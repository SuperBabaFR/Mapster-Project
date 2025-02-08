<?php
require_once "db_config.php";

try {
    // Connexion à la base de données avec PDO
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Requête SQL pour modifier le type de la colonne photoProfil
    $sql = "ALTER TABLE Mapper MODIFY photoProfil MEDIUMTEXT";
    $pdo->exec($sql);

    echo "Le champ 'photoProfil' a été modifié avec succès en MEDIUMTEXT.";
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
?>