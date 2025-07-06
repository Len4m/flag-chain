**FlagChain: Complete White Paper**

**Author:** Lenam
**Date:** April 27, 2025
**Version:** 0.1

# 1. Executive Summary

FlagChain will be a Web3 platform designed to unify CTF (Capture The Flag) management and resolution on a decentralized network, creating a transparent and censorship-resistant ecosystem. Its objectives are:

- **Establish a global standard** for CTF publication and resolution, avoiding information silos between platforms.
- **Guarantee integrity and security** through auditable smart contracts and asymmetric cryptography to validate flags without exposing them.
- **Foster community** through hacker and creator rankings, incentivizing quality and healthy competition.
- **Reduce costs** by leveraging low-gas EVM-compatible networks (Polygon, Arbitrum) and IPFS/Arweave for storage.

FlagChain will be built using Solidity for on-chain logic, IPFS and Filecoin/Arweave for heavy data, and a Next.js + Wagmi + Viem frontend that can be deployed on an IPFS gateway. Its modular design will facilitate scalability, future updates, and external audits.

# 2. Motivation and Opportunity

## 2.1 Current Ecosystem Problems

- **Fragmentation**: Each CTF platform uses its own scoring and publication system, preventing global comparisons.
- **Centralization**: Centralized servers and databases suffer from censorship risks, rating fraud, and single points of failure.
- **Growing costs**: Maintaining backend infrastructures involves continuous expenses, especially when scaling.
- **Certification barriers**: The high costs of traditional professional certifications can be prohibitive for people in regions with lower purchasing power, limiting their access to opportunities and recognition in cybersecurity.

## 2.2 Web3 Opportunity

- **Immutability and transparency**: Blockchain transactions offer a public and immutable record of publications, solves, and ratings.
- **Incentive model**: On-chain rankings can be complemented with tokenized rewards in the future.
- **Decentralized storage**: IPFS and Arweave reduce dependence on traditional servers and hosting costs.
- **Permanent demonstration of skills**: Unlike traditional certifications that expire and require renewal, FlagChain allows hackers to demonstrate their skills permanently and verifiably, without recurring certification costs.
- **Community empowerment**: FlagChain will facilitate cybersecurity professionals and enthusiasts to organize and certify each other's competencies, freeing themselves from burdensome traditional certifications that benefit a few and promoting a collaborative, transparent, and decentralized model of knowledge validation.

## 2.3 Target Audience and Use Cases

- **Hackers and participants**: Seek a single space to demonstrate skills.
- **CTF creators and organizers**: Want to measure the impact and reputation of their challenges.
- **Companies and recruiters**: Can use rankings to identify talent.

# 3. Project Overview

FlagChain will unify challenges and scores on a decentralized platform, using smart contracts to guarantee integrity and asymmetric cryptography to validate flags, incentivizing the community with on-chain rankings and reducing costs through low-gas EVM networks and IPFS/Arweave.

# 4. System Architecture

## 4.1 Main Components

1. **Frontend (Next.js) - Port 3000**

   - Modern user interface in Next.js 14
   - Integration with multiple wallets through Wagmi
   - Direct communication with contracts through Viem
   - State management system for challenges and scores

2. **Blockchain (Hardhat Node) - Port 8545**

   - Local Ethereum network for development
   - Smart contracts for challenge management
   - Flag verification system
   - Immutable activity record

3. **IPFS Node - Ports 4001/5001/8081**

   - Decentralized file storage
   - Gateway on port 8081 for content access
   - API on port 5001 for file uploads
   - Persistence of metadata and challenge files

4. **The Graph Node - Ports 8000/8020/8030**

   - Blockchain event indexing
   - GraphQL API for efficient queries
   - Data aggregation and statistics
   - Support for rankings and metrics

5. **PostgreSQL - Port 5432**

   - Database for The Graph Node
   - Event indexing
   - Not directly accessible by the application

## 4.2 JavaScript/TypeScript SDK

The SDK will include a **wallet connection module** to facilitate integration with MetaMask, WalletConnect, and other compatible providers, based on Wagmi and Viem:

