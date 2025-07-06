# 🚀 FlagChain - Development Context

**Project:** FlagChain - Decentralized CTF Platform  
**Framework:** Scaffold-ETH 2  
**Date:** April 27, 2025  
**Version:** 0.1  

---

## 📋 Project Summary

FlagChain is a Web3 platform for managing CTFs (Capture The Flag) in a decentralized manner. **It DOES NOT replace existing platforms**, but complements them with a unified management layer and global ranking.

### Main Objectives:
- Create a global standard for CTF publication and resolution
- Guarantee integrity through smart contracts and asymmetric cryptography
- Foster community with on-chain rankings
- Reduce costs using low-gas EVM networks and IPFS

---

## 🏗️ Technical Architecture

### Technology Stack (Scaffold-ETH 2):
- **Frontend**: Next.js 14 + Wagmi + Viem + Tailwind CSS
- **Smart Contracts**: Solidity + Hardhat + Foundry
- **Blockchain**: Polygon (mainnet) / Hardhat Node (development)
- **Storage**: IPFS + Arweave/Filecoin
- **Indexing**: The Graph
- **Wallet Integration**: Wagmi (MetaMask, WalletConnect, etc.)

### Development Ports:
- Frontend: `http://localhost:3000`
- Hardhat Node: `http://localhost:8545`
- IPFS: `http://localhost:8081` (gateway)
- The Graph: `http://localhost:8000`

---

## 🔧 Scaffold-ETH 2 Commands

```bash
# Initial setup
yarn install

# Development
yarn chain          # Start Hardhat Node
yarn deploy         # Deploy contracts
yarn start          # Start Next.js frontend
yarn build          # Build for production

# Testing
yarn test           # Frontend tests
yarn hardhat:test   # Contract tests
yarn hardhat:coverage  # Coverage

# Tools
yarn generate       # Generate TypeScript types
yarn lint           # Linter
yarn format         # Code formatting
yarn hardhat:verify # Verify contracts
```

---

## 📊 Main Data Structures

### Challenge (Challenge)
```solidity
struct Challenge {
    uint256 id;
    address creator;
    string ipfsCID;          // Metadata on IPFS
    uint8 difficulty;        // 1=Easy, 2=Medium, 3=Hard
    bytes publicKeyUser;     // Public key for user flag (33 bytes)
    bytes publicKeyRoot;     // Public key for root flag (33 bytes)
    bool active;
    uint256 createdAt;
    uint256 basePoints;      // Base points by difficulty
}
```

### Metadata JSON (IPFS)
```json
{
  "name": "Challenge Name",
  "description": "Detailed description",
  "tags": ["Web", "Crypto", "Forensics"],
  "difficulty": "Medium",
  "fileCID": "QmHash...",
  "imageCID": "QmHash...",
  "flagHints": ["Hint 1", "Hint 2"]
}
```

---

## 🎯 Main Features

### 1. Challenge Management
- **Create challenge**: `createChallenge(ipfsCID, publicKeyUser, publicKeyRoot, difficulty)`
- **List challenges**: `getChallenges()` with filters
- **Get challenge**: `getChallenge(id)`
- **Activate/Deactivate**: `toggleChallenge(id)`

### 2. Flag Resolution
- **Submit flag**: `submitFlag(challengeId, signature, level)`
- **Verify**: Cryptographic system with ECDSA
- **Levels**: 'user' and 'root' (different flags)

### 3. Scoring System
- **Base points**: Easy=100, Medium=200, Hard=500
- **First Blood**: +10% to first solver
- **Multipliers**: According to community-adjusted difficulty

### 4. Rankings
- **Hackers**: By accumulated points
- **Creators**: By average rating of challenges

---

## 🔐 Cryptographic System

### Key Generation
```javascript
// Generate private key from flag
const privateKey = keccak256(abi.encodePacked(flagString));
const publicKey = secp256k1.publicKeyCreate(privateKey, true); // 33 compressed bytes
```

### Flag Signing
```javascript
// Message to sign
const messageHash = keccak256(
  abi.encodePacked("FlagChain", challengeId, userAddress, nonce)
);
const signature = secp256k1.sign(messageHash, privateKey);
```

