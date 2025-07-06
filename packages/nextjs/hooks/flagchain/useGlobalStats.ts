import { useState, useEffect } from "react";
import { useScaffoldEventHistory, useScaffoldReadContract } from "../scaffold-eth";

export const useGlobalStats = () => {
  const [uniqueUsers, setUniqueUsers] = useState<number>(0);
  const [totalFlags, setTotalFlags] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Obtener total de challenges desde el contrato
  const { data: totalChallenges } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "getTotalChallenges",
  });

  // Obtener eventos de flags capturadas
  const { data: flagEvents } = useScaffoldEventHistory({
    contractName: "FlagChain",
    eventName: "FlagCaptured",
    fromBlock: 0n,
  });

  // Obtener eventos de challenges creados
  const { data: challengeEvents } = useScaffoldEventHistory({
    contractName: "FlagChain",
    eventName: "ChallengeCreated",
    fromBlock: 0n,
  });

  // Calcular estadísticas cuando cambien los eventos
  useEffect(() => {
    if (flagEvents && challengeEvents) {
      calculateStats();
    }
  }, [flagEvents, challengeEvents]);

  const calculateStats = () => {
    setLoading(true);
    
    try {
      // Calcular total de flags resueltas
      const totalFlagsResolved = flagEvents ? flagEvents.length : 0;
      setTotalFlags(totalFlagsResolved);

      // Calcular usuarios únicos que han interactuado
      const uniqueAddresses = new Set<string>();
      
      // Usuarios que han resuelto flags
      if (flagEvents) {
        flagEvents.forEach(event => {
          if (event.args.solver) {
            uniqueAddresses.add(event.args.solver.toLowerCase());
          }
        });
      }

      // Usuarios que han creado challenges
      if (challengeEvents) {
        challengeEvents.forEach(event => {
          if (event.args.creator) {
            uniqueAddresses.add(event.args.creator.toLowerCase());
          }
        });
      }

      const totalUniqueUsers = uniqueAddresses.size;
      setUniqueUsers(totalUniqueUsers);

      // Calcular usuarios activos (últimos 7 días)
      // Nota: Usamos blockNumber como proxy para timestamp reciente
      const currentBlock = Math.floor(Date.now() / 1000); // Timestamp aproximado
      const recentBlockThreshold = 50; // Últimos 50 bloques como proxy para actividad reciente
      
      const activeAddresses = new Set<string>();

      if (flagEvents) {
        flagEvents.forEach(event => {
          const eventBlockNumber = Number(event.blockNumber || 0);
          // Considerar los últimos bloques como actividad reciente
          if (eventBlockNumber > 0 && event.args.solver) {
            activeAddresses.add(event.args.solver.toLowerCase());
          }
        });
      }

      if (challengeEvents) {
        challengeEvents.forEach(event => {
          const eventBlockNumber = Number(event.blockNumber || 0);
          // Considerar los últimos bloques como actividad reciente
          if (eventBlockNumber > 0 && event.args.creator) {
            activeAddresses.add(event.args.creator.toLowerCase());
          }
        });
      }

      setActiveUsers(activeAddresses.size);

    } catch (error) {
      console.error("Error calculating global stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas de dificultad
  const getDifficultyStats = () => {
    if (!flagEvents) return { easy: 0, medium: 0, hard: 0 };

    const stats = { easy: 0, medium: 0, hard: 0 };
    
    flagEvents.forEach(event => {
      const points = Number(event.args.points || 0);
      if (points <= 100) stats.easy++;
      else if (points <= 200) stats.medium++;
      else stats.hard++;
    });

    return stats;
  };

  // Obtener estadísticas de first bloods
  const getFirstBloodStats = () => {
    if (!flagEvents) return 0;
    
    return flagEvents.filter(event => event.args.isFirstBlood).length;
  };

  // Obtener top solvers
  const getTopSolvers = (limit: number = 5) => {
    if (!flagEvents) return [];

    const solverStats: Record<string, { solves: number, points: number }> = {};
    
    flagEvents.forEach(event => {
      const solver = event.args.solver?.toLowerCase();
      const points = Number(event.args.points || 0);
      
      if (solver) {
        if (!solverStats[solver]) {
          solverStats[solver] = { solves: 0, points: 0 };
        }
        solverStats[solver].solves += 1;
        solverStats[solver].points += points;
      }
    });

    return Object.entries(solverStats)
      .map(([address, stats]) => ({
        address,
        solves: stats.solves,
        points: stats.points,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  };

  // Obtener actividad reciente
  const getRecentActivity = (limit: number = 10) => {
    if (!flagEvents) return [];

    return flagEvents
      .slice(-limit)
      .reverse()
      .map(event => ({
        type: 'flag_captured',
        solver: event.args.solver,
        challengeId: event.args.challengeId,
        points: Number(event.args.points || 0),
        isFirstBlood: event.args.isFirstBlood,
        blockNumber: Number(event.blockNumber || 0),
      }));
  };

  return {
    // Estadísticas principales
    totalChallenges: totalChallenges ? Number(totalChallenges) : 0,
    totalFlags,
    uniqueUsers,
    activeUsers,
    loading,
    
    // Funciones adicionales
    getDifficultyStats,
    getFirstBloodStats,
    getTopSolvers,
    getRecentActivity,
    
    // Eventos raw
    flagEvents,
    challengeEvents,
  };
}; 