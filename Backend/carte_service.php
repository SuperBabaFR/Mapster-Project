<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


// Inclure la configuration de la base de données
require_once 'db_config.php';

// Définir l'en-tête pour la réponse JSON
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
    // Récupérer les paramètres envoyés en POST
    $idMapper = isset($_POST['idMapper']) ? intval($_POST['idMapper']) : null;
    $hashMdp = isset($_POST['hashMdp']) ? $_POST['hashMdp'] : null;
    $rayon = isset($_POST['rayon']) ? floatval($_POST['rayon']) : null; // Rayon en mètres
    $longitude = isset($_POST['longitude']) ? floatval($_POST['longitude']) : null;
    $latitude = isset($_POST['latitude']) ? floatval($_POST['latitude']) : null;

    // Vérifier si tous les paramètres nécessaires sont présents
    if (empty($idMapper) || empty($hashMdp) || $rayon === null || $longitude === null || $latitude === null) {
        echo json_encode([
            "Code" => 400,
            "Descriptif" => "Paramètres manquants ou invalides"
        ]);
        exit;
    }

    try {
        // Vérifier que le mapperId existe et que le hashMdp correspond
        $stmtMapper = $pdo->prepare("SELECT mdp FROM Mapper WHERE idMapper = :idMapper");
        $stmtMapper->bindParam(':idMapper', $idMapper, PDO::PARAM_INT);
        $stmtMapper->execute();
        $mapper = $stmtMapper->fetch(PDO::FETCH_ASSOC);

        if (!$mapper || $mapper['mdp'] !== $hashMdp) {
            echo json_encode([
                "Code" => 401,
                "Descriptif" => "Non autorisé : idMapper ou hashMdp incorrect."
            ]);
            exit;
        }

        // Calculer la distance entre deux points (Haversine formula)
        $haversine = "
            (6371 * acos(
                cos(radians(:latitude)) *
                cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:longitude)) +
                sin(radians(:latitude)) *
                sin(radians(p.latitude))
            )) AS distance
        ";

        // Rechercher tous les posts dans le rayon donné (converti en kilomètres)
        $stmtPosts = $pdo->prepare("
            SELECT 
                m.pseudo, 
                m.photoProfil, 
                p.date AS postDate, 
                p.longitude, 
                p.latitude, 
                $haversine
            FROM Post p
            JOIN Mapper m ON p.mapperId = m.idMapper
            HAVING distance <= (:rayon / 1000) -- Convertir le rayon en kilomètres
            ORDER BY m.pseudo, postDate DESC
        ");
        $stmtPosts->bindParam(':latitude', $latitude);
        $stmtPosts->bindParam(':longitude', $longitude);
        $stmtPosts->bindParam(':rayon', $rayon); // Rayon en mètres
        $stmtPosts->execute();

        $posts = $stmtPosts->fetchAll(PDO::FETCH_ASSOC);

        // Regrouper les posts par pseudo
        $result = ["mappers" => []];
        foreach ($posts as $post) {
            $pseudo = $post['pseudo'];
            $photoProfil = $post['photoProfil'];

            // Calculer le temps écoulé
            $datePost = new DateTime($post['postDate']);
            $now = new DateTime();
            $interval = $datePost->diff($now);
            if ($interval->y > 0) {
                $timeElapsed = $interval->y . " an(s)";
            } elseif ($interval->m > 0) {
                $timeElapsed = $interval->m . " mois";
            } elseif ($interval->d > 0) {
                $timeElapsed = $interval->d . " jour(s)";
            } elseif ($interval->h > 0) {
                $timeElapsed = $interval->h . " heure(s)";
            } elseif ($interval->i > 0) {
                $timeElapsed = $interval->i . " minute(s)";
            } else {
                $timeElapsed = $interval->s . " seconde(s)";
            }

            // Ajouter le post au pseudo correspondant
            if (!isset($result["mappers"][$pseudo])) {
                $result["mappers"][$pseudo] = [
                    "pseudo" => $pseudo,
                    "photoProfil" => $photoProfil,
                    "posts" => []
                ];
            }

            $result["mappers"][$pseudo]["posts"][] = [
                "tempsEcoule" => "il y a " . $timeElapsed,
                "longitude" => $post['longitude'],
                "latitude" => $post['latitude']
            ];
        }

        // Réorganiser les résultats en tableau indexé
        $result["mappers"] = array_values($result["mappers"]);

        // Réponse finale
        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode([
            "Code" => 500,
            "Descriptif" => "Erreur interne : " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "Code" => 405,
        "Descriptif" => "Méthode non autorisée"
    ]);
}
?>
