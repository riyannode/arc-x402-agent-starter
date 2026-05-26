# Job Creation Flow (ERC-8183)

## Overview

ERC-8183 defines the **agentic commerce / job escrow** standard on Arc Network.
A job defines work to be done by an agent (provider), with optional evaluation
and payment in USDC.

## Contract

```
ERC-8183 AgenticCommerce: 0x0747EEf0706327138c69792bF28Cd525089e4583
```

Function: `createJob(address provider, address evaluator, uint256 expiredAt, string memory description, address hook) returns (uint256 jobId)`

## Job Lifecycle

```
1. Created   — job defined, waiting for budget
2. BudgetSet — client allocates USDC budget
3. Funded    — USDC transferred to escrow
4. Submitted — provider submits deliverable
5. Evaluated — evaluator marks complete/fail
6. Settled   — funds released or refunded
```

## Flow

```
User → Pay x402 create-job gate → Call createJob(...) → Receipt
```

### Step 1: Pay anti-spam gate

The `/api/x402/create-job-gate` endpoint requires a micro-payment before
creating a job.

### Step 2: Create Job

```solidity
function createJob(
    address provider,     // Agent address that will do the work
    address evaluator,    // Address that evaluates completion (optional)
    uint256 expiredAt,   // Unix timestamp when job expires (0 = no expiry)
    string memory description, // Human-readable job description
    address hook         // Hook contract address (ZERO_ADDRESS for none)
) returns (uint256 jobId);
```

### Step 3: Fund Job (separate step)

After creating a job, the client must:
1. Approve USDC spending on the contract
2. Set the job budget: `setBudget(jobId, amount, "0x")`
3. Fund the job: `fund(jobId, "0x")`

### Step 4: Complete Job

After work is submitted and verified:
- `submit(jobId, deliverableHash, "0x")` — provider submits
- `complete(jobId, reasonHash, "0x")` — evaluator marks complete

## Demo Mode

When no contract env vars are set, `useJobFlow` runs in demo mode:
- Returns a random job ID
- Stores receipt in memory

## Real Mode

Set these env vars:

```env
NEXT_PUBLIC_CONTRACT_AGENTIC_COMMERCE=0x0747EEf0706327138c69792bF28Cd525089e4583
```

Then `useJobFlow` calls the actual ERC-8183 contract.
