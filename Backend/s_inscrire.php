<?php
// Configuration des en-têtes HTTP pour l'API

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Security-Policy: connect-src 'self' http://www.miage-antilles.fr;");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// Inclure la configuration de la base de données
require_once 'db_config.php';

// Connexion à la base de données
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASSWORD, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(["success" => false, "error" => "Erreur de connexion à la base de données"]));
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
}
