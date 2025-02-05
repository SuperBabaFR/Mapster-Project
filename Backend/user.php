<?php
ini_set('display_errors', 0); // Désactiver l'affichage des erreurs en production
error_reporting(0);

// Configurer les en-têtes HTTP pour l'API
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Inclure la configuration de la base de données
require_once 'db_config.php';

// Nettoyer tout buffer de sortie résiduel
if (ob_get_length()) {
    ob_end_clean();
}

// Gérer les requêtes OPTIONS (pré-vol CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Initialiser une réponse par défaut
$response = ['success' => false, 'error' => 'Une erreur inconnue est survenue.'];

try {
    // Connexion à la base de données
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASSWORD
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Gérer les erreurs de connexion à la base de données
    error_log("Erreur PDO : " . $e->getMessage(), 3, 'pdo_errors.log');
    $response['error'] = 'Erreur de connexion à la base de données.';
    echo json_encode($response);
    exit;
}

// Vérifier si la méthode est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = $_POST;

    // Vérifier que l'action est spécifiée
    if (empty($data['action'])) {
        $response['error'] = 'Action non spécifiée.';
    } elseif ($data['action'] === 'read') {
        // Vérifier que les champs requis sont présents
        if (!empty($data['mail']) && !empty($data['mdp'])) {
            $mail = trim($data['mail']);
            $mdp = trim($data['mdp']);

            try {
                // Requête pour récupérer les informations utilisateur
                $stmt = $pdo->prepare("SELECT idMapper, pseudo, mail, nom, prenom, photoProfil, mdp FROM Mapper WHERE mail = ?");
                $stmt->execute([$mail]);
                $user = $stmt->fetch();

                if ($user) {
                    // Vérifier si le mot de passe brut correspond au hash stocké
                    if (password_verify($mdp, $user['mdp'])) {
                        unset($user['mdp']); // Retirer le hash du mot de passe pour la réponse

                        $response = [
                            'success' => true,
                            'message' => 'Utilisateur trouvé.',
                            'user' => $user
                        ];
                    } else {
                        $response['error'] = 'Mot de passe incorrect.';
                    }
                } else {
                    $response['error'] = 'Utilisateur non trouvé.';
                }
            } catch (PDOException $e) {
                // Journaliser les erreurs PDO
                error_log("Erreur PDO : " . $e->getMessage(), 3, 'pdo_errors.log');
                $response['error'] = 'Erreur de base de données.';
            }
        } else {
            $response['error'] = 'Données incomplètes. Les champs requis sont : mail, mdp.';
        }
    } elseif ($data['action'] === 'updatePassword') {
        // Exemple de mise à jour du mot de passe
        if (!empty($data['mail']) && !empty($data['newPassword'])) {
            $mail = trim($data['mail']);
            $newPassword = password_hash(trim($data['newPassword']), PASSWORD_BCRYPT);

            try {
                $stmt = $pdo->prepare("UPDATE Mapper SET mdp = ? WHERE mail = ?");
                $stmt->execute([$newPassword, $mail]);

                if ($stmt->rowCount() > 0) {
                    $response = [
                        'success' => true,
                        'message' => 'Mot de passe mis à jour avec succès.'
                    ];
                } else {
                    $response['error'] = 'Utilisateur non trouvé ou aucun changement détecté.';
                }
            } catch (PDOException $e) {
                error_log("Erreur PDO : " . $e->getMessage(), 3, 'pdo_errors.log');
                $response['error'] = 'Erreur lors de la mise à jour du mot de passe.';
            }
        } else {
            $response['error'] = 'Données incomplètes. Les champs requis sont : mail, newPassword.';
        }
    } else {
        $response['error'] = 'Action non valide.';
    }
} else {
    $response['error'] = 'Méthode non autorisée.';
}

// Retourner une réponse JSON propre
echo json_encode($response);
exit;