```typescript
// SDK Configuration
interface FlagChainConfig {
  contractAddress: string;
  rpcUrl: string;
  ipfsGateway: string;
}

// Optional metadata for challenge enrichment
interface ChallengeMetadata {
  name: string;
  description: string;
  tags: string[]; // Technical tags for categorizing challenges. Examples:
                   // 'Web', 'Crypto', 'Forensics', 'Reverse Engineering', 'Pwn',
                   // 'Stego', 'Hardware', 'Network', 'Mobile', 'Cloud', 'Blockchain',
                   // 'IoT', 'Malware Analysis', 'Social Engineering', 'OSINT'
                   // New technical tags can be proposed and, after community review,
                   // incorporated into the catalog.
  fileCID?: string;
  imageCID?: string;
}

// Challenge structure
interface Challenge {
  id: string;
  creator: string;
  ipfsCID: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';       // Assigned difficulty level
  publicKeyUser: string;             // Required public key for user flag
  publicKeyRoot?: string;            // Optional public key for root flag
  active: boolean;
  metadata?: ChallengeMetadata;
  difficultyAdjusted?: number;       // Adjusted difficulty after voting
  currentValue?: number;             // Current value with decay or novelty bonus
}

// Challenge creation parameters
interface ChallengeCreationParams {
  ipfsCID: string;
  publicKeyUser: string;
  publicKeyRoot?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';   // Difficulty level, used to calculate base score
  metadata?: ChallengeMetadata;
}

// Flag submission parameters
interface FlagSubmissionParams {
  challengeId: string;
  signature: string;
  level: 'user' | 'root';         // Indicates whether user or root flag is being submitted
}

// Difficulty voting parameters
interface DifficultyVoteParams {
  challengeId: string;
  rating: number;                  // Rating 1–5
}

// Relevance voting parameters (restoration)
interface RestorationVoteParams {
  challengeId: string;
  relevance: boolean;              // True to restore, false to discard
}

class FlagChainSDK {
  constructor(config: FlagChainConfig);

  // Challenge creation and querying
  async createChallenge(params: ChallengeCreationParams): Promise<Challenge>;
  async getChallengeById(id: string): Promise<Challenge>;
  async listChallenges(filter?: { active?: boolean; tags?: string[] }): Promise<Challenge[]>;
  async getChallengeMetadata(ipfsCID: string): Promise<ChallengeMetadata>;

  // Flag submission at different levels
  async submitFlag(params: FlagSubmissionParams): Promise<boolean>;
  async submitUserFlag(params: Omit<FlagSubmissionParams, 'level'>): Promise<boolean>;
  async submitRootFlag(params: Omit<FlagSubmissionParams, 'level'>): Promise<boolean>;

  // Rating and voting
  async rateChallenge(params: { challengeId: string; stars: number }): Promise<void>;
  async voteDifficulty(params: DifficultyVoteParams): Promise<void>;
  async voteRestoration(params: RestorationVoteParams): Promise<void>;

  // Dynamic data and statistics
  async getAdjustedDifficulty(challengeId: string): Promise<number>;
  async getCurrentValue(challengeId: string): Promise<number>;
  async getLeaderboard(options?: { top?: number }): Promise<{ user: string; score: number }[]>;
}
```

This SDK will allow creating challenges with user and root flags, submitting flags differentially, voting on difficulty and relevance, and querying both dynamic values and updated rankings.

## 4.3 Data Flows

1. **Challenge Creation**:
   ```
   Frontend -> IPFS (metadata/files) -> Smart Contract (registration)
   ```
2. **Challenge Resolution**:
   ```
   Frontend -> Smart Contract (verification) -> The Graph (indexing)
   ```
3. **Challenge Querying**:
   ```
   Frontend -> The Graph (data) -> IPFS (content)
   ```

> **Note**: All these flows can be executed both through the web interface developed in Next.js + Wagmi + Viem, as well as directly through the FlagChain SDK, or even manually by interacting directly with smart contracts, allowing integration from any compatible platform, language, or tool.

# 5. Technology and Cryptography

1. **Curve and algorithm**: ECDSA over secp256k1 curve (compatibility with Ethereum stack).
2. **Key generation**:
   ```js
   privateKey = keccak256(abi.encodePacked(flagString)); // 32 bytes
   publicKey = secp256k1.publicKeyCreate(privateKey);   // 33 compressed bytes
   ```
3. **Message to sign**:
   ```js
   messageHash = keccak256(
     abi.encodePacked("FlagChain", challengeId, userAddress, nonce)
   );
   ```
   - `nonce` (timestamp or counter) is included to prevent replay.
   - Ethereum prefix is applied (`Ethereum Signed Message: 32`).
