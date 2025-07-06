# 📘 FlagChain - Resumen del Libro Blanco

**Autor:** Lenam  
**Fecha:** 27 abril 2025  
**Versión:** 0.1  

---

## 1. 🧩 Resumen Ejecutivo

> ⚠️ **Nota importante:** FlagChain **no busca reemplazar** plataformas CTF existentes. Su objetivo es **complementarlas** ofreciendo una capa de gestión descentralizada y un ranking global verificable. Pretende integrar información de múltiples orígenes para consolidar logros y reputación técnica.

FlagChain será una plataforma Web3 para gestionar CTFs de forma descentralizada, garantizando transparencia, resistencia a la censura y eficiencia. Pretende estar diseñada para:

- Crear un **estándar global** de publicación y resolución de CTFs.
- Proteger la **integridad de los flags** mediante criptografía asimétrica y smart contracts.
- Fomentar la comunidad con rankings verificables y **modelos de incentivos**.
- **Reducir costos** con redes EVM de bajo gas (Polygon, Arbitrum) e IPFS/Arweave.

---

## 2. 🚨 Problemas y Oportunidades

### Problemas actuales:
- Ecosistema fragmentado, centralizado y costoso.
- Certificaciones tradicionales inaccesibles para muchos.

### Oportunidades Web3:
- Transparencia e inmutabilidad en blockchain.
- **Reputación demostrable sin caducidad**.
- Incentivos económicos futuros mediante tokens.
- Validación colaborativa y descentralizada de conocimientos.

---

## 3. 🎯 Público Objetivo

- **Hackers** que quieren mostrar habilidades verificables.
- **Creadores de CTFs** que buscan reconocimiento.
- **Empresas** interesadas en identificar talento técnico.

---

## 4. 🏗️ Arquitectura

- **Frontend** en Next.js + Wagmi + Viem.
- **Smart contracts** en Solidity sobre redes EVM.
- **Almacenamiento** en IPFS/Filecoin/Arweave.
- **Indexación** vía The Graph.
- **SDK** en TypeScript para facilitar integración.

---

## 5. 🔐 Tecnología y Criptografía

- ECDSA sobre secp256k1 (Ethereum-compatible).
- Flags firmadas como mensajes, sin exponer su valor.
- Verificación on-chain mediante `ecrecover`.

---

## 6. 🧮 Modelo de Incentivos y Puntuaciones

### 🧑‍💻 Para Hackers

- **Puntaje**:  
  ```solidity
  scores[user] += basePoints * difficultyMultiplier;
  ```
- Multiplicadores:
  - Easy: ×1
  - Medium: ×2
  - Hard: ×5
- **First Blood**: +10% por ser el primero en resolver.
- **Ranking**: calculado off-chain a partir de eventos `FlagCaptured`.

### 🧠 Para Creadores

- Reputación en función de votos recibidos:
  ```solidity
  creatorReputationAverage = sum / count;
  ```
- Rankings por media ponderada de valoraciones y dificultad.

### 📈 Ajuste Dinámico de Dificultad

1. Dificultad inicial asignada por el creador.
2. Participantes con reputación suficiente votan en escala 1–5.
3. Después de 7 días o 100 soluciones, se calcula:
   ```
   difficultyAdjusted = (pesoCreador + votos) / total
   ```
4. Si la dificultad ajustada difiere significativamente, el creador gana o pierde reputación.

### ⏳ Ajuste Temporal del Valor

- +10% para retos nuevos (<30 días).
- -2% cada 30 días a partir del día 31 (mínimo 50%).
- Retos antiguos pueden **restaurar valor hasta 80%** si reciben 50 votos relevantes.

---

## 7. 💸 Economía del Proyecto

- Costes en Polygon son muy bajos (~0.00044 € por envío de flag).
- Con 250 €, se podrían subvencionar:
  - ~567,000 flags.
  - ~264,000 retos.

### Gas Gratis para Nuevos Usuarios

- Meta-transactions mediante EIP-2771.
- Un relayer cubre las primeras interacciones.
- Límite por usuario configurable.
- No se requiere tener MATIC para comenzar.

---

## 8. 🛡️ Seguridad y Auditoría

- Prevención de reentradas, replay attacks, front-running.
- Controles con OpenZeppelin (`ReentrancyGuard`, `Pausable`, etc.).
- Sistema de moderación: baneos, límites, bloqueo de retos.
- Auditoría interna + externa (ej. CertiK, Gitcoin).
- Kill-switch, multisig, seguimiento de eventos.

---

## 9. 📈 Escalabilidad y Futuras Funciones

- **Subgraphs** para consultas eficientes.
- **NFT Badges** y **token de reputación**.
- DAO para gobernanza y parámetros ajustables.
- Eventos competitivos y gamificación.

---

## 10. 🛠️ Roadmap de Desarrollo

1. Smart Contracts → SDK → Frontend MVP
2. Despliegue en Mainnet (Polygon)
3. Meta-transactions, NFT, DAO, escalabilidad

---

## 11. 📜 Licencia

Licencia GPLv3:

- Código abierto y modificable.
- Redistribución debe mantener la misma licencia.
- Sin garantías.

---

## 🧾 Notas Finales

Este libro blanco está sujeto a revisión conforme al feedback de la comunidad y avances técnicos. Participa vía la [Guía de Contribución](CONTRIBUTING.md).
