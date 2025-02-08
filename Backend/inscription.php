<?php
header("Content-Type: application/json");

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["code" => 405, "descriptif" => "Method not allowed, use POST."]);
    exit;
}

// Inclusion du fichier de configuration
require_once "db_config.php";

// Récupération et validation des données reçues
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['pseudo'], $data['mail'], $data['mdp'], $data['photo'])) {
    echo json_encode(["code" => 400, "descriptif" => "Missing required fields."]);
    exit;
}

$pseudo = trim($data['pseudo']);
$mail = filter_var($data['mail'], FILTER_VALIDATE_EMAIL);
$mdp = password_hash($data['mdp'], PASSWORD_BCRYPT);
$photo = trim($data['photo']);

if (!$mail) {
    echo json_encode(["code" => 400, "descriptif" => "Invalid email format."]);
    exit;
}

try {
    // Connexion à la base de données avec PDO
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Vérifier si l'utilisateur existe déjà
    $stmt = $pdo->prepare("SELECT idMapper FROM Mapper WHERE mail = :mail");
    $stmt->execute(['mail' => $mail]);
    
    if ($stmt->fetch()) {
        echo json_encode(["code" => 409, "descriptif" => "User already exists."]);
        exit;
    }

    // Insertion de l'utilisateur
    $sql = "INSERT INTO Mapper (pseudo, mail, mdp, photoProfil) VALUES (:pseudo, :mail, :mdp, :photo)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'pseudo' => $pseudo,
        'mail' => $mail,
        'mdp' => $mdp,
        'photo' => $photo
    ]);

    // Récupération de l'ID inséré
    $id = $pdo->lastInsertId();

    echo json_encode([
        "id" => $id,
        "pseudo" => $pseudo,
        "mail" => $mail,
        "mdp" => $mdp,
        "photo" => $photo
    ], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    echo json_encode(["code" => 500, "descriptif" => $e->getMessage()]);
}
?>