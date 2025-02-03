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
    echo json_encode(
        [
            "Code" => 500,
            "Descriptif" => "Erreur de connexion à la base de données : " . $e->getMessage()
        ]
    );
exit;
}

// Vérifier si les paramètres sont présents dans la requête
if (!isset($_REQUEST['latitude']) || !isset($_REQUEST['longitude']) || !isset($_REQUEST['rayon'])) {
    echo json_encode(["error" => "Paramètres manquants (latitude, longitude, rayon requis)"]);
    exit;
}

// Récupérer les valeurs depuis la requête HTTP (GET ou POST)
$latitude = floatval($_REQUEST['latitude']);
$longitude = floatval($_REQUEST['longitude']);
$rayon = floatval($_REQUEST['rayon']);


try {
    // Préparer la requête pour récupérer les posts dans un rayon donné
    $query = $pdo->prepare("
        SELECT 
            Post.*, 
            Mapper.pseudo, 
            Mapper.photoProfil
        FROM 
            Post
        JOIN 
            Mapper 
        ON 
            Post.mapperId = Mapper.idMapper
        WHERE 
            (ABS(Post.latitude - :latitude) <= :rayon / 111000)
            AND 
            (ABS(Post.longitude - :longitude) <= :rayon / (111000 * Post.latitude))
    ");

    // Exécuter la requête avec les paramètres
    $query->execute([
        ':latitude'  => $latitude,
        ':longitude' => $longitude,
        ':rayon'     => $rayon
    ]);

    // Récupérer tous les résultats sous forme de tableau associatif
    $results = $query->fetchAll(PDO::FETCH_ASSOC);

    // Renvoyer les résultats au format JSON
    echo json_encode($results);
} catch (PDOException $e) {
    // En cas d'erreur lors de l'exécution de la requête, renvoyer un message JSON d'erreur
    echo json_encode(["error" => "Erreur lors de l'exécution de la requête : " . $e->getMessage()]);
}
?>