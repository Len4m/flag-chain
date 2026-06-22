# 🚩 FlagChain (versión temprana) / FlagChain (Early Version)

> **⚠️ Proyecto discontinuado / Project discontinued**
>
> **🇪🇸 Español:** Este proyecto no continuará. FlagChain pretendía englobar **todas** las plataformas CTF, pero muchos retos en formato OVA (VMWare/VBox) permiten extraer flags del disco sin resolverlos, lo que facilita automatizar su envío y invalida tokens y reputación. Solo sería viable en retos **hospedados** sin acceso al disco (p. ej. Hack The Box, TryHackMe, Offensive Security Proving Grounds, PortSwigger, PentesterLab), que no representan el ecosistema completo.
>
> **🇬🇧 English:** This project will not be continued. FlagChain aimed to **encompass all** CTF platforms, but many OVA-based challenges (VMWare/VBox) allow flag extraction from the disk without solving them, enabling automated submissions that undermine tokens and reputation. It would only be viable for **hosted** challenges with no disk access (e.g. Hack The Box, TryHackMe, Offensive Security Proving Grounds, PortSwigger, PentesterLab), which do not represent the full ecosystem.

---

## 🇪🇸 Español

**FlagChain** será una plataforma Web3 descentralizada para la publicación, resolución y verificación de retos CTF (Capture The Flag), con un sistema de reputación y rankings globales.  
Está en fase inicial de diseño y desarrollo. Todos los documentos, interfaces y contratos están **en construcción activa**.

## 🇬🇧 English

**FlagChain** will be a decentralized Web3 platform for publishing, solving, and verifying CTF (Capture The Flag) challenges, featuring a reputation system and global rankings.  
It's currently in the initial design and development phase. All documents, interfaces, and contracts are **under active construction**.

---

## 📄 Documentación

### 🇪🇸 Documentación en Español
- 📘 [Libro Blanco Completo](./LIBRO-BLANCO.md): visión técnica, arquitectura, incentivos, economía y seguridad.
- 📑 [Resumen del Libro Blanco](./RESUMEN-LIBRO-BLANCO.md): visión condensada para lectura rápida.
- 🤝 [Guía de Contribución](./CONTRIBUTING.md): cómo colaborar con el proyecto.

### 🇬🇧 English Documentation
- 📘 [Complete White Paper](./WHITE-PAPER.md): technical vision, architecture, incentives, economics, and security.
- 📑 [White Paper Summary](./WHITE-PAPER-SUMMARY.md): condensed version for quick reading.
- 🤝 [Contributing Guide](./CONTRIBUTING.en.md): how to collaborate with the project.
- 🚀 [Development Context](./DEVELOPMENT-CONTEXT.md): technical development context and references.

> **📌 Nota importante:** FlagChain **no pretende sustituir** otras plataformas de CTF.  
> Su objetivo es **complementarlas**, ofreciendo una infraestructura común para validación, seguimiento y reputación técnica verificable en todo el ecosistema.

### 🎯 Comparison Table / Tabla Comparativa

| Document Type / Tipo de Documento | Español | English |
|------------------------------------|---------|---------|
| **Main README / README Principal** | Este archivo / This file | Este archivo / This file |
| **Complete White Paper / Libro Blanco Completo** | [LIBRO-BLANCO.md](./LIBRO-BLANCO.md) | [WHITE-PAPER.md](./WHITE-PAPER.md) |
| **White Paper Summary / Resumen del Libro Blanco** | [RESUMEN-LIBRO-BLANCO.md](./RESUMEN-LIBRO-BLANCO.md) | [WHITE-PAPER-SUMMARY.md](./WHITE-PAPER-SUMMARY.md) |
| **Contributing Guide / Guía de Contribución** | [CONTRIBUTING.md](./CONTRIBUTING.md) | [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) |
| **Development Context / Contexto de Desarrollo** | *(No disponible / Not available)* | [DEVELOPMENT-CONTEXT.md](./DEVELOPMENT-CONTEXT.md) |

### 🔧 Quick Start for Contributors / Inicio Rápido para Contribuidores

```bash
# Setup / Configuración
yarn install

# Development / Desarrollo
yarn chain          # Start local blockchain / Iniciar blockchain local
yarn deploy         # Deploy contracts / Desplegar contratos
yarn start          # Start Next.js frontend / Iniciar frontend Next.js

# Testing / Pruebas
yarn test           # Frontend tests / Tests del frontend
yarn hardhat:test   # Contract tests / Tests de contratos
```

### 🚀 Technology Stack / Stack Tecnológico
- **Frontend**: Next.js 14 + Wagmi + Viem + Tailwind CSS
- **Smart Contracts**: Solidity + Hardhat + Foundry
- **Framework**: Scaffold-ETH 2
- **Blockchain**: Polygon (production / producción) / Hardhat Node (development / desarrollo)
- **Storage / Almacenamiento**: IPFS + Arweave/Filecoin
- **Indexing / Indexación**: The Graph with GraphQL

---

## 🛠 Current Status / Estado Actual

> ⚠️ **This project is in a very early stage. / Este proyecto está en una etapa muy temprana.**  
> Ideas, structures, and components are subject to frequent changes. / Las ideas, estructuras y componentes están sujetos a cambios frecuentes.

### 🇪🇸 Español
- 🔬 Actualmente trabajando en:
  - Contratos inteligentes (`FlagChain.sol`)
  - SDK inicial en TypeScript
  - Prototipo de frontend (Next.js + Wagmi + Viem)
- 🧪 Pruebas en entornos locales (Hardhat, IPFS, The Graph)

### 🇬🇧 English
- 🔬 Currently working on:
  - Smart contracts (`FlagChain.sol`)
  - Initial TypeScript SDK
  - Frontend prototype (Next.js + Wagmi + Viem)
- 🧪 Testing in local environments (Hardhat, IPFS, The Graph)

---

## 📬 Contact / Contacto

**🇪🇸 Español:**  
Si deseas contribuir, hacer preguntas o dar feedback, puedes escribirme por **Discord: `LenamGenX`**.  
También puedes usar la sección de [Issues](https://github.com/Len4m/flag-chain/issues) (cuando el repositorio sea público).

**🇬🇧 English:**  
If you'd like to contribute, ask questions, or provide feedback, you can reach me on **Discord: `LenamGenX`**.  
You can also use the [Issues](https://github.com/Len4m/flag-chain/issues) section (when the repository becomes public).

---

## 📜 License / Licencia

**🇪🇸 Español:**  
Este proyecto se encuentra bajo la licencia **GNU GPLv3**.  
Consulta el archivo [LICENSE](./LICENSE) para más información.

**🇬🇧 English:**  
This project is licensed under **GNU GPLv3**.  
Check the [LICENSE](./LICENSE) file for more information.

---

**🚩 ¡Gracias por tu interés en FlagChain! / Thank you for your interest in FlagChain!**
