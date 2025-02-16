<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
header("Content-Type: application/json; charset=UTF-8");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

//////////////////////////////  Connection BDD //////////////////////////////////////
require_once 'db_config.php';
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASSWORD
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////// Traitement ////////////////////////////////
// Vérifier si la requête est en POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (isset($data["mail"], $data["mdp"])) {
        $mail = $data["mail"];
        $mdp = $data["mdp"];
    } else {
        echo json_encode(["status" => "error", "message" => "Données manquantes"]);
        exit();
    }

    // requête et vérification des identifiants
    $stmt = $pdo->prepare("SELECT idMapper, mdp FROM Mapper WHERE mail = :mail");
    $stmt->execute(["mail" => $mail]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if (password_verify($mdp, $user["mdp"])) {
        //if($mdp === $user["mdp"]){
            $_SESSION["user_id"] = $user["idMapper"];
            $_SESSION["user_mdp"] = $user["mdp"];
            echo json_encode(["status" => "success","ID" => $_SESSION["user_id"], "MDP" => $_SESSION["user_mdp"]]);
            exit();

        } else {
            echo json_encode(["status" => "error", "message" => "Mot de passe incorrect"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Utilisateur introuvable"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Méthode non autorisée"]);
}
?>
