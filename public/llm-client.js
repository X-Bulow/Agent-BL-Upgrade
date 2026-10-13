// DeepSeek streaming chat client: browser-side OpenAI-compatible API
//
// Talks directly to api.deepseek.com. Supports:
// - Streaming SSE responses
// - Function calling (tool calls)
// - Timeouts and error handling
//
// Dependencies: fetch (native in the browser), TextDecoder

const DEEPSEEK_CONFIG = {
  API_KEY: window.ENV?.DEEPSEEK_API_KEY || '',
  BASE_URL: window.ENV?.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  MODEL: 'deepseek-chat',
  TIMEOUT_MS: 60000,
  MAX_TOOL_ROUNDS: 5  // Max function-calling rounds
};

/**
 * Generate a unique ID
 */
function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Convert tool definitions to the OpenAI function-calling format
 * @param {Array<{name:string, description:string, parameters?:object}>} tools
 * @returns {Array} Tools in OpenAI format
 */
function toOpenAITools(tools) {
  return tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters || { type: 'object', properties: {}, required: [] }
    }
  }));
}

/**
 * DeepSeek streaming chat client
 */
export class DeepSeekClient {
  constructor(config = {}) {
    this.apiKey = config.apiKey || DEEPSEEK_CONFIG.API_KEY;
    this.baseUrl = config.baseUrl || DEEPSEEK_CONFIG.BASE_URL;
    this.model = config.model || DEEPSEEK_CONFIG.MODEL;
    this.timeout = config.timeout || DEEPSEEK_CONFIG.TIMEOUT_MS;
  }

  /**
   * Streaming chat (with function calling)
   *
   * @param {Array<{role:string, content:string|object, tool_calls?:Array}>} messages - Conversation history
   * @param {Array<{name:string, description:string, parameters?:object}>} tools - Available tools
   * @param {object} callbacks
   * @param {function(string):void} callbacks.onChunk - Called with each text delta
   * @param {function({name:string, args:object}):void} callbacks.onToolCall - Called when a tool call arrives
   * @param {function(string):void} callbacks.onThinking - Called with reasoning content (deepseek-reasoner)
   * @returns {Promise<{content:string|null, tool_calls:Array|null}>} Full response
   */
  async streamChat(messages, tools, { onChunk, onToolCall, onThinking } = {}) {
    const body = {
      model: this.model,
      messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 2048
    };

    if (tools && tools.length > 0) {
      body.tools = toOpenAITools(tools);
      body.tool_choice = 'auto';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`DeepSeek HTTP ${response.status}: ${text.slice(0, 300)}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let content = '';
      let toolCalls = [];
      let toolCallMap = {};  // index -> { id, name, arguments }

      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;

            // Text content
            if (delta.content) {
              content += delta.content;
              onChunk?.(delta.content);
            }

            // Reasoning content (deepseek-reasoner)
            if (delta.reasoning_content) {
              onThinking?.(delta.reasoning_content);
            }

            // Tool calls
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;

                if (!toolCallMap[idx]) {
                  toolCallMap[idx] = {
                    id: tc.id || uid(),
                    name: tc.function?.name || '',
                    arguments: ''
                  };
                }

                if (tc.id) toolCallMap[idx].id = tc.id;
                if (tc.function?.name) toolCallMap[idx].name = tc.function.name;
                if (tc.function?.arguments) toolCallMap[idx].arguments += tc.function.arguments;

                onToolCall?.({
                  name: toolCallMap[idx].name,
                  args: toolCallMap[idx].arguments,
                  id: toolCallMap[idx].id,
                  partial: true
                });
              }
            }
          } catch (_) {
            // Skip lines that cannot be parsed
          }
        }
      }

      // Assemble the complete tool_calls
      const indexes = Object.keys(toolCallMap).sort((a, b) => Number(a) - Number(b));
      toolCalls = indexes.map((i) => {
        const tc = toolCallMap[i];
        let args = {};
        try {
          args = tc.arguments ? JSON.parse(tc.arguments) : {};
        } catch (_) {
          args = { _raw: tc.arguments };
        }
        return { id: tc.id, name: tc.name, arguments: args };
      });

      return {
        content: content || null,
        tool_calls: toolCalls.length > 0 ? toolCalls : null
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Non-streaming chat (for simple single-round tool calls)
   */
  async chat(messages, tools) {
    const body = {
      model: this.model,
      messages,
      temperature: 0.3,
      max_tokens: 2048
    };

    if (tools && tools.length > 0) {
      body.tools = toOpenAITools(tools);
      body.tool_choice = 'auto';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`DeepSeek HTTP ${response.status}: ${text.slice(0, 300)}`);
      }

      const json = await response.json();
      const msg = json.choices?.[0]?.message;
      if (!msg) throw new Error('DeepSeek returned no message');

      const tool_calls = msg.tool_calls?.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments || '{}')
      }));

      return {
        content: msg.content || null,
        tool_calls: tool_calls || null
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Default singleton */
let _instance = null;
export function getDeepSeekClient() {
  if (!_instance) _instance = new DeepSeekClient();
  return _instance;
}

export { DEEPSEEK_CONFIG, toOpenAITools };
