<?php
// Définir le chemin vers la base de données SQLite
$databasePath = 'C:\Users\germa\PhpstormProjects\Mapster\identifier.sqlite';

try {
    // Créer une instance de la classe PDO pour SQLite
    $pdo = new PDO("sqlite:" . $databasePath);

    // Configurer le mode d'erreur pour PDO en cas de problème
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connexion à la base de données SQLite réussie !<br>";
} catch (PDOException $e) {
    // En cas d'erreur, afficher un message d'erreur
    die("Erreur lors de la connexion à la base de données : " . $e->getMessage());
}

// Exemple de paramètres pour la requête
$latitude = 48.8566;  // Latitude de l'utilisateur
$longitude = 2.3522;  // Longitude de l'utilisateur
$rayon = 1000;        // Rayon en mètres

// Exemple de requête : récupérer les posts dans un rayon donné
try {
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
            (ABS(Post.longitude - :longitude) <= :rayon / (111000 * latitude))
    ");

    // Exécuter la requête avec les paramètres
    $query->execute([
        ':latitude' => $latitude,
        ':longitude' => $longitude,
        ':rayon' => $rayon
    ]);

    // Récupérer et afficher les résultats
    $results = $query->fetchAll(PDO::FETCH_ASSOC);

    echo "<pre>";
    print_r($results);
    echo "</pre>";

} catch (PDOException $e) {
    echo "Erreur lors de l'exécution de la requête : " . $e->getMessage();
}

// Fermer la connexion (optionnel, car PHP la ferme automatiquement en fin de script)
$pdo = null;
?>
