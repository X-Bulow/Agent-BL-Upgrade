# AgentBL Agent · Basic Guide (Team Collaboration and Onboarding)

> This is the project's **basic guide / team collaboration handbook** (formerly `README.md`). It looks after teammates who are taking part in a hackathon for the first time, using Node.js for the first time, or opening a PR for the first time, and covers the full flow: Harness background, commands, directories, changing data, claiming tasks, creating branches and opening PRs.
>
> For a quick overview of "what the project is + how to use it", see the new [`README.md`](../README.md) in the root directory. This file is kept as the more detailed background and collaboration guidelines.

---

> AI Agent x Blockchain hackathon repository: docs, Mock Harness, test framework and team collaboration guidelines for an **AI-dynamically-priced, eBL-backed RWA discounted issuance protocol**.

This document is for every project member, and especially looks after teammates who are taking part in a hackathon for the first time, using Node.js for the first time, or opening a PR for the first time. You don't need to fully understand Web3, international trade or backend testing at the start; just follow the steps below and you will be able to run the project, claim tasks, develop, verify and open a PR.

---

## 0. Read this first: what is this project, really

AgentBL Agent is a hackathon-oriented **AI Dynamic Pricing x eBL-backed RWA Trade Finance** repository.

The project in one sentence:

> The exporter pledges an electronic bill of lading to a smart contract, and the system issues an RWA backed by the cargo value; the AI Pricing & Risk Agent, based on payout speed and trade risk, dynamically produces the RWA's discounted issue price, financeable amount and risk-control actions, so investors see the price, target redemption price and risk sources before subscribing.

In plainer terms:

```text
In international trade, the goods are already loaded on the ship, but the money hasn't come back yet.
The exporter wants to get cash early and quickly.
The electronic bill of lading represents rights to the goods and can be pledged.
We use AI to value this cargo, then convert "how fast you want the money + how much risk there is" into an issuance discount (e.g. 1 RWA sells for 0.85).
Investors subscribe at the discount, and the AI reprices, pauses or liquidates during transit according to risk.
```

> ⚠️ Model upgrade notice: early versions were "RiskReport risk control + pooled lending"; the current main line is **AI-dynamically-priced RWA discounted issuance** (see `docs/PRD.md` v0.2 + `docs/tasks.md`). The pricing engine `src/core/pricingEngine.js` is implemented and outputs a `PricingQuote` (pricing_action); the old `riskEngine.js` `RiskReport` (contract_action) is still kept for the legacy flow and regression. This file marks which parts are "Current" and which are "Target".

This repository is not the final Demo right now, but a **preparation repository + runnable Harness**. Its goal is to give everyone a shared background, shared PRD, shared data, shared commands and shared verification method before formal development begins.

---

## 1. What a Harness is

### 1.1 In one sentence

**A Harness is a small, fixed, repeatable test environment.**

You can think of it as:

```text
A fixed set of fake data
+ a fixed set of risk calculation rules
+ a fixed process simulation
+ a fixed set of APIs
+ a fixed set of test commands
```

Its purpose is to let us run the project's main flow end to end even without a real bank, a real electronic bill of lading platform, real smart contracts or real vessel data.

### 1.2 Why a hackathon needs a Harness

Hackathons are short. If everyone changes things, connects data and writes interfaces however they like, it is very easy to end up with:

- The PM's story not matching the engineering implementation;
- JSON output by the Agent teammates that the frontend cannot read;
- The frontend page expecting field A while the backend actually returns field B;
- The state machine designed by the contract teammates not matching the demo storyline;
- Discovering in the last hour that the main flow does not run.

The value of the Harness is:

> Whatever feature you build, it must feed back into the same main flow and be verifiable by a command.

### 1.3 The main path of this project's Harness

Remember this line first:

```text
data/demo-case.json
→ src/core/riskEngine.js
→ src/core/workflow.js
→ src/app/server.js
→ scripts / tests / public UI
```

What each file does:

| File | What it is | Plain-language explanation |
|---|---|---|
| `data/demo-case.json` | Demo input data (legacy) | A copper cathode international trade case, fed to the old risk engine |
| `data/uploads/` | Realistic uploaded documents | Simulates eBL + commercial invoices uploaded by users (Singapore copper / crude oil), see its README |
| `data/cases/` | Structured cases (new model) | Case JSON aligned with PricingQuote fields |
| `src/core/riskEngine.js` | Pricing/risk engine | Current: computes a RiskReport (old). Target: upgrade to output a PricingQuote with the RWA discount |
| `src/core/workflow.js` | Process simulator | Simulates the on-chain state machine (current Created→Funding→…, target Created→Priced→Open→…) |
| `src/agent/` | AI valuation tool calling | The LLM calls the "real-time copper price / historical comparable trade prices / valuation" tools, see `docs/ai-valuation-tooling.md` |
| `src/app/server.js` | Minimal Web/API service | Serves the web page and APIs so the frontend or tests can access the data |
| `scripts/check.mjs` | Self-check script | Checks whether files, scripts, seed data and the engine still work |
| `scripts/demo.mjs` | CLI Demo | Prints the full demo flow in the terminal |
| `scripts/smoke.mjs` | Smoke test | Starts a temporary API server and checks that the key APIs are available |
| `scripts/agent-valuation.mjs` | Valuation CLI | Runs the AI valuation tools, with a deterministic fallback offline |
| `tests/*.test.js` | Automated tests | Verify that the engine and main flow have not been broken |
| `public/*` | Frontend pages | The pages seen in the browser |

