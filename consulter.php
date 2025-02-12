<?php

// Inclure la configuration de la base de données
require_once 'db_config.php';

// Définir l'en-tête pour la réponse en JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");


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

// Vérifier que la méthode utilisée est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données envoyées via FormData
    $mapperId = isset($_POST['idMapper']) ? intval($_POST['idMapper']) : null;
    $hashMdp = isset($_POST['hashMdp']) ? $_POST['hashMdp'] : null;
    $longitude = isset($_POST['longitude']) ? $_POST['longitude'] : null;
    $latitude = isset($_POST['latitude']) ? $_POST['latitude'] : null;
    $rayon = isset($_POST['rayon']) ? $_POST['rayon'] : null;

    // Vérifier si idMapper et hashMdp sont vides
    if (empty($mapperId) || empty($hashMdp)) {
        echo json_encode([
            "Code" => 401,
            "Descriptif" => "Non autorisé : idMapper et hashMdp sont requis."
        ]);
        exit;
    }

    // Vérifier que toutes les données nécessaires sont présentes
    if (!$rayon || !$longitude || !$latitude) {
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

    try {
        // Créer un objet contenant une propriété "liste" avec les résultats
        $response = ["liste" => $results];

        // Préparer la requête pour récupérer les posts dans un rayon donné
$query = $pdo->prepare("
SELECT 
    Post.id, 
    Post.photo, 
    Post.date as date,
    Post.latitude, 
    Post.longitude, 
    Post.description, 
    Mapper.idMapper, 
    Mapper.pseudo AS pseudoMapper, 
    Mapper.photoProfil,
    (6371000 * ACOS(
        COS(RADIANS(:latitude)) * COS(RADIANS(Post.latitude)) * 
        COS(RADIANS(Post.longitude) - RADIANS(:longitude)) + 
        SIN(RADIANS(:latitude)) * SIN(RADIANS(Post.latitude))
    )) AS distanceUser
FROM Post
JOIN Mapper ON Post.mapperId = Mapper.idMapper
HAVING distanceUser <= :rayon
ORDER BY distanceUser ASC
");

// Exécuter la requête avec les paramètres
$query->execute([
':latitude'  => $latitude,
':longitude' => $longitude,
':rayon'     => $rayon
]);

// Récupérer tous les résultats sous forme de tableau associatif
$results = $query->fetchAll(PDO::FETCH_ASSOC);

// Structurer les résultats selon le format demandé
$liste = [];
foreach ($results as $row) {
$liste[] = [
    "id" => (int)$row['id'],
    "photo" => $row['photo'],
    "date" => $row['date'],
    "longitude" => (float)$row['longitude'],
    "latitude" => (float)$row['latitude'],
    "distanceUser" => round($row['distanceUser'], 2), // Distance en mètres
    "descriptions" => $row['description'],
    "Maper" => [
        "idMapper" => (int)$row['idMapper'],
        "pseudoMapper" => $row['pseudoMapper'],
        "photoProfil" => $row['photoProfil']
    ]
];
}

// Retourner la réponse en JSON
header('Content-Type: application/json');
echo json_encode(["liste" => $liste], JSON_PRETTY_PRINT);
    } catch (PDOException $e) {
        // En cas d'erreur lors de l'exécution de la requête, renvoyer un message JSON d'erreur
        echo json_encode(["error" => "Erreur lors de l'exécution de la requête : " . $e->getMessage()]);
    }
}


?>