**FlagChain: Libro Blanco Completo**

**Autor:** Lenam
**Fehca:** 27 abril 2025
**Versión:** 0.1

# 1. Resumen Ejecutivo

FlagChain será una plataforma Web3 diseñada para unificar la gestión y resolución de CTFs (Capture The Flag) en una red descentralizada, creando un ecosistema transparente y resistente a la censura. Su objetivo es:

- **Establecer un estándar global** de publicación y resolución de CTFs, evitando islas de información entre plataformas.
- **Garantizar integridad y seguridad** mediante smart contracts auditables y criptografía asimétrica para validar flags sin exponerlas.
- **Fomentar la comunidad** a través de rankings de hackers y creadores, incentivando la calidad y la competencia saludable.
- **Reducir costos** de infraestructura aprovechando redes EVM compatibles de bajo gas (Polygon, Arbitrum) e IPFS/Arweave para almacenamiento.

FlagChain se construirá usando Solidity para la lógica on-chain, IPFS y Filecoin/Arweave para datos pesados, y un frontend en Angular + Ethers.js que podrá desplegarse en un gateway IPFS. Su diseño modular facilitará la escalabilidad, las futuras actualizaciones y las auditorías externas.

# 2. Motivación y Oportunidad

## 2.1 Problemas en el Ecosistema Actual

- **Fragmentación**: Cada plataforma CTF emplea su propio sistema de puntuación y publicación, impidiendo comparaciones globales.
- **Centralización**: Servidores y bases de datos centralizadas sufren riesgos de censura, fraudes en valoraciones y puntos únicos de fallo.
- **Costos crecientes**: Mantener infraestructuras de backend implica gastos continuos, sobre todo al escalar.
- **Barreras de certificación**: Los elevados costes de las certificaciones profesionales tradicionales pueden resultar prohibitivos para personas en regiones con menor poder adquisitivo, limitando su acceso a oportunidades y reconocimiento en el ámbito de la ciberseguridad.

## 2.2 Oportunidad de Web3

- **Inmutabilidad y transparencia**: Las transacciones en blockchain ofrecen un registro público e inmutable de publicaciones, solves y valoraciones.
- **Modelo de incentivos**: Los rankings on-chain pueden complementarse con recompensas tokenizadas en el futuro.
- **Almacenamiento descentralizado**: IPFS y Arweave reducen la dependencia de servidores tradicionales y los gastos de hosting.
- **Demostración permanente de habilidades**: A diferencia de las certificaciones tradicionales que caducan y requieren renovación, FlagChain permite a los hackers demostrar sus habilidades de forma permanente y verificable, sin costos recurrentes de certificación.
- **Empoderamiento comunitario**: FlagChain facilitará que los profesionales y entusiastas de la ciberseguridad se organicen y certifiquen mutuamente sus competencias, liberándose de las onerosas certificaciones tradicionales que benefician a unos pocos y promoviendo un modelo colaborativo, transparente y descentralizado de validación de conocimientos.

## 2.3 Público Objetivo y Casos de Uso

- **Hackers y participantes**: Buscan un único espacio para demostrar habilidades.
- **Creadores y organizadores de CTF**: Desean medir el impacto y la reputación de sus retos.
- **Empresas y reclutadores**: Pueden usar los rankings para identificar talento.

# 3. Visión General del Proyecto

FlagChain unificará retos y puntuaciones en una plataforma descentralizada, usando smart contracts para garantizar integridad y criptografía asimétrica para validar flags, incentivando a la comunidad con rankings on-chain y reduciendo costes mediante redes EVM de bajo gas e IPFS/Arweave.

# 4. Arquitectura del Sistema

## 4.1 Componentes Principales

1. **Frontend (Angular) - Puerto 8080**

   - Interfaz de usuario moderna en Angular 17
   - Integración con MetaMask para autenticación
   - Comunicación directa con contratos mediante ethers.js
   - Sistema de gestión de estados para retos y puntuaciones

2. **Blockchain (Hardhat Node) - Puerto 8545**

   - Red local Ethereum para desarrollo
   - Contratos inteligentes para gestión de retos
   - Sistema de verificación de flags
   - Registro inmutable de actividades