### On-Chain Verification
```solidity
function verifyFlag(uint256 challengeId, bytes memory signature) public {
    bytes32 messageHash = keccak256(abi.encodePacked("FlagChain", challengeId, msg.sender, nonce));
    bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    address signer = ecrecover(ethSignedHash, v, r, s);
    
    require(
        signer == addressFromPublicKey(challenges[challengeId].publicKeyUser) ||
        signer == addressFromPublicKey(challenges[challengeId].publicKeyRoot),
        "Invalid signature"
    );
}
```

---

## 🛠️ Main Contracts

### FlagChain.sol (Main Contract)
```solidity
contract FlagChain is ReentrancyGuard, Pausable, AccessControl {
    // Roles
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    // Structures
    mapping(uint256 => Challenge) public challenges;
    mapping(address => uint256) public scores;
    mapping(address => uint256) public creatorReputation;
    
    // Events
    event ChallengeCreated(uint256 indexed id, address indexed creator);
    event FlagCaptured(uint256 indexed challengeId, address indexed solver, uint8 level);
    event ChallengeRated(uint256 indexed challengeId, address indexed rater, uint8 stars);
}
```

### Main Functions
- `createChallenge()`: Create new challenge
- `submitFlag()`: Submit flag with signature
- `rateChallenge()`: Rate challenge (1-5 stars)
- `getLeaderboard()`: Get ranking
- `voteDifficulty()`: Vote on real difficulty

---

## 📱 Frontend (Next.js + Wagmi)

### Folder Structure
```
packages/nextjs/
├── components/
│   ├── Challenge/
│   │   ├── ChallengeCard.tsx
│   │   ├── ChallengeDetail.tsx
│   │   ├── CreateChallenge.tsx
│   │   └── SubmitFlag.tsx
│   ├── Leaderboard/
│   │   ├── HackerRanking.tsx
│   │   └── CreatorRanking.tsx
│   └── common/
├── hooks/
│   ├── useChallenge.ts
│   ├── useFlag.ts
│   └── useRanking.ts
├── pages/
│   ├── challenges/
│   ├── leaderboard/
│   └── create/
└── utils/
    ├── crypto.ts
    └── ipfs.ts
```

### Main Hooks
```typescript
// useChallenge.ts
export const useChallenge = () => {
  const { data: challenges } = useContractRead({
    address: FLAGCHAIN_ADDRESS,
    abi: FLAGCHAIN_ABI,
    functionName: 'getChallenges',
  });

  const { write: createChallenge } = useContractWrite({
    address: FLAGCHAIN_ADDRESS,
    abi: FLAGCHAIN_ABI,
    functionName: 'createChallenge',
  });

  return { challenges, createChallenge };
};

// useFlag.ts
export const useFlag = () => {
  const { write: submitFlag } = useContractWrite({
    address: FLAGCHAIN_ADDRESS,
    abi: FLAGCHAIN_ABI,
    functionName: 'submitFlag',
  });

  return { submitFlag };
};
```

---

## 🌐 IPFS Integration

### File Upload
```typescript
// utils/ipfs.ts
import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001' });

export const uploadToIPFS = async (file: File): Promise<string> => {
  const added = await ipfs.add(file);
  return added.cid.toString();
};

export const uploadMetadata = async (metadata: ChallengeMetadata): Promise<string> => {
  const added = await ipfs.add(JSON.stringify(metadata));
  return added.cid.toString();
};
```

### Data Retrieval
```typescript
export const getFromIPFS = async (cid: string): Promise<any> => {
  const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
  return await response.json();
};
```

---

## 📊 The Graph (Indexing)

### Subgraph Schema
```graphql
# schema.graphql
type Challenge @entity {
  id: ID!
  creator: Bytes!
  ipfsCID: String!
  difficulty: Int!
  active: Boolean!
  createdAt: BigInt!
  solves: [Solve!]! @derivedFrom(field: "challenge")
  ratings: [Rating!]! @derivedFrom(field: "challenge")
}

type Solve @entity {
  id: ID!
  challenge: Challenge!
  solver: Bytes!
  level: Int!
  timestamp: BigInt!
  points: Int!
}

type User @entity {
  id: ID!
  totalScore: Int!
  solves: [Solve!]! @derivedFrom(field: "solver")
  challengesCreated: [Challenge!]! @derivedFrom(field: "creator")
}
```

