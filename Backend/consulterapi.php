<?php

header('Content-Type: application/json');




// Récupérer les données de la requête
$data = json_decode(file_get_contents("php://input"), true);

$idMapper = $data['idMapper'];
$hashMdp = $data['hashMdp'];
$rayon = $data['rayon'];
$latitude = $data['latitude'];
$longitude = $data['longitude'];

// Vérifier si les paramètres sont valides
if (empty($idMapper) || empty($hashMdp) || empty($rayon) || empty($latitude) || empty($longitude)) {
    echo json_encode([
        'code' => 400,
        'descriptif' => 'Paramètres manquants ou invalides.'
    ]);
    exit;
}

// Simulation d'une base de données ou récupération des données depuis un système externe
// Exemple de liste de photos avec les informations associées
$photos = [
    [
        'id' => 1,
        'photo' => 'photo1.jpg',
        'date' => '01/01/2025',
        'longitude' => 2.3522,
        'latitude' => 48.8566,
        'distanceUser' => 300,
        'descriptions' => 'Une belle photo de Paris',
        'Mapper' => [
            'idMapper' => 101,
            'pseudoMapper' => 'JohnDoe',
            'photoProfil' => 'profile1.jpg'
        ]
    ],
    [
        'id' => 2,
        'photo' => 'photo2.jpg',
        'date' => '02/01/2025',
        'longitude' => 2.3522,
        'latitude' => 48.8570,
        'distanceUser' => 500,
        'descriptions' => 'Un coucher de soleil magnifique',
        'Mapper' => [
            'idMapper' => 102,
            'pseudoMapper' => 'JaneDoe',
            'photoProfil' => 'profile2.jpg'
        ]
    ]
];

// Vérification si l'utilisateur et les informations sont valides (ajouter la logique de connexion selon le besoin)
if ($hashMdp !== 'validHashPassword') {
    echo json_encode([
        'code' => 401,
        'descriptif' => 'Identifiants incorrects.'
    ]);
    exit;
}

// Filtrer les photos en fonction du rayon de recherche
$filteredPhotos = array_filter($photos, function ($photo) use ($latitude, $longitude, $rayon) {
    $distance = calculateDistance($latitude, $longitude, $photo['latitude'], $photo['longitude']);
    return $distance <= $rayon;
});

// Fonction pour calculer la distance entre deux coordonnées en mètres
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371000; // en mètres
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);

    $a = sin($dLat / 2) * sin($dLat / 2) +
        cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
        sin($dLon / 2) * sin($dLon / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

    return $earthRadius * $c; // distance en mètres
}

// Formater la réponse
$response = [
    'liste' => array_values($filteredPhotos)
];

// Retourner la réponse en format JSON
echo json_encode($response);
