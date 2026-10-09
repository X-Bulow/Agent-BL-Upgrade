# 🚀 AgentBL 部署指南

AgentBL 的后端是一个**常驻的 Node.js HTTP 服务**（[`src/app/server.js`](../src/app/server.js)），同一个进程既提供 `/api/*` 接口，也托管 [`public/`](../public/) 下的前端页面。因此它需要部署在能**长期运行进程**的环境里（本机、Docker、VPS、Railway 等）。

> ⚠️ **不支持 Vercel / Netlify 这类纯静态 + Serverless 平台。** 项目没有拆成 serverless 函数，池子状态也保存在进程内存里，部署到这些平台后前端能打开，但 `/api/*` 会全部失效。

---

## 📋 部署前检查

- [ ] Node.js ≥ 20（`node -v`）
- [ ] 本地可以正常运行：`npm run dev`，打开 http://localhost:3000
- [ ] 测试通过：`npm test`
- [ ] 赛前自检通过：`npm run preflight`
- [ ] `.env` 已准备好，且**没有**提交到 Git

### 环境变量

复制模板后按需填写：

```bash
cp .env.example .env
```

**所有 key 都是可选的。** 不填时，AI 估值、行情、世界风险情报都会回退到确定性的离线数据，演示照样可用。各变量的说明见 [`.env.example`](../.env.example)，常用的有：

| 变量 | 用途 |
|---|---|
| `PORT` | 监听端口，默认 `3000` |
| `DEEPSEEK_API_KEY` / `DASHSCOPE_API_KEY` / `Tencent_API_KEY` | 任选一个 LLM 提供方，用于 AI 估值与解说 |
| `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_DEPLOYMENT` / `AZURE_OPENAI_API_KEY` | 也可改用 Azure OpenAI 作为 LLM 提供方 |
| `METALPRICE_API_KEY` / `ALPHAVANTAGE_API_KEY` | 实时铜价 |
| `COMTRADE_PRIMARY_KEY` | UN Comtrade 历史成交价 |
| `XAPI_KEY` | 世界风险情报（新闻 / 社交 / 预测市场） |
| `DEMO_MODE` | 运行模式，默认 Demo；Live 模式不会静默回退到模拟交易 |
| `INJECTIVE_RPC_URL` | Injective 测试网 RPC（有默认值） |
| `X402_*`、`WHITE_AGENT_PRIVATE_KEY` | x402 付费情报，详见 [x402-integration.md](./x402-integration.md) |

前端连接的合约地址**不走环境变量**，而是读取 [`public/chain-config.json`](../public/chain-config.json)。重新部署合约后，需要更新这个文件（见 `npm run migrate:chain-config`）。

### 运行时数据

服务会把 x402 收据、Agent 决策日志、Mystery Voyage 揭晓记录写入 `data/runtime/`（已在 `.gitignore` 中忽略）。生产环境要保证这个目录**可写且持久**，否则重启后这些记录会丢失。池子 / 认购数据只在内存里，重启即清空。

---

## 方案 1：直接用 Node 运行（本地 / 演示）

```bash
npm install
npm start          # 等价于 node src/app/server.js
```

## 方案 2：Docker（推荐）

```bash
# docker compose：自动读取 .env，映射 3000 端口，并挂载 data/
docker compose up -d --build

# 或手动
docker build -t agentbl .
docker run -p 3000:3000 --env-file .env -v "$PWD/data/runtime:/app/data/runtime" agentbl
```

[`docker-compose.yml`](../docker-compose.yml) 以只读方式挂载 `data/`，另外单独把 `data/runtime/` 挂成可写目录。镜像自带健康检查（`GET /api/health`）。

## 方案 3：VPS / 云服务器（PM2 + Nginx）

```bash
npm ci --omit=dev
npm install -g pm2
pm2 start src/app/server.js --name agentbl
pm2 save && pm2 startup
```

Nginx 反向代理：

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

HTTPS：`sudo certbot --nginx -d your-domain.com`

