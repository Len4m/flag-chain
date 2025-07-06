"use client";

import { useState } from "react";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { uploadFile, uploadCTFMetadata, validateFile } from "~~/utils/flagchain/ipfs";
import { generateKeyPair } from "~~/utils/flagchain/crypto";
import { Difficulty } from "~~/types/flagchain";
import { AddressInput } from "~~/components/scaffold-eth";
import { useAccount } from "wagmi";

interface CreateChallengeProps {
  onChallengeCreated?: (challengeId: number) => void;
}

// URLs base de las plataformas CTF
const PLATFORM_URLS: Record<string, string> = {
  "HackTheBox": "https://www.hackthebox.com/",
  "TryHackMe": "https://tryhackme.com/",
  "VulnHub": "https://www.vulnhub.com/",
  "OverTheWire": "https://overthewire.org/",
  "PicoCTF": "https://picoctf.org/",
  "CyberDefenders": "https://cyberdefenders.org/",
  "RootMe": "https://www.root-me.org/",
  "HackThisSite": "https://www.hackthissite.org/",
  "VulNyx": "https://vulnyx.com/",
  "The Hackers Labs": "https://thehackerslabs.com/",
  "DockerLabs": "https://dockerlabs.es/",
  "BugBountyLabs": "https://bugbountylabs.com/",
  "HackMyVM": "https://hackmyvm.eu/",
};

