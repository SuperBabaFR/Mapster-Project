<?php
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "error" => "Method not allowed, use GET."]);
    exit;
}

// Inclusion du fichier de configuration
require_once "db_config.php";

try {
    // Connexion à la base de données avec PDO
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Requête SQL pour récupérer les données spécifiques
    $sql = "SELECT idMapper, pseudo, mail, mdp, photoProfil FROM Mapper";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    // Récupération des résultats
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Vérification si des données existent
    if ($results) {
        echo json_encode(["success" => true, "data" => $results], JSON_PRETTY_PRINT);
    } else {
        echo json_encode(["success" => false, "message" => "No records found."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
