import { keccak256, toHex, fromHex, encodePacked, recoverAddress } from "viem";
import { secp256k1 } from "@noble/curves/secp256k1";
import { CryptoUtils } from "../../types/flagchain";

/**
 * Genera un par de claves a partir de una flag
 */
export const generateKeyPair = (flag: string): {
  privateKey: string;
  publicKey: string;
  address: string;
} => {
  // Generar clave privada desde flag usando keccak256
  const privateKeyBytes = keccak256(encodePacked(["string"], [flag]));
  const privateKey = privateKeyBytes.slice(2); // Remover '0x'
  
  // Generar clave pública usando secp256k1
  const publicKeyBytes = secp256k1.getPublicKey(privateKey, true); // compressed
  const publicKey = `0x${Buffer.from(publicKeyBytes).toString('hex')}`;
  
  // Generar dirección a partir de la clave pública
  const uncompressedPubKey = secp256k1.getPublicKey(privateKey, false);
  const pubKeyWithoutPrefix = uncompressedPubKey.slice(1); // Remover prefix 0x04
  const addressHash = keccak256(pubKeyWithoutPrefix);
  const address = `0x${addressHash.slice(-40)}`; // Últimos 20 bytes
  
  return {
    privateKey: `0x${privateKey}`,
    publicKey,
    address,
  };
};

/**
 * Firma un mensaje usando ECDSA
 */
export const signMessage = (message: string, privateKey: string): {
  signature: string;
  v: number;
  r: string;
  s: string;
} => {
  // Crear hash del mensaje siguiendo el estándar de Ethereum
  const messageHash = keccak256(encodePacked(["string"], [message]));
  const ethSignedHash = keccak256(
    encodePacked(
      ["string", "bytes32"],
      ["\x19Ethereum Signed Message:\n32", messageHash]
    )
  );
  
  // Firmar usando secp256k1
  const privateKeyBytes = fromHex(privateKey as `0x${string}`, 'bytes');
  const signatureObj = secp256k1.sign(ethSignedHash.slice(2), privateKeyBytes);
  
  // Extraer r, s y v
  const r = `0x${signatureObj.r.toString(16).padStart(64, '0')}`;
  const s = `0x${signatureObj.s.toString(16).padStart(64, '0')}`;
  const v = signatureObj.recovery! + 27;
  
  // Combinar en signature completa
  const signature = `${r}${s.slice(2)}${v.toString(16).padStart(2, '0')}`;
  
  return {
    signature: `0x${signature}`,
    v,
    r,
    s,
  };
};

/**
 * Verifica una firma ECDSA
 */
export const verifySignature = async (
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> => {
  try {
    // Crear hash del mensaje
    const messageHash = keccak256(encodePacked(["string"], [message]));
    const ethSignedHash = keccak256(
      encodePacked(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      )
    );
    
    // Recuperar dirección desde la firma
    const recoveredAddress = await recoverAddress({
      hash: ethSignedHash,
      signature: signature as `0x${string}`,
    });
    
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Genera el mensaje que se debe firmar para enviar una flag
 */
export const generateFlagMessage = (
  challengeId: bigint,
  userAddress: string,
  nonce: bigint = 0n
): string => {
  return `FlagChain-${challengeId}-${userAddress}-${nonce}`;
};

/**
 * Valida que una flag tenga el formato correcto
 */
export const validateFlagFormat = (flag: string): boolean => {
  // Formato esperado: FLAG{...} o flag{...}
  const flagRegex = /^(FLAG|flag)\{.+\}$/;
  return flagRegex.test(flag);
};

/**
 * Genera una clave pública comprimida desde una dirección
 */
export const getCompressedPublicKey = (flag: string): string => {
  const { publicKey } = generateKeyPair(flag);
  return publicKey;
};

/**
 * Convierte una clave pública a dirección
 */
export const publicKeyToAddress = (publicKey: string): string => {
  try {
    // Si es clave pública comprimida, expandir
    const pubKeyBytes = fromHex(publicKey as `0x${string}`, 'bytes');
    const uncompressedPubKey = secp256k1.getPublicKey(pubKeyBytes, false);
    
    // Obtener los últimos 20 bytes del hash
    const pubKeyWithoutPrefix = uncompressedPubKey.slice(1);
    const addressHash = keccak256(pubKeyWithoutPrefix);
    return `0x${addressHash.slice(-40)}`;
  } catch (error) {
    console.error('Error converting public key to address:', error);
    return '';
  }
};

/**
 * Instancia de utilidades criptográficas
 */
export const cryptoUtils: CryptoUtils = {
  generateKeyPair,
  signMessage,
  verifySignature,
};

/**
 * Constantes criptográficas
 */
export const CRYPTO_CONSTANTS = {
  SECP256K1_ORDER: 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n,
  ETHEREUM_MESSAGE_PREFIX: '\x19Ethereum Signed Message:\n32',
  FLAGCHAIN_MESSAGE_PREFIX: 'FlagChain',
} as const; 