<?php

// Activer l'affichage des erreurs pour le debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Inclure la configuration de la base de données
require_once 'db_config.php';

// Définir l'en-tête pour la réponse en JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Gérer la requête OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Connexion à la base de données
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASSWORD
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log("Erreur de connexion à la base de données: " . $e->getMessage());
    echo json_encode(["code" => 500, "descriptif" => "Erreur de connexion à la base de données"]);
    exit;
}

// Vérifier que la méthode utilisée est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["code" => 405, "descriptif" => "Méthode non autorisée."]);
    exit;
}

// Récupérer les données envoyées via `php://input` ou `POST`
$data = json_decode(file_get_contents("php://input"), true) ?? $_POST;

// Vérifier que toutes les données nécessaires sont présentes
$idMapper = !empty($data['idMapper']) ? intval($data['idMapper']) : null;
$hashMdp = !empty($data['hashMdp']) ? trim($data['hashMdp']) : null;
$pseudo = !empty($data['pseudo']) ? trim($data['pseudo']) : null;
$mail = !empty($data['mail']) ? filter_var(trim($data['mail']), FILTER_VALIDATE_EMAIL) : null;
$mdp = !empty($data['mdp']) ? trim($data['mdp']) : null;
$photoProfil = !empty($data['photo']) ? trim($data['photo']) : null;

// Vérification des champs obligatoires
if (!$idMapper || !$hashMdp || !$pseudo || !$mail) {
    echo json_encode(["code" => 400, "descriptif" => "Données manquantes : idMapper, hashMdp, pseudo et mail sont requis."]);
    exit;
}

// Vérifier si l'utilisateur existe et récupérer son mot de passe
try {
    $stmtAuth = $pdo->prepare("SELECT mdp FROM Mapper WHERE idMapper = :idMapper");
    $stmtAuth->execute(['idMapper' => $idMapper]);
    $user = $stmtAuth->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["code" => 404, "descriptif" => "Utilisateur non trouvé."]);
        exit;
    }

    // Vérification du mot de passe
    if (!password_verify($hashMdp, $user['mdp'])) {
        echo json_encode(["code" => 403, "descriptif" => "Authentification échouée."]);
        exit;
    }

    // Vérifier si l'email ou le pseudo existe déjà pour un autre utilisateur
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM Mapper WHERE (mail = :mail OR pseudo = :pseudo) AND idMapper != :idMapper");
    $stmtCheck->execute([
        'mail' => $mail,
        'pseudo' => $pseudo,
        'idMapper' => $idMapper
    ]);

    if ($stmtCheck->fetchColumn() > 0) {
        echo json_encode(["code" => 403, "descriptif" => "L'email ou le pseudo est déjà utilisé."]);
        exit;
    }

    // Construire la requête de mise à jour dynamiquement
    $fields = ['pseudo' => $pseudo, 'mail' => $mail];

    if (!empty($mdp)) {
        $fields['mdp'] = password_hash($mdp, PASSWORD_BCRYPT);
    }

    if (!empty($photoProfil)) {
        $fields['photoProfil'] = $photoProfil;
    }

    $setClause = implode(", ", array_map(fn($key) => "$key = :$key", array_keys($fields)));
    $fields['idMapper'] = $idMapper;

    // Exécuter la requête de mise à jour
    $stmtUpdate = $pdo->prepare("UPDATE Mapper SET $setClause WHERE idMapper = :idMapper");
    $stmtUpdate->execute($fields);

    // Vérifier si une mise à jour a eu lieu
    if ($stmtUpdate->rowCount() > 0) {
        echo json_encode([
            "id" => $idMapper,
            "pseudo" => $pseudo,
            "mail" => $mail,
            "mdp" => !empty($mdp) ? "hashé" : "inchangé",
            "photo" => $photoProfil
        ]);
    } else {
        echo json_encode([
            "id" => $idMapper,
            "pseudo" => $pseudo,
            "mail" => $mail,
            "mdp" => "inchangé",
            "photo" => $photoProfil,
            "message" => "Aucune modification effectuée"
        ]);
    }
} catch (PDOException $e) {
    error_log("Erreur SQL : " . $e->getMessage());
    echo json_encode(["code" => 500, "descriptif" => "Erreur lors de la mise à jour du profil."]);
    exit;
}