### GraphQL Queries
```graphql
# Get leaderboard
query GetLeaderboard {
  users(first: 100, orderBy: totalScore, orderDirection: desc) {
    id
    totalScore
    solves {
      challenge {
        id
        difficulty
      }
      points
    }
  }
}

# Get active challenges
query GetActiveChallenges {
  challenges(where: { active: true }) {
    id
    creator
    ipfsCID
    difficulty
    createdAt
    solves {
      solver
      level
    }
  }
}
```

---

## 🔒 Security and Considerations

### OpenZeppelin Security
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
```

### Security Controls
- **Reentrancy Protection**: `nonReentrant` modifier
- **Pausable**: Emergency pause system
- **Access Control**: Granular roles (CREATOR, PAUSER, OPERATOR)
- **Rate Limiting**: Cooldowns between actions
- **Signature Verification**: Strict cryptographic validation

### System Limits
- Maximum 1000 points per challenge
- Maximum 10 challenges per user
- Maximum 5 attempts per challenge
- 1-hour cooldown between actions

---

## 🧪 Testing Strategy

### Contract Tests (Hardhat + Foundry)
```solidity
// test/FlagChain.test.sol
contract FlagChainTest is Test {
    FlagChain public flagChain;
    
    function setUp() public {
        flagChain = new FlagChain();
    }
    
    function testCreateChallenge() public {
        // Test creation logic
    }
    
    function testSubmitFlag() public {
        // Test flag submission
    }
}
```

### Frontend Tests (Jest + React Testing Library)
```typescript
// __tests__/ChallengeCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ChallengeCard } from '../components/Challenge/ChallengeCard';

describe('ChallengeCard', () => {
  it('renders challenge information', () => {
    render(<ChallengeCard challenge={mockChallenge} />);
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
  });
});
```

---

## 📚 Documentation References

### Scaffold-ETH 2
- [Official Documentation](https://docs.scaffoldeth.io/)
- [GitHub](https://github.com/scaffold-eth/scaffold-eth-2)
- [Examples](https://github.com/scaffold-eth/scaffold-eth-2/tree/main/examples)

### Wagmi + Viem
- [Wagmi Docs](https://wagmi.sh/)
- [Viem Docs](https://viem.sh/)
- [Wagmi Examples](https://wagmi.sh/examples)

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)

### Solidity + Hardhat
- [Solidity Docs](https://docs.soliditylang.org/)
- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin](https://docs.openzeppelin.com/)

### The Graph
- [The Graph Docs](https://thegraph.com/docs/)
- [Subgraph Developer Guide](https://thegraph.com/docs/en/developing/creating-a-subgraph/)

### IPFS
- [IPFS Docs](https://docs.ipfs.io/)
- [js-ipfs](https://github.com/ipfs/js-ipfs)

---

## 🎯 Development Roadmap

### Phase 1: Smart Contracts (High Priority)
- [ ] Implement `FlagChain.sol` with all functions
- [ ] Role and permission system
- [ ] Cryptographic flag verification
- [ ] Complete unit tests
- [ ] Security audit

### Phase 2: TypeScript SDK
- [ ] Contract function wrappers
- [ ] Cryptography utilities
- [ ] IPFS management
- [ ] Documentation and examples

### Phase 3: Frontend MVP
- [ ] Scaffold-ETH 2 configuration
- [ ] Main components
- [ ] Wagmi integration
- [ ] Responsive UI/UX

### Phase 4: Indexing and Optimization
- [ ] The Graph subgraph
- [ ] Optimized GraphQL queries
- [ ] Caching and performance

### Phase 5: Deployment and Production
- [ ] Polygon deployment
- [ ] Production IPFS configuration
- [ ] Monitoring and metrics

---

## 🚨 Important Considerations

1. **Development Order**: ALWAYS Smart Contracts → SDK → Frontend
2. **Scaffold-ETH 2 First**: Leverage all framework tools
3. **Security**: Every function must be audited and tested
4. **Gas Optimization**: Use Polygon for low costs
5. **User Experience**: Meta-transactions for frictionless onboarding
6. **Decentralization**: IPFS for storage, avoid centralization

---

**This documentation should be kept updated throughout development!** 