### 1.4 What the Harness is not

The Harness is not the final product. At the current stage it does not do the following:

- Does not connect to a real bank;
- Does not connect to a real electronic bill of lading platform;
- Does not raise real funds;
- Does not deploy real mainnet contracts;
- Does not perform real KYC;
- Does not process real cross-border payments;
- Does not promise any returns;
- Does not raise funds from the public.

It is just a **runnable, explainable, verifiable hackathon skeleton**.

---

## 2. What to prepare before getting started for the first time

### 2.1 Software you need to install

At minimum:

1. **Git**
   Used to pull code, create branches, commit changes and push PRs.

2. **Node.js >= 18.18.0**
   Used to run project scripts, tests and the local web service.

3. **Code editor**
   VS Code is recommended; Cursor, WebStorm or other editors also work.

4. **Browser**
   Chrome, Edge or Firefox are all fine.

### 2.2 Check whether Git is installed

Open a terminal and run:

```bash
git --version
```

If you see something like:

```text
git version 2.x.x
```

Git is installed.

If it says `git` cannot be found, you haven't installed Git yet; install Git first and then continue.

### 2.3 Check whether Node is installed

Run:

```bash
node -v
```

If you see something like:

```text
v18.18.0
v20.x.x
v22.x.x
```

Node is installed. The version must be greater than or equal to 18.18.0.

Then check npm:

```bash
npm -v
```

If it prints a version number, you can continue.

### 2.4 A quick note for Windows PowerShell

If you run `npm run check` in Windows PowerShell and get something like:

```text
File npm.ps1 cannot be loaded because running scripts is disabled on this system
```

The project is not broken; it is a PowerShell execution policy restriction. You can use instead:

```powershell
npm.cmd run check
npm.cmd run test
npm.cmd run demo
npm.cmd run dev
```

Wherever this document says `npm run xxx`, Windows users can replace it with `npm.cmd run xxx`.

---

## 3. Running the project for the first time

### 3.1 Enter the project directory

If you already have the project files, in the terminal go to:

```bash
cd AgentBL-Agent-Starter
```

If you are cloning from GitHub:

```bash
git clone <repo-url>
cd AgentBL-Agent-Starter
```

Replace `<repo-url>` with the real repository address.

### 3.2 Confirm you are in the right directory

Run:

```bash
ls
```

In Windows PowerShell you can also run:

```powershell
dir
```

You should see these files or directories:

```text
README.md
package.json
data
docs
public
scripts
src
tests
```

If you cannot see `package.json`, you are not in the project root directory and need to `cd` to the right location first.

### 3.3 Install the project

Run:

```bash
npm install
```

The project currently has no external dependencies, so it only prints a message:

```text
No external dependencies are required for this preparation harness.
Next: npm run check && npm run test && npm run demo
```

Why this step matters:

- Gives all members a consistent startup habit;
- If the project adds dependencies later, nobody needs to change their workflow;
- Confirms that npm runs correctly.

### 3.4 Run the first self-check command

Run:

```bash
npm run check
```

This command checks:

- Whether the required files exist;
- Whether the scripts in `package.json` are complete;
- Whether `data/demo-case.json` can be read;
- Whether the risk engine can generate `evidence_hash`;
- Whether the risk action is a valid value.

On success you should see:

```text
check passed: files, scripts, seed data and risk engine are valid.
```

If it fails, don't panic. Read the error message first; it is usually a missing file, broken JSON format, or Node not running correctly.

### 3.5 Run the tests

Run:

```bash
npm run test
```

This command runs `tests/*.test.js`.

It mainly verifies:

- Whether the risk engine rules have been broken;
- Whether the workflow main flow still runs;
- Whether the key output fields still exist.

On success you will see the Node test pass results.

### 3.6 Run the command-line Demo

Run:

```bash
npm run demo
```

This command reads `data/demo-case.json` and then prints:

```text
AgentBL Agent mock demo flow
==========================================
1. [Created] ...
2. [Funding] ...
...

Risk report
{
  ...
}
```

Why this step matters:

- The PM can use it to understand the demo storyline;
- Agent teammates can see the risk output;
- Web3 teammates can see the state machine;
- Frontend teammates can know which fields the page should display.

### 3.7 Start the web page and API

Run:

```bash
npm run dev
```

On success you will see:

```text
AgentBL Agent harness running at http://localhost:3000
```

Open a browser and visit:

```text
http://localhost:3000
```

