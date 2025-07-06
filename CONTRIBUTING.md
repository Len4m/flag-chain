# 🤝 Guía de Contribución a FlagChain

¡Gracias por tu interés en contribuir a FlagChain! Este proyecto busca construir una plataforma descentralizada para la gestión de CTFs (Capture The Flag), abierta, transparente y resistente a la censura.

## 📌 Principios del Proyecto

  ⚠️ **Nota importante:** FlagChain *no pretende reemplazar* ninguna plataforma CTF existente.  
  Su objetivo es **complementar el ecosistema**, ofreciendo una capa unificada de gestión, verificación y ranking descentralizado para retos publicados en cualquier lugar del mundo.  
  La visión es colaborar, no competir, consolidando reputación y logros técnicos de forma global y verificable.

- Transparencia y descentralización
- Seguridad y privacidad de los participantes
- Incentivos justos y colaborativos
- Accesibilidad global

## 🧱 Cómo Contribuir

### 1. Revisa el Código y la Documentación

Antes de comenzar, asegúrate de entender la arquitectura del proyecto:

- [Libro Blanco](./RESUMEN-LIBRO-BLANCO.md)
- Smart Contracts (Solidity con Hardhat)
- SDK (TypeScript)
- Frontend (Next.js + Wagmi + Viem)

### 2. Configuración del Entorno de Desarrollo

Este proyecto utiliza **Scaffold-ETH 2**. Para configurar tu entorno:

```bash
# Clona el repositorio
git clone https://github.com/Len4m/flag-chain.git
cd flag-chain

# Instala las dependencias
yarn install

# Inicia la cadena local
yarn chain

# Despliega los contratos (en otra terminal)
yarn deploy

# Inicia el frontend (en otra terminal)
yarn start
```

### 3. Crea un Fork

Haz un fork del repositorio y trabaja desde una rama:

```bash
git checkout -b tu-rama-nombre
```

### 4. Tipos de Contribuciones Aceptadas

- Correcciones de bugs o vulnerabilidades
- Mejoras en contratos inteligentes
- Nuevas funcionalidades (p. ej., nuevos tipos de retos, votaciones DAO)
- Mejora de documentación o tutoriales
- Traducciones
- Feedback de diseño o UX

### 5. Estilo de Código

- **Solidity**: seguir las guías de estilo de OpenZeppelin y usar Prettier para formateo
- **TypeScript/JavaScript**: usar ESLint y Prettier (configurados en Scaffold-ETH 2)
- **Next.js**: respetar buenas prácticas de componentes y hooks
- **Wagmi/Viem**: usar los hooks y utilidades proporcionadas por el framework

### 6. Pull Requests

1. Haz commit de tus cambios con mensajes claros.
2. Verifica que pasen los tests:
   ```bash
   yarn test          # Tests del frontend
   yarn hardhat:test  # Tests de contratos
   ```
3. Abre un PR detallado, indicando el propósito de la contribución.
4. Si es una mejora importante, abre primero un Issue para discutirlo.

### 7. Código de Conducta

Todos los contribuyentes deben seguir nuestro [Código de Conducta](./CODE_OF_CONDUCT.md). Fomentamos un entorno inclusivo, respetuoso y constructivo.

---

## 🧪 Tests y Calidad

Antes de enviar un PR:

- Asegúrate de que los tests pasen correctamente:
  ```bash
  yarn test                    # Tests del frontend
  yarn hardhat:test            # Tests de contratos
  yarn hardhat:coverage       # Cobertura de tests
  ```
- Escribe pruebas para nuevas funcionalidades si es posible.
- Usa herramientas como Slither, Mythril incluidas en Scaffold-ETH 2 para auditorías locales.

## 🛠️ Herramientas Incluidas en Scaffold-ETH 2

- **Hardhat**: Para desarrollo y despliegue de contratos
- **Foundry**: Para testing avanzado de contratos
- **Wagmi + Viem**: Para integración con Ethereum
- **Next.js**: Framework de React para el frontend
- **Tailwind CSS**: Para estilos
- **TypeScript**: Tipado estático
- **The Graph**: Para indexación de datos (opcional)

## 📁 Estructura del Proyecto

```
flag-chain/
├── packages/
│   ├── hardhat/          # Contratos inteligentes
│   │   ├── contracts/    # Contratos Solidity
│   │   ├── deploy/       # Scripts de despliegue
│   │   └── test/         # Tests de contratos
│   └── nextjs/           # Frontend
│       ├── components/   # Componentes React
│       ├── pages/        # Páginas Next.js
│       └── hooks/        # Hooks personalizados
└── README.md
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
yarn chain            # Inicia red local
yarn deploy           # Despliega contratos
yarn start            # Inicia frontend
yarn build            # Construye para producción

# Testing
yarn test             # Tests del frontend
yarn hardhat:test     # Tests de contratos
yarn hardhat:coverage # Cobertura de tests

# Herramientas
yarn hardhat:verify   # Verifica contratos
yarn generate         # Genera tipos TypeScript
yarn lint             # Linter
yarn format           # Formateo de código
```

## 💬 Canales de Soporte

- [Issues](https://github.com/Len4m/flag-chain/issues)
- [Discussions](https://github.com/Len4m/flag-chain/discussions)
- Discord (proximamente)

---

Gracias nuevamente por tu interés. ¡Tu contribución hace crecer a la comunidad FlagChain! 🚩