## 方案 4：Railway 等容器托管平台

在 [railway.app](https://railway.app) 选择 *Deploy from GitHub*，平台会识别 Dockerfile 或 Node 项目。启动命令用 `npm start`，在平台面板中填写环境变量。如需保留 `data/runtime/`，挂载一个持久卷到 `/app/data/runtime`。

---

## ⛓️ 上链发行：让市场页可以真实认购

市场页的认购默认是模拟的。要让投资者用 MetaMask 在 Injective 测试网上真实认购，平台运营者需要先部署完整协议，再为案例创建链上发行。只有协议 owner 能登记提单、创建发行，所以这一步由运营者在本机执行，私钥不经过网站后端。

前提：根目录 `.env` 中配置了 `DEPLOYER_PRIVATE_KEY`，并且该地址有测试 INJ（[水龙头](https://testnet.faucet.injective.network/)）。

```bash
npm --prefix hardhat install
npm run deploy:protocol                 # 部署 EBLRegistry / RWAToken / MockUSDC / RWAOfferingPool / RiskPricingOracle
npm run protocol:op -- seed             # 为 data/cases 的每个案例登记提单、按 AI 推荐报价创建发行
npm run protocol:op -- status           # 查看各发行的链上状态
```

`seed` 会把"案例 → 池子编号"的对应关系写入 `public/chain-config.json` 的 `offerings` 字段（每个案例 4 笔交易，可用 `--cases ID1,ID2` 只处理部分案例，重复执行会跳过已创建的）。提交并重新部署网站后，市场页就会显示"链上发行"面板：投资者连接 MetaMask，领取测试 mUSDC，即可链上认购。重新部署合约后旧的对应关系自动失效，需要重新 `seed`。

演示时可以用运营命令推进生命周期：

| 命令 | 作用 |
|---|---|
| `npm run protocol:op -- fill <caseId>` | 运营者买下剩余份额，认满并放款给出口商 |
| `npm run protocol:op -- transit <caseId>` | 标记货物出港 |
| `npm run protocol:op -- settle <caseId> [--ratio 1]` | 存入还款（按目标兑付价的比例）、记录到港并结算，投资者随后可兑付 |
| `npm run protocol:op -- cancel <caseId>` | 取消尚未放款的发行，投资者可退款 |
| `npm run protocol:op -- liquidate <caseId> [--ratio 0.6]` | AI 触发清算并存入清算款，投资者按比例兑付 |

## ✅ 部署后验证

```bash
BASE=https://your-domain.com     # 本地为 http://localhost:3000

curl $BASE/api/health                         # 健康检查
curl $BASE/api/cases                          # 贸易案例列表
curl -X POST $BASE/api/pricing/quote \
  -H "Content-Type: application/json" -d '{}' # 用默认演示案例生成定价报价
```

页面上再确认：

- [ ] 首页、样式、图片正常加载，控制台无报错
- [ ] 可以切换贸易案例并看到 AI 定价结果
- [ ] 钱包（MetaMask / Keplr）可以连接，并切换到 Injective 测试网（chainId 1439）

---

## 🐛 常见问题

| 症状 | 排查 |
|---|---|
| AI 结果是固定数值 | 没有配置 LLM / 行情 key，正在使用离线回退数据，属正常行为 |
| 环境变量不生效 | 确认 `.env` 在项目根目录，或已通过 `--env-file` / 平台面板传入；变量名区分大小写 |
| Docker 中写 `data/runtime` 报只读错误 | 确认 `data/runtime` 单独挂载为可写卷 |
| 钱包交易失败 | 确认钱包在 Injective 测试网、账户有测试 INJ（[水龙头](https://testnet.faucet.injective.network/)），且 `chain-config.json` 中的合约地址是最新部署 |

## 🔒 安全建议

- 永远不要提交 `.env`，私钥只放在部署平台的密钥管理里
- 测试网私钥与主网私钥严格分开
- 对外公开部署时，考虑在 Nginx 层加上请求频率限制
