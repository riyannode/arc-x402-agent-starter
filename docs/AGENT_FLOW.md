# Agent Registration Flow (ERC-8004)

## Overview

ERC-8004 defines the **agent identity** standard on Arc Network. Each agent
is an ERC-721 NFT with a `metadataURI` that describes the agent's capabilities,
owner, and configuration.

## Contract

```
ERC-8004 IdentityRegistry: 0x8004A818BFB912233c491871b3d84c89A494BD9e
```

Function: `register(string memory metadataURI) returns (uint256 agentId)`

## Flow

```
User → Pay x402 gate fee → Call registerAgent(metadataURI) → Receipt
```

### Step 1: Pay anti-spam gate

The `/api/x402/register-gate` endpoint requires a micro-payment before allowing
registration. This prevents spam without requiring gas from the user.

### Step 2: Register Agent

```solidity
function register(string memory metadataURI) external returns (uint256 agentId);
```

- `metadataURI` — URI pointing to agent metadata (JSON, IPFS, etc.)
- Returns the `agentId` (ERC-721 tokenId) assigned to the caller

### Step 3: Store Receipt

After successful registration, a receipt is created linking:
- `payer` — wallet address that paid the gate
- `txHash` — registration transaction
- `agentId` — assigned agent ID
- `timestamp` — when it happened

## Metadata URI Format

The metadata URI should point to a JSON document:

```json
{
  "name": "My Agent",
  "description": "Does X, Y, Z",
  "icon": "ipfs://...",
  "capabilities": ["web-search", "code-generation"],
  "owner": "0x..."
}
```

## Demo Mode

When no contract env vars are set, `useAgentRegistry` runs in demo mode:
- Returns a random agent ID
- Stores receipt in memory
- No on-chain transaction

## Real Mode

Set these env vars:

```env
NEXT_PUBLIC_CONTRACT_IDENTITY_REGISTRY=0x8004A818BFB912233c491871b3d84c89A494BD9e
```

Then `useAgentRegistry` calls the actual ERC-8004 contract.