3. **IPFS Node - Puertos 4001/5001/8081**

   - Almacenamiento descentralizado de archivos
   - Gateway en puerto 8081 para acceso a contenidos
   - API en puerto 5001 para subida de archivos
   - Persistencia de metadatos y archivos de retos

4. **The Graph Node - Puertos 8000/8020/8030**

   - Indexación de eventos blockchain
   - API GraphQL para consultas eficientes
   - Agregación de datos y estadísticas
   - Soporte para rankings y métricas

5. **PostgreSQL - Puerto 5432**

   - Base de datos para The Graph Node
   - Indexación de eventos
   - No accesible directamente por la aplicación

## 4.2 SDK JavaScript/TypeScript

El SDK incluirá un **módulo de conexión de wallet** para facilitar la integración con MetaMask, WalletConnect y otros proveedores compatibles, basado en Ethers.js y Web3Modal:

```typescript
// Configuración del SDK
interface FlagChainConfig {
  contractAddress: string;
  rpcUrl: string;
  ipfsGateway: string;
}

// Metadata opcional para enriquecimiento de retos
interface ChallengeMetadata {
  name: string;
  description: string;
  tags: string[]; // Etiquetas técnicas para categorizar el reto. Ejemplos:
                   // 'Web', 'Crypto', 'Forensics', 'Reverse Engineering', 'Pwn',
                   // 'Stego', 'Hardware', 'Network', 'Mobile', 'Cloud', 'Blockchain',
                   // 'IoT', 'Malware Analysis', 'Social Engineering', 'OSINT'
                   // Nuevas etiquetas técnicas podrán proponerse y, tras revisión comunitaria,
                   // incorporarse al catálogo.
  fileCID?: string;
  imageCID?: string;
}

// Estructura de un reto
interface Challenge {
  id: string;
  creator: string;
  ipfsCID: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';       // Nivel de dificultad asignado
  publicKeyUser: string;             // Clave pública obligatoria para flag de usuario
  publicKeyRoot?: string;            // Clave pública opcional para flag de root
  active: boolean;
  metadata?: ChallengeMetadata;
  difficultyAdjusted?: number;       // Dificultad ajustada tras votaciones
  currentValue?: number;             // Valor actual con decaimiento o bonus de novedad
}

// Parámetros para creación de reto
interface ChallengeCreationParams {
  ipfsCID: string;
  publicKeyUser: string;
  publicKeyRoot?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';   // Nivel de dificultad, usado para calcular puntuación base
  metadata?: ChallengeMetadata;
}

// Parámetros para envío de flags
interface FlagSubmissionParams {
  challengeId: string;
  signature: string;
  level: 'user' | 'root';         // Indica si se envía flag de usuario o root
}

// Parámetros para votación de dificultad
interface DifficultyVoteParams {
  challengeId: string;
  rating: number;                  // Valoración 1–5
}

// Parámetros para votación de relevancia (restauración)
interface RestorationVoteParams {
  challengeId: string;
  relevance: boolean;              // True para restaurar, false para descartar
}

class FlagChainSDK {
  constructor(config: FlagChainConfig);

  // Creación y consulta de retos
  async createChallenge(params: ChallengeCreationParams): Promise<Challenge>;
  async getChallengeById(id: string): Promise<Challenge>;
  async listChallenges(filter?: { active?: boolean; tags?: string[] }): Promise<Challenge[]>;
  async getChallengeMetadata(ipfsCID: string): Promise<ChallengeMetadata>;

  // Envío de flags a distintos niveles
  async submitFlag(params: FlagSubmissionParams): Promise<boolean>;
  async submitUserFlag(params: Omit<FlagSubmissionParams, 'level'>): Promise<boolean>;
  async submitRootFlag(params: Omit<FlagSubmissionParams, 'level'>): Promise<boolean>;

  // Valoración y votaciones
  async rateChallenge(params: { challengeId: string; stars: number }): Promise<void>;
  async voteDifficulty(params: DifficultyVoteParams): Promise<void>;
  async voteRestoration(params: RestorationVoteParams): Promise<void>;

  // Datos dinámicos y estadísticas
  async getAdjustedDifficulty(challengeId: string): Promise<number>;
  async getCurrentValue(challengeId: string): Promise<number>;
  async getLeaderboard(options?: { top?: number }): Promise<{ user: string; score: number }[]>;
}
```

