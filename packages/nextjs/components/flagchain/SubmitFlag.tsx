"use client";

import { useState, useEffect } from "react";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { signMessage, validateFlagFormat, generateKeyPair } from "~~/utils/flagchain/crypto";
import { FlagLevel, Challenge, Difficulty } from "~~/types/flagchain";
import { Address } from "~~/components/scaffold-eth";
import { useAccount } from "wagmi";

interface SubmitFlagProps {
  challenge: Challenge & {
    name?: string;
    description?: string;
    basePoints?: number;
    hasFirstBloodUser?: boolean;
    hasFirstBloodRoot?: boolean;
  };
  onFlagSubmitted?: (success: boolean, points?: number) => void;
}

export const SubmitFlag = ({ challenge, onFlagSubmitted }: SubmitFlagProps) => {
  const { address: connectedAddress } = useAccount();
  
  // Estados del formulario
  const [flag, setFlag] = useState("");
  const [flagLevel, setFlagLevel] = useState<FlagLevel>(FlagLevel.User);
  const [isValidFormat, setIsValidFormat] = useState(false);
  
  // Estados de carga
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  
  // Hook para escribir al contrato
  const { writeContractAsync, isPending } = useScaffoldWriteContract("FlagChain");
  
  // Hook para leer datos del contrato
  const { data: userNonce } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "userNonces",
    args: [connectedAddress],
  });

  const { data: attempts } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "attemptsByUserAndChallenge",
    args: [connectedAddress, BigInt(challenge.id)],
  });

  const { data: maxAttempts } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "MAX_ATTEMPTS_PER_CHALLENGE",
  });

  const { data: hasUserSolvedUser } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "hasUserSolvedChallengeLevel",
    args: [connectedAddress, BigInt(challenge.id), FlagLevel.User],
  });

  const { data: hasUserSolvedRoot } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "hasUserSolvedChallengeLevel",
    args: [connectedAddress, BigInt(challenge.id), FlagLevel.Root],
  });

  const { data: lastAttempt } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "lastAttemptByUserAndChallenge",
    args: [connectedAddress, BigInt(challenge.id)],
  });

  const { data: cooldownPeriod } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "COOLDOWN_PERIOD",
  });

  // Validar formato del flag cuando cambia
  useEffect(() => {
    setIsValidFormat(validateFlagFormat(flag));
  }, [flag]);

  // Calcular tiempo restante de cooldown
  const getCooldownRemaining = (): number => {
    if (!lastAttempt || !cooldownPeriod) return 0;
    const now = Math.floor(Date.now() / 1000);
    const lastAttemptTime = Number(lastAttempt);
    const cooldownSeconds = Number(cooldownPeriod);
    const remaining = (lastAttemptTime + cooldownSeconds) - now;
    return Math.max(0, remaining);
  };

  // Función para formatear tiempo
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Verificar si el usuario puede enviar el flag
  const canSubmitFlag = (): boolean => {
    if (!connectedAddress) return false;
    if (!isValidFormat) return false;
    if (challenge.creator === connectedAddress) return false;
    if (attempts && maxAttempts && Number(attempts) >= Number(maxAttempts)) return false;
    if (getCooldownRemaining() > 0) return false;
    
    // Verificar si ya resolvió este nivel
    if (flagLevel === FlagLevel.User && hasUserSolvedUser) return false;
    if (flagLevel === FlagLevel.Root && hasUserSolvedRoot) return false;
    
    return true;
  };

  // Función principal para enviar el flag
  const handleSubmitFlag = async () => {
    try {
      if (!canSubmitFlag()) {
        alert("Cannot submit flag. Check requirements.");
        return;
      }

      setIsSubmitting(true);
      setSubmitProgress("Generating cryptographic signature...");

      // Generar firma criptográfica
      const nonce = userNonce ? Number(userNonce) + 1 : 1;
      const message = `FlagChain-${challenge.id}-${connectedAddress}-${nonce}`;
      const { privateKey } = generateKeyPair(flag);
      const signatureData = signMessage(message, privateKey);
      const signature = signatureData.signature;

      // Enviar flag al contrato
      setSubmitProgress("Submitting flag to blockchain...");
      await writeContractAsync({
        functionName: "submitFlag",
        args: [
          BigInt(challenge.id),
          signature as `0x${string}`,
          flagLevel,
        ],
      });

      // Limpiar formulario
      setFlag("");
      
      alert("Flag submitted successfully! 🎉");
      
      // Callback opcional
      if (onFlagSubmitted) {
        // En una implementación real, obtendríamos los puntos del evento
        const points = (challenge.basePoints || 100) * (flagLevel === FlagLevel.Root ? 1.5 : 1);
        onFlagSubmitted(true, points);
      }

    } catch (error) {
      console.error("Error submitting flag:", error);
      alert("Invalid flag or submission error. Please try again.");
      
      if (onFlagSubmitted) {
        onFlagSubmitted(false);
      }
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  };

  const cooldownRemaining = getCooldownRemaining();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">🚩 Submit Flag</h3>
      
      {/* Información del challenge */}
      <div className="mb-6 p-4 bg-base-200 rounded-lg">
        <h4 className="font-bold">{challenge.name}</h4>
                        <p className="text-sm text-base-content/70 mt-1">{challenge.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className={`badge ${
            challenge.difficulty === Difficulty.Easy ? 'badge-success' : 
            challenge.difficulty === Difficulty.Medium ? 'badge-warning' : 
            'badge-error'
          }`}>
            {challenge.difficulty === Difficulty.Easy ? 'Easy' : challenge.difficulty === Difficulty.Medium ? 'Medium' : 'Hard'}
          </span>
          <span className="text-sm">
            Base Points: {challenge.basePoints || 100}
          </span>
        </div>
      </div>

      {/* Estado del usuario */}
      <div className="mb-6 p-4 bg-base-200 rounded-lg">
        <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-base-content/70">Connected as:</span>
          <Address address={connectedAddress} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="opacity-75">Attempts:</span>
            <span className="ml-2 font-bold">
              {attempts ? Number(attempts) : 0} / {maxAttempts ? Number(maxAttempts) : 5}
            </span>
          </div>
          <div>
            <span className="opacity-75">Status:</span>
            <span className="ml-2">
              {hasUserSolvedUser && hasUserSolvedRoot ? (
                <span className="badge badge-success">Both Solved</span>
              ) : hasUserSolvedUser ? (
                <span className="badge badge-warning">User Solved</span>
              ) : hasUserSolvedRoot ? (
                <span className="badge badge-warning">Root Solved</span>
              ) : (
                <span className="badge badge-ghost">Unsolved</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Verificar si el usuario es el creador */}
      {challenge.creator === connectedAddress && (
        <div className="alert alert-warning mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>You cannot submit flags for your own challenges.</span>
        </div>
      )}

      {/* Cooldown activo */}
      {cooldownRemaining > 0 && (
        <div className="alert alert-info mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Cooldown active. Try again in {formatTime(cooldownRemaining)}.</span>
        </div>
      )}

      {/* Formulario de envío */}
      <div className="space-y-4">
        {/* Selector de nivel */}
        <div>
          <label className="label">
            <span className="label-text">Flag Level</span>
          </label>
          <div className="flex gap-4">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="flagLevel"
                className="radio radio-primary"
                checked={flagLevel === FlagLevel.User}
                onChange={() => setFlagLevel(FlagLevel.User)}
                disabled={hasUserSolvedUser}
              />
              <span className="ml-2">
                User Level
                {hasUserSolvedUser && <span className="ml-1 badge badge-success badge-sm">✓</span>}
              </span>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="flagLevel"
                className="radio radio-primary"
                checked={flagLevel === FlagLevel.Root}
                onChange={() => setFlagLevel(FlagLevel.Root)}
                disabled={hasUserSolvedRoot}
              />
              <span className="ml-2">
                Root Level (+50% points)
                {hasUserSolvedRoot && <span className="ml-1 badge badge-success badge-sm">✓</span>}
              </span>
            </label>
          </div>
        </div>

        {/* Input del flag */}
        <div>
          <label className="label">
            <span className="label-text">Flag</span>
            <span className="label-text-alt">
              {isValidFormat ? (
                <span className="text-success">✓ Valid format</span>
              ) : flag ? (
                <span className="text-error">✗ Invalid format</span>
              ) : (
                <span className="opacity-50">Format: flag{`{content}`}</span>
              )}
            </span>
          </label>
          <input
            type="text"
            className={`input input-bordered w-full ${
              isValidFormat ? 'input-success' : 
              flag ? 'input-error' : ''
            }`}
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="flag{your_flag_here}"
            disabled={isSubmitting}
          />
        </div>

        {/* Información adicional */}
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="opacity-75">Expected Points:</span>
            <span className="font-bold">
              {Math.floor((challenge.basePoints || 100) * (flagLevel === FlagLevel.Root ? 1.5 : 1))}
              {!challenge.hasFirstBloodUser && flagLevel === FlagLevel.User && " (+10% First Blood!)"}
              {!challenge.hasFirstBloodRoot && flagLevel === FlagLevel.Root && " (+10% First Blood!)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75">Remaining Attempts:</span>
            <span className="font-bold">
              {maxAttempts ? Number(maxAttempts) - (attempts ? Number(attempts) : 0) : 0}
            </span>
          </div>
        </div>

        {/* Progreso de envío */}
        {isSubmitting && (
          <div className="alert alert-info">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{submitProgress}</span>
          </div>
        )}

        {/* Botón de envío */}
        <div className="flex justify-center">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleSubmitFlag}
            disabled={!canSubmitFlag() || isPending || isSubmitting}
          >
            {isPending || isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Submitting Flag...
              </>
            ) : (
              <>
                🚩 Submit Flag
              </>
            )}
          </button>
        </div>

        {/* Ayuda */}
        <div className="text-xs opacity-60 text-center">
          <p>💡 Tip: Flags must be in the format flag{"{content}"}</p>
          <p>🕒 There&apos;s a 1-hour cooldown between attempts</p>
          <p>🎯 Root level flags give 50% more points</p>
        </div>
      </div>
    </div>
  );
}; 