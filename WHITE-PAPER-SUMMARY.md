# 📘 FlagChain - White Paper Summary

**Author:** Lenam  
**Date:** April 27, 2025  
**Version:** 0.1  

---

## 1. 🧩 Executive Summary

> ⚠️ **Important Note:** FlagChain **does not seek to replace** existing CTF platforms. Its goal is to **complement them** by offering a decentralized management layer and a verifiable global ranking. It aims to integrate information from multiple sources to consolidate achievements and technical reputation.

FlagChain will be a Web3 platform for managing CTFs in a decentralized manner, ensuring transparency, censorship resistance, and efficiency. It aims to be designed to:

- Create a **global standard** for CTF publication and resolution.
- Protect **flag integrity** through asymmetric cryptography and smart contracts.
- Foster community with verifiable rankings and **incentive models**.
- **Reduce costs** with low-gas EVM networks (Polygon, Arbitrum) and IPFS/Arweave.

---

## 2. 🚨 Problems and Opportunities

### Current problems:
- Fragmented, centralized, and expensive ecosystem.
- Traditional certifications inaccessible to many.

### Web3 opportunities:
- Transparency and immutability on blockchain.
- **Demonstrable reputation without expiration**.
- Future economic incentives through tokens.
- Collaborative and decentralized knowledge validation.

---

## 3. 🎯 Target Audience

- **Hackers** who want to show verifiable skills.
- **CTF creators** seeking recognition.
- **Companies** interested in identifying technical talent.

---

## 4. 🏗️ Architecture

- **Frontend** in Next.js + Wagmi + Viem.
- **Smart contracts** in Solidity on EVM networks.
- **Storage** on IPFS/Filecoin/Arweave.
- **Indexing** via The Graph.
- **SDK** in TypeScript to facilitate integration.

---

## 5. 🔐 Technology and Cryptography

- ECDSA over secp256k1 (Ethereum-compatible).
- Flags signed as messages, without exposing their value.
- On-chain verification via `ecrecover`.

---

## 6. 🧮 Incentive Model and Scoring

### 🧑‍💻 For Hackers

- **Score**:  
  ```solidity
  scores[user] += basePoints * difficultyMultiplier;
  ```
- Multipliers:
  - Easy: ×1
  - Medium: ×2
  - Hard: ×5
- **First Blood**: +10% for being the first to solve.
- **Ranking**: calculated off-chain from `FlagCaptured` events.

### 🧠 For Creators

- Reputation based on received votes:
  ```solidity
  creatorReputationAverage = sum / count;
  ```
- Rankings by weighted average of ratings and difficulty.

### 📈 Dynamic Difficulty Adjustment

1. Initial difficulty assigned by creator.
2. Participants with sufficient reputation vote on 1–5 scale.
3. After 7 days or 100 solutions, calculated:
   ```
   difficultyAdjusted = (creatorWeight + votes) / total
   ```
4. If adjusted difficulty differs significantly, creator gains or loses reputation.

### ⏳ Temporal Value Adjustment

- +10% for new challenges (<30 days).
- -2% every 30 days from day 31 (minimum 50%).
- Old challenges can **restore value up to 80%** if they receive 50 relevant votes.

---

## 7. 💸 Project Economics

- Costs on Polygon are very low (~€0.00044 per flag submission).
- With €250, you could subsidize:
  - ~567,000 flags.
  - ~264,000 challenges.

### Free Gas for New Users

- Meta-transactions via EIP-2771.
- A relayer covers first interactions.
- Configurable limit per user.
- No need to have MATIC to start.

---

## 8. 🛡️ Security and Audit

- Prevention of reentrancy, replay attacks, front-running.
- Controls with OpenZeppelin (`ReentrancyGuard`, `Pausable`, etc.).
- Moderation system: bans, limits, challenge blocking.
- Internal + external audit (e.g., CertiK, Gitcoin).
- Kill-switch, multisig, event tracking.

---

## 9. 📈 Scalability and Future Features

- **Subgraphs** for efficient queries.
- **NFT Badges** and **reputation token**.
- DAO for governance and adjustable parameters.
- Competitive events and gamification.

---

## 10. 🛠️ Development Roadmap

1. Smart Contracts → SDK → Frontend MVP
2. Mainnet deployment (Polygon)
3. Meta-transactions, NFT, DAO, scalability

---

## 11. 📜 License

GPLv3 License:

- Open source and modifiable code.
- Redistribution must maintain the same license.
- No warranties.

---

## 🧾 Final Notes

This white paper is subject to revision based on community feedback and technical advances. Participate via the [Contributing Guide](CONTRIBUTING.en.md). 