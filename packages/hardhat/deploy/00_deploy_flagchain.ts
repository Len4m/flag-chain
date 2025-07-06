import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Despliega el contrato FlagChain
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployFlagChain: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    En localhost, el deployer account es el que viene con Hardhat, que se ve dentro del archivo README.md
    Cuando se despliega en testnets, el deployer account debe tener fondos suficientes para pagar el gas de despliegue
    La cuenta deployer se obtiene de la variable de entorno DEPLOYER_PRIVATE_KEY
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Desplegando FlagChain...");
  console.log("🏗️  Deployer account:", deployer);

  await deploy("FlagChain", {
    from: deployer,
    // Los argumentos del constructor van aquí
    args: [],
    log: true,
    // auto mining speed up deployment on local network (ganache, hardhat), no effect on live networks
    autoMine: true,
  });

  // Obtener el contrato desplegado para configurarlo
  const flagChain = await hre.ethers.getContract<Contract>("FlagChain", deployer);

  console.log("✅ FlagChain desplegado en:", await flagChain.getAddress());
  console.log("🎯 Configurando roles iniciales...");

  // Verificar que el deployer tiene los roles necesarios
  const DEFAULT_ADMIN_ROLE = await flagChain.DEFAULT_ADMIN_ROLE();
  const CREATOR_ROLE = await flagChain.CREATOR_ROLE();
  const PAUSER_ROLE = await flagChain.PAUSER_ROLE();
  const OPERATOR_ROLE = await flagChain.OPERATOR_ROLE();

  console.log("✅ Roles configurados:");
  console.log("   - DEFAULT_ADMIN_ROLE:", await flagChain.hasRole(DEFAULT_ADMIN_ROLE, deployer));
  console.log("   - CREATOR_ROLE:", await flagChain.hasRole(CREATOR_ROLE, deployer));
  console.log("   - PAUSER_ROLE:", await flagChain.hasRole(PAUSER_ROLE, deployer));
  console.log("   - OPERATOR_ROLE:", await flagChain.hasRole(OPERATOR_ROLE, deployer));

  // Mostrar información útil para el desarrollo
  console.log("\n📊 Información del contrato:");
  console.log("   - Dirección:", await flagChain.getAddress());
  console.log("   - Retos totales:", await flagChain.getTotalChallenges());
  console.log("   - Resoluciones totales:", await flagChain.getTotalSolves());
  console.log("   - Contrato pausado:", await flagChain.paused());

  console.log("\n🛠️  Comandos útiles:");
  console.log("   - Crear reto: yarn hardhat run scripts/createChallenge.ts");
  console.log("   - Enviar flag: yarn hardhat run scripts/submitFlag.ts");
  console.log("   - Ver estadísticas: yarn hardhat run scripts/getStats.ts");

  console.log("\n🎉 ¡FlagChain desplegado exitosamente!");
};

export default deployFlagChain;

// Tags para organizar los deployments
deployFlagChain.tags = ["FlagChain", "main"]; 