Este SDK permitirá crear retos con flags de usuario y root, enviar flags de forma diferenciada, votar dificultad y relevancia, y consultar tanto valores dinámicos como rankings actualizados.

## 4.3 Flujos de Datos

1. **Creación de Retos**:
   ```
   Frontend -> IPFS (metadata/files) -> Smart Contract (registro)
   ```
2. **Resolución de Retos**:
   ```
   Frontend -> Smart Contract (verificación) -> The Graph (indexación)
   ```
3. **Consulta de Retos**:
   ```
   Frontend -> The Graph (datos) -> IPFS (contenido)
   ```

> **Nota**: Todos estos flujos podrán ejecutarse tanto a través de la interfaz web desarrollada en Angular + Ethers.js, como directamente mediante el SDK de FlagChain, o incluso de forma manual interactuando directamente con los contratos inteligentes, permitiendo la integración desde cualquier plataforma, lenguaje o herramienta compatible.

# 5. Tecnología y Criptografía

1. **Curva y algoritmo**: ECDSA sobre la curva secp256k1 (compatibilidad con la stack de Ethereum).
2. **Generación de claves**:
   ```js
   privateKey = keccak256(abi.encodePacked(flagString)); // 32 bytes
   publicKey = secp256k1.publicKeyCreate(privateKey);   // 33 bytes comprimidos
   ```
3. **Mensaje a firmar**:
   ```js
   messageHash = keccak256(
     abi.encodePacked("FlagChain", challengeId, userAddress, nonce)
   );
   ```
   - Se incluye `nonce` (timestamp o contador) para evitar replay.
   - Se aplica prefijo de Ethereum (`Ethereum Signed Message: 32`).
4. **Verificación on-chain**:
   ```solidity
   bytes32 msgHash = prefixedHash(...);
   address signer = ecrecover(msgHash, v, r, s);
   require(
     signer == addressFromPublicKey(challenges[id].publicKeyUser) || signer == addressFromPublicKey(challenges[id].publicKeyRoot),
     "Firma no válida"
   );
   ```
5. **Prevención de replay**:
   - `mapping(uint256 => mapping(address => mapping(uint256 => bool))) usedNonces`.
6. **Códigos de revert claros**: `InvalidSignature`, `AlreadySolved`, `ChallengeInactive`.

# 6. Modelo de Incentivos y Rankings

## 6.1 Hackers

- **Acumulación de puntos**:
  ```solidity
  scores[user] += basePoints * difficultyMultiplier;
  ```
- **Multiplicadores**: Easy = 1×100, Medium = 2×100, Hard = 5×100.
- **First Blood**: bonus del 10% al primer solver.
- **Ranking**: calculado off-chain mediante subgraph que agrupa eventos `FlagCaptured`.

## 6.2 Creadores

- **Valoraciones**:
  ```solidity
  creatorReputationSum[creator] += stars * difficultyMultiplier;
  creatorReputationCount[creator] += 1;
  creatorReputationAverage[creator] =
    creatorReputationSum[creator] / creatorReputationCount[creator];
  ```
- **Ranking de creadores**: ordenado por `creatorReputationAverage`, calculado off-chain.

## 6.3 Gestión Dinámica de la Dificultad

Para asegurar que la dificultad refleje la percepción real de la comunidad, FlagChain implementará un sistema híbrido de valoración:

1. **Propuesta Inicial**: El creador de cada reto asigna una dificultad preliminar (Easy, Medium, Hard) y un puntaje base.
2. **Recolección de Votos de Resolución**:
   - Tras cada solución exitosa, el participante puede votar la dificultad real en una escala de 1 a 5.
   - Sólo cuentan las votaciones de usuarios con reputación mínima (p.ej., >500 puntos) para evitar sesgos.
3. **Ventana de Ajuste**:
   - Durante las primeras 100 resoluciones o los primeros 7 días, el sistema recoge los votos.
   - Tras este periodo, se calcula la **dificultad ajustada** como promedio ponderado:
     ```text
     difficultyAdjusted = (initialWeight * difficultyCreator + votesWeight * difficultyCommunity) / (initialWeight + votesWeight)
     ```
   - `initialWeight` y `votesWeight` son parámetros configurables (p.ej., 1 y número de votos).
