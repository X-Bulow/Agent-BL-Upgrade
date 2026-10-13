# Wave B: On-chain Trust and Agent Composability

Status: **Gate B achieved (Injective Testnet, 2026-06-29)**.

## 1. Traceable Paid-Pricing Loop

A single `report_hash` links the real paid report to the on-chain pricing:

```text
0.001 USDC payment
  → PaidReportEnvelope.report_hash
  → PaymentOracle.PaymentAttested.reportHash
  → RiskPricingOracle.PricingUpdated.evidenceHash
  → RWAOfferingPool #2 final quote = $0.80
```

| Evidence | Value |
|---|---|
| USDC payment tx | [`0x6d796d…a0b49`](https://testnet.blockscout.injective.network/tx/0x6d796d39de0de3becd57f2c8b0ff72e6baf33e570259530cb294ff819d1a0b49) |
| PaidReportEnvelope hash | `0x994078c73bdb44f13007d7b6ff4ea899ff9dc44d11f1d3afae1320df418168ce` |
| `PaymentAttested` tx | [`0xa03ab9…ef6e`](https://testnet.blockscout.injective.network/tx/0xa03ab9622dbc1af7bd448af2a52b5322963abf65853916dc13c75a139adfef6e) |
| `PricingUpdated` tx | [`0xee6b65…bac3`](https://testnet.blockscout.injective.network/tx/0xee6b6520c040662f3644c2514de628baa2351abe185623e9c22dbbcab76bbac3) |
| Final quote | pool `2`, `$0.80`, `OPEN_OFFERING` |

The public evidence is in [`evidence/wave-b-gate.json`](./evidence/wave-b-gate.json). The body of the paid report is not published; the evidence file keeps only the commitments and redacted fields that pass runtime schema validation.

## 2. Five-Contract Protocol on Injective Testnet

| Contract | Address | Deployment tx |
|---|---|---|
| AgentBLRWA | [`0x1e4998…48Ab`](https://testnet.blockscout.injective.network/address/0x1e499819cfbD847a3152CdFaD313C3229b9148Ab) | [`0xd66686…819e`](https://testnet.blockscout.injective.network/tx/0xd666868dadc99a1020a697ba71e40e8886c2dbe382259cefef65ba581749819e) |
| EBLRegistry V2 | [`0x99eBa4…d6ae`](https://testnet.blockscout.injective.network/address/0x99eBa4CD00B6650cac7dc57F3b1fB4Ed03Cfd6ae) | [`0xec930a…d808`](https://testnet.blockscout.injective.network/tx/0xec930a68ac9ab9a2f6d5d9c6f1c12be165708a6603d722e9d8bb3e0aba96d808) |
| RWAToken | [`0xDD32B1…2668`](https://testnet.blockscout.injective.network/address/0xDD32B186536d05d0E6218dAA834B5EB312642668) | [`0x1be641…7e55`](https://testnet.blockscout.injective.network/tx/0x1be641cf6d6d6cdfdbff557277019974b908f13cb7c41e276223a2e692c17e55) |
| RWAOfferingPool | [`0x61ac2E…529d`](https://testnet.blockscout.injective.network/address/0x61ac2E4E261fCa58725e5fe8a2E1aBEd48d6529d) | [`0x5a915a…6724`](https://testnet.blockscout.injective.network/tx/0x5a915ad39ba7421301c6d714c87496425b00a93a38ac4d9727b8df1cf1536724) |
| RiskPricingOracle | [`0xaE19a6…618b`](https://testnet.blockscout.injective.network/address/0xaE19a62e26B17B32B183DC89b365da898987618b) | [`0x24f3fc…2d78`](https://testnet.blockscout.injective.network/tx/0x24f3fcf0f34ea73f0f2e1da3be1de4fef5d56d3a8ee40d93937ddabf00782d78) |

The deployment script merges into `public/chain-config.json` rather than overwriting it, then runs `mintEBLV2 → pledge → create → subscribe → reprice → pause → resume → settle`. The final on-chain state is `Repaid`; the full transaction list is in [`evidence/wave-b-protocol.json`](./evidence/wave-b-protocol.json).

## 3. Standard MCP: 9 tools + 3 resources

The original Wave B baseline was 7 tools; Mystery Voyage added the read-only `preview_mystery_voyage` and `verify_mystery_reveal`, so the current surface is 9 tools + 3 resources.

`npm run mcp:stdio` uses the official Model Context Protocol SDK with the stdio transport and supports `initialize/listTools/callTool/listResources/readResource`; stdout carries protocol frames only.

Tools:

1. `get_trade_case`
2. `generate_pricing_quote`
3. `search_knowledge_base`
4. `verify_trade_documents`
5. `purchase_premium_analysis`
6. `simulate_offering`
7. `push_pricing_to_oracle`

Resources:

1. `agentbl://cases/catalog`
2. `agentbl://risk/methodology`
3. `agentbl://contracts/deployments`

All resources are fixed to `application/json` and expose summaries only; an unknown URI returns a protocol error. `tests/mcpProtocol.test.js` uses a real SDK client to call each of the 7 Wave B baseline tools and read the 3 resources; the 2 read-only Mystery Voyage tools are additionally covered by the current protocol manifest.

## 4. Official Injective MCP Adapter and Security Boundary

AgentBL calls `usdc_native_info` and `evm_broadcast` on the official InjectiveLabs MCP Server through `InjectiveMcpAdapter`. One query and one controlled testnet EVM transaction with value 0, targeting an allowlisted contract, have been completed: [`0x1578c1…984f`](https://testnet.blockscout.injective.network/tx/0x1578c10144a6216d8580eabc1497ee02c99a435c20cd315c1492fc0d78d8984f). The redacted tool trace is in [`evidence/injective-mcp-smoke.json`](./evidence/injective-mcp-smoke.json).

All write operations are fail-closed: the network is fixed to `eip155:1439`, targets come from the local deployment allowlist, the amount is capped at `0.005 USDC`, and dry-run is the default. A real write requires both `approved=true` and a local `MCP_HUMAN_APPROVAL_TOKEN` that never enters the model context; the raw-EVM smoke test additionally only allows the `nextPoolId()` selector `0x18e56131`. Prompts and document bodies play no part in authorization decisions.

The current official MCP source omits the protobuf `from` field when constructing `MsgEthereumTx`, so the testnet ante handler returns `sender address missing`. Before reproducing the official raw EVM smoke test, apply the minimal compatibility patch from this repository to the official checkout:

```bash
git -C <injective-mcp-server> apply <agentbl>/patches/injective-mcp-msg-sender.patch
npm --prefix <injective-mcp-server> run build
```

The AgentBL adapter also pins a non-zero gas price and leaves the Cosmos memo empty for Ethereum extension transactions; these are protocol-compatibility parameters and do not relax the security policy above.

## 5. Re-verification Commands

```bash
npm test
npm --prefix hardhat test
npm run verify:wave-b
npm run mcp:stdio
MCP_LIVE_CONFIRM=injective-testnet npm run smoke:mcp:injective
                              # requires a testnet private key, gas and an official MCP build
npm run preflight
```

`verify:wave-b` re-reads the explorer transactions and events and regenerates the Gate B evidence; it sends new eBL / offering / pricing testnet transactions. Routine offline acceptance only needs `npm test`, which never spends funds or writes to the chain.
