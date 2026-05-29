# Pitfalls & Gotchas

Real bugs encountered building on Arc Testnet. Read this before you debug.

---

## 1. `evaluator` MUST be non-zero in `createJob()`

**Symptom:** `Execution reverted for an unknown reason` when calling `createJob()`.

**Cause:** ERC-8183 requires `evaluator` (2nd arg) to be a non-zero address.
The spec explicitly allows `evaluator = client` when no third-party evaluator
is needed.

```ts
// ❌ WRONG — reverts
buildCreateJobConfig(provider, ZERO_ADDRESS, expiredAt, desc, hook);

// ✅ CORRECT — use client wallet as evaluator
buildCreateJobConfig(provider, clientAddress, expiredAt, desc, hook);
```

**Note:** `provider` MAY be zero at creation. `hook` MAY be zero.
Only `evaluator` is enforced non-zero.

---

## 2. `BigInt` vs `string` from JSON

**Symptom:** `TypeError: Cannot mix BigInt and other types` or contract
reverts with no clear error.

**Cause:** JSON serialization converts `bigint` to `string`. When you read
`expiredAtUnix` from an API response, it's a string, not a bigint.

```ts
// ❌ WRONG — expiredAt is still a string from JSON
const data = await res.json();
args: [provider, evaluator, data.expiredAt, desc, hook]

// ✅ CORRECT — convert explicitly
const expiredAt = BigInt(data.expiredAt);
args: [provider, evaluator, expiredAt, desc, hook]
```

This applies to ALL uint256 args: `jobId`, `amount`, `expiredAt`, etc.

---

## 3. Use server-returned tx instruction (prevent client/server drift)

**Symptom:** Frontend creates job with different args than backend expects.
Works locally, fails in production.

**Anti-pattern:** Page calls API, gets back `tx` instruction, then ignores it
and rebuilds the call locally with its own defaults.

```ts
// ❌ WRONG — rebuilds locally, drifts from server
const data = await apiRes.json();
const hash = await writeContractAsync(
  buildCreateJobConfig(provider, evaluator, expiredAt, desc, hook)
);

// ✅ CORRECT — use server instruction as single source of truth
const data = await apiRes.json();
const hash = await writeContractAsync({
  address: data.tx.address,
  abi: ERC8183_AGENTIC_COMMERCE_ABI,
  functionName: data.tx.functionName,
  args: data.tx.args.map((a, i) => i === 2 ? BigInt(a) : a),
});
```

---

## 4. Dual decimal model: 18 vs 6

**Symptom:** Amounts are 1 million times too large or too small.

**Cause:** Arc uses USDC as native gas with **18 decimals** (like ETH),
but the ERC-20 USDC interface uses **6 decimals** (standard USDC).

| Interface | Decimals | Use case |
|-----------|----------|----------|
| Native gas | 18 | `maxFeePerGas`, balance display |
| ERC-20 `transfer()` | 6 | Token transfers, approvals |
| ERC-8183 `setBudget()` | 6 | Job escrow amounts |

```ts
// 10 USDC for escrow (ERC-20)
BigInt(10 * 10**6)  // 10_000000n

// 0.01 USDC for gas (native)
BigInt(10_000_000_000_000_000)  // 0.01 * 1e18
```

---

## 5. Gas minimum: 20 Gwei

**Symptom:** `transaction underpriced` or tx stays pending forever.

**Cause:** Arc enforces a 20 Gwei minimum base fee.

```ts
// ❌ WRONG — too low
maxFeePerGas: parseGwei('10')

// ✅ CORRECT
maxFeePerGas: parseGwei('20')
maxPriorityFeePerGas: parseGwei('1')
```

---

## 6. `PUSH0` opcode (Solidity >= 0.8.20)

**Symptom:** Contract deploys but calls revert or behave unexpectedly.

**Cause:** Solidity >= 0.8.20 defaults to Shanghai EVM which uses PUSH0.
Arc may not support it yet.

```toml
# foundry.toml
[profile.default]
evm_version = "paris"
```

---

## 7. ERC-8183 lifecycle order

The full lifecycle is sequential. Each step must confirm before the next:

```
createJob(provider, evaluator, expiredAt, desc, hook)
  → jobId (from JobCreated event)
setBudget(jobId, amount)
USDC.approve(AgenticCommerce, amount)
fund(jobId)
  ... worker does work ...
submit(jobId, deliverableHash)
complete(jobId, reasonHash)
  → USDC settles from escrow to worker
```

**Common mistake:** Calling `fund()` before `approve()` completes.
USDC `approve()` must be confirmed on-chain before `fund()`.

---

## 8. Job ID from event, not return value

**Symptom:** `jobId` is 0 or undefined after `createJob()`.

**Cause:** `createJob()` emits a `JobCreated(jobId, ...)` event but does NOT
return the jobId. You must parse it from the transaction receipt.

```ts
const hash = await writeContractAsync(buildCreateJobConfig(...));
const receipt = await waitForTransactionReceipt(config, { hash });

let jobId = BigInt(0);
for (const log of receipt.logs) {
  if (log.address.toLowerCase() !== CONTRACTS.ERC8183_AGENTIC_COMMERCE.toLowerCase()) continue;
  const decoded = decodeEventLog({
    abi: ERC8183_AGENTIC_COMMERCE_ABI,
    data: log.data,
    topics: log.topics,
  });
  if (decoded.eventName === 'JobCreated' && decoded.args && 'jobId' in decoded.args) {
    jobId = decoded.args.jobId as bigint;
  }
}
```
