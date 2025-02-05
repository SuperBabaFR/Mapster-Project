<?php
// Configuration des en-têtes HTTP pour l'API
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Gérer les requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Inclure la configuration de la base de données
require_once 'db_config.php';

// Connexion à la base de données
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(["success" => false, "error" => "Erreur de connexion à la base de données"]));
}

// Vérifier si la table "users" existe, sinon la créer
$checkTable = $pdo->query("SHOW TABLES LIKE 'users'")->rowCount();
if ($checkTable == 0) {
    $createTableSQL = "
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nom VARCHAR(100) NOT NULL,
            prenom VARCHAR(100) NOT NULL,
            pseudo VARCHAR(50) NOT NULL UNIQUE,
            mail VARCHAR(255) NOT NULL UNIQUE,
            mdp VARCHAR(255) NOT NULL,
            pays VARCHAR(50) NOT NULL,
            photo MEDIUMTEXT NULL, 
            date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
    $pdo->exec($createTableSQL);
} else {
    // Vérifier si la colonne "photo" est en TEXT et la modifier en MEDIUMTEXT si nécessaire
    $columnCheck = $pdo->query("SHOW COLUMNS FROM users LIKE 'photo'")->fetch(PDO::FETCH_ASSOC);
    if ($columnCheck && strtoupper($columnCheck['Type']) !== 'MEDIUMTEXT') {
        $pdo->exec("ALTER TABLE users MODIFY COLUMN photo MEDIUMTEXT NULL");
    }
}

// Gestion des requêtes HTTP
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        die(json_encode(["success" => false, "error" => "Format JSON invalide"]));
    }

    // Récupération et validation des données
    $nom = htmlspecialchars(trim($data['nom'] ?? ''));
    $prenom = htmlspecialchars(trim($data['prenom'] ?? ''));
    $pseudo = htmlspecialchars(trim($data['pseudo'] ?? ''));
    $mail = filter_var($data['mail'] ?? '', FILTER_VALIDATE_EMAIL);
    $mdp = $data['mdp'] ?? '';
    $pays = htmlspecialchars(trim($data['pays'] ?? ''));
    $photo = $data['photo'] ?? ''; // Image en base64

    if (empty($nom) || empty($prenom) || empty($pseudo) || empty($mail) || empty($mdp) || empty($pays)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Tous les champs sont obligatoires"]);
        exit;
    }

    try {
        // Vérifier si l'email ou le pseudo existent déjà
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE mail = :mail OR pseudo = :pseudo");
        $checkStmt->execute(['mail' => $mail, 'pseudo' => $pseudo]);

        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode(["success" => false, "code" => 6, "error" => "Email ou pseudo déjà utilisé !"]);
            exit;
        }

        // Hacher le mot de passe
        $hashedPassword = password_hash($mdp, PASSWORD_BCRYPT);

        // Insérer l'utilisateur
        $stmt = $pdo->prepare("INSERT INTO users (nom, prenom, pseudo, mail, mdp, pays, photo) 
                               VALUES (:nom, :prenom, :pseudo, :mail, :mdp, :pays, :photo)");

        $stmt->bindParam(':nom', $nom);
        $stmt->bindParam(':prenom', $prenom);
        $stmt->bindParam(':pseudo', $pseudo);
        $stmt->bindParam(':mail', $mail);
        $stmt->bindParam(':mdp', $hashedPassword);
        $stmt->bindParam(':pays', $pays);
        $stmt->bindParam(':photo', $photo);
        
        $stmt->execute();

        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Inscription réussie"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Erreur lors de l'inscription: " . $e->getMessage()]);
    }
} elseif ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, nom, prenom, pseudo, mail, pays, photo FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($users) {
            echo json_encode(["success" => true, "users" => $users]);
        } else {
            echo json_encode(["success" => false, "error" => "Aucun utilisateur trouvé"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Erreur lors de la récupération des utilisateurs"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Méthode non autorisée"]);
}
?>