Note: `npm run dev` keeps occupying the terminal while it runs. If you want to stop it, press in the terminal:

```text
Ctrl + C
```

### 3.8 Check the API

After starting `npm run dev`, you can open in the browser:

```text
http://localhost:3000/api/health
```

If you see:

```json
{
  "ok": true,
  "service": "agentbl-agent-harness"
}
```

the server is working.

Then open:

```text
http://localhost:3000/api/demo-data
```

You will see the contents of `data/demo-case.json`.

---

## 4. What each command actually does

### 4.1 `npm run check`

When to run it:

- After pulling the project for the first time;
- Before every commit;
- After changing `package.json`, `data/demo-case.json` or `scripts/check.mjs`;
- When you are not sure whether the project has been broken.

What it does:

```text
Check that key files such as README, docs, data, src and tests exist
Check that the install/dev/test/check/demo/smoke scripts exist in package.json
Read demo-case.json
Call calculateRisk(data)
Confirm the risk report has an evidence_hash
Confirm contract_action is a valid action
```

Remember:

> `check` is the lowest-cost health check. Run it first.

### 4.2 `npm run test`

When to run it:

- After changing `src/core/riskEngine.js`;
- After changing `src/core/workflow.js`;
- After changing test files;
- After changing RiskReport fields.

What it does:

```text
Run tests/riskEngine.test.js
Run tests/smoke.test.js
Check that the core logic behaves as expected
```

Remember:

> If you change core logic, you must run `test`.

### 4.3 `npm run smoke`

When to run it:

- After changing `src/app/server.js`;
- After changing the API;
- After changing the workflow;
- After changing how the frontend calls the API;
- Before submitting a PR related to the main flow.

What it does:

```text
Temporarily start a server
Request /api/health
Request /api/demo-data
Request /api/workflow/simulate
Confirm the returned results are usable
Shut down the server
```

Remember:

> `smoke` checks whether the API main flow is going up in smoke.

### 4.4 `npm run demo`

When to run it:

- When the PM writes the pitch script;
- When Agent teammates tune the risk explanation;
- When Web3 teammates look at the state machine;
- When preparing the final demo;
- After changing the demo case.

What it does:

```text
Read demo-case.json
Call simulateWorkflow(data)
Print each state change
Print the RiskReport JSON
```

Remember:

> `demo` is our fallback demo option. Even if the web page breaks, we can use it to walk through the full flow.

### 4.5 `npm run dev`

When to run it:

- When building frontend pages;
- When manually inspecting the API;
- When showing the current page to teammates;
- When checking how it looks in the browser.

What it does:

```text
Start the local web server
Serve public/index.html
Serve /api/health
Serve /api/demo-data
Serve /api/risk/analyze
Serve /api/workflow/simulate
```

Remember:

> `dev` is for manual debugging; once it is running, open a browser to look.

---

## 5. How to read the project directories

When looking at the repository for the first time, don't look at all the files at once. Read in this order:

### 5.1 Docs first

```text
docs/background.md
docs/PRD.md
docs/tasks.md
docs/acceptance.md
```

What each one answers:

| File | Question it answers |
|---|---|
| `docs/background.md` | What this domain is; what bills of lading/eBL/RWA/trade finance are |
| `docs/PRD.md` | What product exactly we are building, what MVP, what pages and APIs |
| `docs/tasks.md` | What tasks each person can claim and how to verify them |
| `docs/acceptance.md` | What counts as done and which commands must pass |

### 5.2 Then the data

```text
data/demo-case.json
```

This is the input to the whole Harness. It is a simulated trade finance case.

You can think of it as:

```text
An electronic bill of lading
+ an insurance policy
+ a financing request
+ a market price
+ some transit risk events
```

### 5.3 Then the core logic

```text
src/core/riskEngine.js
src/core/workflow.js
```

`riskEngine.js` does the risk calculation.

`workflow.js` turns risk actions into process states.

### 5.4 Finally, the web layer and tests

```text
src/app/server.js
public/*
tests/*
scripts/*
```

These files expose the core logic to the web page, APIs, tests and the command line.

---

## 6. How to modify the Demo data

### 6.1 Why modify the Demo data first

The most beginner-friendly exercise is to modify `data/demo-case.json` first, because you can see the risk results change without having to understand much code.

> This section modifies the **legacy** seed (the old RiskReport engine). Realistic data for the new model is in `data/uploads/` (eBL + commercial invoices) and `data/cases/` (structured cases), with fields aligned to PricingQuote; see `data/uploads/README.md`.

### 6.2 Which fields you can change

Open:

```text
data/demo-case.json
```

You can try changing:

- `bill_of_lading.shipper`: exporter;
- `bill_of_lading.consignee`: importer;
- `bill_of_lading.vessel`: vessel name;
- `bill_of_lading.cargo`: cargo name;
- `bill_of_lading.quantity_mt`: cargo quantity;
- `bill_of_lading.declared_value_usd`: declared cargo value;
- `insurance.insured_value_usd`: insured amount;
- `financing.requested_amount_usd`: financing amount;
- `market.current_price_usd_per_mt`: current market price;
- `shipment_events`: shipment events, such as bad weather, delays, insurance risk.

