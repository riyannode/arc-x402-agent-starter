/**
 * Example External Agent Runtime
 *
 * A minimal Express server that demonstrates how to build an external
 * agent runtime compatible with the Arc x402 Agent Starter ecosystem.
 *
 * Endpoints:
 *   GET  /.well-known/arclayer-agent.json  — Agent manifest
 *   GET  /health                           — Health check
 *   POST /jobs/quote                       — Get a price quote for a job
 *   POST /jobs/run                         — Execute a job and return a receipt
 *   GET  /jobs/:id/status                  — Check job status
 *
 * Run: npx tsx server.ts
 * Test: curl http://localhost:4000/.well-known/arclayer-agent.json
 */

import express from 'express';
import { keccak256, toBytes } from 'viem';
import manifest from './agent.manifest.json';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

// In-memory job store (demo)
const jobs = new Map<string, {
  id: string;
  status: 'pending' | 'running' | 'completed';
  input: unknown;
  result?: unknown;
  receipt?: unknown;
  createdAt: string;
}>();

// ── Helpers ─────────────────────────────────────────────────────────────

function hashPayload(payload: unknown): string {
  const canonical = JSON.stringify(payload, Object.keys(payload as Record<string, unknown>).sort());
  return keccak256(toBytes(canonical));
}

function generateId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Routes ──────────────────────────────────────────────────────────────

/**
 * GET /.well-known/arclayer-agent.json
 * Returns the agent manifest for discovery.
 */
app.get('/.well-known/arclayer-agent.json', (_req, res) => {
  res.json(manifest);
});

/**
 * GET /health
 * Simple liveness check.
 */
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    agent: manifest.name,
    version: manifest.version,
    uptime: process.uptime(),
    jobsProcessed: jobs.size,
  });
});

/**
 * POST /jobs/quote
 * Returns a price quote for a job without executing it.
 *
 * Body: { task: string, params?: object }
 * Response: { jobId: string, price: string, estimatedDuration: string }
 */
app.post('/jobs/quote', (req, res) => {
  const { task, params } = req.body;

  if (!task) {
    return res.status(400).json({ ok: false, error: 'task is required' });
  }

  // Simple pricing: 0.01 USDC per job (10000 atomic units)
  res.json({
    ok: true,
    price: '10000', // 0.01 USDC (6 decimals)
    asset: '0x3600000000000000000000000000000000000000',
    estimatedDuration: '2s',
    task,
    params: params || {},
  });
});

/**
 * POST /jobs/run
 * Execute a job: process the input, produce a result, hash it, return a receipt.
 *
 * Body: { task: string, input: any, params?: object }
 * Response: { ok, jobId, result, deliverableHash, receipt }
 */
app.post('/jobs/run', (req, res) => {
  const { task, input, params } = req.body;

  if (!task) {
    return res.status(400).json({ ok: false, error: 'task is required' });
  }

  const jobId = generateId();

  // Simulate work: produce a result based on the task
  const result = {
    task,
    output: `Processed: ${JSON.stringify(input)}`,
    processedAt: new Date().toISOString(),
    params: params || {},
  };

  // Hash the deliverable
  const deliverableHash = hashPayload(result);

  // Build a receipt
  const receipt = {
    schema: 'arclayer.work-receipt/v1',
    jobId,
    worker: '0x0000000000000000000000000000000000000000', // Replace with actual worker address
    client: '0x0000000000000000000000000000000000000000', // Replace with actual client address
    deliverableHash,
    deliverable: result,
    timestamp: new Date().toISOString(),
    receiptHash: '', // Computed below
  };

  // Hash the full receipt (excluding receiptHash itself)
  const { receiptHash: _, ...hashable } = receipt;
  receipt.receiptHash = hashPayload(hashable);

  // Store the job
  jobs.set(jobId, {
    id: jobId,
    status: 'completed',
    input,
    result,
    receipt,
    createdAt: new Date().toISOString(),
  });

  res.json({
    ok: true,
    jobId,
    result,
    deliverableHash,
    receipt,
  });
});

/**
 * GET /jobs/:id/status
 * Check the status of a previously submitted job.
 */
app.get('/jobs/:id/status', (req, res) => {
  const job = jobs.get(req.params.id);

  if (!job) {
    return res.status(404).json({ ok: false, error: 'Job not found' });
  }

  res.json({
    ok: true,
    jobId: job.id,
    status: job.status,
    result: job.result,
    receipt: job.receipt,
    createdAt: job.createdAt,
  });
});

// ── Start ───────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🤖 External Agent Runtime running on http://localhost:${PORT}`);
  console.log(`📋 Manifest: http://localhost:${PORT}/.well-known/arclayer-agent.json`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log(`🚀 POST /jobs/run to execute a job`);
});
