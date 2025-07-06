import { IPFSUtils } from "../../types/flagchain";

// Configuración de IPFS
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
const IPFS_API_ENDPOINT = process.env.NEXT_PUBLIC_IPFS_API || "https://api.web3.storage/upload";
const IPFS_API_KEY = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY;

// Tipos de archivo permitidos para CTFs
export const ALLOWED_FILE_TYPES = [
  // Archivos de código
  "text/plain",
  "application/javascript",
  "text/html",
  "text/css",
  "application/json",
  "application/xml",
  "text/xml",
  
  // Archivos ejecutables y binarios
  "application/octet-stream",
  "application/x-executable",
  "application/x-elf",
  "application/x-msdownload",
  
  // Archivos comprimidos
  "application/zip",
  "application/x-tar",
  "application/gzip",
  "application/x-7z-compressed",
  
  // Imágenes
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  
  // Documentos
  "application/pdf",
  "text/markdown",
  "text/rtf",
];

// Tamaño máximo de archivo (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Valida un archivo antes de subirlo a IPFS
 */
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  // Permitir todos los tipos de archivo para CTFs (la validación se hace en el backend)
  return { valid: true };
};

/**
 * Sube un archivo a IPFS usando Web3.Storage
 */
export const uploadFile = async (file: File): Promise<string> => {
  try {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (!IPFS_API_KEY) {
      console.warn("IPFS API key not configured, using mock CID");
      return `mock-cid-${Date.now()}-${file.name}`;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(IPFS_API_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${IPFS_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.cid || data.Hash;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    
    // Fallback: usar un mock CID para desarrollo
    if (process.env.NODE_ENV === "development") {
      return `mock-cid-${Date.now()}-${file.name}`;
    }
    
    throw error;
  }
};

/**
 * Sube metadatos de un CTF a IPFS
 */
export const uploadCTFMetadata = async (metadata: {
  name: string;
  description: string;
  tags: string[];
  difficulty: string;
  category: string;
  author: string;
  platform: string;
  challengeURL: string;
  imageCID?: string;
  flagHints?: string[];
  writeup?: string;
  points?: number;
}): Promise<string> => {
  try {
    // Validar metadatos requeridos
    if (!metadata.name || !metadata.description || !metadata.difficulty) {
      throw new Error("Missing required metadata fields");
    }

    const ctfMetadata = {
      ...metadata,
      version: "1.0",
      createdAt: new Date().toISOString(),
      type: "flagchain-challenge",
    };

    return await uploadJSON(ctfMetadata);
  } catch (error) {
    console.error("Error uploading CTF metadata:", error);
    throw error;
  }
};

/**
 * Obtiene metadatos de un CTF desde IPFS
 */
export const getCTFMetadata = async (cid: string): Promise<any> => {
  try {
    const metadata = await getJSON(cid);
    
    // Validar que sea un CTF válido
    if (!metadata.name || !metadata.description || !metadata.difficulty) {
      throw new Error("Invalid CTF metadata format");
    }

    return metadata;
  } catch (error) {
    console.error("Error getting CTF metadata:", error);
    throw error;
  }
};

/**
 * Sube un objeto JSON a IPFS
 */
export const uploadJSON = async (data: any): Promise<string> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const file = new File([blob], "metadata.json", { type: "application/json" });
    
    return await uploadFile(file);
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw error;
  }
};

/**
 * Obtiene un archivo desde IPFS
 */
export const getFile = async (cid: string): Promise<File> => {
  try {
    // Si es mock CID, devolver un archivo mock
    if (cid.startsWith("mock-cid-")) {
      const content = "Mock file content for development";
      const blob = new Blob([content], { type: "text/plain" });
      return new File([blob], "mock-file.txt", { type: "text/plain" });
    }

    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const filename = `file-${cid.slice(0, 8)}`; // Nombre basado en CID
    
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error("Error getting file from IPFS:", error);
    throw error;
  }
};

/**
 * Obtiene un objeto JSON desde IPFS
 */
export const getJSON = async (cid: string): Promise<any> => {
  try {
    // Si es mock CID, devolver datos mock
    if (cid.startsWith("mock-cid-")) {
      return {
        name: "Mock Challenge",
        description: "This is a mock challenge for development",
        tags: ["mock", "development"],
        difficulty: "Easy",
        category: "Development",
        author: "MockUser",
        version: "1.0",
        createdAt: new Date().toISOString(),
        type: "flagchain-challenge",
      };
    }

    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting JSON from IPFS:", error);
    throw error;
  }
};

/**
 * Valida un CID de IPFS
 */
export const isValidCID = (cid: string): boolean => {
  // Validación básica de CID
  const cidRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|bafybe[a-z2-7]{52}|mock-cid-.+)$/;
  return cidRegex.test(cid);
};

