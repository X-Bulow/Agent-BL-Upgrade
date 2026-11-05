# Injective x402 Compatibility Spike (X402-1)

> Verified: 2026-06-29 04:50–05:05 CST (UTC+8)  
> Conclusion: **SDK compatible; Injective Testnet facilitator is discoverable; Mainnet facilitator not verified**

## 1. Conclusions and Project Decisions

AgentBL can adopt the official `@injectivelabs/x402`, but must distinguish between "the SDK supports it" and "a facilitator already supports it":

| Layer | Verification result | AgentBL decision |
|---|---|---|
| npm SDK | `latest=0.0.1`, `next=0.1.0-rc.1`; ships with `eip155:1776` and `eip155:1439` built in | X402-2 pins the stable `0.0.1`; do not use the RC |
| Runtime | The npm package requires Node `>=20`; AgentBL measured Node `v22.9.0` | When integrating, raise the project's `engines.node` from `>=18.18.0` to `>=20` |
| Web framework | `express` is an optional peer dependency allowing `^4 || ^5`; it is not installed automatically with the package | When using the official middleware, Express must be installed and pinned explicitly; do not assume the existing `node:http` server satisfies the dependency |
| Testnet | The official Demo's `/supported` actually returns `exact + eip155:1439 + Testnet USDC + EIP-3009` | Real testnet smoke tests with a disposable test wallet are allowed, and the UI/CLI shows `TESTNET` |
| Mainnet | Doc examples use `eip155:1776` and the SDK has mainnet built in; but this check found no HTTPS production facilitator verifiable via `/supported` | Keep mainnet configuration capability but disabled by default; must be re-verified live before X402-15; mainnet real payments must not be claimed |
| Demo settlement | Does not depend on a facilitator; not a real on-chain payment | Must display `DEMO SETTLEMENT · NOT ONCHAIN`; must not generate clickable fake tx/explorer links |

The current implementation path is therefore:

1. Default development path: `eip155:1439` + Testnet USDC + the official V2/EIP-3009 challenge.
2. CI and offline demos: explicit Demo settlement; every receipt uses a `demo_` prefix and `onchain=false`.
3. Mainnet live: may only be enabled when an HTTPS facilitator's `/supported` returns `eip155:1776`, the correct USDC address and `exact/eip3009` together.
4. The testnet facilitator found so far is a staging plaintext-HTTP ELB; only isolated disposable test wallets are allowed with it. It must not carry mainnet signatures, production keys or real funds.

## 2. Version and Dependency Verification

Run:

```powershell
node --version
npm.cmd --version
npm.cmd view @injectivelabs/x402 version dist-tags engines dependencies peerDependencies exports repository time --json
```

Actual summary:

```text
Node: v22.9.0
npm:  11.17.0

@injectivelabs/x402:
  latest: 0.0.1
  next:   0.1.0-rc.1
  node:   >=20
  dependencies:
    viem: ^2.39.3
    zod:  ^3.23.8
  peerDependencies:
    express: ^4.0.0 || ^5.0.0
  module: ESM only
```

Both `0.0.1` and `0.1.0-rc.1` were published on 2026-05-13. In `0.0.1` the Express peer dependency is marked optional because the core/client/facilitator exports do not necessarily use Express; however, when importing `@injectivelabs/x402/middleware`, the application must still provide Express itself.

### Conflict Between Docs and Package Constraints

The Injective x402 tutorial says Node.js 18+, yet the published npm package's `engines` is Node `>=20`. The implementation must follow the stricter constraint of the executable package, i.e. **Node >=20**. AgentBL's current runtime satisfies this; the existing `>=18.18.0` in `package.json` is only adjusted when X402-2 installs dependencies; this spike does not change runtime dependencies.

## 3. Network and Asset Matrix

