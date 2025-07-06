import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { 
  useScaffoldReadContract, 
  useScaffoldEventHistory 
} from "../scaffold-eth";
import { ChallengeMetadata } from "../../types/flagchain";
import { getCTFMetadata } from "../../utils/flagchain/ipfs";

export interface ChallengeWithMetadata {
  id: bigint;
  creator: string;
  ipfsCID: string;
  difficulty: number;
  publicKeyUser: string;
  publicKeyRoot: string;
  active: boolean;
  createdAt: bigint;
  basePoints: bigint;
  totalSolves: bigint;
  userSolves: bigint;
  rootSolves: bigint;
  totalRatings: bigint;
  sumRatings: bigint;
  averageRating: bigint;
  firstBloodUser: string;
  firstBloodRoot: string;
  firstBloodTimestampUser: bigint;
  firstBloodTimestampRoot: bigint;
  // Metadatos de IPFS
  name?: string;
  description?: string;
  tags?: string[];
  category?: string;
  author?: string;
  platform?: string;
  challengeURL?: string;
  imageCID?: string;
  flagHints?: string[];
  website?: string;
}

export const useChallenges = () => {
  const { address } = useAccount();
  const [challenges, setChallenges] = useState<ChallengeWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadataCache, setMetadataCache] = useState<Record<string, ChallengeMetadata>>({});

  // Obtener total de challenges
  const { data: totalChallenges } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "getTotalChallenges",
  });

  // Obtener eventos de challenges creados
  const { data: challengeEvents } = useScaffoldEventHistory({
    contractName: "FlagChain",
    eventName: "ChallengeCreated",
    fromBlock: 0n,
  });

  // Obtener eventos de flags capturadas
  const { data: flagEvents } = useScaffoldEventHistory({
    contractName: "FlagChain",
    eventName: "FlagCaptured",
    fromBlock: 0n,
  });

    // Cargar metadatos de IPFS
  const loadMetadata = async (ipfsCID: string): Promise<ChallengeMetadata | null> => {
    if (metadataCache[ipfsCID]) {
      return metadataCache[ipfsCID];
    }

    try {
      const metadata = await getCTFMetadata(ipfsCID);
      setMetadataCache(prev => ({ ...prev, [ipfsCID]: metadata }));
      return metadata;
    } catch (error) {
      console.error("Error loading metadata:", error);
      return null;
    }
  };

  // Cargar todos los challenges desde eventos
  const loadAllChallenges = async () => {
    setLoading(true);
    
    try {
      // Si no hay eventos de challenges, el array está vacío
      if (!challengeEvents || challengeEvents.length === 0) {
        setChallenges([]);
        return;
      }

      const challengesList: ChallengeWithMetadata[] = [];

             // Usar eventos en lugar de bucle con hooks
       for (const event of challengeEvents) {
         try {
           const challengeId = event.args.challengeId;
           const creator = event.args.creator;
           const ipfsCID = event.args.ipfsCID;
           const difficulty = event.args.difficulty;
           
           // Verificar que los datos requeridos existan
           if (!challengeId || !creator || !ipfsCID || difficulty === undefined) {
             console.warn("Skipping challenge with missing data:", event.args);
             continue;
           }
           
           // Cargar metadatos
           const metadata = await loadMetadata(ipfsCID);
          
          // Crear objeto challenge con datos del evento y metadatos
          const challengeWithMetadata: ChallengeWithMetadata = {
            id: challengeId,
            creator,
            ipfsCID,
            difficulty,
            publicKeyUser: "", // Se puede obtener del contrato si es necesario
            publicKeyRoot: "", // Se puede obtener del contrato si es necesario
            active: true, // Asumir activo por defecto, se puede verificar
            createdAt: BigInt(event.blockNumber || 0), // Usar block number como timestamp
            basePoints: BigInt(difficulty === 1 ? 100 : difficulty === 2 ? 200 : 500),
            totalSolves: BigInt(0), // Se calculará desde flagEvents
            userSolves: BigInt(0),
            rootSolves: BigInt(0),
            totalRatings: BigInt(0),
            sumRatings: BigInt(0),
            averageRating: BigInt(0),
            firstBloodUser: "",
            firstBloodRoot: "",
            firstBloodTimestampUser: 0n,
            firstBloodTimestampRoot: 0n,
            // Metadatos de IPFS
            name: metadata?.name || "Challenge sin nombre",
            description: metadata?.description || "Sin descripción",
            tags: metadata?.tags || [],
            category: metadata?.category || "General",
            author: metadata?.author || "Anónimo",
            platform: metadata?.platform || "Unknown",
            challengeURL: metadata?.challengeURL || "",
            imageCID: metadata?.imageCID,
            flagHints: metadata?.flagHints || [],
            website: metadata?.website,
          };

          // Calcular estadísticas desde flagEvents
          if (flagEvents) {
            const challengeFlags = flagEvents.filter(
              flagEvent => flagEvent.args.challengeId === challengeId
            );
            
            challengeWithMetadata.totalSolves = BigInt(challengeFlags.length);
            challengeWithMetadata.userSolves = BigInt(
              challengeFlags.filter(f => f.args.level === 1).length
            );
            challengeWithMetadata.rootSolves = BigInt(
              challengeFlags.filter(f => f.args.level === 2).length
            );

            // First bloods
            const firstBloodUser = challengeFlags.find(f => f.args.level === 1 && f.args.isFirstBlood);
            const firstBloodRoot = challengeFlags.find(f => f.args.level === 2 && f.args.isFirstBlood);
            
                         if (firstBloodUser) {
               challengeWithMetadata.firstBloodUser = firstBloodUser.args.solver || "";
               challengeWithMetadata.firstBloodTimestampUser = BigInt(firstBloodUser.blockNumber || 0);
             }
             
             if (firstBloodRoot) {
               challengeWithMetadata.firstBloodRoot = firstBloodRoot.args.solver || "";
               challengeWithMetadata.firstBloodTimestampRoot = BigInt(firstBloodRoot.blockNumber || 0);
             }
           }
           
           challengesList.push(challengeWithMetadata);
         } catch (error) {
           console.error(`Error loading challenge:`, error);
           // Continuar con el siguiente challenge
         }
      }
      
      setChallenges(challengesList);
    } catch (error) {
      console.error("Error loading challenges:", error);
      setChallenges([]); // Setear array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando cambien los eventos
  useEffect(() => {
    loadAllChallenges();
  }, [challengeEvents, flagEvents]);

  // Filtrar challenges
  const filterChallenges = (filters: {
    difficulty?: number;
    category?: string;
    active?: boolean;
    solved?: boolean;
  }) => {
    return challenges.filter(challenge => {
      if (filters.difficulty && challenge.difficulty !== filters.difficulty) return false;
      if (filters.category && challenge.category !== filters.category) return false;
      if (filters.active !== undefined && challenge.active !== filters.active) return false;
      
      // Para filtrar por resuelto, necesitamos verificar si el usuario actual lo resolvió
      if (filters.solved !== undefined && address) {
        const userSolved = flagEvents?.some(event => 
          event.args.challengeId === challenge.id && 
          event.args.solver === address
        );
        if (filters.solved !== userSolved) return false;
      }
      
      return true;
    });
  };

  // Obtener estadísticas
  const getStats = () => {
    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter(c => c.active).length;
    const totalSolves = challenges.reduce((sum, c) => sum + Number(c.totalSolves), 0);
    const categories = [...new Set(challenges.map(c => c.category))];
    
    return {
      totalChallenges,
      activeChallenges,
      totalSolves,
      categories,
    };
  };

  // Obtener leaderboard
  const getLeaderboard = () => {
    if (!flagEvents) return [];
    
    const userScores: Record<string, number> = {};
    
    flagEvents.forEach(event => {
      const solver = event.args.solver;
      const points = Number(event.args.points);
      
      if (solver && points) {
        if (!userScores[solver]) {
          userScores[solver] = 0;
        }
        userScores[solver] += points;
      }
    });
    
    return Object.entries(userScores)
      .map(([address, score]) => ({ address, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  };

  return {
    challenges,
    loading,
    filterChallenges,
    getStats,
    getLeaderboard,
    loadAllChallenges,
    loadMetadata,
    totalChallenges,
    challengeEvents,
    flagEvents,
  };
}; 