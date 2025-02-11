<?php
// Activer l'affichage et la journalisation des erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_error.log'); // Fichier de log pour les erreurs PHP
error_reporting(E_ALL);

// Configurer les en-têtes HTTP pour l'API
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Vérifier l'accès au répertoire logs
$logFile = __DIR__ . '/logs/debug_log.log';
if (!is_writable(dirname($logFile))) {
    die(json_encode(['success' => false, 'error' => 'Le répertoire logs n\'est pas accessible en écriture.']));
}
file_put_contents($logFile, "Test d'écriture réussi.\n", FILE_APPEND);

// Gérer les requêtes OPTIONS (pré-vol CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents($logFile, "Requête OPTIONS détectée.\n", FILE_APPEND);
    http_response_code(204);
    exit;
}

// Gestion globale des exceptions
set_exception_handler(function ($exception) use ($logFile) {
    http_response_code(500);
    file_put_contents($logFile, "Exception capturée : " . $exception->getMessage() . "\n", FILE_APPEND);
    echo json_encode([
        'success' => false,
        'error' => 'Une erreur inattendue est survenue.',
        'details' => $exception->getMessage()
    ]);
    exit;
});

// Inclure la configuration de la base de données
require_once 'db_config.php';

// Connexion à la base de données
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASSWORD
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    file_put_contents($logFile, "Connexion à la base de données réussie.\n", FILE_APPEND);
} catch (PDOException $e) {
    file_put_contents($logFile, "Erreur PDO : " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur de connexion à la base de données.']);
    exit;
}

// Vérification de la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée.']);
    exit;
}

// Traitement des données POST
$inputData = json_decode(file_get_contents('php://input'), true);
if (!$inputData) {
    file_put_contents($logFile, "Données JSON invalides : " . file_get_contents('php://input') . "\n", FILE_APPEND);
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Données JSON invalides.']);
    exit;
}

// Journaliser les données reçues
file_put_contents($logFile, "Données POST reçues : " . print_r($inputData, true), FILE_APPEND);

// Vérifier l'action demandée
if (empty($inputData['action']) || $inputData['action'] !== 'updateProfile') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Action non valide.']);
    exit;
}

// Vérifier et nettoyer les champs obligatoires
$requiredFields = ['idMapper', 'prenom', 'nom', 'pseudo', 'mail'];
foreach ($requiredFields as $field) {
    if (empty($inputData[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Le champ '$field' est requis."]);
        exit;
    }
}

$idMapper = intval($inputData['idMapper']);
$prenom = trim($inputData['prenom']);
$nom = trim($inputData['nom']);
$pseudo = trim($inputData['pseudo']);
$mail = filter_var(trim($inputData['mail']), FILTER_SANITIZE_EMAIL);

if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Adresse email invalide.']);
    exit;
}

$mdp = !empty($inputData['mdp']) ? password_hash(trim($inputData['mdp']), PASSWORD_BCRYPT) : null;
$photoProfil = !empty($inputData['photoProfil']) ? trim($inputData['photoProfil']) : null;

// Vérification et mise à jour dans la base de données
try {
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM Mapper WHERE (mail = :mail OR pseudo = :pseudo) AND idMapper != :idMapper"
    );
    $stmt->execute(['mail' => $mail, 'pseudo' => $pseudo, 'idMapper' => $idMapper]);
    if ($stmt->fetchColumn() > 0) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'L\'email ou le pseudo est déjà utilisé.']);
        exit;
    }

    $fields = ['prenom' => $prenom, 'nom' => $nom, 'pseudo' => $pseudo, 'mail' => $mail];
    if ($mdp) $fields['mdp'] = $mdp;
    if ($photoProfil) $fields['photoProfil'] = $photoProfil;

    $setClause = implode(", ", array_map(fn($key) => "$key = :$key", array_keys($fields)));
    $fields['idMapper'] = $idMapper;

    $stmt = $pdo->prepare("UPDATE Mapper SET $setClause WHERE idMapper = :idMapper");
    $stmt->execute($fields);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Profil mis à jour avec succès.']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Aucune modification détectée.']);
    }
} catch (PDOException $e) {
    file_put_contents($logFile, "Erreur PDO : " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur de base de données.']);
}