export const CreateChallenge = ({ onChallengeCreated }: CreateChallengeProps) => {
  const { address: connectedAddress } = useAccount();
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [flagUser, setFlagUser] = useState("");
  const [flagRoot, setFlagRoot] = useState("");
  const [platform, setPlatform] = useState("");
  const [challengeURL, setChallengeURL] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [hintInput, setHintInput] = useState("");
  
  // Estados de carga
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  // Hook para escribir al contrato
  const { writeContractAsync, isPending } = useScaffoldWriteContract("FlagChain");
  
  // Hook para leer datos del contrato
  const { data: challengesCreated } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "challengesCreatedByUser",
    args: [connectedAddress],
  });

  const { data: maxChallenges } = useScaffoldReadContract({
    contractName: "FlagChain",
    functionName: "MAX_CHALLENGES_PER_USER",
  });

  // Función para agregar tags
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Función para eliminar tags
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Función para agregar hints
  const addHint = () => {
    if (hintInput.trim() && hints.length < 5) {
      setHints([...hints, hintInput.trim()]);
      setHintInput("");
    }
  };

  // Función para eliminar hints
  const removeHint = (index: number) => {
    setHints(hints.filter((_, i) => i !== index));
  };

  // Función para manejar el cambio de plataforma y autocompletar URL
  const handlePlatformChange = (selectedPlatform: string) => {
    setPlatform(selectedPlatform);
    // Auto-completar URL base si la plataforma tiene una URL definida
    if (selectedPlatform && PLATFORM_URLS[selectedPlatform]) {
      setChallengeURL(PLATFORM_URLS[selectedPlatform]);
    } else if (selectedPlatform === "") {
      // Limpiar URL si no se selecciona plataforma
      setChallengeURL("");
    }
  };



  // Función para manejar la subida de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      setImage(selectedFile);
    }
  };

  // Función principal para crear el challenge
  const handleCreateChallenge = async () => {
    try {
      // Validaciones
      if (!name || !description || !flagUser || !flagRoot || !platform || !challengeURL) {
        alert("Please fill in all required fields");
        return;
      }

      if (!connectedAddress) {
        alert("Please connect your wallet");
        return;
      }

      if (challengesCreated && maxChallenges && Number(challengesCreated) >= Number(maxChallenges)) {
        alert(`Maximum challenges per user reached (${maxChallenges})`);
        return;
      }

      setIsUploading(true);
      setUploadProgress("Generating cryptographic keys...");

      // Generar claves públicas desde las flags
      const { publicKey: publicKeyUser } = generateKeyPair(flagUser);
      const { publicKey: publicKeyRoot } = generateKeyPair(flagRoot);

      // Subir imagen a IPFS si existe
      let imageCID = "";
      if (image) {
        setUploadProgress("Uploading challenge image to IPFS...");
        imageCID = await uploadFile(image);
      }

      // Crear metadatos del challenge
      setUploadProgress("Uploading metadata to IPFS...");
      const metadataCID = await uploadCTFMetadata({
        name,
        description,
        tags,
        difficulty: difficulty === Difficulty.Easy ? "Easy" : difficulty === Difficulty.Medium ? "Medium" : "Hard",
        category,
        author: connectedAddress,
        platform,
        challengeURL,
        imageCID,
        flagHints: hints,
        points: difficulty === Difficulty.Easy ? 100 : difficulty === Difficulty.Medium ? 200 : 500,
      });

      // Crear challenge en el contrato
      setUploadProgress("Creating challenge on blockchain...");
      await writeContractAsync({
        functionName: "createChallenge",
        args: [
          metadataCID,
          publicKeyUser as `0x${string}`,
          publicKeyRoot as `0x${string}`,
          difficulty,
        ],
      });

      // Limpiar formulario
      setName("");
      setDescription("");
      setDifficulty(Difficulty.Easy);
      setCategory("");
      setTags([]);
      setFlagUser("");
      setFlagRoot("");
      setPlatform("");
      setChallengeURL("");
      setImage(null);
      setHints([]);

      alert("Challenge created successfully!");
      
      // Callback opcional
      if (onChallengeCreated) {
        // En una implementación real, obtendríamos el ID del evento
        onChallengeCreated(1);
      }

    } catch (error) {
      console.error("Error creating challenge:", error);
      alert("Error creating challenge. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 rounded-lg shadow-lg">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="relative w-8 h-[34px]">
          <img src="/logo.png" alt="FlagChain logo" className="w-full h-full object-contain dark:brightness-0 dark:invert" />
        </div>
        <h2 className="text-2xl font-bold text-base-content">Añadir Nuevo Challenge CTF</h2>
      </div>
      
      {/* Información del usuario */}
      <div className="mb-6 p-4 bg-base-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-base-content/70">Connected as:</p>
            <AddressInput
              value={connectedAddress || ""}
              onChange={() => {}}
              placeholder="Connect wallet"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-base-content/70">Challenges Añadidos:</p>
            <p className="text-lg font-bold">
              {challengesCreated ? Number(challengesCreated) : 0} / {maxChallenges ? Number(maxChallenges) : 10}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Challenge Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter challenge name"
              maxLength={100}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              <option value="Web">Web</option>
              <option value="Crypto">Crypto</option>
              <option value="Binary">Binary</option>
              <option value="Reverse">Reverse</option>
              <option value="Pwn">Pwn</option>
              <option value="Forensics">Forensics</option>
              <option value="Misc">Misc</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="label">
            <span className="label-text">Description *</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full h-32 rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your challenge... What should participants find?"
            maxLength={1000}
          />
        </div>

        {/* Dificultad */}
        <div>
          <label className="label">
            <span className="label-text">Difficulty</span>
          </label>
          <div className="flex gap-4">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                className="radio radio-primary"
                checked={difficulty === Difficulty.Easy}
                onChange={() => setDifficulty(Difficulty.Easy)}
              />
              <span className="ml-2 text-base-content">Easy (100 pts)</span>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                className="radio radio-primary"
                checked={difficulty === Difficulty.Medium}
                onChange={() => setDifficulty(Difficulty.Medium)}
              />
              <span className="ml-2 text-base-content">Medium (200 pts)</span>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                className="radio radio-primary"
                checked={difficulty === Difficulty.Hard}
                onChange={() => setDifficulty(Difficulty.Hard)}
              />
              <span className="ml-2 text-base-content">Hard (500 pts)</span>
            </label>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">
            <span className="label-text">Tags</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags (e.g., PHP, SQL, XSS)"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <button type="button" className="btn btn-primary" onClick={addTag}>
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="badge badge-primary gap-2">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* Plataforma y URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Platform *</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
            >
              <option value="">Select platform</option>
              <option value="BugBountyLabs">BugBountyLabs</option>
              <option value="CyberDefenders">CyberDefenders</option>
              <option value="DockerLabs">DockerLabs</option>
              <option value="HackMyVM">HackMyVM</option>
              <option value="HackTheBox">HackTheBox</option>
              <option value="HackThisSite">HackThisSite</option>
              <option value="OverTheWire">OverTheWire</option>
              <option value="PicoCTF">PicoCTF</option>
              <option value="RootMe">RootMe</option>
              <option value="The Hackers Labs">The Hackers Labs</option>
              <option value="TryHackMe">TryHackMe</option>
              <option value="VulnHub">VulnHub</option>
              <option value="VulNyx">VulNyx</option>
              <option value="Other">Other</option>
            </select>
            <div className="label">
              <span className="label-text-alt text-base-content/60">CTF platform where the challenge is hosted</span>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Challenge URL *</span>
            </label>
            <input
              type="url"
              className="input input-bordered w-full"
              value={challengeURL}
              onChange={(e) => setChallengeURL(e.target.value)}
              placeholder="https://..."
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">Direct link to the challenge</span>
            </div>
          </div>
        </div>

        {/* Imagen del Challenge */}
        <div>
          <label className="label">
            <span className="label-text">Challenge Image (Optional)</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={handleImageChange}
            accept="image/*"
          />
          {image && (
            <div className="mt-2 text-sm text-base-content/70">
              Selected: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        {/* Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">User Flag *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={flagUser}
              onChange={(e) => setFlagUser(e.target.value)}
              placeholder="flag{user_level_flag}"
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">Flag for user-level access</span>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Root Flag *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={flagRoot}
              onChange={(e) => setFlagRoot(e.target.value)}
              placeholder="flag{root_level_flag}"
            />
            <div className="label">
              <span className="label-text-alt text-base-content/60">Flag for root-level access</span>
            </div>
          </div>
        </div>

        {/* Hints */}
        <div>
          <label className="label">
            <span className="label-text">Hints (Optional)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              value={hintInput}
              onChange={(e) => setHintInput(e.target.value)}
              placeholder="Add a hint for participants"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHint())}
            />
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={addHint}
              disabled={hints.length >= 5}
            >
              Add Hint
            </button>
          </div>
          <div className="space-y-2">
            {hints.map((hint, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-base-200 rounded">
                <span className="flex-1">{hint}</span>
                <button 
                  type="button" 
                  className="btn btn-sm btn-ghost" 
                  onClick={() => removeHint(index)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Progreso de subida */}
        {isUploading && (
          <div className="alert alert-info">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{uploadProgress}</span>
          </div>
        )}

        {/* Botón de envío */}
        <div className="flex justify-center">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleCreateChallenge}
            disabled={isPending || isUploading || !connectedAddress}
          >
            {isPending || isUploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Añadiendo Challenge...
              </>
            ) : (
              <>
                🚩 Añadir Challenge
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 