4. **On-chain verification**:
   ```solidity
   bytes32 msgHash = prefixedHash(...);
   address signer = ecrecover(msgHash, v, r, s);
   require(
     signer == addressFromPublicKey(challenges[id].publicKeyUser) || signer == addressFromPublicKey(challenges[id].publicKeyRoot),
     "Invalid signature"
   );
   ```
5. **Replay prevention**:
   - `mapping(uint256 => mapping(address => mapping(uint256 => bool))) usedNonces`.
6. **Clear revert codes**: `InvalidSignature`, `AlreadySolved`, `ChallengeInactive`.

# 6. Incentive Model and Rankings

## 6.1 Hackers

- **Point accumulation**:
  ```solidity
  scores[user] += basePoints * difficultyMultiplier;
  ```
- **Multipliers**: Easy = 1×100, Medium = 2×100, Hard = 5×100.
- **First Blood**: 10% bonus to the first solver.
- **Ranking**: calculated off-chain through subgraph that aggregates `FlagCaptured` events.

## 6.2 Creators

- **Ratings**:
  ```solidity
  creatorReputationSum[creator] += stars * difficultyMultiplier;
  creatorReputationCount[creator] += 1;
  creatorReputationAverage[creator] =
    creatorReputationSum[creator] / creatorReputationCount[creator];
  ```
- **Creator ranking**: ordered by `creatorReputationAverage`, calculated off-chain.

## 6.3 Dynamic Difficulty Management

To ensure difficulty reflects the community's real perception, FlagChain will implement a hybrid rating system:

1. **Initial Proposal**: The creator of each challenge assigns a preliminary difficulty (Easy, Medium, Hard) and a base score.
2. **Resolution Vote Collection**:
   - After each successful solution, the participant can vote on the real difficulty on a scale of 1 to 5.
   - Only votes from users with minimum reputation (e.g., >500 points) count to avoid bias.
3. **Adjustment Window**:
   - During the first 100 resolutions or first 7 days, the system collects votes.
   - After this period, the **adjusted difficulty** is calculated as a weighted average:
     ```text
     difficultyAdjusted = (initialWeight * difficultyCreator + votesWeight * difficultyCommunity) / (initialWeight + votesWeight)
     ```
   - `initialWeight` and `votesWeight` are configurable parameters (e.g., 1 and number of votes).
4. **Dynamic Rewards**:
   - The awarded score is automatically recalculated based on adjusted difficulty.
   - If adjusted difficulty differs by more than one full level from the proposal, the creator gains or loses reputation based on variance.

## 6.4 Temporal Value Adjustment of Challenges

To reflect the evolution of hacking techniques and maintain challenge relevance:

1. **Novelty Multiplier**:
   - Challenges **published in the last 30 days** receive a +10% bonus on the base score.
2. **Gradual Decay**:
   - From day 31, every 30 days the base value of a challenge is reduced by **2%**, to a **minimum of 50%** of the original score.
3. **Community Restoration**:
   - If an old challenge receives a **new set of 50 votes** demonstrating its relevance (current techniques, renewed interest), it can be restored to up to 80% of its original value.
4. **Configurable Parameters**:
   - Both time windows and percentages can be adjusted with DAO governance.

# 7. Storage and Availability

- **IPFS**: For JSON metadata (name, description, difficulty, file and image CIDs) according to a validated schema.
- **Pinning**: Services like Pinata or Infura guarantee CID availability.
- **Filecoin**: To incentivize replication of large files.
- **Arweave**: To permanently archive critical metadata.

**Data flow when creating a CTF**:

1. The creator packages a JSON (`challenge.json`) and associated files.
2. Uploads the package to IPFS and obtains a `CID_meta`.
3. The JSON contains fields: `name`, `description`, `difficulty`, `competenceTags`, `fileCID`, `imageCID`, `flagPublicKey`.
4. The frontend or any client (SDK or direct contract interaction) sends a transaction to `createChallenge` with `CID_meta` and `flagPublicKey`.

# 8. Project Economics

1. **Cost calculation**:
   ```
   gasFee = gasUsed * gasPrice;
   // Ex: 70,000 gas × 1 Gwei = 70,000 Gwei = 0.00007 ETH
   ```
