<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

require_once 'db_config.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(["success" => false, "error" => "Erreur de connexion à la base de données"]));
}

// Vérification de la méthode HTTP
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        die(json_encode(["success" => false, "error" => "Format JSON invalide"]));
    }

    $pseudo = htmlspecialchars(trim($data['pseudo'] ?? ''));
    $mail = filter_var($data['mail'] ?? '', FILTER_VALIDATE_EMAIL);
    $mdp = $data['mdp'] ?? '';
    $photoProfil = $data['photoProfil'] ?? '';

    if (empty($pseudo) || empty($mail) || empty($mdp)) {
        http_response_code(400);
        echo json_encode(["success" => false, "error" => "Pseudo, email et mot de passe sont obligatoires"]);
        exit;
    }

    try {
        // Vérifier si l'email ou le pseudo existent déjà
        $checkStmt = $pdo->prepare("SELECT idMapper FROM users WHERE mail = :mail OR pseudo = :pseudo");
        $checkStmt->execute(['mail' => $mail, 'pseudo' => $pseudo]);

        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode(["success" => false, "error" => "Email ou pseudo déjà utilisé !"]);
            exit;
        }

        // Hachage sécurisé du mot de passe
        $hashedPassword = password_hash($mdp, PASSWORD_BCRYPT);

        // Insérer l'utilisateur
        $stmt = $pdo->prepare("
            INSERT INTO users (pseudo, mail, mdp, photoProfil) 
            VALUES (:pseudo, :mail, :mdp, :photoProfil)
        ");

        $stmt->execute([
            ':pseudo' => $pseudo,
            ':mail' => $mail,
            ':mdp' => $hashedPassword,
            ':photoProfil' => $photoProfil
        ]);

        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Inscription réussie"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Erreur lors de l'inscription: " . $e->getMessage()]);
    }
} elseif ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT idMapper, pseudo, mail, photoProfil FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $users]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Erreur lors de la récupération des utilisateurs"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Méthode non autorisée"]);
}
?>