4. **Recompensas Dinámicas**:
   - El puntaje otorgado se recalcula automáticamente según la dificultad ajustada.
   - Si la dificultad ajustada difiere más de un nivel completo de la propuesta, el creador gana o pierde reputación en función de la varianza.

## 6.4 Ajuste Temporal de Valor de Retos

Para reflejar la evolución de las técnicas de hacking y mantener la relevancia de los retos:

1. **Multiplicador de Novedad**:
   - Retos **publicados en los últimos 30 días** reciben un +10% en el puntaje base.
2. **Decaimiento Gradual**:
   - A partir del día 31, cada 30 días el valor base de un reto se reduce un **2%**, hasta un **mínimo del 50%** del puntaje original.
3. **Restauración Comunitaria**:
   - Si un reto antiguo recibe un **nuevo conjunto de 50 votos** que demuestran su relevancia (técnicas actuales, interés renovado), podrá restaurarse hasta un 80% de su valor original.
4. **Parámetros Configurables**:
   - Tanto ventanas de tiempo como porcentajes pueden ajustarse con gobernanza DAO.

# 7. Almacenamiento y Disponibilidad

- **IPFS**: Para metadatos JSON (nombre, descripción, dificultad, CIDs de archivos e imágenes) según un esquema validado.
- **Pinning**: Servicios como Pinata o Infura garantizan la disponibilidad de los CIDs.
- **Filecoin**: Para incentivar la replicación de archivos grandes.
- **Arweave**: Para archivar permanentemente metadatos críticos.

**Flujo de datos al crear un CTF**:

1. El creador empaqueta un JSON (`challenge.json`) y los archivos asociados.
2. Sube el paquete a IPFS y obtiene un `CID_meta`.
3. El JSON contiene campos: `name`, `description`, `difficulty`, `competenceTags`, `fileCID`, `imageCID`, `flagPublicKey`.
4. El frontend o cualquier cliente (SDK o interacción directa con contrato) envía una transacción a `createChallenge` con `CID_meta` y `flagPublicKey`.

# 8. Economía del Proyecto

1. **Cálculo de coste**:
   ```
   gasFee = gasUsed * gasPrice;
   // Ej: 70,000 gas × 1 Gwei = 70,000 Gwei = 0.00007 ETH
   ```