2. **Euro equivalence**:
   - 1 ETH ≈ €2,000, 1 MATIC ≈ €0.21 ([kraken.com](https://www.kraken.com/convert/matic/eur?utm_source=chatgpt.com), [coingecko.com](https://www.coingecko.com/en/coins/polygon/eur?utm_source=chatgpt.com)).
   - On Polygon: 70,000 gas × 30 Gwei/gas = 0.0021 MATIC → €0.000441.
3. **Examples**:
   - **SubmitFlag** (70k gas) ≈ 0.0021 MATIC (≈€0.00044).
   - **CreateChallenge** (150k gas) ≈ 0.0045 MATIC (≈€0.00094).
4. **€250 budget**:
   - With €250 you would get ~1,190 MATIC (250 ÷ 0.21) ([kraken.com](https://www.kraken.com/convert/matic/eur?utm_source=chatgpt.com)).
   - This would allow subsidizing approximately:
     - ~567,000 free flag submissions (1,190 ÷ 0.0021).
     - ~264,000 free challenge creations (1,190 ÷ 0.0045).

### Gas Subsidy for New Users

To alleviate the gas burden on first submissions and challenge creations, FlagChain will implement a **gasless transaction system** based on meta-transactions:

1. **Trusted Forwarder (EIP-2771 / GSN)**:
   - A "trusted forwarder" contract is deployed that verifies user signatures.
   - Users sign calls (`createChallenge`, `submitFlag`) off-chain.
   - A relayer (operated by the platform) sends transactions on-chain using the MATIC pool.
2. **Subsidy Pool**:
   - The platform refills a fund with MATIC (up to €250 equivalent).
   - The relayer uses this fund to cover gas costs for the first N users.
3. **Limits and Protection**:
   - Each user can benefit from the subsidy in their **first X operations** (configurable).
   - After exhausting their quota, the user must pay gas normally.
4. **Benefits**:
   - Frictionless user experience for onboarding.
   - Predictable and transparent cost control.
   - Aligned with Web3 philosophy, without imposing hidden fees.

With this mechanism, **new participants can interact with FlagChain without needing to own MATIC**, facilitating their entry and initial community expansion.

# 9. Security and Audit

1. **Threat model**:

   - On-chain: reentrancy, overflows, invalid signatures, replays, front-running, DoS.
   - Off-chain: IPFS manipulation, frontend phishing attacks.
   - Social: spam, system abuse, ranking manipulation.

2. **Security Controls**:

   - **OpenZeppelin**:

     - `ReentrancyGuard` to prevent reentrancy attacks
     - `Pausable` to stop operations in emergencies
     - `AccessControl` for granular role management
     - `Counters` for secure and non-predictable IDs

   - **Front-running Protection**:

     - Cooldown system between actions (1 hour)
     - Tracking of last activity timestamps
     - Verification of duplicate transactions
     - Unique nonces per user and challenge

   - **Limits and Restrictions**:

     - Maximum 1000 points per challenge
     - Duration between 1 hour and 365 days
     - Maximum 10 challenges per user
     - Maximum 5 attempts per challenge
     - 7-day rating window

   - **Access Control**:

     - `DEFAULT_ADMIN_ROLE`: Role management
     - `CREATOR_ROLE`: Challenge creation
     - `PAUSER_ROLE`: System pause/unpause
     - `OPERATOR_ROLE`: Moderation and management

   - **Moderation System**:

     - User banning capability
     - Blocking of problematic challenges
     - User activity tracking
     - Detailed statistics

3. **Audit process**:

   - **Internal**:

     - Unit tests (Hardhat, Foundry)
     - Static analysis (Slither, Mythril)
     - Fuzzing and integration tests

   - **External**:

     - Third-party audit (CertiK, Quantstamp)
     - Bug Bounty on platforms like Gitcoin
     - Community peer review

4. **Mitigations**:

   - Kill-switch and pausability
   - Multisig (Gnosis Safe) for critical functions
   - Cooldown system to prevent spam
   - Transaction tracking to prevent duplicates
   - Exhaustive state verifications

5. **Monitoring and Response**:

   - Events for all important actions
   - Detailed usage statistics
   - Abuse reporting system
   - Rapid blocking capability for problematic challenges

6. **Best Practices**:

   - Use of SafeMath (implicit in Solidity 0.8+)
   - State verifications before operations
   - Events for all important actions
   - Clear documentation of functions and roles
   - Modular and maintainable code

7. **Incident Response Plan**:

   - Emergency pause protocol
   - Contract update process
   - Community communication
   - Fund recovery if necessary

# 10. Scalability and Future Improvements

1. **Indexing with The Graph**:
   - Subgraph for key events and GraphQL queries.
2. **Meta-Transactions**:
   - Relayers that allow gasless UX for onboarding.
3. **Additional modules**:
   - **NFT Badges** (ERC-721) for achievements.
   - **Reputation token** (ERC-20) for perks.
   - **Live events** with competitive leaderboard.
4. **Governance**:
   - DAO for voting on updates and new features.
5. **SDK and third-party integration**:
   - npm package (JavaScript/TypeScript) with:
     - Contract connection (address and ABI).
     - Wrappers for `createChallenge()`, `submitFlag()`, `rateChallenge()`, `getChallenges()`, `getScores()`.
     - Utilities for signatures and nonce management.
   - Detailed documentation on GitHub and examples for Next.js, React, Node.js, PHP.
   - Semantic versioning to guarantee compatibility.

# 11. Development Roadmap

Our approach prioritizes building in the following immutable order: **1) Smart Contracts**, **2) SDK**, **3) Frontend MVP**, backed by an initial phase of preparation and specifications. Below are the detailed phases:

**Phase 0: Preparation and Specifications**

- Definition of Smart Contract interface (functions, events, data structures) and ABI generation.
- Setup of development environments and testnets (Hardhat Node, Mumbai, Goerli).
- Design of unit and integration tests.

**Phase 1: Smart Contract Implementation & SDK API**

- Development and implementation of `FlagChain.sol` contract in Solidity.
- Emission of `ChallengeCreated`, `FlagCaptured`, and `ChallengeRated` events.
- Design and publication of public SDK API based on ABI.
- Unit tests and bug fixes (Hardhat, Foundry).

**Phase 2: SDK Development & Testing**

- Implementation of npm/TypeScript library to interact with Smart Contracts.
- Wrappers for `createChallenge()`, `submitFlag()`, `rateChallenge()`, `getChallenges()`, `getScores()`, nonce management, and signatures.
- Integration testing on testnets and initial documentation.

**Phase 3: Frontend MVP Development**

- DApp construction in Next.js + Wagmi + Viem consuming the SDK.
- Basic features: challenge listing, challenge details, flag submission, and ranking visualization.
- End-to-end testing and static deployment on IPFS/Arweave or traditional server.

**Phase 4: Mainnet Launch & Bounty Program**

- Deployment on Polygon PoS.
- Integration with pinning services (IPFS, Arweave).
- Creator dashboard and complete rating system.
- Bug bounty launch and external audit.

**Phase 5: Scalability and Advanced Features**

- Subgraph implementation in The Graph for efficient GraphQL queries.
- Meta-Transactions introduction for gasless UX.
- NFT Badges (ERC-721) and reputation token (ERC-20) development.
- Live events organization and gamification elements.

**Phase 6: Governance and Continuous Extensions**

- DAO establishment for protocol governance.
- Oracle integration and cross-chain collaboration with other CTF platforms.
- Community extension of certification modules and reward programs.

# 12. License and Transparency

This project is licensed under the [GNU General Public License v3.0](LICENSE). This means that:

- The code is free and open source
- Any modifications must be distributed under the same license
- The license and copyright notices must be included in all copies
- No warranty is provided

For more details about the license, see the [LICENSE](LICENSE) file.

## Auxiliary Components

- **IPFS Pinning**: services like Pinata or Infura to ensure availability. They don't affect immutability, only redundancy.
- **RPC Gateways**: Infura or Alchemy to facilitate connections without requiring your own node. Users can opt for alternative nodes.
- **Off-Chain Indexing**: The Graph subgraphs or similar indexers process on-chain events to offer efficient queries.
- **Frontend Hosting**: although it can be deployed on IPFS/Arweave, centralized platforms (Netlify, Vercel) are also supported for more agile updates.

# 13. Final Notes

This white paper is provisional and subject to modifications as development progresses, new technologies are incorporated, or community feedback is received. To contribute or report issues, check the [Contributing Guide](CONTRIBUTING.en.md). 