/**
 * Obtiene la URL completa de IPFS para un CID
 */
export const getIPFSUrl = (cid: string): string => {
  return `${IPFS_GATEWAY}${cid}`;
};

/**
 * Comprime una imagen antes de subirla a IPFS
 */
export const compressImage = async (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspecto
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        "image/jpeg",
        quality
      );
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Sube múltiples archivos a IPFS
 */
export const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadFile(file));
  return Promise.all(uploadPromises);
};

/**
 * Obtiene metadatos de un CID sin descargar el archivo completo
 */
export const getFileMeta = async (cid: string): Promise<{
  size: number;
  type: string;
  name: string;
}> => {
  try {
    if (cid.startsWith("mock-cid-")) {
      return {
        size: 1024,
        type: "text/plain",
        name: "mock-file.txt",
      };
    }

    const response = await fetch(`${IPFS_GATEWAY}${cid}`, {
      method: "HEAD",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const size = parseInt(response.headers.get("content-length") || "0");
    const type = response.headers.get("content-type") || "application/octet-stream";
    const name = `file-${cid.slice(0, 8)}`;

    return { size, type, name };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw error;
  }
};

/**
 * Descarga un archivo desde IPFS
 */
export const downloadFile = async (cid: string, filename?: string): Promise<void> => {
  try {
    const url = getIPFSUrl(cid);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename || `file-${cid.slice(0, 8)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

/**
 * Verifica si IPFS está disponible
 */
export const checkIPFSAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(IPFS_GATEWAY, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error("IPFS not available:", error);
    return false;
  }
};

// Interfaces para perfiles de usuario
export interface UserProfile {
  address: string;
  username?: string;
  bio?: string;
  avatar?: string;
  website?: string;
  twitter?: string;
  github?: string;
  discord?: string;
  country?: string;
  team?: string;
  skills?: string[];
  achievements?: string[];
  preferences?: {
    theme?: "light" | "dark" | "auto";
    notifications?: boolean;
    showStats?: boolean;
    showSolves?: boolean;
  };
  stats?: {
    totalScore: number;
    totalSolves: number;
    userSolves: number;
    rootSolves: number;
    challengesCreated: number;
    firstBloods: number;
    averageRating: number;
    joinedAt: number;
    lastActive: number;
  };
  badges?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: number;
  }[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Sube perfil de usuario a IPFS
 */
export const uploadUserProfile = async (profile: UserProfile): Promise<string> => {
  try {
    const profileData = {
      ...profile,
      updatedAt: Date.now(),
    };
    
    const cid = await uploadJSON(profileData);
    return cid;
  } catch (error) {
    console.error("Error uploading user profile:", error);
    // Fallback para desarrollo
    return `mock-profile-${Date.now()}`;
  }
};

/**
 * Obtiene perfil de usuario desde IPFS
 */
export const getUserProfile = async (cid: string): Promise<UserProfile> => {
  try {
    const profile = await getJSON(cid);
    return profile as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Crear perfil por defecto
 */
export const createDefaultProfile = (address: string): UserProfile => {
  return {
    address,
    username: `Player_${address.slice(0, 6)}`,
    bio: "",
    avatar: "",
    skills: [],
    achievements: [],
    preferences: {
      theme: "auto",
      notifications: true,
      showStats: true,
      showSolves: true,
    },
    stats: {
      totalScore: 0,
      totalSolves: 0,
      userSolves: 0,
      rootSolves: 0,
      challengesCreated: 0,
      firstBloods: 0,
      averageRating: 0,
      joinedAt: Date.now(),
      lastActive: Date.now(),
    },
    badges: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

// Utilidades exportadas
export const IPFSUtilities: IPFSUtils = {
  uploadFile,
  uploadJSON,
  getFile,
  getJSON,
}; 