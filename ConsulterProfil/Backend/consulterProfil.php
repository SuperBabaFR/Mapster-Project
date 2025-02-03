<?php
// Définition de l'en-tête pour indiquer que la réponse sera en format JSON
header("Content-Type: application/json");

// Paramètres de connexion à la base de données MySQL
$host = 'localhost';
$dbname = 'db_mapster';
$username = 'root';
$password = '';

try {
    // Connexion à la base de données en utilisant PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // Configuration des attributs PDO pour activer la gestion des erreurs et définir le mode de récupération
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // En cas d'échec de connexion, renvoyer une réponse JSON avec le message d'erreur
    die(json_encode(["code" => 500, "descriptif" => "Erreur de connexion : " . $e->getMessage()]));
}


//    Verifier la connexion de l'utilisateur ( si l'id mapper est présent dans la session)
    if (isset($_SESSION['idMapper'])) {
        $idMapper =$_SESSION['idMapper'];
        echo "L'id du mapper est ".$idMapper;

    } else {
        echo "Aucun Utilisateur connecté ";
    }


    try {
        // Préparation et exécution de la requête SQL pour récupérer les informations du mapper
        $stmt = $pdo->prepare("SELECT idMapper, pseudo, mail, photoProfil FROM Mapper WHERE idMapper = $idMapper");
        $mapper = $stmt->fetch(); // Récupération de la ligne sous forme de tableau associatif

        // Vérification si le mapper existe dans la base de données
        if (!$mapper) {
            echo json_encode(["code" => 404, "descriptif" => "Mapper non trouvé"]);
            exit;
        }

        // Préparation et exécution de la requête SQL pour récupérer les posts associés au mapper
        $stmtPosts = $pdo->prepare("SELECT id, photo, date, longitude, latitude, description FROM Post WHERE mapperId = $idMapper");
        $posts = $stmtPosts->fetchAll(); // Récupération de toutes les lignes sous forme de tableau associatif

        // Construction de la réponse JSON avec les informations du mapper
        $response = [
            "id" => $mapper['idMapper'],
            "pseudo" => $mapper['pseudo'],
            "mail" => $mapper['mail'],
            "mdp" => "(hashé)", // Masquage du mot de passe pour des raisons de sécurité
            "photo" => $mapper['photoProfil'],
            "liste" => [] // Initialisation d'un tableau vide pour stocker les posts
        ];

        // Ajout des posts à la liste dans la réponse JSON
        foreach ($posts as $post) {
            $response["liste"][] = [
                "id" => $post['id'],
                "photo" => $post['photo'],
                "date" => $post['date'],
                "longitude" => $post['longitude'],
                "latitude" => $post['latitude'],
                "descriptions" => $post['description']
            ];
        }

       
        echo json_encode($response, JSON_PRETTY_PRINT);
    } catch (PDOException $e) {
        // En cas d'erreur SQL, renvoyer une réponse JSON avec le message d'erreur
        echo json_encode(["code" => 500, "descriptif" => "Erreur serveur : " . $e->getMessage()]);
    }
 else {
    // Si la requête n'est pas de type POST, renvoyer une réponse JSON indiquant que la méthode n'est pas autorisée
    echo json_encode(["code" => 405, "descriptif" => "Méthode non autorisée"]);
}
?>
