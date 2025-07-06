import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Address } from "../scaffold-eth";
import { Challenge, ChallengeMetadata, Difficulty } from "../../types/flagchain";
import { useChallenge } from "../../hooks/flagchain/useChallenge";
import { useFlag } from "../../hooks/flagchain/useFlag";
import { getIPFSUrl, getCTFMetadata } from "../../utils/flagchain/ipfs";

interface ChallengeCardProps {
  challenge: Challenge;
  showActions?: boolean;
  compact?: boolean;
}

const DIFFICULTY_COLORS = {
  [Difficulty.Easy]: "bg-green-100 text-green-800 border-green-300",
  [Difficulty.Medium]: "bg-yellow-100 text-yellow-800 border-yellow-300",
  [Difficulty.Hard]: "bg-red-100 text-red-800 border-red-300",
};

const DIFFICULTY_LABELS = {
  [Difficulty.Easy]: "Fácil",
  [Difficulty.Medium]: "Medio",
  [Difficulty.Hard]: "Difícil",
};

const DIFFICULTY_POINTS = {
  [Difficulty.Easy]: 100,
  [Difficulty.Medium]: 200,
  [Difficulty.Hard]: 500,
};

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  showActions = true,
  compact = false,
}) => {
  const { address: connectedAddress } = useAccount();
  const { getChallengeStats } = useChallenge();
  const { hasUserSolvedChallenge } = useFlag();
  
  const [metadata, setMetadata] = useState<ChallengeMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  // Cargar metadatos del challenge
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const meta = await getCTFMetadata(challenge.ipfsCID);
        setMetadata(meta);
      } catch (error) {
        console.error("Error loading metadata:", error);
      } finally {
        setLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, [challenge.ipfsCID]);

  // Obtener estadísticas del challenge
  const stats = getChallengeStats(challenge);
  const isCreator = connectedAddress && challenge.creator.toLowerCase() === connectedAddress.toLowerCase();
  const isSolved = hasUserSolvedChallenge(challenge.id);
  const points = DIFFICULTY_POINTS[challenge.difficulty];

  // Calcular tiempo desde creación
  const createdDate = new Date(Number(challenge.createdAt) * 1000);
  const timeAgo = getTimeAgo(createdDate);

  if (loadingMetadata) {
    return (
      <div className="card bg-base-100 shadow-xl animate-pulse">
        <div className="card-body">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow ${compact ? 'compact' : ''}`}>
      {/* Header con imagen */}
      {metadata?.imageCID && !compact && (
        <figure className="h-48 overflow-hidden">
          <img
            src={getIPFSUrl(metadata.imageCID)}
            alt={metadata.name}
            className="w-full h-full object-cover"
          />
        </figure>
      )}

      <div className="card-body">
        {/* Título y badges */}
        <div className="flex justify-between items-start">
          <h2 className="card-title text-lg">
            {metadata?.name || `Challenge #${challenge.id}`}
            {isSolved && (
              <div className="badge badge-success">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Resuelto
              </div>
            )}
          </h2>
          
          <div className="flex gap-2">
            {/* Badge de dificultad */}
            <div className={`badge badge-lg ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
              {DIFFICULTY_LABELS[challenge.difficulty]}
            </div>
            
            {/* Badge de puntos */}
            <div className="badge badge-lg badge-primary">
              {points} pts
            </div>
          </div>
        </div>

        {/* Descripción */}
        {metadata?.description && !compact && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {metadata.description}
          </p>
        )}

        {/* Tags */}
        {metadata?.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {metadata.tags.slice(0, compact ? 2 : 4).map((tag, index) => (
              <span key={index} className="badge badge-sm badge-outline">
                {tag}
              </span>
            ))}
            {metadata.tags.length > (compact ? 2 : 4) && (
              <span className="badge badge-sm badge-outline">
                +{metadata.tags.length - (compact ? 2 : 4)}
              </span>
            )}
          </div>
        )}

        {/* Estadísticas */}
        <div className="stats stats-horizontal bg-base-200 mb-3">
          <div className="stat py-2">
            <div className="stat-title text-xs">Resoluciones</div>
            <div className="stat-value text-sm">{stats?.totalSolves || 0}</div>
          </div>
          {stats && stats.averageRating > 0 && (
            <div className="stat py-2">
              <div className="stat-title text-xs">Rating</div>
              <div className="stat-value text-sm flex items-center">
                <span className="mr-1">⭐</span>
                {stats.averageRating.toFixed(1)}
              </div>
            </div>
          )}
          {!compact && (
            <div className="stat py-2">
              <div className="stat-title text-xs">Creado</div>
              <div className="stat-value text-sm">{timeAgo}</div>
            </div>
          )}
        </div>

        {/* Información del creador */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <span className="mr-2">Por:</span>
            <Address address={challenge.creator as `0x${string}`} />
            {isCreator && (
              <span className="badge badge-xs badge-primary ml-2">TÚ</span>
            )}
          </div>
          
          {/* Estado activo/inactivo */}
          <div className={`badge badge-sm ${challenge.active ? 'badge-success' : 'badge-error'}`}>
            {challenge.active ? 'Activo' : 'Inactivo'}
          </div>
        </div>

        {/* Acciones */}
        {showActions && (
          <div className="card-actions justify-end">
            {/* Botón Ver Challenge */}
            <button className="btn btn-primary btn-sm">
              Ver Challenge
            </button>
            
            {/* Botón Resolver (solo si no está resuelto) */}
            {!isSolved && challenge.active && (
              <button className="btn btn-success btn-sm">
                Resolver Flag
              </button>
            )}
            
            {/* Botón Ver en plataforma */}
            {metadata?.challengeURL && (
              <a
                href={metadata.challengeURL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver en {metadata.platform}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function para calcular tiempo relativo
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Hace un momento';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} min${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  }
} 