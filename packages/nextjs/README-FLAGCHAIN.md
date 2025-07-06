# 🚩 FlagChain Frontend

Frontend descentralizado para FlagChain construido con **Next.js 14**, **Wagmi** y **Scaffold-ETH 2**.

## ✨ Características

- 🔗 **Conexión Wallet**: Integración completa con MetaMask y WalletConnect
- 🎯 **Gestión de Challenges**: Crear, ver y resolver challenges CTF
- 🏆 **Sistema de Puntuación**: Rankings on-chain con First Blood bonus
- 🔐 **Verificación Criptográfica**: Validación ECDSA de flags
- 📁 **Almacenamiento IPFS**: Metadatos y archivos descentralizados
- 📊 **Leaderboard Global**: Rankings en tiempo real
- 🎨 **UI Moderna**: Diseño responsive con Tailwind CSS y DaisyUI

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Blockchain**: Wagmi + Viem
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: React Hooks + Custom Hooks
- **Storage**: IPFS (Web3.Storage)
- **Development**: TypeScript + ESLint

## 🏗️ Estructura del Proyecto

```
packages/nextjs/
├── app/                     # Next.js App Router
│   ├── page.tsx            # Página principal
│   ├── challenges/         # Páginas de challenges
│   └── layout.tsx          # Layout global
├── components/             # Componentes React
│   ├── flagchain/         # Componentes específicos de FlagChain
│   │   ├── ChallengeCard.tsx
│   │   └── SubmitFlag.tsx
│   └── scaffold-eth/      # Componentes reutilizables
├── hooks/                 # Custom React Hooks
│   └── flagchain/        # Hooks específicos de FlagChain
│       ├── useChallenge.ts
│       └── useFlag.ts
├── types/                # Definiciones TypeScript
│   └── flagchain.ts
└── utils/               # Utilidades
    └── flagchain/      # Utilidades específicas
        ├── crypto.ts   # Funciones criptográficas
        └── ipfs.ts     # Gestión IPFS
```

## 🚀 Desarrollo Local

### Prerrequisitos

1. **Node.js 18+** y **Yarn 3+**
2. **Red Hardhat** ejecutándose en puerto 8545
3. **Contrato FlagChain** desplegado

### Instalación

```bash
# Instalar dependencias
cd packages/nextjs
yarn install

# Ejecutar servidor de desarrollo
yarn dev
```

El frontend estará disponible en `http://localhost:3000`

### Configuración del Entorno

Crear `.env.local`:

```bash
# IPFS (opcional para desarrollo)
NEXT_PUBLIC_IPFS_GATEWAY="https://ipfs.io/ipfs/"
NEXT_PUBLIC_WEB3_STORAGE_API_KEY="tu_api_key_aqui"

# Configuración de red (ya está en scaffold.config.ts)
NEXT_PUBLIC_HARDHAT_RPC_URL="http://localhost:8545"
```

## 📱 Páginas Principales

### 🏠 Homepage (`/`)
- Hero section con estadísticas del usuario
- Características de FlagChain
- Call-to-action para empezar

### 🚩 Challenges (`/challenges`)
- Lista de challenges disponibles
- Filtros por dificultad y categoría
- Sidebar con leaderboard y actividad reciente

### 📊 Leaderboard (`/leaderboard`)
- Ranking global de usuarios
- Estadísticas de creadores
- Filtros por período

## 🔧 Componentes Principales

### ChallengeCard
Tarjeta que muestra información de un challenge:
- Metadatos desde IPFS
- Estado de resolución
- Estadísticas y rating
- Acciones (ver, resolver, descargar)

### SubmitFlag
Formulario para enviar flags:
- Validación en tiempo real
- Soporte para flags User y Root
- Feedback visual
- Gestión de errores

## 🎣 Hooks Personalizados

### useChallenge
```typescript
const {
  totalChallenges,
  getChallengeById,
  handleCreateChallenge,
  handleRateChallenge,
  challengeCreatedEvents
} = useChallenge();
```

### useFlag
```typescript
const {
  handleSubmitFlag,
  hasUserSolvedChallenge,
  getUserSolveStats,
  flagCapturedEvents
} = useFlag();
```

## 🔐 Seguridad y Validación

### Validación de Flags
- Formato: `FLAG{...}` o `flag{...}`
- Verificación criptográfica ECDSA
- Rate limiting (5 intentos por challenge)
- Cooldown de 1 hora entre intentos

### Gestión de Claves
```typescript
// Generación de par de claves desde flag
const { privateKey, publicKey, address } = generateKeyPair(flag);

// Firma del mensaje
const { signature, v, r, s } = signMessage(message, privateKey);
```

## 🎨 Sistema de Diseño

### Colores por Dificultad
- **Fácil**: `badge-success` (verde)
- **Medio**: `badge-warning` (amarillo)
- **Difícil**: `badge-error` (rojo)

### Puntuación
- Easy: 100 puntos
- Medium: 200 puntos
- Hard: 500 puntos
- First Blood: +10% bonus

## 📊 Integración Blockchain

### Lectura de Contratos
```typescript
const { data: totalChallenges } = useScaffoldReadContract({
  contractName: "FlagChain",
  functionName: "getTotalChallenges",
});
```

### Escritura de Contratos
```typescript
const { writeContractAsync: submitFlag } = useScaffoldWriteContract("FlagChain");

await submitFlag({
  functionName: "submitFlag",
  args: [challengeId, signature, level],
});
```

### Eventos en Tiempo Real
```typescript
const { data: flagCapturedEvents } = useScaffoldEventHistory({
  contractName: "FlagChain",
  eventName: "FlagCaptured",
  fromBlock: 0n,
});
```

## 🔄 Estado y Sincronización

- **Optimistic Updates**: UI se actualiza inmediatamente
- **Event Listening**: Sync automático con eventos blockchain
- **Error Handling**: Recuperación automática de fallos
- **Loading States**: Feedback visual durante transacciones

## 🧪 Testing

```bash
# Tests unitarios
yarn test

# Tests de integración
yarn test:integration

# Coverage
yarn test:coverage
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
yarn build
vercel --prod
```

### IPFS
```bash
yarn export
ipfs add -r out/
```

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📝 Notas de Desarrollo

### Scaffold-ETH 2 Features
- Hot reload automático
- TypeScript types generados automáticamente
- Integración nativa con Hardhat
- Componentes reutilizables

### Performance
- Image optimization con Next.js
- Code splitting automático
- Lazy loading de componentes
- IPFS caching

### Próximas Mejoras
- [ ] PWA support
- [ ] Dark mode toggle
- [ ] Notificaciones push
- [ ] Búsqueda avanzada
- [ ] Export de estadísticas

---

**¡Happy Hacking! 🚩** 