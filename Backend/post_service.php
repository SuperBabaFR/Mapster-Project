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
    echo json_encode([
        "Code" => 500,
        "Descriptif" => "Erreur de connexion à la base de données : " . $e->getMessage()
    ]);
    exit;
}

// Vérifier que la méthode utilisée est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données envoyées via FormData
    $mapperId = isset($_POST['idMapper']) ? intval($_POST['idMapper']) : null;
    $hashMdp = isset($_POST['hashMdp']) ? $_POST['hashMdp'] : null;
    $photoBase64 = isset($_POST['photo']) ? $_POST['photo'] : null;
    $longitude = isset($_POST['longitude']) ? $_POST['longitude'] : null;
    $latitude = isset($_POST['latitude']) ? $_POST['latitude'] : null;
    $description = isset($_POST['description']) ? $_POST['description'] : null;

    // Vérifier si idMapper et hashMdp sont vides
    if (empty($mapperId) || empty($hashMdp)) {
        echo json_encode([
            "Code" => 401,
            "Descriptif" => "Non autorisé : idMapper et hashMdp sont requis."
        ]);
        exit;
    }

    // Vérifier que toutes les données nécessaires sont présentes
    if (!$photoBase64 || !$longitude || !$latitude) {
        echo json_encode([
            "Code" => 400,
            "Descriptif" => "Données manquantes ou invalides"
        ]);
        exit;
    }

    // Vérifier que le mapperId existe bien dans la table Mapper
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM Mapper WHERE idMapper = :mapperId");
    $stmtCheck->bindParam(':mapperId', $mapperId, PDO::PARAM_INT);
    $stmtCheck->execute();
    $exists = $stmtCheck->fetchColumn();

    if ($exists == 0) {
        echo json_encode([
            "Code" => 400,
            "Descriptif" => "Le mapperId spécifié n'existe pas."
        ]);
        exit;
    }

    // Récupérer la date actuelle du serveur PHP
    $datePost = date('Y-m-d H:i:s');

    // Insérer les données dans la base de données
    try {
        $stmt = $pdo->prepare("
            INSERT INTO Post (mapperId, photo, date, longitude, latitude, description)
            VALUES (:mapperId, :photo, :date, :longitude, :latitude, :description)
        ");
        $stmt->bindParam(':mapperId', $mapperId, PDO::PARAM_INT);
        $stmt->bindParam(':photo', $photoBase64);
        $stmt->bindParam(':date', $datePost);
        $stmt->bindParam(':longitude', $longitude);
        $stmt->bindParam(':latitude', $latitude);
        $stmt->bindParam(':description', $description);

        $stmt->execute();

        // Obtenir l'ID du post inséré
        $idPost = $pdo->lastInsertId();

        // Réponse en cas de succès
        echo json_encode([
            "idPost" => $idPost,
            "datePost" => $datePost
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "Code" => 500,
            "Descriptif" => "Erreur lors de l'insertion dans la base de données : " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "Code" => 405,
        "Descriptif" => "Méthode non autorisée"
    ]);
}
?>
