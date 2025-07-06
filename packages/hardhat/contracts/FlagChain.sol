// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title FlagChain
 * @dev Plataforma descentralizada para gestionar CTFs (Capture The Flag)
 * @author BuidlGuidl - FlagChain Team
 */
contract FlagChain is ReentrancyGuard, Pausable, AccessControl {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // =============================================================================
    // CONSTANTES Y ROLES
    // =============================================================================

    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Límites del sistema
    uint256 public constant MAX_CHALLENGES_PER_USER = 10;
    uint256 public constant MAX_ATTEMPTS_PER_CHALLENGE = 5;
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    uint256 public constant MAX_POINTS_PER_CHALLENGE = 1000;

    // Puntos base por dificultad
    uint256 public constant EASY_POINTS = 100;
    uint256 public constant MEDIUM_POINTS = 200;
    uint256 public constant HARD_POINTS = 500;

    // Bonus first blood
    uint256 public constant FIRST_BLOOD_BONUS = 10; // 10% adicional

    // =============================================================================
    // ENUMS Y ESTRUCTURAS
    // =============================================================================

    enum Difficulty {
        EASY,    // 0
        MEDIUM,  // 1
        HARD     // 2
    }

    enum FlagLevel {
        USER,    // 0
        ROOT     // 1
    }

    struct Challenge {
        uint256 id;
        address creator;
        string ipfsCID;                 // Metadatos del reto en IPFS
        Difficulty difficulty;
        bytes publicKeyUser;           // Clave pública para flag usuario (33 bytes)
        bytes publicKeyRoot;           // Clave pública para flag root (33 bytes)
        bool active;
        uint256 createdAt;
        uint256 basePoints;
        uint256 totalSolves;
        uint256 userSolves;
        uint256 rootSolves;
        bool hasFirstBloodUser;
        bool hasFirstBloodRoot;
        uint256 totalRatings;
        uint256 sumRatings;
        uint256 averageRating;         // Promedio * 100 para evitar decimales
    }

    struct Solve {
        uint256 challengeId;
        address solver;
        FlagLevel level;
        uint256 timestamp;
        uint256 points;
        bool isFirstBlood;
    }

    struct Rating {
        uint256 challengeId;
        address rater;
        uint8 stars;                   // 1-5 estrellas
        uint256 timestamp;
    }

    struct UserStats {
        uint256 totalScore;
        uint256 totalSolves;
        uint256 userSolves;
        uint256 rootSolves;
        uint256 challengesCreated;
        uint256 averageRating;         // Como creador
        uint256 lastActivity;
        uint256 consecutiveSolves;
    }

    // =============================================================================
    // ESTADO DEL CONTRATO
    // =============================================================================

    uint256 private _challengeIds;
    uint256 private _solveIds;
    uint256 private _ratingIds;

    // Mappings principales
    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => Solve) public solves;
    mapping(uint256 => Rating) public ratings;
    mapping(address => UserStats) public userStats;

    // Mappings para control de acceso y límites
    mapping(address => uint256) public challengesCreatedByUser;
    mapping(address => mapping(uint256 => uint256)) public attemptsByUserAndChallenge;
    mapping(address => mapping(uint256 => bool)) public hasUserSolvedChallenge;
    mapping(address => mapping(uint256 => mapping(uint256 => bool))) public hasUserSolvedLevel; // user -> challenge -> level -> bool
    mapping(address => mapping(uint256 => uint256)) public lastAttemptByUserAndChallenge;
    mapping(address => mapping(uint256 => bool)) public hasUserRatedChallenge;
    mapping(address => uint256) public userNonces;

    // Arrays para consultas eficientes
    uint256[] public activeChallenges;
    uint256[] public allSolves;
    uint256[] public allRatings;

    // =============================================================================
    // EVENTOS
    // =============================================================================

    event ChallengeCreated(
        uint256 indexed challengeId,
        address indexed creator,
        string ipfsCID,
        Difficulty difficulty,
        uint256 basePoints
    );

    event FlagCaptured(
        uint256 indexed challengeId,
        address indexed solver,
        FlagLevel level,
        uint256 points,
        bool isFirstBlood,
        uint256 timestamp
    );

    event ChallengeRated(
        uint256 indexed challengeId,
        address indexed rater,
        uint8 stars,
        uint256 newAverageRating
    );

    event ChallengeStatusChanged(
        uint256 indexed challengeId,
        bool active,
        address indexed changedBy
    );

    event DifficultyVoted(
        uint256 indexed challengeId,
        address indexed voter,
        Difficulty newDifficulty,
        uint256 newBasePoints
    );

    // =============================================================================
    // MODIFICADORES
    // =============================================================================

    modifier validChallengeId(uint256 challengeId) {
        require(challengeId > 0 && challengeId <= _challengeIds, "Invalid challenge ID");
        _;
    }

    modifier challengeExists(uint256 challengeId) {
        require(challenges[challengeId].id != 0, "Challenge does not exist");
        _;
    }

    modifier challengeActive(uint256 challengeId) {
        require(challenges[challengeId].active, "Challenge is not active");
        _;
    }

    modifier notSolvedByUser(uint256 challengeId, FlagLevel level) {
        require(!hasUserSolvedLevel[msg.sender][challengeId][uint256(level)], "Already solved this level");
        _;
    }

    modifier withinAttemptLimit(uint256 challengeId) {
        require(attemptsByUserAndChallenge[msg.sender][challengeId] < MAX_ATTEMPTS_PER_CHALLENGE, "Attempt limit exceeded");
        _;
    }

    modifier respectCooldown(uint256 challengeId) {
        require(
            block.timestamp >= lastAttemptByUserAndChallenge[msg.sender][challengeId] + COOLDOWN_PERIOD,
            "Cooldown period not met"
        );
        _;
    }

    modifier validDifficulty(Difficulty difficulty) {
        require(uint8(difficulty) <= 2, "Invalid difficulty");
        _;
    }

    modifier validRating(uint8 stars) {
        require(stars >= 1 && stars <= 5, "Rating must be between 1 and 5");
        _;
    }

    modifier validPublicKey(bytes memory publicKey) {
        require(publicKey.length == 33, "Public key must be 33 bytes (compressed)");
        _;
    }

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // =============================================================================
    // FUNCIONES PRINCIPALES
    // =============================================================================

    /**
     * @dev Crea un nuevo reto CTF
     * @param ipfsCID CID de IPFS con los metadatos del reto
     * @param publicKeyUser Clave pública para el flag de usuario (33 bytes)
     * @param publicKeyRoot Clave pública para el flag de root (33 bytes)
     * @param difficulty Dificultad del reto (0=Easy, 1=Medium, 2=Hard)
     */
    function createChallenge(
        string memory ipfsCID,
        bytes memory publicKeyUser,
        bytes memory publicKeyRoot,
        Difficulty difficulty
    ) 
        external 
        whenNotPaused 
        nonReentrant 
        validDifficulty(difficulty)
        validPublicKey(publicKeyUser)
        validPublicKey(publicKeyRoot)
    {
        require(bytes(ipfsCID).length > 0, "IPFS CID cannot be empty");
        require(challengesCreatedByUser[msg.sender] < MAX_CHALLENGES_PER_USER, "Max challenges limit exceeded");
        require(hasRole(CREATOR_ROLE, msg.sender), "Must have CREATOR_ROLE");

        _challengeIds++;
        uint256 challengeId = _challengeIds;

        uint256 basePoints = _getBasePoints(difficulty);

        challenges[challengeId] = Challenge({
            id: challengeId,
            creator: msg.sender,
            ipfsCID: ipfsCID,
            difficulty: difficulty,
            publicKeyUser: publicKeyUser,
            publicKeyRoot: publicKeyRoot,
            active: true,
            createdAt: block.timestamp,
            basePoints: basePoints,
            totalSolves: 0,
            userSolves: 0,
            rootSolves: 0,
            hasFirstBloodUser: false,
            hasFirstBloodRoot: false,
            totalRatings: 0,
            sumRatings: 0,
            averageRating: 0
        });

        challengesCreatedByUser[msg.sender]++;
        userStats[msg.sender].challengesCreated++;
        activeChallenges.push(challengeId);

        emit ChallengeCreated(challengeId, msg.sender, ipfsCID, difficulty, basePoints);
    }

    /**
     * @dev Envía un flag para resolver un reto
     * @param challengeId ID del reto
     * @param signature Firma ECDSA del flag
     * @param level Nivel del flag (0=USER, 1=ROOT)
     */
    function submitFlag(
        uint256 challengeId,
        bytes memory signature,
        FlagLevel level
    ) 
        external 
        whenNotPaused 
        nonReentrant 
        validChallengeId(challengeId)
        challengeExists(challengeId)
        challengeActive(challengeId)
        notSolvedByUser(challengeId, level)
        withinAttemptLimit(challengeId)
        respectCooldown(challengeId)
    {
        require(signature.length == 65, "Invalid signature length");
        require(msg.sender != challenges[challengeId].creator, "Creator cannot solve own challenge");

        // Incrementar nonce del usuario
        userNonces[msg.sender]++;

        // Verificar la firma
        bool isValid = _verifyFlag(challengeId, signature, level, msg.sender, userNonces[msg.sender]);
        require(isValid, "Invalid flag signature");

        // Registrar intento
        attemptsByUserAndChallenge[msg.sender][challengeId]++;
        lastAttemptByUserAndChallenge[msg.sender][challengeId] = block.timestamp;

        // Calcular puntos
        uint256 points = _calculatePoints(challengeId, level);

        // Verificar first blood
        bool isFirstBlood = false;
        if (level == FlagLevel.USER && !challenges[challengeId].hasFirstBloodUser) {
            challenges[challengeId].hasFirstBloodUser = true;
            isFirstBlood = true;
            points += (points * FIRST_BLOOD_BONUS) / 100;
        } else if (level == FlagLevel.ROOT && !challenges[challengeId].hasFirstBloodRoot) {
            challenges[challengeId].hasFirstBloodRoot = true;
            isFirstBlood = true;
            points += (points * FIRST_BLOOD_BONUS) / 100;
        }

        // Actualizar estadísticas
        _updateSolveStats(challengeId, level, points, isFirstBlood);

        emit FlagCaptured(challengeId, msg.sender, level, points, isFirstBlood, block.timestamp);
    }

    /**
     * @dev Califica un reto (solo si lo has resuelto)
     * @param challengeId ID del reto
     * @param stars Calificación de 1 a 5 estrellas
     */
    function rateChallenge(
        uint256 challengeId, 
        uint8 stars
    ) 
        external 
        whenNotPaused 
        nonReentrant 
        validChallengeId(challengeId)
        challengeExists(challengeId)
        validRating(stars)
    {
        require(hasUserSolvedChallenge[msg.sender][challengeId], "Must solve challenge before rating");
        require(!hasUserRatedChallenge[msg.sender][challengeId], "Already rated this challenge");
        require(msg.sender != challenges[challengeId].creator, "Creator cannot rate own challenge");

        _ratingIds++;
        uint256 ratingId = _ratingIds;

        ratings[ratingId] = Rating({
            challengeId: challengeId,
            rater: msg.sender,
            stars: stars,
            timestamp: block.timestamp
        });

        hasUserRatedChallenge[msg.sender][challengeId] = true;
        
        // Actualizar estadísticas de rating
        challenges[challengeId].totalRatings++;
        challenges[challengeId].sumRatings += stars;
        challenges[challengeId].averageRating = (challenges[challengeId].sumRatings * 100) / challenges[challengeId].totalRatings;

        // Actualizar rating del creador
        address creator = challenges[challengeId].creator;
        _updateCreatorRating(creator);

        allRatings.push(ratingId);

        emit ChallengeRated(challengeId, msg.sender, stars, challenges[challengeId].averageRating);
    }

    /**
     * @dev Vota por cambiar la dificultad de un reto (solo si lo has resuelto)
     * @param challengeId ID del reto
     * @param newDifficulty Nueva dificultad propuesta
     */
    function voteDifficulty(
        uint256 challengeId,
        Difficulty newDifficulty
    ) 
        external 
        whenNotPaused 
        validChallengeId(challengeId)
        challengeExists(challengeId)
        validDifficulty(newDifficulty)
    {
        require(hasUserSolvedChallenge[msg.sender][challengeId], "Must solve challenge before voting");
        require(challenges[challengeId].difficulty != newDifficulty, "Same difficulty");

        // Lógica de votación de dificultad (simplificada)
        // En una implementación completa, esto requeriría un sistema de votación más complejo
        if (hasRole(OPERATOR_ROLE, msg.sender)) {
            challenges[challengeId].difficulty = newDifficulty;
            challenges[challengeId].basePoints = _getBasePoints(newDifficulty);
            
            emit DifficultyVoted(challengeId, msg.sender, newDifficulty, challenges[challengeId].basePoints);
        }
    }

    // =============================================================================
    // FUNCIONES DE GESTIÓN
    // =============================================================================

    /**
     * @dev Activa o desactiva un reto
     * @param challengeId ID del reto
     * @param active Nuevo estado
     */
    function toggleChallenge(
        uint256 challengeId,
        bool active
    ) 
        external 
        validChallengeId(challengeId)
        challengeExists(challengeId)
    {
        require(
            msg.sender == challenges[challengeId].creator || hasRole(OPERATOR_ROLE, msg.sender),
            "Only creator or operator can toggle challenge"
        );

        challenges[challengeId].active = active;
        
        emit ChallengeStatusChanged(challengeId, active, msg.sender);
    }

    /**
     * @dev Otorga el rol de creador a un usuario
     * @param user Dirección del usuario
     */
    function grantCreatorRole(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(CREATOR_ROLE, user);
    }

    /**
     * @dev Revoca el rol de creador a un usuario
     * @param user Dirección del usuario
     */
    function revokeCreatorRole(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(CREATOR_ROLE, user);
    }

    /**
     * @dev Pausa el contrato (solo PAUSER_ROLE)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Reanuda el contrato (solo PAUSER_ROLE)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // =============================================================================
    // FUNCIONES DE CONSULTA
    // =============================================================================

    /**
     * @dev Obtiene un reto por ID
     * @param challengeId ID del reto
     * @return Challenge struct
     */
    function getChallenge(uint256 challengeId) 
        external 
        view 
        validChallengeId(challengeId)
        challengeExists(challengeId)
        returns (Challenge memory) 
    {
        return challenges[challengeId];
    }

    /**
     * @dev Obtiene todos los retos activos
     * @return Array de IDs de retos activos
     */
    function getActiveChallenges() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](activeChallenges.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeChallenges.length; i++) {
            if (challenges[activeChallenges[i]].active) {
                activeIds[count] = activeChallenges[i];
                count++;
            }
        }
        
        // Redimensionar array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeIds[i];
        }
        
        return result;
    }

    /**
     * @dev Obtiene los retos creados por un usuario
     * @param creator Dirección del creador
     * @return Array de IDs de retos
     */
    function getChallengesByCreator(address creator) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](challengesCreatedByUser[creator]);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= _challengeIds; i++) {
            if (challenges[i].creator == creator) {
                result[count] = i;
                count++;
            }
        }
        
        return result;
    }

    /**
     * @dev Obtiene las estadísticas de un usuario
     * @param user Dirección del usuario
     * @return UserStats struct
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }

    /**
     * @dev Obtiene el leaderboard de hackers (top 100)
     * @return Arrays de direcciones y puntuaciones
     */
    function getLeaderboard() external view returns (address[] memory, uint256[] memory) {
        // Implementación simplificada - en producción usar un sistema más eficiente
        address[] memory users = new address[](100);
        uint256[] memory scores = new uint256[](100);
        
        // Esta implementación es O(n) y no escalable
        // En producción, mantener un array ordenado o usar un sistema de ranking off-chain
        
        return (users, scores);
    }

    /**
     * @dev Obtiene el número total de retos
     * @return Número total de retos
     */
    function getTotalChallenges() external view returns (uint256) {
        return _challengeIds;
    }

    /**
     * @dev Obtiene el número total de resoluciones
     * @return Número total de resoluciones
     */
    function getTotalSolves() external view returns (uint256) {
        return _solveIds;
    }

    /**
     * @dev Verifica si un usuario ha resuelto un reto específico
     * @param user Dirección del usuario
     * @param challengeId ID del reto
     * @return bool
     */
    function hasUserSolved(address user, uint256 challengeId) external view returns (bool) {
        return hasUserSolvedChallenge[user][challengeId];
    }

    /**
     * @dev Verifica si un usuario ha resuelto un nivel específico de un reto
     * @param user Dirección del usuario
     * @param challengeId ID del reto
     * @param level Nivel del flag
     * @return bool
     */
    function hasUserSolvedChallengeLevel(address user, uint256 challengeId, FlagLevel level) external view returns (bool) {
        return hasUserSolvedLevel[user][challengeId][uint256(level)];
    }

    // =============================================================================
    // FUNCIONES INTERNAS
    // =============================================================================

    /**
     * @dev Verifica la firma ECDSA de un flag
     * @param challengeId ID del reto
     * @param signature Firma ECDSA
     * @param level Nivel del flag
     * @param solver Dirección del solver
     * @param nonce Nonce del usuario
     * @return bool Validez de la firma
     */
    function _verifyFlag(
        uint256 challengeId,
        bytes memory signature,
        FlagLevel level,
        address solver,
        uint256 nonce
    ) internal view returns (bool) {
        // Crear el hash del mensaje
        bytes32 messageHash = keccak256(
            abi.encodePacked("FlagChain", challengeId, solver, nonce)
        );
        
        // Crear el hash firmado de Ethereum
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        
        // Recuperar la dirección del firmante
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        
        // Obtener la clave pública correspondiente al nivel
        bytes memory publicKey = (level == FlagLevel.USER) 
            ? challenges[challengeId].publicKeyUser 
            : challenges[challengeId].publicKeyRoot;
        
        // Convertir clave pública a dirección
        address expectedSigner = _publicKeyToAddress(publicKey);
        
        return recoveredSigner == expectedSigner;
    }

    /**
     * @dev Convierte una clave pública comprimida a dirección Ethereum
     * @param publicKey Clave pública comprimida (33 bytes)
     * @return address Dirección Ethereum correspondiente
     */
    function _publicKeyToAddress(bytes memory publicKey) internal pure returns (address) {
        require(publicKey.length == 33, "Invalid public key length");
        
        // Expandir clave pública comprimida a no comprimida (simplificado)
        // En una implementación real, se necesitaría una biblioteca de curvas elípticas
        bytes32 hash = keccak256(publicKey);
        return address(uint160(uint256(hash)));
    }

    /**
     * @dev Calcula los puntos para una resolución
     * @param challengeId ID del reto
     * @param level Nivel del flag
     * @return uint256 Puntos calculados
     */
    function _calculatePoints(uint256 challengeId, FlagLevel level) internal view returns (uint256) {
        uint256 basePoints = challenges[challengeId].basePoints;
        
        // Multiplicador por nivel (root vale más)
        if (level == FlagLevel.ROOT) {
            basePoints = (basePoints * 150) / 100; // 50% más puntos
        }
        
        // Aplicar modificadores por popularidad (menos puntos si ya lo resolvieron muchos)
        uint256 totalSolves = challenges[challengeId].totalSolves;
        if (totalSolves > 100) {
            basePoints = (basePoints * 80) / 100; // 20% menos
        } else if (totalSolves > 50) {
            basePoints = (basePoints * 90) / 100; // 10% menos
        }
        
        return basePoints;
    }

    /**
     * @dev Actualiza las estadísticas después de una resolución
     * @param challengeId ID del reto
     * @param level Nivel del flag
     * @param points Puntos obtenidos
     * @param isFirstBlood Si es first blood
     */
    function _updateSolveStats(
        uint256 challengeId,
        FlagLevel level,
        uint256 points,
        bool isFirstBlood
    ) internal {
        _solveIds++;
        uint256 solveId = _solveIds;
        
        // Crear registro de solve
        solves[solveId] = Solve({
            challengeId: challengeId,
            solver: msg.sender,
            level: level,
            timestamp: block.timestamp,
            points: points,
            isFirstBlood: isFirstBlood
        });
        
        // Actualizar estadísticas del reto
        challenges[challengeId].totalSolves++;
        if (level == FlagLevel.USER) {
            challenges[challengeId].userSolves++;
        } else {
            challenges[challengeId].rootSolves++;
        }
        
        // Actualizar estadísticas del usuario
        userStats[msg.sender].totalScore += points;
        userStats[msg.sender].totalSolves++;
        if (level == FlagLevel.USER) {
            userStats[msg.sender].userSolves++;
        } else {
            userStats[msg.sender].rootSolves++;
        }
        userStats[msg.sender].lastActivity = block.timestamp;
        
        // Marcar como resuelto
        hasUserSolvedChallenge[msg.sender][challengeId] = true;
        hasUserSolvedLevel[msg.sender][challengeId][uint256(level)] = true;
        
        allSolves.push(solveId);
    }

    /**
     * @dev Actualiza el rating promedio de un creador
     * @param creator Dirección del creador
     */
    function _updateCreatorRating(address creator) internal {
        uint256 totalRating = 0;
        uint256 totalChallenges = 0;
        
        for (uint256 i = 1; i <= _challengeIds; i++) {
            if (challenges[i].creator == creator && challenges[i].totalRatings > 0) {
                totalRating += challenges[i].averageRating;
                totalChallenges++;
            }
        }
        
        if (totalChallenges > 0) {
            userStats[creator].averageRating = totalRating / totalChallenges;
        }
    }

    /**
     * @dev Obtiene los puntos base según la dificultad
     * @param difficulty Dificultad del reto
     * @return uint256 Puntos base
     */
    function _getBasePoints(Difficulty difficulty) internal pure returns (uint256) {
        if (difficulty == Difficulty.EASY) {
            return EASY_POINTS;
        } else if (difficulty == Difficulty.MEDIUM) {
            return MEDIUM_POINTS;
        } else {
            return HARD_POINTS;
        }
    }

    // =============================================================================
    // FUNCIONES DE EMERGENCIA
    // =============================================================================

    /**
     * @dev Función de emergencia para actualizar un reto (solo OPERATOR_ROLE)
     * @param challengeId ID del reto
     * @param newIpfsCID Nuevo CID de IPFS
     */
    function emergencyUpdateChallenge(
        uint256 challengeId,
        string memory newIpfsCID
    ) external onlyRole(OPERATOR_ROLE) {
        require(bytes(newIpfsCID).length > 0, "IPFS CID cannot be empty");
        challenges[challengeId].ipfsCID = newIpfsCID;
    }

    /**
     * @dev Función de emergencia para resetear intentos de un usuario
     * @param user Dirección del usuario
     * @param challengeId ID del reto
     */
    function emergencyResetAttempts(
        address user,
        uint256 challengeId
    ) external onlyRole(OPERATOR_ROLE) {
        attemptsByUserAndChallenge[user][challengeId] = 0;
        lastAttemptByUserAndChallenge[user][challengeId] = 0;
    }
} 