// @cosmjs/crypto only reaches for node:crypto when WebCrypto is unavailable (never in a browser).
throw new Error('node:crypto is not available in the browser build; WebCrypto is required');
