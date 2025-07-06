# 🤝 FlagChain Contributing Guide

Thank you for your interest in contributing to FlagChain! This project aims to build a decentralized platform for CTF (Capture The Flag) management that is open, transparent, and resistant to censorship.

## 📌 Project Principles

  ⚠️ **Important Note:** FlagChain *does not aim to replace* any existing CTF platform.  
  Its goal is to **complement the ecosystem**, offering a unified layer for management, verification, and decentralized ranking for challenges published anywhere in the world.  
  The vision is to collaborate, not compete, consolidating reputation and technical achievements globally and verifiably.

- Transparency and decentralization
- Security and privacy of participants
- Fair and collaborative incentives
- Global accessibility

## 🧱 How to Contribute

### 1. Review the Code and Documentation

Before starting, make sure to understand the project architecture:

- [White Paper](./WHITE-PAPER-SUMMARY.md)
- Smart Contracts (Solidity with Hardhat)
- SDK (TypeScript)
- Frontend (Next.js + Wagmi + Viem)

### 2. Development Environment Setup

This project uses **Scaffold-ETH 2**. To set up your environment:

```bash
# Clone the repository
git clone https://github.com/Len4m/flag-chain.git
cd flag-chain

# Install dependencies
yarn install

# Start local chain
yarn chain

# Deploy contracts (in another terminal)
yarn deploy

# Start frontend (in another terminal)
yarn start
```

### 3. Create a Fork

Fork the repository and work from a branch:

```bash
git checkout -b your-branch-name
```

### 4. Types of Accepted Contributions

- Bug fixes or vulnerability patches
- Smart contract improvements
- New features (e.g., new challenge types, DAO voting)
- Documentation or tutorial improvements
- Translations
- Design or UX feedback

### 5. Code Style

- **Solidity**: Follow OpenZeppelin style guidelines and use Prettier for formatting
- **TypeScript/JavaScript**: Use ESLint and Prettier (configured in Scaffold-ETH 2)
- **Next.js**: Follow best practices for components and hooks
- **Wagmi/Viem**: Use hooks and utilities provided by the framework

### 6. Pull Requests

1. Commit your changes with clear messages.
2. Verify tests pass:
   ```bash
   yarn test          # Frontend tests
   yarn hardhat:test  # Contract tests
   ```
3. Open a detailed PR indicating the purpose of the contribution.
4. For major improvements, open an Issue first to discuss it.

### 7. Code of Conduct

All contributors must follow our [Code of Conduct](./CODE_OF_CONDUCT.md). We foster an inclusive, respectful, and constructive environment.

---

## 🧪 Testing and Quality

Before submitting a PR:

- Ensure tests pass correctly:
  ```bash
  yarn test                    # Frontend tests
  yarn hardhat:test            # Contract tests
  yarn hardhat:coverage       # Test coverage
  ```
- Write tests for new features if possible.
- Use tools like Slither, Mythril included in Scaffold-ETH 2 for local audits.

## 🛠️ Tools Included in Scaffold-ETH 2

- **Hardhat**: For contract development and deployment
- **Foundry**: For advanced contract testing
- **Wagmi + Viem**: For Ethereum integration
- **Next.js**: React framework for frontend
- **Tailwind CSS**: For styling
- **TypeScript**: Static typing
- **The Graph**: For data indexing (optional)

## 📁 Project Structure

```
flag-chain/
├── packages/
│   ├── hardhat/          # Smart contracts
│   │   ├── contracts/    # Solidity contracts
│   │   ├── deploy/       # Deployment scripts
│   │   └── test/         # Contract tests
│   └── nextjs/           # Frontend
│       ├── components/   # React components
│       ├── pages/        # Next.js pages
│       └── hooks/        # Custom hooks
└── README.md
```

## 🔧 Useful Commands

```bash
# Development
yarn chain            # Start local network
yarn deploy           # Deploy contracts
yarn start            # Start frontend
yarn build            # Build for production

# Testing
yarn test             # Frontend tests
yarn hardhat:test     # Contract tests
yarn hardhat:coverage # Test coverage

# Tools
yarn hardhat:verify   # Verify contracts
yarn generate         # Generate TypeScript types
yarn lint             # Linter
yarn format           # Code formatting
```

## 💬 Support Channels

- [Issues](https://github.com/Len4m/flag-chain/issues)
- [Discussions](https://github.com/Len4m/flag-chain/discussions)
- Discord (coming soon)

---

Thank you again for your interest. Your contribution helps grow the FlagChain community! 🚩 