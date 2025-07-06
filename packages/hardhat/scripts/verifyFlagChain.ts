import { ethers } from "hardhat";
import { FlagChain } from "../typechain-types";

async function main() {
  console.log("🔍 Verificando contrato FlagChain...");

  try {
    // Obtener el contrato desplegado
    const flagChain = await ethers.getContract("FlagChain") as FlagChain;
    const address = await flagChain.getAddress();
    
    console.log("✅ Contrato FlagChain encontrado en:", address);

    // Verificar constantes del contrato
    console.log("\n📊 Verificando constantes:");
    
    try {
      const paused = await flagChain.paused();
      console.log("   - paused():", paused);
    } catch (e) {
      console.log("   - paused(): ERROR -", (e as Error).message);
    }

    try {
      const firstBloodBonus = await flagChain.FIRST_BLOOD_BONUS();
      console.log("   - FIRST_BLOOD_BONUS():", firstBloodBonus.toString());
    } catch (e) {
      console.log("   - FIRST_BLOOD_BONUS(): ERROR -", (e as Error).message);
    }

    try {
      const hardPoints = await flagChain.HARD_POINTS();
      console.log("   - HARD_POINTS():", hardPoints.toString());
    } catch (e) {
      console.log("   - HARD_POINTS(): ERROR -", (e as Error).message);
    }

    try {
      const cooldownPeriod = await flagChain.COOLDOWN_PERIOD();
      console.log("   - COOLDOWN_PERIOD():", cooldownPeriod.toString());
    } catch (e) {
      console.log("   - COOLDOWN_PERIOD(): ERROR -", (e as Error).message);
    }

    try {
      const defaultAdminRole = await flagChain.DEFAULT_ADMIN_ROLE();
      console.log("   - DEFAULT_ADMIN_ROLE():", defaultAdminRole);
    } catch (e) {
      console.log("   - DEFAULT_ADMIN_ROLE(): ERROR -", (e as Error).message);
    }

    try {
      const maxAttempts = await flagChain.MAX_ATTEMPTS_PER_CHALLENGE();
      console.log("   - MAX_ATTEMPTS_PER_CHALLENGE():", maxAttempts.toString());
    } catch (e) {
      console.log("   - MAX_ATTEMPTS_PER_CHALLENGE(): ERROR -", (e as Error).message);
    }

    try {
      const maxChallenges = await flagChain.MAX_CHALLENGES_PER_USER();
      console.log("   - MAX_CHALLENGES_PER_USER():", maxChallenges.toString());
    } catch (e) {
      console.log("   - MAX_CHALLENGES_PER_USER(): ERROR -", (e as Error).message);
    }

    // Verificar funciones principales
    console.log("\n🎯 Verificando funciones principales:");
    
    try {
      const totalChallenges = await flagChain.getTotalChallenges();
      console.log("   - getTotalChallenges():", totalChallenges.toString());
    } catch (e) {
      console.log("   - getTotalChallenges(): ERROR -", (e as Error).message);
    }

    try {
      const totalSolves = await flagChain.getTotalSolves();
      console.log("   - getTotalSolves():", totalSolves.toString());
    } catch (e) {
      console.log("   - getTotalSolves(): ERROR -", (e as Error).message);
    }

    try {
      const activeChallenges = await flagChain.getActiveChallenges();
      console.log("   - getActiveChallenges():", activeChallenges);
    } catch (e) {
      console.log("   - getActiveChallenges(): ERROR -", (e as Error).message);
    }

    // Verificar roles
    console.log("\n🔐 Verificando roles:");
    const [deployer] = await ethers.getSigners();
    
    try {
      const creatorRole = await flagChain.CREATOR_ROLE();
      const hasCreatorRole = await flagChain.hasRole(creatorRole, deployer.address);
      console.log("   - CREATOR_ROLE para deployer:", hasCreatorRole);
    } catch (e) {
      console.log("   - CREATOR_ROLE: ERROR -", (e as Error).message);
    }

    try {
      const pauserRole = await flagChain.PAUSER_ROLE();
      const hasPauserRole = await flagChain.hasRole(pauserRole, deployer.address);
      console.log("   - PAUSER_ROLE para deployer:", hasPauserRole);
    } catch (e) {
      console.log("   - PAUSER_ROLE: ERROR -", (e as Error).message);
    }

    console.log("\n✅ Verificación completada");

  } catch (error) {
    console.error("❌ Error al verificar el contrato:", error);
    
    // Información adicional
    console.log("\n🔍 Información adicional:");
    console.log("   - Network:", "localhost");
    console.log("   - Verificación completada con errores");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 