| Environment | CAIP-2 | Chain ID | USDC | Decimals | EIP-3009 | RPC | Explorer |
|---|---|---:|---|---:|---|---|---|
| Mainnet | `eip155:1776` | 1776 | `0xa00C59fF5a080D2b954d0c75e46E22a0c371235a` | 6 | Yes, EIP-712 version `2` | `https://sentry.evm-rpc.injective.network` | `https://blockscout.injective.network` |
| Testnet | `eip155:1439` | 1439 | `0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d` | 6 | Yes, EIP-712 version `2` | `https://k8s.testnet.json-rpc.injective.network` | `https://testnet.blockscout.injective.network` |

The official package's network registry includes both chains and explicitly marks both USDC tokens as Circle FiatTokenV2_2 with `TransferWithAuthorization`. USDT, WINJ and the legacy IBC USDC do not support EIP-3009 and cannot be substituted as the x402 payment asset.

## 4. Actual HTTP Requests and Responses

Below are the key fields of the live requests; for the payment challenge's Base64 header only a placeholder is kept, and the decoded content comes from the JSON of the same response.

### 4.1 Official Demo Status

```http
GET https://agents.injective.com/api/x402/status

HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "mode": "live",
  "configured": true,
  "available": true,
  "network": "eip155:1439",
  "usdcAddress": "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d",
  "priceUsdc": "0.01",
  "amountAtomic": "10000",
  "facilitator": {
    "status": "configured",
    "url": "http://x402-staging-alb-1300061645.us-east-1.elb.amazonaws.com",
    "missing": []
  }
}
```

Conclusion: the official Demo currently runs on Testnet, not on the Mainnet used in the tutorial examples; the public status endpoint exposes a staging HTTP facilitator.

### 4.2 Unpaid Resource Returns a Standard V2 Challenge

```http
GET https://agents.injective.com/api/x402/perps/market-data

HTTP/1.1 402 Payment Required
Access-Control-Expose-Headers: PAYMENT-REQUIRED, PAYMENT-RESPONSE, X-PAYMENT-RESPONSE
Payment-Required: <base64 omitted>
Content-Type: application/json
```

Core payment requirements in the response:

```json
{
  "x402Version": 2,
  "accepts": [
    {
      "scheme": "exact",
      "network": "eip155:1439",
      "amount": "10000",
      "asset": "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d",
      "payTo": "0x2968698c6b9ed6d44b667a0b1f312a3b5d94ded7",
      "maxTimeoutSeconds": 60,
      "extra": {
        "name": "USDC",
        "version": "2",
        "assetTransferMethod": "eip3009",
        "chainId": 1439,
        "primaryType": "TransferWithAuthorization"
      }
    }
  ],
  "extensions": {
    "mode": "live",
    "facilitatorStatus": "configured"
  }
}
```

This proves that the 402, V2 headers, CAIP-2, Testnet USDC and EIP-3009 challenge are all actually returned by the official Demo; it does not prove that settlement succeeds. A real settlement tx is still to be accepted under X402-15.

### 4.3 Facilitator `/supported`

```http
GET http://x402-staging-alb-1300061645.us-east-1.elb.amazonaws.com/supported

HTTP/1.1 200 OK
Content-Type: application/json
x-request-id: dc77196a-ac21-4e12-8665-c88f33d3b967
```

```json
{
  "kinds": [
    {
      "x402Version": 2,
      "scheme": "exact",
      "network": "eip155:1439",
      "extra": {
        "supportedAssets": [
          {
            "address": "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d",
            "decimals": 6,
            "assetTransferMethod": "eip3009",
            "eip712": {
              "name": "USDC",
              "version": "2",
              "primaryType": "TransferWithAuthorization"
            }
          }
        ]
      }
    }
  ],
  "extensions": [],
  "signers": {
    "eip155:1439": ["0x7a6d1bb95b3AC77EcFBF3D3EB92E4e5a7df2b57c"]
  }
}
```

Verdict: **1439 is supported; 1776 is not listed.** `/supported` is the runtime source of truth; the existence of an `eip155:1776` constant in the SDK cannot replace this check.

### 4.4 Negative Availability Probes

```text
GET https://x402-staging-alb-1300061645.us-east-1.elb.amazonaws.com/supported
=> curl: (28) Connection timed out after 30010 milliseconds

GET https://x402.injective.network/supported
=> curl: (6) Could not resolve host: x402.injective.network
```

