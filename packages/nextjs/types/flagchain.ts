export interface Challenge {
  id: bigint;
  creator: string;
  ipfsCID: string;
  difficulty: Difficulty;
  publicKeyUser: string;
  publicKeyRoot: string;
  active: boolean;
  createdAt: bigint;
  solveCountUser: bigint;
  solveCountRoot: bigint;
  totalRatings: bigint;
  sumRatings: bigint;
  firstBloodUser: string;
  firstBloodRoot: string;
  firstBloodTimestampUser: bigint;
  firstBloodTimestampRoot: bigint;
}

export enum Difficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3
}

export interface ChallengeMetadata {
  name: string;
  description: string;
  tags: string[];
  difficulty: keyof typeof Difficulty;
  platform: string; // Plataforma del CTF (ej: HackTheBox, TryHackMe, etc.)
  challengeURL: string; // URL del challenge en la plataforma
  imageCID?: string;
  flagHints?: string[];
  author?: string;
  website?: string;
  category?: string;
}

export interface Solve {
  id: string;
  challengeId: bigint;
  solver: string;
  level: FlagLevel;
  timestamp: bigint;
  points: bigint;
  isFirstBlood: boolean;
}

export enum FlagLevel {
  User = 1,
  Root = 2
}

export interface UserStats {
  address: string;
  totalScore: bigint;
  totalSolves: bigint;
  userSolves: bigint;
  rootSolves: bigint;
  challengesCreated: bigint;
  firstBloods: bigint;
  rank: number;
}

export interface CreatorStats {
  address: string;
  challengesCreated: bigint;
  averageRating: number;
  totalRatings: bigint;
  totalSolves: bigint;
  reputation: number;
}

export interface LeaderboardEntry {
  address: string;
  score: bigint;
  solves: bigint;
  firstBloods: bigint;
  rank: number;
}

export interface RatingData {
  challengeId: bigint;
  rater: string;
  stars: number;
  timestamp: bigint;
}

export interface CreateChallengeForm {
  name: string;
  description: string;
  tags: string[];
  difficulty: keyof typeof Difficulty;
  flagUser: string;
  flagRoot?: string;
  platform: string; // Plataforma del CTF
  challengeURL: string; // URL del challenge
  image?: File;
  category: string;
  flagHints: string[];
  author: string;
  website?: string;
}

export interface SubmitFlagForm {
  challengeId: bigint;
  flag: string;
  level: FlagLevel;
}

export interface ChallengeFilters {
  difficulty?: Difficulty;
  category?: string;
  tag?: string;
  creator?: string;
  solved?: boolean;
  active?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FlagChainEvents {
  ChallengeCreated: {
    id: bigint;
    creator: string;
    ipfsCID: string;
    difficulty: Difficulty;
  };
  
  FlagCaptured: {
    challengeId: bigint;
    solver: string;
    level: FlagLevel;
    points: bigint;
    isFirstBlood: boolean;
  };
  
  ChallengeRated: {
    challengeId: bigint;
    rater: string;
    stars: number;
  };
  
  ChallengeToggled: {
    challengeId: bigint;
    active: boolean;
  };
}

export interface CryptoUtils {
  generateKeyPair: (flag: string) => {
    privateKey: string;
    publicKey: string;
    address: string;
  };
  
  signMessage: (message: string, privateKey: string) => {
    signature: string;
    v: number;
    r: string;
    s: string;
  };
  
  verifySignature: (message: string, signature: string, publicKey: string) => Promise<boolean>;
}

export interface IPFSUtils {
  uploadFile: (file: File) => Promise<string>;
  uploadJSON: (data: any) => Promise<string>;
  getFile: (cid: string) => Promise<File>;
  getJSON: (cid: string) => Promise<any>;
}

export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
} 