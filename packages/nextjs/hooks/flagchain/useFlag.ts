import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useScaffoldWriteContract,
  useScaffoldEventHistory,
  useScaffoldReadContract,
} from "../scaffold-eth";
import { FlagLevel, SubmitFlagForm } from "../../types/flagchain";
import { generateKeyPair, signMessage, generateFlagMessage, validateFlagFormat } from "../../utils/flagchain/crypto";
import { notification } from "../../utils/scaffold-eth";

export const useFlag = () => {
  const { address: connectedAddress } = useAccount();
  const [submittingFlag, setSubmittingFlag] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{
    challengeId: bigint;
    timestamp: number;
  } | null>(null);

  // Escribir: submit flag
  const { writeContractAsync: submitFlag, isMining: isSubmittingFlag } = useScaffoldWriteContract("FlagChain");

  // Eventos de flags capturadas
  const { data: flagCapturedEvents, refetch: refetchFlagEvents } = useScaffoldEventHistory({
    contractName: "FlagChain",
    eventName: "FlagCaptured",
    fromBlock: 0n,
  });

  // Leer intentos de un usuario para un challenge (simplificado)
  const getUserAttempts = (challengeId: bigint) => {
    // Por ahora devolvemos 0, se puede implementar más tarde
    return 0;
  };

  // Leer cooldown de un usuario (simplificado)
  const getUserCooldown = (challengeId: bigint) => {
    // Por ahora devolvemos 0, se puede implementar más tarde
    return 0;
  };

  // Validar flag antes de enviarla
  const validateFlag = async (flag: string, challengeId: bigint): Promise<{
    isValid: boolean;
    error?: string;
  }> => {
    try {
      // Validar formato
      if (!validateFlagFormat(flag)) {
        return {
          isValid: false,
          error: "Formato de flag inválido. Debe ser FLAG{...} o flag{...}",
        };
      }

      // Validar que el usuario esté conectado
      if (!connectedAddress) {
        return {
          isValid: false,
          error: "Conecta tu wallet para enviar flags",
        };
      }

      // Validar intentos restantes
      const attempts = getUserAttempts(challengeId);
      const maxAttempts = 5; // MAX_ATTEMPTS_PER_CHALLENGE
      
      if (attempts >= maxAttempts) {
        return {
          isValid: false,
          error: `Has alcanzado el máximo de ${maxAttempts} intentos para este challenge`,
        };
      }

      // Validar cooldown
      const cooldown = getUserCooldown(challengeId);
      const now = Math.floor(Date.now() / 1000);
      
      if (cooldown > now) {
        const remainingTime = cooldown - now;
        const minutes = Math.ceil(remainingTime / 60);
        return {
          isValid: false,
          error: `Debes esperar ${minutes} minuto(s) antes de enviar otra flag`,
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error("Error validating flag:", error);
      return {
        isValid: false,
        error: "Error al validar la flag",
      };
    }
  };

  // Enviar flag
  const handleSubmitFlag = async (
    challengeId: bigint,
    flag: string,
    level: FlagLevel = FlagLevel.User
  ) => {
    setSubmittingFlag(true);
    try {
      // Validar flag
      const validation = await validateFlag(flag, challengeId);
      if (!validation.isValid) {
        notification.error(validation.error || "Flag inválida");
        return false;
      }

      // Generar clave privada y firma
      const { privateKey, address: flagAddress } = generateKeyPair(flag);
      const message = generateFlagMessage(challengeId, connectedAddress!, 0n);
      const { signature, v, r, s } = signMessage(message, privateKey);

      // Enviar flag al contrato
      await submitFlag({
        functionName: "submitFlag",
        args: [challengeId, signature as `0x${string}`, level],
      });

      // Actualizar estado
      setLastSubmission({
        challengeId,
        timestamp: Date.now(),
      });

      notification.success("¡Flag enviada exitosamente!");
      refetchFlagEvents();
      return true;
    } catch (error) {
      console.error("Error submitting flag:", error);
      notification.error("Error al enviar la flag");
      return false;
    } finally {
      setSubmittingFlag(false);
    }
  };

  // Enviar flag usando formulario
  const handleSubmitFlagForm = async (formData: SubmitFlagForm) => {
    return handleSubmitFlag(formData.challengeId, formData.flag, formData.level);
  };

  // Verificar si el usuario ya resolvió un challenge
  const hasUserSolvedChallenge = (challengeId: bigint, level?: FlagLevel): boolean => {
    if (!flagCapturedEvents || !connectedAddress) return false;

    return flagCapturedEvents.some((event: any) => {
      const isSameChallenge = event.args.challengeId === challengeId;
      const isSameUser = event.args.solver.toLowerCase() === connectedAddress.toLowerCase();
      const isSameLevel = level ? event.args.level === level : true;
      
      return isSameChallenge && isSameUser && isSameLevel;
    });
  };

  // Obtener estadísticas de resolución del usuario
  const getUserSolveStats = () => {
    if (!flagCapturedEvents || !connectedAddress) {
      return {
        totalSolves: 0,
        userSolves: 0,
        rootSolves: 0,
        firstBloods: 0,
        totalPoints: 0,
      };
    }

    const userEvents = flagCapturedEvents.filter((event: any) => 
      event.args.solver.toLowerCase() === connectedAddress.toLowerCase()
    );

    const totalSolves = userEvents.length;
    const userSolves = userEvents.filter((event: any) => event.args.level === FlagLevel.User).length;
    const rootSolves = userEvents.filter((event: any) => event.args.level === FlagLevel.Root).length;
    const firstBloods = userEvents.filter((event: any) => event.args.isFirstBlood).length;
    const totalPoints = userEvents.reduce((sum: number, event: any) => sum + Number(event.args.points), 0);

    return {
      totalSolves,
      userSolves,
      rootSolves,
      firstBloods,
      totalPoints,
    };
  };

  // Obtener flags capturadas recientes
  const getRecentFlags = (limit: number = 10) => {
    if (!flagCapturedEvents) return [];

    return flagCapturedEvents
      .slice(-limit)
      .reverse()
      .map((event: any) => ({
        challengeId: event.args.challengeId,
        solver: event.args.solver,
        level: event.args.level,
        points: Number(event.args.points),
        isFirstBlood: event.args.isFirstBlood,
        timestamp: event.block?.timestamp || 0,
      }));
  };

  return {
    // Estado
    submittingFlag,
    lastSubmission,
    
    // Estados de transacciones
    isSubmittingFlag,
    
    // Funciones principales
    handleSubmitFlag,
    handleSubmitFlagForm,
    validateFlag,
    
    // Funciones de consulta
    getUserAttempts,
    getUserCooldown,
    hasUserSolvedChallenge,
    getUserSolveStats,
    getRecentFlags,
    
    // Eventos
    flagCapturedEvents,
  };
}; 