### 6.3 What to run after changing it

After changing it, run:

```bash
npm run check
npm run test
npm run demo
```

Check whether these fields in the `npm run demo` output have changed:

- `risk_level`
- `cargo_health_score`
- `verified_cargo_value_usd`
- `health_factor`
- `contract_action`
- `detected_risks`
- `explanation`

### 6.4 Common mistakes

JSON files are the easiest thing to break. Note:

- Strings must use double quotes;
- There must be a comma between fields;
- Do not put an extra comma after the last item;
- Do not quote numbers, unless they were originally strings.

Bad example:

```json
{
  "cargo": "Copper Cathodes",
  "quantity_mt": 1000,
}
```

The last line has an extra comma, which makes JSON parsing fail.

Good example:

```json
{
  "cargo": "Copper Cathodes",
  "quantity_mt": 1000
}
```

---

## 7. How to test the API manually

### 7.1 Start the server

Run:

```bash
npm run dev
```

Keep this terminal open.

### 7.2 Test GET APIs in the browser

Open:

```text
http://localhost:3000/api/health
```

This shows whether the service is alive.

Open:

```text
http://localhost:3000/api/demo-data
```

This shows whether the seed data can be read.

### 7.3 Test POST APIs in the terminal

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/risk/analyze
```

It returns the risk report.

Then run:

```bash
curl -X POST http://localhost:3000/api/workflow/simulate
```

It returns the state machine simulation result.

If your Windows machine does not have `curl`, you can just use the browser for the GET APIs for now, or run directly:

```bash
npm run smoke
```

`smoke` automatically tests the key APIs for you.

---

## 8. How to claim a task

The task file is at:

```text
docs/tasks.md
```

### 8.1 How to read the task table

Tasks are grouped by role:

- PM / Business;
- Agent / AI;
- Frontend;
- Web3 / Contract;
- Backend / Integration;
- QA / Integrator.

Each task row looks like this:

```text
| AI-2 | Optimize riskEngine rules and weights | Unassigned | Todo | `npm run test` | - |
```

What each column means:

| Column | Meaning |
|---|---|
| ID | Task number, to be included in the PR |
| Task | What exactly needs to be done |
| Owner | Who is responsible |
| Status | Current status |
| Verification | How to verify it |
| Done Evidence | Evidence of completion, such as a PR link or commit |

### 8.2 What the statuses mean

| Status | Meaning |
|---|---|
| `Todo` | Nobody is working on it yet |
| `In Progress` | Someone is working on it |
| `Review` | PR submitted, waiting for review |
| `Done` | Completed and merged |
| `Blocked` | Stuck, needs help from teammates |

### 8.3 What to do before claiming a task

First make sure you are on the latest main branch:

```bash
git checkout main
git pull
```

If the main branch is not called `main`, use the repository's actual main branch name.

Then open `docs/tasks.md` and find a task whose `Owner` is `Unassigned` and whose `Status` is `Todo`.

### 8.4 How to claim a task

Suppose you want to claim:

```text
AI-2 | Optimize riskEngine rules and weights
```

Change this row from:

```text
| AI-2 | Optimize riskEngine rules and weights | Unassigned | Todo | `npm run test` | - |
```

to:

```text
| AI-2 | Optimize riskEngine rules and weights | your-name | In Progress | `npm run test` | - |
```

`your-name` can be your name, GitHub ID or team nickname.

### 8.5 Should you commit right after claiming a task

Yes, that is recommended.

That way others can see you are already working on it, avoiding collisions.

```bash
git checkout -b feature/ai-risk-weight
git add docs/tasks.md
git commit -m "chore(tasks): claim AI-2"
git push -u origin feature/ai-risk-weight
```

If your team doesn't want a separate commit just for claiming tasks, you can also put the claim and the feature changes in the same PR. But be sure to say so clearly in the group chat, so that two people don't work on the same task.

---

## 9. How to create a branch and develop

### 9.1 Why create a branch

Do not make changes directly on `main`. Reasons:

- main should stay stable;
- Each task should have its own PR;
- It is easy to roll back when something goes wrong;
- It is easy for teammates to review.

### 9.2 Branch naming rules

Recommended:

```text
feature/ai-risk-schema
feature/frontend-dashboard
feature/contract-mock
fix/smoke-api
docs/update-readme
chore/update-tasks
```

Naming suggestion:

```text
type/short-description
```

Common types:

| Type | Purpose |
|---|---|
| `feature` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `test` | Tests |
| `chore` | Miscellaneous such as task table, scripts, config |

### 9.3 Branch creation commands

First make sure the main branch is up to date:

```bash
git checkout main
git pull
```

Then create a new branch:

```bash
git checkout -b feature/your-task-name
```

Example:

```bash
git checkout -b feature/ai-risk-weight
```

---

## 10. How to develop a task

### 10.1 Look at Verification first

Every task has a `Verification` column. That column tells you what you must run when you are done.

For example:

```text
AI-2 | Optimize riskEngine rules and weights | Verification: `npm run test`
```

This means that when you are done you must at least run:

```bash
npm run test
```

If you changed the main flow, it is recommended to also run:

```bash
npm run check
npm run test
npm run smoke
npm run demo
```

### 10.2 Find files by task type

| Task type | Commonly changed files |
|---|---|
| PM / Business | `docs/*`, `README.md` |
| Agent / AI | `src/core/riskEngine.js`, `data/demo-case.json`, `tests/riskEngine.test.js` |
| Frontend | `public/index.html`, `public/app.js`, `public/styles.css` |
| Web3 / Contract | `src/core/workflow.js`, `docs/PRD.md`, `hardhat/contracts/*` |
| Backend / Integration | `src/app/server.js`, `scripts/smoke.mjs`, `tests/*` |
| QA | `scripts/*`, `tests/*`, `docs/acceptance.md` |

### 10.3 The most recommended way for beginners to develop

Don't change a lot at once.

Recommended rhythm:

```text
Change a little
→ run the relevant command once
→ look at the output
→ change a little more
→ run again
```

For example, when changing risk rules:

```bash
npm run test
npm run demo
```

For example, when changing an API:

```bash
npm run smoke
```

For example, when changing a page:

```bash
npm run dev
```

Then open the browser to look.

### 10.4 What to do if you don't know what you broke

First see which files you have changed:

```bash
git status
```

See the specific differences:

```bash
git diff
```

Run the lowest-cost check:

```bash
npm run check
```

If `check` passes, then run the commands for the task.

---

## 11. How to update task status

### 11.1 When you start

In `docs/tasks.md`:

```text
Owner: Unassigned → your-name
Status: Todo → In Progress
```

### 11.2 Before opening a PR

If your team wants the task table to reflect review status, you can change it to:

```text
Status: In Progress → Review
Done Evidence: PR link, or write Pending PR for now
```

If you don't have a PR link yet, you can leave Done Evidence empty for now and add it in another commit after the PR is created.

### 11.3 After merging

After the PR is merged, change the task to:

```text
Status: Done
Done Evidence: PR link / commit hash / test command output
```

If the team moves fast, the integrator can also update the task table centrally after merging.

---

## 12. What to check before committing code

### 12.1 Look at the working tree status

Run:

```bash
git status
```

You will see which files have been changed.

Confirm:

- It only includes files related to this task;
- You haven't accidentally changed unrelated files;
- You aren't committing local temporary files;
- It doesn't include API keys, private keys or passwords.

### 12.2 Run the verification commands

Minimum requirement:

```bash
npm run check
npm run test
```

If you changed the API, server, workflow, frontend or demo data:

```bash
npm run smoke
npm run demo
```

If you changed a page:

```bash
npm run dev
```

Then open manually:

```text
http://localhost:3000
```

### 12.3 Record the verification results

The PR should include something like:

```text
Verification:
- npm run check: passed
- npm run test: passed
- npm run smoke: passed
- npm run demo: passed
```

If you didn't run a command, say so honestly:

```text
Not run:
- npm run smoke: not needed, docs-only change
```

---

## 13. How to make a commit

### 13.1 Add files

Check the status:

```bash
git status
```

Add the files you want to commit:

```bash
git add README.md
git add docs/tasks.md
git add src/core/riskEngine.js
```

If you are sure all changes belong to this task, you can also:

```bash
git add .
```

Beginners are advised to prefer `git add <filename>` one by one, which makes accidental commits less likely.

### 13.2 Write the commit message

Recommended format:

```text
type(scope): short description
```

Examples:

```bash
git commit -m "docs(readme): explain harness workflow"
git commit -m "feat(agent): tune cargo health scoring"
git commit -m "fix(api): validate empty request body"
git commit -m "test(risk): cover insurance expiry risk"
git commit -m "chore(tasks): claim FE-1"
```

Common types:

| type | Purpose |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `test` | Tests |
| `chore` | Miscellaneous, task table, config |
| `refactor` | Refactoring without changing behavior |

### 13.3 What to do if you find a mistake before submitting

If you haven't committed yet, just edit the files and re-run the verification.

If you have committed but not pushed yet, you can amend:

```bash
git add <file>
git commit --amend
```

If you are a beginner and not familiar with `amend`, you can also make another fix commit:

```bash
git add <file>
git commit -m "fix: address review notes"
```

---

## 14. How to push a branch

Push the current branch for the first time:

```bash
git push -u origin feature/your-task-name
```

Example:

```bash
git push -u origin feature/ai-risk-weight
```

Later pushes on the same branch:

```bash
git push
```

If the push fails, common reasons are:

- No permission;
- Wrong branch name;
- Network problems;
- Local branch is behind the remote;
- GitHub SSH / token not configured yet.

For permission problems, contact the team's repo admin.

---

## 15. How to open a PR

### 15.1 Create a PR on the GitHub page

After pushing the branch, open the GitHub repository page.

Usually GitHub will prompt:

```text
Compare & pull request
```

Click it.

If there is no prompt:

1. Open the repository's Pull requests page;
2. Click New pull request;
3. Choose `main` as base;
4. Choose your branch as compare;
5. Create the PR.

### 15.2 How to write the PR title

Recommended format:

```text
[Task ID] type(scope): short description
```

Examples:

```text
[AI-2] feat(agent): tune risk scoring weights
[FE-1] feat(frontend): add exporter dashboard card
[PM-2] docs(demo): add 3-minute script
[BE-5] fix(api): validate invalid case input
```

### 15.3 PR description template

Copy the template below into the PR description:

````markdown
## Task

- Task ID:
- Owner:

## What changed

-

## Files changed

-

## How to verify

- [ ] npm run check
- [ ] npm run test
- [ ] npm run smoke
- [ ] npm run demo
- [ ] Manual browser check at http://localhost:3000

## Verification result

```text
Paste command output or summarize results here.
```

## Screenshots / demo notes

-

## Risk / notes

-
````

For a docs-only PR, you can write:

```text
Not run: npm run smoke / npm run demo, docs-only change.
```

But if you changed code, try to run the corresponding commands.

### 15.4 What to do after creating the PR

1. Post the PR link in the team group chat;
2. Change the task status to `Review` in `docs/tasks.md`;
3. If you have the PR link, temporarily fill Done Evidence with the PR link;
4. Wait for teammates to review;
5. Make changes according to the review comments;
6. Push again;
7. Wait for CI / manual verification to pass;
8. Merge.

---

## 16. What to do after review and merge

### 16.1 When you receive review comments

Don't create a new branch. Keep making changes on the original branch:

```bash
git status
git add <changed-files>
git commit -m "fix: address review feedback"
git push
```

The GitHub PR updates automatically.

### 16.2 Update your local main after merging

After the PR is merged, go back to main locally:

```bash
git checkout main
git pull
```

### 16.3 Update the task status

If you haven't updated `docs/tasks.md` yet, change the task to:

```text
Status: Done
Done Evidence: PR link or commit hash
```

If this update needs its own PR, you can open a small PR:

```bash
git checkout -b chore/mark-task-done
git add docs/tasks.md
git commit -m "chore(tasks): mark AI-2 done"
git push -u origin chore/mark-task-done
```

The team can also agree that the PM / Integrator maintains task status centrally.

---

## 17. Detailed onboarding paths for different roles

### 17.1 PM / Business

Your main job is to make the judges understand.

Read first:

```text
docs/background.md
docs/PRD.md
docs/acceptance.md
```

Common tasks:

- Write the 3-minute demo script;
- Prepare the one-sentence pitch;
- Prepare the compliance boundary Q&A;
- Prepare the final demo storyline.

Commands you will run often:

```bash
npm run demo
```

You should pay attention to these in the output:

- Each step of the state machine;
- The risk report explanation;
- `contract_action`;
- `detected_risks`.

### 17.2 Agent / AI

Your main job is to make the risk judgement credible, stable and structured.

Look at first:

```text
data/demo-case.json
src/core/riskEngine.js
tests/riskEngine.test.js
```

Common tasks:

- Tune risk rules;
- Freeze the RiskReport schema;
- Add document consistency checks;
- Generate natural-language risk explanations;
- Integrate the Qwen / DeepSeek mock fallback.

Commands you will run often:

```bash
npm run test
npm run demo
```

Notes:

- Output must be JSON;
- Don't return only natural language;
- Field changes must be synced with the frontend and tests.

### 17.3 Frontend

Your main job is to visualize the Demo.

Look at first:

```text
public/index.html
public/app.js
public/styles.css
src/app/server.js
```

Common tasks:

- Exporter Dashboard;
- Risk Agent Report;
- Investor Pool;
- Settlement Timeline;
- Run Demo button.

Commands you will run often:

```bash
npm run dev
npm run smoke
```

Open in the browser:

```text
http://localhost:3000
```

Notes:

- The data shown on the page should come from the API;
- Don't hard-code too many fields in the frontend;
- When API fields change, sync with the Agent / Backend teammates.

### 17.4 Web3 / Contract

Your main job is to map the workflow into contract thinking.

Look at first:

```text
src/core/workflow.js
docs/PRD.md
docs/background.md
```

Common tasks:

- Design the EBLRegistry interface;
- Design the RWAOfferingPool interface (createOffering / subscribe / reprice / pause / settle);
- Design the RiskPricingOracle interface (updatePricing + PricingUpdated event);
- Build the JS contract mock;
- Optionally implement minimal Solidity contracts.

Commands you will run often:

```bash
npm run test
npm run smoke
npm run demo
```

Notes:

- The hackathon MVP can use a JS mock first;
- Contract states must align with the demo state machine;
- Risk actions come from the Agent output; states are not switched out of thin air.

### 17.5 Backend / Integration

Your main job is the stability of the API and the main flow.

Look at first:

```text
src/app/server.js
scripts/smoke.mjs
tests/smoke.test.js
```

Common tasks:

- Maintain `/api/health`;
- Maintain `/api/demo-data`;
- Maintain `/api/risk/analyze`;
- Maintain `/api/workflow/simulate`;
- Add invalid-input validation.

Commands you will run often:

```bash
npm run smoke
npm run test
```

### 17.6 QA / Integrator

Your main job is to stop people from breaking the main flow.

Look at first:

```text
scripts/check.mjs
scripts/smoke.mjs
tests/*
docs/acceptance.md
```

Common tasks:

- Maintain check/test/smoke;
- Add tests;
- Prepare the final demo fallback checklist;
- Feature freeze for the final 6 hours.

Commands you will run often:

```bash
npm run check
npm run test
npm run smoke
npm run demo
```

---

## 18. Demo flow

### 18.1 Current (legacy) CLI demo

Command:

```bash
npm run demo
```

The current `npm run demo` still runs the old RiskReport engine, showing:

```text
Created → Funding → Funded → InTransit
→ AI Risk Agent analyzes cargo / market / insurance events
→ Warning / Frozen / Liquidation
```

Current seed case (`data/demo-case.json`):

```text
Shanghai Metals Export Co. → Hamburg Industrial GmbH
Cargo: Copper Cathodes, 1,000 MT
Financing: 5,600,000 USDC
Risk events: bad weather, delay, insurance expiry risk, copper price drop
```

### 18.2 Target pricing demo

The new model's demo uses the realistic data in `data/uploads/` (Singapore → Shanghai copper cathodes, 500 tonnes):

```text
Exporter uploads eBL + commercial invoice
→ AI calls tools: real-time LME copper price + historical comparable trade prices + valuation (npm run agent:value)
→ AI outputs PricingQuote: issue price ≈ 0.80 (FAST payout, giving up about 60% of the profit)
→ Created → Priced → Open (investors subscribe at ≈ 0.80)
→ Hormuz war escalation + sharp copper price volatility → AI pushes the price down to ≈ 0.76
→ Repriced / Paused, RiskPricingOracle records the new price + evidence hash
```

Judges should see:

```text
AI calls tools to pull real prices and historical trade prices
→ converts "speed + risk" into an issue price (≈ 0.80 → ≈ 0.76)
→ pricing_action / offering state changes
→ the frontend or CLI shows the price, target redemption price, risk sources and evidence hash
```

---

## 19. API preview

The current API is a Mock version and can later be replaced with real AI Agent, contract, Oracle or RAG services.

Currently implemented (Current):

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Harness health check |
| GET | `/api/demo-data` | Returns the seed electronic bill of lading case |
| GET | `/api/cases` | Returns the structured case catalog (used by the frontend scenario selector) |
| POST | `/api/risk/analyze` | Returns a structured AI risk report (old RiskReport) |
| POST | `/api/workflow/simulate` | Simulates the main-flow state machine |
| POST | `/api/pricing/quote` | Generates an AI PricingQuote (discount + amount + action; empty body uses the demo case, `?compare=true` returns three payout speeds + recommendation) |
| POST | `/api/offering/simulate` | Simulates RWA issuance, subscription, repricing, pause and settlement (`events` can escalate risk mid-way) |
| POST | `/api/workflow/pricing-simulate` | Merges PricingQuote + RiskReport + offering lifecycle into one simulation |
| POST | `/api/oracle/pricing-update` | Returns the on-chain oracle update payload (issue price/risk/action + quote_hash/evidence_hash) |
| GET | `/api/scenarios` | Returns the multi-scenario regression summary |
| POST | `/api/scenarios/run` | Runs a single scenario |
| GET | `/api/mcp/tools` | MCP tool list |
| POST | `/api/mcp/call` | Calls an MCP tool |
| POST | `/api/rag/search` | Searches the risk intelligence knowledge base |
| GET | `/api/rag/judge-qa` | Judge Q&A pairs |

The body of POST APIs can be empty. When empty, it automatically reads:

```text
data/demo-case.json
```

---

## 20. Directory structure

```text
.
├── README.md                   # Project introduction + usage guide (new)
├── docs/Instruction.md         # This file: team collaboration and onboarding basics
├── Makefile
├── package.json
├── .env.example
├── data/
│   ├── demo-case.json          # legacy seed (RiskReport engine)
│   ├── scenarios/              # Multi-scenario regression fixtures
│   ├── pricing-scenarios/      # AI pricing scenario fixtures
│   ├── uploads/                # Realistic uploaded documents: eBL + commercial invoices (Singapore copper / crude oil)
│   ├── cases/                  # Structured cases (aligned with the new model's PricingQuote fields)
│   └── risk-intel/             # RAG risk intelligence feed
├── docs/
│   ├── background.md
│   ├── PRD.md
│   ├── tasks.md
│   ├── acceptance.md
│   ├── contracts.md
│   ├── award-roadmap.md
│   └── ai-valuation-tooling.md
├── public/                     # Frontend (zero-dependency ES module SPA)
│   ├── index.html
│   ├── app.js
│   ├── api.js
│   ├── format.js
│   └── styles.css
├── scripts/
│   ├── check.mjs / demo.mjs / smoke.mjs / scenarios.mjs
│   ├── price.mjs / pricing-scenarios.mjs / agent-valuation.mjs
│   ├── judge-qa.mjs / mcp.mjs / install.mjs
├── src/
│   ├── app/server.js
│   ├── core/                   # pricingEngine / pricingSchema / offeringSimulator / oracle / ...
│   ├── agent/                  # AI valuation tool calling + LLM client + document consistency + risk intelligence
│   ├── mcp/                    # MCP server + tools
│   ├── rag/                    # Knowledge base + retrieval + judge QA
│   └── skill/                  # pricingAnalyst / demoOperator
├── hardhat/                    # Solidity contracts (RiskPricingOracle / RWAOfferingPool / ...)
└── tests/                      # node --test
```

---

## 21. What we are not doing for now

This repository deliberately does not do:

- An open secondary market;
- AMM;
- Real KYC;
- Real cross-border payments;
- Real AIS vessel data integration;
- Real high-accuracy OCR document review;
- Real smart contract mainnet deployment;
- Fundraising from the public;
- Promises of guaranteed capital or returns.

These are not forgotten; they are left out to keep the 48-hour hackathon main flow stable.

---

## 22. Final checklist before opening a PR

Before opening a PR, please confirm each item:

```text
[ ] I created my own branch from the latest main
[ ] I claimed the task in docs/tasks.md
[ ] My changes only include files related to this task
[ ] I did not commit API keys, private keys, passwords or local temporary files
[ ] I ran the verification commands required by the task
[ ] I wrote the verification results into the PR description
[ ] If I changed a page, I manually opened http://localhost:3000 to look
[ ] If I changed the main flow, I ran npm run smoke and npm run demo
[ ] The PR title includes the task ID
[ ] The PR description explains what was done, how to verify it and what the risks are
```

Minimum verification:

```bash
npm run check
npm run test
```

Main-flow-related verification:

```bash
npm run check
npm run test
npm run smoke
npm run demo
```

---

## 23. Rules for the final 6 hours

Entering the final 6 hours of the hackathon:

- No more new major features;
- Only fix bugs that affect the demo;
- Keep the CLI demo working;
- Keep the web page working;
- `npm run check`, `npm run test`, `npm run smoke` must pass;
- If the AI provider goes down, use the mock fallback;
- If the web page goes down, use `npm run demo` as the fallback demo.

At this point the most important thing is not "build one more feature", but:

> The main flow is stable, the demo is explained clearly, and the judges understand it.

---

## 24. The collaboration rules in one line

```text
Read the docs first
→ get the Harness running
→ claim a task
→ create a branch
→ change in small steps
→ run verification
→ make a commit
→ push the branch
→ create a PR
→ merge after review
```

If you are a beginner and don't know what to do next, run first:

```bash
npm run check
npm run demo
```

Then go to `docs/tasks.md` and pick a small `Unassigned` task. Take it steady, and the project will grow bit by bit.

---

## 25. Scenario Harness

To bring the project closer to a real competition entry, the Harness supports multi-scenario regression:

```bash
npm run scenarios
```

It runs regressions for both engines:

```text
1. legacy RiskReport harness: data/demo-case.json + data/scenarios/*.json
   (low-risk approval, warning margin call, severe-risk liquidation)
2. AI dynamic pricing scenarios: data/pricing-scenarios/*.json
   (fast / balanced normal opening, high-risk in-transit price cut reprice, high-risk pause)
```

The second set directly drives the AI pricing engine (risk discount = AI-4, high-risk pause/reprice = AI-10),
so `npm run scenarios` is the verification command for these two AI tasks. When adding AI, MCP, RAG, contract or frontend features in the future,
at least state which scenario it affects, and run:

```bash
npm run check
npm run test
npm run smoke
npm run scenarios
```

## 26. Judge Q&A assistant (AI-12)

A down-to-earth Q&A assistant for answering judges' follow-up questions during rehearsal (offline and deterministic by default, with optional LLM polish and automatic fallback):

```bash
npm run qa                          # Run the full judge rehearsal Q&A (6 standard questions)
npm run qa -- "why discount to 0.80?"   # Answer a single free-form question
npm run qa -- --llm "is it guaranteed?"  # Let the configured LLM polish it (automatically falls back to the deterministic answer on error)
```

Every answer is assembled from **real pricing engine numbers** (`compareSpeeds` / `quoteFromCase`) and **retrieved risk intelligence citations**
(`src/agent/riskIntel.js`), so the assistant never contradicts the pricing engine and always keeps
the compliance line "target redemption is not a capital guarantee". Implementation in `src/agent/judgeAssistant.js`.
