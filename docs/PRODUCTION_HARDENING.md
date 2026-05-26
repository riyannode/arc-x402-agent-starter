# Production Hardening Checklist

## 1. x402 Payment Verification

- [ ] Replace demo settlement in `src/lib/x402.ts` with real verification
- [ ] Use `@x402/core` for EIP-3009 signature verification
- [ ] Use Circle Gateway SDK for server-side settlement
- [ ] Add nonce replay protection (store used nonces in DB)
- [ ] Add payment idempotency keys (prevent double-settlement)

## 2. Backend & Database

- [ ] Replace in-memory receipts with PostgreSQL / Supabase
- [ ] Add migrations for receipts, agents, and jobs tables
- [ ] Add webhook endpoints for payment/agent/job events
- [ ] Store proof URIs on IPFS (Pinata, web3.storage)
- [ ] Add read replicas for high-throughput endpoints

## 3. Auth & Rate Limiting

- [ ] Add rate limiting on x402-protected routes (e.g., 100 req/min per IP)
- [ ] Add CORS configuration for production domains
- [ ] Add API key authentication for server-to-server calls
- [ ] Add CSRF protection for wallet-triggered actions

## 4. Error Handling & Monitoring

- [ ] Add Sentry or PostHog for error tracking
- [ ] Add structured logging (pino, winston)
- [ ] Add health check endpoints (`/api/health`)
- [ ] Add uptime monitoring (Better Stack, UptimeRobot)
- [ ] Set up alerting for payment failures and contract reverts

## 5. Infrastructure

- [ ] Deploy to Vercel with production environment variables
- [ ] Use dedicated Arc RPC (not free tier dRPC)
- [ ] Add CDN caching for static content
- [ ] Configure proper DNS + SSL
- [ ] Set up CI/CD pipeline (GitHub Actions)

## 6. Security

- [ ] Rotate `X402_RECEIVER_ADDRESS` regularly
- [ ] Keep private keys in hardware wallet or KMS (not env vars)
- [ ] Run smart contract audit on any custom contracts
- [ ] Add reentrancy guards on settlement flows
- [ ] Validate all user inputs server-side (zod)

## 7. Wallet UX

- [ ] Add auto-switch-to-Arc on wallet connection
- [ ] Add network mismatch detection + prompt
- [ ] Add transaction status polling (pending → confirmed)
- [ ] Add pending transaction UI (toast, progress bar)
- [ ] Handle wallet disconnection mid-flow

## 8. Session Keys (Future)

- [ ] Implement session key generation UI
- [ ] Add session key middleware on API routes
- [ ] Add spend limit tracking
- [ ] Add key revocation UI
- [ ] Add key expiry notifications

## 9. Testing

- [ ] Unit tests for hooks (vitest)
- [ ] Unit tests for API routes
- [ ] Integration tests for x402 flow
- [ ] E2E tests with Playwright
- [ ] Contract integration tests (Foundry)

## 10. Compliance

- [ ] Add terms of service
- [ ] Add privacy policy
- [ ] Implement data retention policies
- [ ] Add audit trail for all payments
- [ ] KYC/AML for high-value transactions (if needed)
