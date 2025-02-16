<?php
require_once 'db_config.php';
header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["code" => 500, "descriptif" => "Erreur de connexion à la base de données : " . $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["code" => 405, "descriptif" => "Méthode non autorisée."]);
    exit;
}

// Récupération des données POST
$idMapper = isset($_POST['idMapper']) ? intval($_POST['idMapper']) : null;
$hashMdp = isset($_POST['hashMdp']) ? trim($_POST['hashMdp']) : null;
$pseudo = isset($_POST['pseudo']) ? trim($_POST['pseudo']) : null;
$mail = isset($_POST['mail']) ? filter_var(trim($_POST['mail']), FILTER_VALIDATE_EMAIL) : null;
$mdp = isset($_POST['mdp']) && !empty($_POST['mdp']) ? password_hash(trim($_POST['mdp']), PASSWORD_BCRYPT) : null;

// Gestion de la photo
$photoProfil = null;
if (!empty($_POST['photoProfilBase64'])) {
    $photoProfil = $_POST['photoProfilBase64'];
} elseif (!empty($_FILES['photoProfil']) && $_FILES['photoProfil']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . "/uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = "profil_" . $idMapper . "_" . time() . "." . pathinfo($_FILES['photoProfil']['name'], PATHINFO_EXTENSION);
    $uploadFile = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['photoProfil']['tmp_name'], $uploadFile)) {
        $photoProfil = "uploads/" . $fileName;
    } else {
        echo json_encode(["code" => 500, "descriptif" => "Échec de l'upload de la photo."]);
        exit;
    }
}

// Vérifier que toutes les informations essentielles sont présentes
if (!$idMapper || !$hashMdp || !$pseudo || !$mail) {
    echo json_encode(["code" => 400, "descriptif" => "Données manquantes : idMapper, hashMdp, pseudo et mail sont requis."]);
    exit;
}

// Mise à jour des informations utilisateur
$query = "UPDATE Mapper SET pseudo = :pseudo, mail = :mail";
$params = [':pseudo' => $pseudo, ':mail' => $mail, ':idMapper' => $idMapper];

if ($mdp) {
    $query .= ", mdp = :mdp";
    $params[':mdp'] = $mdp;
}

if ($photoProfil) {
    $query .= ", photoProfil = :photoProfil";
    $params[':photoProfil'] = $photoProfil;
}

$query .= " WHERE idMapper = :idMapper";

$stmtUpdate = $pdo->prepare($query);
$stmtUpdate->execute($params);

// ✅ Correction ici : S'assurer que l'URL est bien complète dans la réponse
$photoURL = !empty($photoProfil) ? "http://miage-antilles.fr/mapper/" . $photoProfil : "";

if ($stmtUpdate->rowCount() > 0) {
    echo json_encode([
        "id" => $idMapper,
        "pseudo" => $pseudo,
        "mail" => $mail,
        "photo" => $photoURL,
        "message" => "Profil mis à jour avec succès."
    ]);
} else {
    echo json_encode([
        "id" => $idMapper,
        "pseudo" => $pseudo,
        "mail" => $mail,
        "photo" => $photoURL,
        "message" => "Aucune modification effectuée."
    ]);
}
