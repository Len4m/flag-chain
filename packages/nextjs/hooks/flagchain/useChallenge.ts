import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useScaffoldEventHistory,
} from "../scaffold-eth";
import { Challenge, ChallengeMetadata, Difficulty, ChallengeFilters } from "../../types/flagchain";
import { getCTFMetadata } from "../../utils/flagchain/ipfs";
import { notification } from "../../utils/scaffold-eth";

export const useChallenge = () => {
  const { address: connectedAddress } = useAccount();
  const [challengeMetadata, setChallengeMetadata] = useState<Record<string, ChallengeMetadata>>({});
  const [loading, setLoading] = useState(false);

  // Leer total de challenges
  const { data: totalChallenges, refetch: refetchTotal } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "getTotalChallenges",
  });

  // Leer challenges activos
  const { data: activeChallenges, refetch: refetchActive } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "getActiveChallenges",
  });

  // Escribir: crear challenge
  const { writeContractAsync: createChallenge, isMining: isCreatingChallenge } = useScaffoldWriteContract("FlagChain");

  // Escribir: toggle challenge
  const { writeContractAsync: toggleChallenge, isMining: isTogglingChallenge } = useScaffoldWriteContract("FlagChain");

  // Escribir: rate challenge
  const { writeContractAsync: rateChallenge, isMining: isRatingChallenge } = useScaffoldWriteContract("FlagChain");

  // Eventos de challenges
  const { data: challengeCreatedEvents, refetch: refetchEvents } = useScaffoldEventHistory({
    contractName: "FlagChain",
    eventName: "ChallengeCreated",
    fromBlock: 0n,
  });

  const { data: challengeRatedEvents } = useScaffoldEventHistory({
    contractName: "FlagChain",
    eventName: "ChallengeRated",
    fromBlock: 0n,
  });

  // Obtener un challenge específico
  const getChallengeById = (id: bigint) => {
    const { data: challenge } = useScaffoldReadContract({
      contractName: "FlagChain",
      functionName: "getChallenge",
      args: [id],
    });
    return challenge;
  };

  // Obtener metadatos de IPFS
  const getChallengeMetadata = async (ipfsCID: string): Promise<ChallengeMetadata | null> => {
    try {
      if (challengeMetadata[ipfsCID]) {
        return challengeMetadata[ipfsCID];
      }

      const metadata = await getCTFMetadata(ipfsCID);
      setChallengeMetadata(prev => ({ ...prev, [ipfsCID]: metadata }));
      return metadata;
    } catch (error) {
      console.error("Error getting challenge metadata:", error);
      return null;
    }
  };

  // Obtener todos los challenges del contrato
  const getAllChallenges = async (): Promise<any[]> => {
    try {
      const challengeCount = totalChallenges || 0;
      const challenges: any[] = [];
      
      for (let i = 0; i < challengeCount; i++) {
        const challenge = getChallengeById(BigInt(i));
        if (challenge) {
          challenges.push(challenge);
        }
      }
      
      return challenges;
    } catch (error) {
      console.error("Error getting all challenges:", error);
      return [];
    }
  };

  // Crear nuevo challenge
  const handleCreateChallenge = async (
    ipfsCID: string,
    publicKeyUser: string,
    publicKeyRoot: string,
    difficulty: Difficulty
  ) => {
    try {
      if (!connectedAddress) {
        notification.error("Conecta tu wallet para crear un challenge");
        return;
      }

      await createChallenge({
        functionName: "createChallenge",
        args: [ipfsCID, publicKeyUser as `0x${string}`, publicKeyRoot as `0x${string}`, difficulty],
      });

      notification.success("Challenge creado exitosamente!");
      refetchTotal();
      refetchActive();
      refetchEvents();
    } catch (error) {
      console.error("Error creating challenge:", error);
      notification.error("Error al crear el challenge");
    }
  };

  // Toggle challenge activo/inactivo
  const handleToggleChallenge = async (challengeId: bigint) => {
    try {
      if (!connectedAddress) {
        notification.error("Conecta tu wallet para toggle el challenge");
        return;
      }

      await toggleChallenge({
        functionName: "toggleChallenge",
        args: [challengeId, undefined],
      });

      notification.success("Challenge actualizado exitosamente!");
      refetchActive();
    } catch (error) {
      console.error("Error toggling challenge:", error);
      notification.error("Error al actualizar el challenge");
    }
  };

  // Calificar challenge
  const handleRateChallenge = async (challengeId: bigint, stars: number) => {
    try {
      if (!connectedAddress) {
        notification.error("Conecta tu wallet para calificar el challenge");
        return;
      }

      if (stars < 1 || stars > 5) {
        notification.error("La calificación debe estar entre 1 y 5 estrellas");
        return;
      }

      await rateChallenge({
        functionName: "rateChallenge",
        args: [challengeId, stars],
      });

      notification.success("Challenge calificado exitosamente!");
    } catch (error) {
      console.error("Error rating challenge:", error);
      notification.error("Error al calificar el challenge");
    }
  };

  // Obtener estadísticas de un challenge
  const getChallengeStats = (challenge: any) => {
    if (!challenge) return null;

    const totalSolves = Number(challenge.totalSolves || 0);
    const averageRating = challenge.totalRatings > 0 
      ? Number(challenge.sumRatings) / Number(challenge.totalRatings)
      : 0;

    return {
      totalSolves,
      averageRating,
      totalRatings: Number(challenge.totalRatings || 0),
    };
  };

  return {
    // Estado
    challengeMetadata,
    loading,
    
    // Datos del contrato
    totalChallenges: totalChallenges ? Number(totalChallenges) : 0,
    activeChallenges: activeChallenges ? (activeChallenges as bigint[]).length : 0,
    
    // Estados de transacciones
    isCreatingChallenge,
    isTogglingChallenge,
    isRatingChallenge,
    
    // Funciones
    getChallengeById,
    getChallengeMetadata,
    handleCreateChallenge,
    handleToggleChallenge,
    handleRateChallenge,
    getChallengeStats,
    
    // Eventos
    challengeCreatedEvents,
    challengeRatedEvents,
  };
}; 