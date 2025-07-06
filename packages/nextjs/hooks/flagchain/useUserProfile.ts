import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { 
  useScaffoldReadContract, 
  useScaffoldWriteContract,
  useScaffoldEventHistory 
} from "../scaffold-eth";
import { 
  UserProfile, 
  uploadUserProfile, 
  getUserProfile, 
  createDefaultProfile 
} from "../../utils/flagchain/ipfs";
import { notification } from "../../utils/scaffold-eth";

export const useUserProfile = () => {
  const { address } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Por ahora, no hay perfiles de usuario en el contrato, solo usamos IPFS
  const userProfileCID = null;

  // Obtener estadísticas del usuario desde el contrato
  const { data: userStats } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "getUserStats",
    args: [address],
  });

  // Cargar perfil desde IPFS
  const loadProfile = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      if (userProfileCID && userProfileCID !== "") {
        // Cargar perfil existente desde IPFS
        const profileData = await getUserProfile(userProfileCID);
        setProfile(profileData);
      } else {
        // Crear perfil por defecto con estadísticas del contrato
        const defaultProfile = createDefaultProfile(address);
        if (userStats) {
          defaultProfile.stats = {
            totalScore: Number(userStats.totalScore || 0),
            totalSolves: Number(userStats.totalSolves || 0),
            userSolves: Number(userStats.userSolves || 0),
            rootSolves: Number(userStats.rootSolves || 0),
            challengesCreated: Number(userStats.challengesCreated || 0),
            firstBloods: 0, // Calcular después
            lastActive: Number(userStats.lastActivity || 0),
            averageRating: userStats.averageRating ? Number(userStats.averageRating) / 100 : 0,
            joinedAt: Number(userStats.lastActivity || Date.now()),
          };
        }
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback a perfil por defecto
      const defaultProfile = createDefaultProfile(address);
      setProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  };

  // Guardar perfil en IPFS (simplificado)
  const saveProfile = async (updatedProfile: UserProfile) => {
    if (!address) {
      notification.error("Conecta tu wallet para guardar el perfil");
      return;
    }

    setSaving(true);
    try {
      // Subir perfil actualizado a IPFS
      const cid = await uploadUserProfile(updatedProfile);
      
      // Por ahora solo guardamos en local, ya que no hay función en el contrato
      setProfile(updatedProfile);
      notification.success("Perfil guardado exitosamente");
    } catch (error) {
      console.error("Error saving profile:", error);
      notification.error("Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  // Actualizar campo específico del perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: Date.now(),
    };

    await saveProfile(updatedProfile);
  };

  // Obtener ranking del usuario (simplificado)
  const getUserRank = async (): Promise<number> => {
    return 0; // Placeholder
  };

  // Obtener badges del usuario (simplificado)
  const getUserBadges = () => {
    if (!profile || !profile.stats) return [];
    
    const badges = [];
    
    // Badge por primera flag
    if (profile.stats.totalSolves > 0) {
      badges.push({
        id: "first-flag",
        name: "Primera Flag",
        description: "Capturó tu primera flag",
        icon: "🚩",
        earnedAt: Date.now(),
      });
    }

    // Badge por 10 flags
    if (profile.stats.totalSolves >= 10) {
      badges.push({
        id: "flag-collector",
        name: "Coleccionista",
        description: "Capturó 10 flags",
        icon: "🏆",
        earnedAt: Date.now(),
      });
    }

    // Badge por crear challenges
    if (profile.stats.challengesCreated > 0) {
      badges.push({
        id: "challenge-creator",
        name: "Creador",
        description: "Creó un challenge",
        icon: "🛠️",
        earnedAt: Date.now(),
      });
    }

    return badges;
  };

  // Efectos
  useEffect(() => {
    loadProfile();
  }, [address, userProfileCID]);

  return {
    profile,
    loading,
    saving,
    saveProfile,
    updateProfile,
    loadProfile,
    getUserRank,
    getUserBadges,
  };
}; 