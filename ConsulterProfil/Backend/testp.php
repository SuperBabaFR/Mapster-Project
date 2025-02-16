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

// Vérifier que la méthode utilisée est POST


$data = json_decode(file_get_contents("php://input"), true);

// Vérifier que toutes les données nécessaires sont présentes
$idMapper = !empty($data['idMapper']) ? intval($data['idMapper']) : null;
$hashMdp = !empty($data['hashMdp']) ? trim($data['hashMdp']) : null;
$pseudo = !empty($data['pseudo']) ? trim($data['pseudo']) : null;
$mail = !empty($data['mail']) ? filter_var(trim($data['mail']), FILTER_VALIDATE_EMAIL) : null;
$mdp = !empty($data['mdp']) ? trim($data['mdp']) : null;
$photoProfil = !empty($data['photo']) ? trim($data['photo']) : null;

// if (!$idMapper || !$hashMdp || !$pseudo || !$mail) {
//     echo json_encode(["code" => 400, "descriptif" => "Données manquantes : idMapper, hashMdp, pseudo et mail sont requis."]);
//     exit;
// }

// Vérifier si l'utilisateur existe et récupérer son mot de passe
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Vérification des variables essentielles
        if (!isset($idMapper, $pseudo, $mail)) {
            echo json_encode(["code" => 400, "descriptif" => "Données manquantes"]);
            exit;
        }

        // Vérifier si l'utilisateur existe
        $stmtCheck = $pdo->prepare("SELECT idMapper FROM Mapper WHERE idMapper = :idMapper");
        $stmtCheck->execute([':idMapper' => $idMapper]);
        $user = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(["code" => 404, "descriptif" => "Utilisateur non trouvé"]);
            exit;
        }

        // Vérifier si l'email ou le pseudo existent déjà pour un autre utilisateur
        $stmtExist = $pdo->prepare("SELECT COUNT(*) FROM Mapper WHERE (mail = :mail OR pseudo = :pseudo) AND idMapper != :idMapper");
        $stmtExist->execute([
            ':mail' => $mail,
            ':pseudo' => $pseudo,
            ':idMapper' => $idMapper
        ]);

        if ($stmtExist->fetchColumn() > 0) {
            echo json_encode(["code" => 403, "descriptif" => "L'email ou le pseudo est déjà utilisé."]);
            exit;
        }

        // Construire la requête de mise à jour dynamiquement
        $fields = ['pseudo' => $pseudo, 'mail' => $mail];

        if (!empty($mdp)) {
            $fields['mdp'] = password_hash($mdp, PASSWORD_BCRYPT);
        }

        if (!empty($photoProfil)) {
            $fields['photoProfil'] = $photoProfil;
        }

        // Vérification avant de générer la requête
        if (empty($fields)) {
            echo json_encode(["code" => 400, "descriptif" => "Aucune donnée à mettre à jour"]);
            exit;
        }

        $setParts = [];
        foreach ($fields as $key => $value) {
            $setParts[] = "$key = :$key";
        }
        $setClause = implode(", ", $setParts);

        $fields['idMapper'] = $idMapper;

        // Exécuter la requête de mise à jour
        $stmtUpdate = $pdo->prepare("UPDATE Mapper SET $setClause WHERE idMapper = :idMapper");
        $stmtUpdate->execute($fields);

        // Vérifier si une mise à jour a eu lieu
        if ($stmtUpdate->rowCount() > 0) {
            echo json_encode([
                "id" => $idMapper,
                "pseudo" => $pseudo,
                "mail" => $mail,
                "mdp" => !empty($mdp) ? "hashé" : "inchangé",
                "photo" => $photoProfil
            ]);
        } else {
            echo json_encode([
                "id" => $idMapper,
                "pseudo" => $pseudo,
                "mail" => $mail,
                "mdp" => "inchangé",
                "photo" => $photoProfil,
                "message" => "Aucune modification effectuée"
            ]);
        }
    } catch (PDOException $e) {
        error_log("Erreur SQL : " . $e->getMessage());
        echo json_encode(["code" => 500, "descriptif" => "Erreur lors de la mise à jour du profil."]);
        exit;
    }
}


// // Récupération des données envoyées en JSON
// $data = json_decode(file_get_contents("php://input"), true);

// $idMapper = isset($data['idMapper']) ? intval($data['idMapper']) : null;
// $pseudo = isset($data['pseudo']) ? trim($data['pseudo']) : null;
// $mail = isset($data['mail']) ? filter_var(trim($data['mail']), FILTER_VALIDATE_EMAIL) : null;
// $mdp = isset($data['mdp']) ? trim($data['mdp']) : null;
// $photoProfil = isset($data['photo']) ? trim($data['photo']) : null;

// // Vérification des champs obligatoires
// if (!$idMapper || !$pseudo || !$mail) {
//     echo json_encode([
//         "code" => 400,
//         "descriptif" => "Données manquantes : idMapper, pseudo et mail sont requis."
//     ]);
//     exit;
// }

// try {
//     // Vérifier si l'utilisateur existe
//     $stmtCheck = $pdo->prepare("SELECT idMapper FROM Mapper WHERE idMapper = :idMapper");
//     $stmtCheck->execute([':idMapper' => $idMapper]);
//     $user = $stmtCheck->fetch(PDO::FETCH_ASSOC);
    
//     if (!$user) {
//         echo json_encode(["code" => 404, "descriptif" => "Utilisateur non trouvé"]);
//         exit;
//     }

//     // Vérifier si l'email ou le pseudo existent déjà pour un autre utilisateur
//     $stmtExist = $pdo->prepare("SELECT COUNT(*) FROM Mapper WHERE (mail = :mail OR pseudo = :pseudo) AND idMapper != :idMapper");
//     $stmtExist->execute([
//         ':mail' => $mail,
//         ':pseudo' => $pseudo,
//         ':idMapper' => $idMapper
//     ]);
    
//     if ($stmtExist->fetchColumn() > 0) {
//         echo json_encode(["code" => 403, "descriptif" => "L'email ou le pseudo est déjà utilisé."]);
//         exit;
//     }

//     // Préparer la mise à jour
//     $fields = [
//         'pseudo' => $pseudo,
//         'mail' => $mail
//     ];
    
//     if (!empty($mdp)) {
//         $fields['mdp'] = password_hash($mdp, PASSWORD_BCRYPT);
//     }
    
//     if (!empty($photoProfil)) {
//         $fields['photoProfil'] = $photoProfil;
//     }
    
//     $setClause = implode(", ", array_map(fn($key) => "$key = :$key", array_keys($fields)));
//     $fields['idMapper'] = $idMapper;
    
//     // Exécuter la requête de mise à jour
//     $stmtUpdate = $pdo->prepare("UPDATE Mapper SET $setClause WHERE idMapper = :idMapper");
//     $stmtUpdate->execute($fields);

//     // Vérifier si des modifications ont été effectuées
//     if ($stmtUpdate->rowCount() > 0) {
//         echo json_encode([
//             "id" => $idMapper,
//             "pseudo" => $pseudo,
//             "mail" => $mail,
//             "mdp" => !empty($mdp) ? "hashé" : "inchangé",
//             "photo" => $photoProfil
//         ]);
//     } else {
//         echo json_encode([
//             "id" => $idMapper,
//             "pseudo" => $pseudo,
//             "mail" => $mail,
//             "mdp" => "inchangé",
//             "photo" => $photoProfil,
//             "message" => "Aucune modification effectuée"
//         ]);
