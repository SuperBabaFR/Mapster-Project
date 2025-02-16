<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
require_once "db_config.php";

// Connexion à la base de données
try {
    // Connexion à la base de données avec PDO
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Erreur de connexion à la base de données : " . $e->getMessage()]);
    exit();
}

// Récupérer l'ID envoyé en POST
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['id'])) {
    echo json_encode(["success" => false, "error" => "ID manquant"]);
    exit();
}

$id = intval($data['id']);

try {
    // Vérifier si l'image existe
    $query = $pdo->prepare("SELECT * FROM Post WHERE id = :id");
    $query->bindValue(':id', $id, PDO::PARAM_INT);
    $query->execute();
    $result = $query->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        echo json_encode(["success" => false, "error" => "Aucun enregistrement trouvé avec cet ID"]);
        exit();
    }

    // Supprimer l'enregistrement
    $deleteQuery = $pdo->prepare("DELETE FROM Post WHERE id = :id");
    $deleteQuery->bindValue(':id', $id, PDO::PARAM_INT);
    $deleteQuery->execute();

    echo json_encode(["success" => true, "message" => "Enregistrement supprimé avec succès"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Erreur SQL : " . $e->getMessage()]);
}
?>

