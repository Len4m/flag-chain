import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ChallengeWithMetadata } from "../../hooks/flagchain/useChallenges";
import { getCTFMetadata } from "../../utils/flagchain/ipfs";
import { useScaffoldEventHistory } from "../../hooks/scaffold-eth";
import { FlagLevel } from "../../types/flagchain";

interface ChallengeCardRealProps {
  challenge: ChallengeWithMetadata;
  onSubmitFlag?: (challengeId: bigint, flag: string, level: FlagLevel) => void;
  onDownload?: (challengeId: bigint) => void;
}

export const ChallengeCardReal: React.FC<ChallengeCardRealProps> = ({
  challenge,
  onSubmitFlag,
  onDownload,
}) => {
  const { address } = useAccount();
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userSolved, setUserSolved] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [flag, setFlag] = useState("");
  const [level, setLevel] = useState<FlagLevel>(FlagLevel.User);

  // Obtener eventos de flags capturadas para este challenge
  const { data: flagEvents } = useScaffoldEventHistory({
    contractName: "FlagChain",
    eventName: "FlagCaptured",
    fromBlock: 0n,
    filters: { challengeId: challenge.id },
  });

  // Cargar metadatos del challenge
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        setLoading(true);
        const meta = await getCTFMetadata(challenge.ipfsCID);
        setMetadata(meta);
        
        // Verificar si el usuario ya resolvió este challenge
        if (address && flagEvents) {
          const userSolve = flagEvents.find(
            (event: any) => event.args.solver === address && event.args.challengeId === challenge.id
          );
          setUserSolved(!!userSolve);
        }
      } catch (error) {
        console.error("Error loading metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [challenge.ipfsCID, address, flagEvents]);

  const getDifficultyColor = (diff: number) => {
    switch (diff) {
      case 1: return "badge-success";
      case 2: return "badge-warning";
      case 3: return "badge-error";
      default: return "badge-neutral";
    }
  };

  const getDifficultyText = (diff: number) => {
    switch (diff) {
      case 1: return "Fácil";
      case 2: return "Medio";
      case 3: return "Difícil";
      default: return "Desconocido";
    }
  };

  const handleSubmitFlag = () => {
    if (!flag.trim()) return;
    
    if (onSubmitFlag) {
      onSubmitFlag(challenge.id, flag, level);
    }
    
    setShowSubmitForm(false);
    setFlag("");
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Date.now();
    const time = Number(timestamp) * 1000;
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return "hace un momento";
  };

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl border-2 border-base-300 hover:border-primary transition-all">
      <div className="card-body">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="card-title text-xl font-bold">
              {metadata?.name || challenge.name || "Challenge sin nombre"}
              {userSolved && <span className="text-green-500 ml-2">✓</span>}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              por {metadata?.author || challenge.author || "Anónimo"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`badge ${getDifficultyColor(challenge.difficulty)}`}>
              {getDifficultyText(challenge.difficulty)}
            </div>
            <div className="text-xs text-gray-500">
              {formatTimeAgo(challenge.createdAt)}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {metadata?.description || challenge.description || "Sin descripción disponible"}
          </p>
        </div>

        {/* Tags */}
        {(metadata?.tags || challenge.tags) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(metadata?.tags || challenge.tags)?.map((tag: string, index: number) => (
              <span key={index} className="badge badge-outline badge-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="bg-base-200 rounded-lg p-3">
            <div className="stat-value text-lg text-primary">
              {Number(challenge.totalSolves)}
            </div>
            <div className="stat-title text-xs">Resoluciones</div>
          </div>
          <div className="bg-base-200 rounded-lg p-3">
            <div className="stat-value text-lg text-accent">
              {Number(challenge.basePoints)}
            </div>
            <div className="stat-title text-xs">Puntos</div>
          </div>
          <div className="bg-base-200 rounded-lg p-3">
            <div className="stat-value text-lg text-secondary">
              {challenge.averageRating > 0 ? (Number(challenge.averageRating) / 100).toFixed(1) : "N/A"}
            </div>
            <div className="stat-title text-xs">Rating</div>
          </div>
        </div>

        {/* Acciones */}
        <div className="card-actions justify-end">
          {metadata?.fileCID && (
            <button
              className="btn btn-sm btn-outline"
              onClick={() => onDownload && onDownload(challenge.id)}
            >
              📁 Descargar
            </button>
          )}
          
          {!userSolved && challenge.active && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setShowSubmitForm(true)}
            >
              🚩 Resolver
            </button>
          )}
          
          {userSolved && (
            <button className="btn btn-sm btn-success" disabled>
              ✓ Resuelto
            </button>
          )}
        </div>

        {/* Formulario de envío de flag */}
        {showSubmitForm && (
          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <h3 className="font-bold mb-3">Enviar Flag</h3>
            
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Flag</span>
              </label>
              <input
                type="text"
                placeholder="flag{...}"
                className="input input-bordered w-full"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
              />
            </div>

            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Nivel</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value) as FlagLevel)}
              >
                <option value={FlagLevel.User}>Usuario (menos puntos)</option>
                <option value={FlagLevel.Root}>Root (más puntos)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowSubmitForm(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSubmitFlag}
                disabled={!flag.trim()}
              >
                Enviar Flag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 