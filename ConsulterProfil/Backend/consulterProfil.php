<?php
// Définition de l'en-tête pour indiquer que la réponse sera en format JSON
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



//    Verifier la connexion de l'utilisateur ( si l'id mapper est présent dans la session)
// if (isset($_SESSION['idMapper'])) {
//     $idMapper = $_SESSION['idMapper'];
//     echo "L'id du mapper est " . $idMapper;
// } else {
//     echo "Aucun Utilisateur connecté ";
// }



// Vérifier que la méthode utilisée est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $idMapper = 1;
        // Préparation et exécution de la requête SQL pour récupérer les informations du mapper
        // $stmt = $pdo->prepare("SELECT idMapper, pseudo, mail, photoProfil FROM Mapper WHERE idMapper = ?");
        // $stmt->execute([$idMapper]);
        // $mapper = $stmt->fetch();// Récupération sous forme de tableau associatif
    
        $stmtCheck = $pdo->prepare("SELECT  idMapper, pseudo, mail, photoProfil FROM Mapper WHERE idMapper = :mapperId");
        // $stmtCheck->bindParam(':mapperId', $mapperId, PDO::PARAM_INT);
        $stmtCheck->execute([
            ':mapperId'  => $idMapper]);
        $mapper = $stmtCheck->fetch();
    
        // Vérification si le mapper existe dans la base de données
        // if (!$mapper) {
        //     echo json_encode(["code" => 404, "descriptif" => "Mapper non trouvé"]);
        //     exit;
        // }
    
        // Préparation et exécution de la requête SQL pour récupérer les posts associés au mapper
        $stmtPosts = $pdo->prepare("SELECT id, photo, date, longitude, latitude, description FROM Post WHERE mapperId = :mapperId");
        // $stmtPosts->bindParam(':mapperId', $mapperId, PDO::PARAM_INT);
        $stmtPosts->execute([
            ':mapperId'  => $idMapper]);
        $posts = $stmtPosts->fetchAll(PDO::FETCH_ASSOC);// Récupération sous forme de tableau associatif
    
        // Construction de la réponse JSON avec les informations du mapper
        $response = [
            "id" => $mapper['idMapper'],
            "pseudo" => $mapper['pseudo'],
            "mail" => $mapper['mail'],
            "mdp" => "(hashé)", // Masquage du mot de passe pour des raisons de sécurité
            "photo" => $mapper['photoProfil'],
            "liste" => $posts // Initialisation d'un tableau vide pour stocker les posts
        ];
    
        echo json_encode($response);
    } catch (PDOException $e) {
        // En cas d'erreur SQL, renvoyer une réponse JSON avec le message d'erreur
        echo json_encode(["code" => 500, "descriptif" => "Erreur serveur : " . $e->getMessage()]);
    }
} else {
    echo json_encode([
        "Code" => 405,
        "Descriptif" => "Méthode non autorisée"
    ]);
}

