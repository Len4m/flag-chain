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

- [Libro Blanco](./Resumen_FlagChain_Libro_Blanco_Correcto.md)
- Smart Contracts (Solidity)
- SDK (TypeScript)
- Frontend (Angular + Ethers.js)

### 2. Crea un Fork

Haz un fork del repositorio y trabaja desde una rama:

```bash
git checkout -b tu-rama-nombre
```

### 3. Tipos de Contribuciones Aceptadas

- Correcciones de bugs o vulnerabilidades
- Mejoras en contratos inteligentes
- Nuevas funcionalidades (p. ej., nuevos tipos de retos, votaciones DAO)
- Mejora de documentación o tutoriales
- Traducciones
- Feedback de diseño o UX

### 4. Estilo de Código

- Solidity: seguir las guías de estilo de OpenZeppelin.
- TypeScript/JavaScript: usar ESLint y Prettier.
- Angular: respetar buenas prácticas de componentes y servicios.

### 5. Pull Requests

1. Haz commit de tus cambios con mensajes claros.
2. Verifica que pasen los tests (`npm test`, `npx hardhat test`, etc.).
3. Abre un PR detallado, indicando el propósito de la contribución.
4. Si es una mejora importante, abre primero un Issue para discutirlo.

### 6. Código de Conducta

Todos los contribuyentes deben seguir nuestro [Código de Conducta](./CODE_OF_CONDUCT.md). Fomentamos un entorno inclusivo, respetuoso y constructivo.

---

## 🧪 Tests y Calidad

Antes de enviar un PR:

- Asegúrate de que los tests pasen correctamente.
- Escribe pruebas para nuevas funcionalidades si es posible.
- Usa herramientas como Slither, Mythril y Hardhat para auditorías locales.

## 🛠️ Herramientas Recomendadas

- Hardhat + Waffle (Smart Contracts)
- The Graph (Subgraphs)
- IPFS CLI / Web UI
- Angular CLI
- Metamask, WalletConnect

## 💬 Canales de Soporte

- [Issues](https://github.com/flagchain/issues)
- [Discussions](https://github.com/flagchain/discussions)
- Discord (proximamente)

---

Gracias nuevamente por tu interés. ¡Tu contribución hace crecer a la comunidad FlagChain! 🚩
