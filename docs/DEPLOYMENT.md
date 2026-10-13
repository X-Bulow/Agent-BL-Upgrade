# 🚀 AgentBL Deployment Guide

The AgentBL backend is a **long-running Node.js HTTP server** ([`src/app/server.js`](../src/app/server.js)). A single process serves both the `/api/*` endpoints and the frontend pages under [`public/`](../public/). It therefore has to be deployed somewhere that can **keep a process running** (a local machine, Docker, a VPS, Railway, etc.).

> ⚠️ **Static + serverless platforms such as Vercel / Netlify are not supported.** The project is not split into serverless functions and pool state lives in process memory. If you deploy to one of these platforms the frontend will load, but every `/api/*` call will fail.

---

## 📋 Pre-deployment Checklist

- [ ] Node.js ≥ 20 (`node -v`)
- [ ] Runs locally: `npm run dev`, then open http://localhost:3000
- [ ] Tests pass: `npm test`
- [ ] Pre-demo self-check passes: `npm run preflight`
- [ ] `.env` is prepared and **not** committed to Git

### Environment Variables

Copy the template and fill in what you need:

```bash
cp .env.example .env
```

**Every key is optional.** When a key is missing, AI valuation, market prices and world-risk intelligence fall back to deterministic offline data, so the demo still works. Each variable is described in [`.env.example`](../.env.example); the common ones are:

| Variable | Purpose |
|---|---|
| `PORT` | Listening port, default `3000` |
| `DEEPSEEK_API_KEY` / `DASHSCOPE_API_KEY` / `Tencent_API_KEY` | Any one LLM provider, used for AI valuation and commentary |
| `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_DEPLOYMENT` / `AZURE_OPENAI_API_KEY` | Azure OpenAI can be used as the LLM provider instead |
| `METALPRICE_API_KEY` / `ALPHAVANTAGE_API_KEY` | Live copper price |
| `COMTRADE_PRIMARY_KEY` | UN Comtrade historical trade prices |
| `XAPI_KEY` | World-risk intelligence (news / social / prediction markets) |
| `DEMO_MODE` | Run mode, Demo by default; Live mode never silently falls back to simulated trading |
| `INJECTIVE_RPC_URL` | Injective testnet RPC (has a default) |
| `X402_*`, `WHITE_AGENT_PRIVATE_KEY` | x402 paid intelligence, see [x402-integration.md](./x402-integration.md) |

The contract addresses the frontend connects to **do not come from environment variables**; they are read from [`public/chain-config.json`](../public/chain-config.json). After redeploying the contracts you need to update this file (see `npm run migrate:chain-config`).

### Runtime Data

The server writes x402 receipts, Agent decision logs and Mystery Voyage reveal records to `data/runtime/` (ignored in `.gitignore`). In production this directory must be **writable and persistent**, otherwise these records are lost on restart. Pool / subscription data is held only in memory and is cleared on restart.

---

## Option 1: Run Directly with Node (local / demo)

```bash
npm install
npm start          # equivalent to node src/app/server.js
```

## Option 2: Docker (recommended)

```bash
# docker compose: reads .env automatically, maps port 3000 and mounts data/
docker compose up -d --build

# or manually
docker build -t agentbl .
docker run -p 3000:3000 --env-file .env -v "$PWD/data/runtime:/app/data/runtime" agentbl
```

[`docker-compose.yml`](../docker-compose.yml) mounts `data/` read-only and separately mounts `data/runtime/` as a writable directory. The image ships with a health check (`GET /api/health`).

## Option 3: VPS / Cloud Server (PM2 + Nginx)

```bash
npm ci --omit=dev
npm install -g pm2
pm2 start src/app/server.js --name agentbl
pm2 save && pm2 startup
```

Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

HTTPS: `sudo certbot --nginx -d your-domain.com`

## Option 4: Railway and Other Container Hosting Platforms