The facilitator found so far therefore cannot be a production dependency of AgentBL. X402-3 must allow the URL to be configured; X402-4/6 must call `/supported` and fail closed before starting or executing, rather than hard-coding it or silently falling back to "success".

## 5. Implementation Constraints for X402-2/3/4

### Dependency Choice

```text
Required: @injectivelabs/x402@0.0.1
Required (when using the official middleware): express, pinned within the official peer range
Not added for now: @x402/core / @x402/evm / @x402/fetch
```

x402 Foundation packages are only introduced when a capability is missing from the official client and a test proves it, to avoid two sets of protocol objects and headers coexisting.

### Startup Gate

Starting Live mode requires all of:

```text
GET {facilitatorUrl}/supported == 200
kinds contains x402Version=2
scheme == exact
network == the configured CAIP-2
supportedAssets contains the configured USDC address (case-insensitive)
decimals == 6
assetTransferMethod == eip3009
HTTPS: mandatory on mainnet; testnet staging only with an explicit ALLOW_INSECURE_TESTNET=true
```

If any condition fails, Live mode is refused and must not automatically pretend to have settled. Demo mode may keep running, but its response must include:

```json
{
  "mode": "demo",
  "onchain": false,
  "settlement": "simulated",
  "txHash": null,
  "explorerUrl": null
}
```

### Live Support Matrix

| Mode | Currently allowed | Public wording | Real tx requirement |
|---|---|---|---|
| Demo | Yes, default | `Demo settlement · not onchain` | None, and it must not be faked |
| Testnet 1439 | Conditionally | `Injective Testnet payment` | X402-15 records a Testnet explorer tx; disposable wallet; allowing insecure staging requires an explicit opt-in |
| Mainnet 1776 | No, off by default | Do not show `live` / `paid onchain` | Only after HTTPS `/supported` verifies 1776 + mainnet USDC, then make a small real payment |

## 6. Known Risks

1. The npm package is still `0.0.1`, so API stability is low; the version must be pinned and contract tests must lock down the challenge/settlement schema.
2. The official tutorial's Node 18+ disagrees with npm's Node >=20; CI uses >=20.
3. The official tutorial highlights Mainnet, but the official Demo currently returns Testnet; demos must show the actual network from the response.
4. The staging facilitator is HTTP only, so signed payloads may be intercepted or front-run; restrict it to worthless test assets and disposable wallets.
5. `/supported` does not list 1776; until a production facilitator can be verified, mainnet counts only as SDK/config support, not as integrated.
6. The public `InjectiveLabs/x402-facilitator-injective` repository currently linked from the Demo page returns 404; do not describe inaccessible source code as an "audited open-source facilitator".

## 7. Re-verification Commands

```powershell
npm.cmd view @injectivelabs/x402 version dist-tags engines dependencies peerDependencies --json
curl.exe -sS -D - --max-time 30 https://agents.injective.com/api/x402/status
curl.exe -sS -D - --max-time 30 https://agents.injective.com/api/x402/perps/market-data
curl.exe -sS -D - --max-time 30 http://x402-staging-alb-1300061645.us-east-1.elb.amazonaws.com/supported
```

The facilitator is an external runtime dependency, so the probe results above are time-sensitive. X402-15 and every demo preflight must re-run them; do not just cite the historical responses in this file.

## 8. Sources

- [Official Injective x402 tutorial](https://docs.injective.network/developers-ai/x402)
- [Injective EVM Network Information](https://docs.injective.network/developers-evm/network-information)
- [USDC on Injective](https://docs.injective.network/developers-defi/usdc-stablecoin)
- [npm: @injectivelabs/x402](https://www.npmjs.com/package/@injectivelabs/x402)
- [Network registry of the published package](https://unpkg.com/@injectivelabs/x402@0.0.1/dist/networks/index.js)
- [Official Injective x402 Demo](https://agents.injective.com/x402/)
- [x402 Network & Token Support](https://docs.x402.org/core-concepts/network-and-token-support)

