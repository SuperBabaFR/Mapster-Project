<?php
// Inclure la configuration de la base de données
require_once 'db_config.php';

// Définir l'en-tête pour la réponse en JSON
header('Content-Type: application/json');

// Essayer de se connecter à la base de données
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASSWORD
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // En cas d'erreur de connexion à la base de données
    echo json_encode([
        "Code" => 500,
        "Descriptif" => "Erreur de connexion à la base de données : " . $e->getMessage()
    ]);
    exit;
}

// Vérifier que la méthode utilisée est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données envoyées via FormData
    $idMapper = isset($_POST['idMapper']) ? $_POST['idMapper'] : null;
    $hashMdp = isset($_POST['hashMdp']) ? $_POST['hashMdp'] : null;
    $photoBase64 = isset($_POST['photo']) ? $_POST['photo'] : null; // Image en Base64
    $longitude = isset($_POST['longitude']) ? $_POST['longitude'] : null;
    $latitude = isset($_POST['latitude']) ? $_POST['latitude'] : null;
    $description = isset($_POST['description']) ? $_POST['description'] : null;

    // Vérifier si idMapper et hashMdp sont vides
    if (empty($idMapper) || empty($hashMdp)) {
        echo json_encode([
            "Code" => 401,
            "Descriptif" => "Non autorisé : idMapper et hashMdp sont requis."
        ]);
        exit;
    }

    // Vérifier que toutes les données nécessaires sont présentes
    if (!$photoBase64 || !$longitude || !$latitude ) {
        echo json_encode([
            "Code" => 400,
            "Descriptif" => "Données manquantes ou invalides"
        ]);
        exit;
    }

    // Insérer les données dans la base de données
    try {
        $stmt = $pdo->prepare("
            INSERT INTO posts (idMapper, hashMdp, photo, longitude, latitude, description)
            VALUES (:idMapper, :hashMdp, :photo, :longitude, :latitude, :description)
        ");
        $stmt->bindParam(':idMapper', $idMapper);
        $stmt->bindParam(':hashMdp', $hashMdp);
        $stmt->bindParam(':photo', $photoBase64);
        $stmt->bindParam(':longitude', $longitude);
        $stmt->bindParam(':latitude', $latitude);
        $stmt->bindParam(':description', $description);

        $stmt->execute();

        // Obtenir l'ID du post inséré
        $idPost = $pdo->lastInsertId();

        // Réponse en cas de succès
        echo json_encode([
            "idPost" => $idPost
        ]);
    } catch (Exception $e) {
        // Réponse en cas d'erreur d'insertion dans la base de données
        echo json_encode([
            "Code" => 500,
            "Descriptif" => "Erreur lors de l'insertion dans la base de données : " . $e->getMessage()
        ]);
    }
} else {
    // Réponse si la méthode n'est pas POST
    echo json_encode([
        "Code" => 405,
        "Descriptif" => "Méthode non autorisée"
    ]);
}
?>