On [railway.app](https://railway.app) choose *Deploy from GitHub*; the platform detects the Dockerfile or the Node project. Use `npm start` as the start command and fill in the environment variables in the platform dashboard. To keep `data/runtime/`, mount a persistent volume at `/app/data/runtime`.

---

## ⛓️ On-chain Offerings: Enabling Real Subscriptions on the Market Page

Subscriptions on the market page are simulated by default. To let investors subscribe for real with MetaMask on the Injective testnet, the platform operator must first deploy the full protocol and then create on-chain offerings for the cases. Only the protocol owner can register bills of lading and create offerings, so the operator runs this step on their own machine and the private key never passes through the website backend.

Prerequisites: `DEPLOYER_PRIVATE_KEY` is set in the root `.env`, and that address holds testnet INJ ([faucet](https://testnet.faucet.injective.network/)).

```bash
npm --prefix hardhat install
npm run deploy:protocol                 # deploy EBLRegistry / RWAToken / MockUSDC / RWAOfferingPool / RiskPricingOracle
npm run protocol:op -- seed             # register a bill of lading for each case in data/cases and create an offering at the AI-recommended quote
npm run protocol:op -- status           # show the on-chain status of each offering
```

`seed` writes the "case → pool ID" mapping into the `offerings` field of `public/chain-config.json` (4 transactions per case; use `--cases ID1,ID2` to process only some cases; re-running skips offerings that already exist). After committing and redeploying the website, the market page shows an "On-chain Offering" panel: investors connect MetaMask, claim test mUSDC and can then subscribe on-chain. Redeploying the contracts automatically invalidates the old mapping, so you need to run `seed` again.

During a demo you can advance the lifecycle with operator commands:

| Command | Effect |
|---|---|
| `npm run protocol:op -- fill <caseId>` | Operator buys the remaining units, filling the offering and disbursing funds to the exporter |
| `npm run protocol:op -- transit <caseId>` | Mark the cargo as departed |
| `npm run protocol:op -- settle <caseId> [--ratio 1]` | Deposit the repayment (as a ratio of the target redemption price), record arrival and settle; investors can then redeem |
| `npm run protocol:op -- cancel <caseId>` | Cancel an offering that has not yet disbursed; investors can claim refunds |
| `npm run protocol:op -- liquidate <caseId> [--ratio 0.6]` | AI triggers liquidation and deposits the liquidation proceeds; investors redeem pro rata |

## ✅ Post-deployment Verification

```bash
BASE=https://your-domain.com     # locally use http://localhost:3000

curl $BASE/api/health                         # health check
curl $BASE/api/cases                          # list of trade cases
curl -X POST $BASE/api/pricing/quote \
  -H "Content-Type: application/json" -d '{}' # generate a pricing quote for the default demo case
```

Then confirm in the browser:

- [ ] The home page, styles and images load, with no console errors
- [ ] You can switch trade cases and see the AI pricing result
- [ ] A wallet (MetaMask / Keplr) can connect and switch to the Injective testnet (chainId 1439)

---

## 🐛 Troubleshooting

| Symptom | What to check |
|---|---|
| AI results are fixed values | No LLM / market-data key is configured, so offline fallback data is being used; this is expected |
| Environment variables have no effect | Make sure `.env` is in the project root, or is passed via `--env-file` / the platform dashboard; variable names are case-sensitive |
| Read-only error when writing `data/runtime` in Docker | Make sure `data/runtime` is mounted separately as a writable volume |
| Wallet transaction fails | Make sure the wallet is on the Injective testnet, the account has testnet INJ ([faucet](https://testnet.faucet.injective.network/)), and the contract addresses in `chain-config.json` are from the latest deployment |

## 🔒 Security Recommendations

- Never commit `.env`; keep private keys only in the deployment platform's secret manager
- Keep testnet and mainnet private keys strictly separate
- For public deployments, consider adding rate limiting at the Nginx layer