2. **Equivalencia en euros**:
   - 1 ETH ≈ 2,000 €, 1 MATIC ≈ 0.21 € ([kraken.com](https://www.kraken.com/convert/matic/eur?utm_source=chatgpt.com), [coingecko.com](https://www.coingecko.com/en/coins/polygon/eur?utm_source=chatgpt.com)).
   - En Polygon: 70,000 gas × 30 Gwei/gas = 0.0021 MATIC → 0.000441 €.
3. **Ejemplos**:
   - **SubmitFlag** (70k gas) ≈ 0.0021 MATIC (≈0.00044 €).
   - **CreateChallenge** (150k gas) ≈ 0.0045 MATIC (≈0.00094 €).
4. **Presupuesto de 250 €**:
   - Con 250 € se obtendrían ~1 190 MATIC (250 ÷ 0.21) ([kraken.com](https://www.kraken.com/convert/matic/eur?utm_source=chatgpt.com)).
   - Esto permitiría subvencionar aproximadamente:
     - ~567,000 envíos de flag gratuitos (1 190 ÷ 0.0021).
     - ~264,000 creaciones de retos gratuitos (1 190 ÷ 0.0045).

### Subsidio de Gas para Nuevos Usuarios

Para aliviar la carga de gas en los primeros envíos y creaciones de retos, FlagChain implementará un **sistema de transacciones sin gas** basado en meta-transactions:

1. **Forwarder Confiable (EIP-2771 / GSN)**:
   - Se despliega un contrato «trusted forwarder» que verifica firmas de usuarios.
   - Los usuarios firman las llamadas (`createChallenge`, `submitFlag`) off-chain.
   - Un relayer (operado por la plataforma) envía las transacciones on-chain usando el pool de MATIC.
2. **Pool de Subvención**:
   - La plataforma recarga un fondo con MATIC (hasta 250 € equivalentes).
   - El relayer utiliza este fondo para cubrir el coste de gas de los primeros N usuarios.
3. **Límites y Protección**:
   - Cada usuario podrá beneficiarse del subsidio en sus **primeras X operaciones** (configurable).
   - Tras agotar su cuota, el usuario deberá pagar gas normalmente.
4. **Beneficios**:
   - Experiencia de usuario sin fricción para onboarding.
   - Control de costes predecible y transparente.
   - Alineado con la filosofía Web3, sin imponer tarifas ocultas.

Con este mecanismo, **los nuevos participantes podrán interactuar con FlagChain sin necesidad de poseer MATIC**, facilitando su entrada y expansión inicial de la comunidad.

# 9. Seguridad y Auditoría

1. **Modelo de amenazas**:

   - On-chain: reentrancy, overflows, firmas inválidas, replays, front-running, DoS.
   - Off-chain: manipulación de IPFS, ataques de phishing en el frontend.
   - Social: spam, abuso de sistema, manipulación de rankings.

2. **Controles de Seguridad**:

   - **OpenZeppelin**:

     - `ReentrancyGuard` para prevenir ataques de reentrada
     - `Pausable` para detener operaciones en emergencias
     - `AccessControl` para gestión granular de roles
     - `Counters` para IDs seguros y no predecibles

   - **Protección contra Front-running**:

     - Sistema de cooldown entre acciones (1 hora)
     - Tracking de timestamps de última actividad
     - Verificación de transacciones duplicadas
     - Nonces únicos por usuario y reto

   - **Límites y Restricciones**:

     - Máximo 1000 puntos por reto
     - Duración entre 1 hora y 365 días
     - Máximo 10 retos por usuario
     - Máximo 5 intentos por reto
     - Ventana de valoración de 7 días

   - **Control de Acceso**:

     - `DEFAULT_ADMIN_ROLE`: Gestión de roles
     - `CREATOR_ROLE`: Creación de retos
     - `PAUSER_ROLE`: Pausa/despausa del sistema
     - `OPERATOR_ROLE`: Moderación y gestión

   - **Sistema de Moderación**:

     - Capacidad de banear usuarios
     - Bloqueo de retos problemáticos
     - Tracking de actividad de usuarios
     - Estadísticas detalladas

3. **Proceso de auditoría**:

   - **Interna**:

     - Pruebas unitarias (Hardhat, Waffle)
     - Análisis estático (Slither, Mythril)
     - Fuzzing y pruebas de integración

   - **Externa**:

     - Auditoría por terceros (CertiK, Quantstamp)
     - Bug Bounty en plataformas como Gitcoin
     - Revisión por pares de la comunidad

4. **Mitigaciones**:

   - Kill-switch y pausabilidad
   - Multisig (Gnosis Safe) para funciones críticas
   - Sistema de cooldown para prevenir spam
   - Tracking de transacciones para prevenir duplicados
   - Verificaciones de estado exhaustivas

5. **Monitoreo y Respuesta**:

   - Eventos para todas las acciones importantes
   - Estadísticas detalladas de uso
   - Sistema de reportes de abuso
   - Capacidad de bloqueo rápido de retos problemáticos

6. **Mejores Prácticas**:

   - Uso de SafeMath (implícito en Solidity 0.8+)
   - Verificaciones de estado antes de operaciones
   - Eventos para todas las acciones importantes
   - Documentación clara de funciones y roles
   - Código modular y mantenible

7. **Plan de Respuesta a Incidentes**:

   - Protocolo de pausa de emergencia
   - Proceso de actualización de contratos
   - Comunicación con la comunidad
   - Recuperación de fondos si es necesario

# 10. Escalabilidad y Futuras Mejoras

1. **Indexación con The Graph**:
   - Subgraph para eventos clave y consultas GraphQL.
2. **Meta-Transactions**:
   - Relayers que permitan UX sin gas para onboarding.
3. **Módulos adicionales**:
   - **NFT Badges** (ERC-721) para logros.
   - **Token de reputación** (ERC-20) para perks.
   - **Eventos en vivo** con leaderboard competitivo.
4. **Gobernanza**:
   - DAO para votaciones sobre actualizaciones y nuevas funcionalidades.
5. **SDK e integración para terceros**:
   - Paquete npm (JavaScript/TypeScript) con:
     - Conexión al contrato (dirección y ABI).
     - Wrappers para `createChallenge()`, `submitFlag()`, `rateChallenge()`, `getChallenges()`, `getScores()`.
     - Utilidades para firmas y gestión de nonces.
   - Documentación detallada en GitHub y ejemplos para Angular, React, Node.js, PHP.
   - Versionado semántico para garantizar compatibilidad.

# 11. Roadmap de Desarrollo

Nuestro enfoque prioriza la construcción en el siguiente orden inmutable: **1) Smart Contracts**, **2) SDK**, **3) Frontend MVP**, respaldado por una fase inicial de preparación y especificaciones. A continuación, las fases detalladas:

**Fase 0: Preparación y Especificaciones**

- Definición de la interfaz de Smart Contracts (funciones, eventos, estructuras de datos) y generación del ABI.
- Configuración de entornos de desarrollo y testnets (Hardhat Node, Mumbai, Goerli).
- Diseño de pruebas unitarias y de integración.

**Fase 1: Implementación de Smart Contracts & API del SDK**

- Desarrollo e implementación del contrato `FlagChain.sol` en Solidity.
- Emisión de eventos `ChallengeCreated`, `FlagCaptured` y `ChallengeRated`.
- Diseño y publicación de la API pública del SDK basada en el ABI.
- Pruebas unitarias y corrección de errores (Hardhat, Waffle).

**Fase 2: Desarrollo del SDK & Pruebas**

- Implementación de la librería npm/TypeScript para interactuar con los Smart Contracts.
- Wrappers para `createChallenge()`, `submitFlag()`, `rateChallenge()`, `getChallenges()`, `getScores()`, gestión de nonces y firmas.
- Pruebas de integración en testnets y documentación inicial.

**Fase 3: Desarrollo del Frontend MVP**

- Construcción de la DApp en Angular + Ethers.js consumiendo el SDK.
- Funcionalidades básicas: listado de retos, detalle de reto, envío de flags y visualización de ranking.
- Pruebas end-to-end y despliegue estático en IPFS/Arweave o servidor tradicional.

**Fase 4: Lanzamiento en Mainnet & Programa de Bounty**

- Despliegue en Polygon PoS.
- Integración con servicios de pinning (IPFS, Arweave).
- Panel de control para creadores y sistema completo de valoraciones.
- Puesta en marcha de bug bounty y auditoría externa.

**Fase 5: Escalabilidad y Funcionalidades Avanzadas**

- Implementación de Subgraph en The Graph para consultas GraphQL eficientes.
- Introducción de Meta-Transactions para UX sin gas.
- Desarrollo de NFT Badges (ERC-721) y token de reputación (ERC-20).
- Organización de eventos en vivo y elementos de gamificación.

**Fase 6: Gobernanza y Extensiones Continuas**

- Establecimiento de una DAO para gobernanza del protocolo.
- Integración de oráculos y colaboración cross-chain con otras plataformas CTF.
- Extensión comunitaria de módulos de certificación y programas de recompensas.

# 12. Licencia y Transparencia

Este proyecto está licenciado bajo la [GNU General Public License v3.0](LICENSE). Esto significa que:

- El código es libre y de código abierto
- Cualquier modificación debe ser distribuida bajo la misma licencia
- Se requiere incluir la licencia y los avisos de copyright en todas las copias
- No se proporciona garantía alguna

Para más detalles sobre la licencia, consulta el archivo [LICENSE](LICENSE).

## Componentes Auxiliares

- **Pinning de IPFS**: servicios como Pinata o Infura para asegurar disponibilidad. No afectan la inmutabilidad, solo la redundancia.
- **Gateways RPC**: Infura o Alchemy para facilitar conexiones sin requerir un nodo propio. Los usuarios pueden optar por nodos alternativos.
- **Indexación Off-Chain**: subgraphs de The Graph o indexadores similares procesan los eventos on-chain para ofrecer consultas eficientes.
- **Hosting del Frontend**: aunque puede desplegarse en IPFS/Arweave, también se admiten plataformas centralizadas (Netlify, Vercel) para actualizaciones más ágiles.

# 13. Notas Finales

Este libro blanco es provisional y está sujeto a modificaciones conforme avance el desarrollo, se incorporen nuevas tecnologías o se reciba feedback de la comunidad. Para contribuir o reportar problemas, consulta la [Guía de Contribución](CONTRIBUTING.md).

