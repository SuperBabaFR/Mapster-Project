<?php
header("Content-Type: application/json"); 
$host = 'localhost'; 
$dbname = 'db_mapster'; 
$username = 'root'; 
$password = ''; 

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(["code" => 500, "descriptif" => "Erreur de connexion : " . $e->getMessage()]));
}


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
   
    $data = json_decode(file_get_contents("php://input"), true);


    if (!isset($data['idMapper'])) {
        echo json_encode(["code" => 400, "descriptif" => "Paramètre idMapper manquant"]);
        exit;
    }

    $idMapper = $data['idMapper'];

    try {
      
        $stmt = $pdo->prepare("SELECT idMapper, pseudo, mail, photoProfil FROM Mapper WHERE idMapper = ?");
        $stmt->execute([$idMapper]);
        $mapper = $stmt->fetch();

        if (!$mapper) {
            echo json_encode(["code" => 404, "descriptif" => "Mapper non trouvé"]);
            exit;
        }

        
        $stmtPosts = $pdo->prepare("SELECT id, photo, date, longitude, latitude, description FROM Post WHERE mapperId = ?");
        $stmtPosts->execute([$idMapper]);
        $posts = $stmtPosts->fetchAll();

        $response = [
            "id" => $mapper['idMapper'],
            "pseudo" => $mapper['pseudo'],
            "mail" => $mapper['mail'],
            "mdp" => "(hashé)", 
            "photo" => $mapper['photoProfil'],
            "liste" => []
        ];

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
        echo json_encode(["code" => 500, "descriptif" => "Erreur serveur : " . $e->getMessage()]);
    }
} else {
    echo json_encode(["code" => 405, "descriptif" => "Méthode non autorisée"]);
}
?>
