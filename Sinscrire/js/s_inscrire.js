document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");
    const photoInput = document.getElementById("photoInput");
    const userPhoto = document.getElementById("userPhoto");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            envoyerDonnees();
        });
    }

    // Afficher l'aperçu de l'image avant l'envoi
    if (photoInput) {
        photoInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    userPhoto.src = e.target.result;
                    userPhoto.classList.remove("d-none");
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Fonction pour afficher les messages de succès ou d'erreur
function afficherMessage(message, type) {
    const feedback = document.getElementById("feedback");
    feedback.className = `alert alert-${type} text-center`;
    feedback.innerText = message;
    feedback.classList.remove("d-none");

    setTimeout(() => {
        feedback.classList.add("d-none");
    }, 5000);
}

// Vérification des champs avant l'envoi des données
function validerChamps() {
    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();
    const mail = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const pseudo = document.getElementById("pseudo").value.trim();
    const pays = document.getElementById("pays").value;

    if (!nom || !prenom || !mail || !password || !pseudo || !pays) {
        afficherMessage("Tous les champs doivent être remplis", "danger");
        return false;
    }

    if (!mail.includes("@") || !mail.includes(".")) {
        afficherMessage("Adresse email invalide", "danger");
        return false;
    }

    if (password.length < 6) {
        afficherMessage("Le mot de passe doit contenir au moins 6 caractères", "danger");
        return false;
    }

    return true;
}

// Fonction pour envoyer les données au serveur
function envoyerDonnees() {
    if (!validerChamps()) {
        return;
    }

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Inscription en cours...';

    let formData = new FormData();
    formData.append("action", "create");
    formData.append("nom", document.getElementById("nom").value.trim());
    formData.append("prenom", document.getElementById("prenom").value.trim());
    formData.append("mail", document.getElementById("email").value.trim());
    formData.append("pays", document.getElementById("pays").value);
    formData.append("mdp", document.getElementById("password").value);
    formData.append("pseudo", document.getElementById("pseudo").value);

    // Gestion de la photo
    const photoInput = document.getElementById("photoInput");
    if (photoInput.files.length > 0) {
        formData.append("photo", photoInput.files[0]);
    }

    envoyerRequete(formData);
}

// Fonction pour envoyer la requête au serveur avec stockage de la réponse
function envoyerRequete(formData) {
    fetch("http://www.miage-antilles.fr/mapper/s_inscrire.php", {
        method: "POST",
        body: formData, 
        mode: "cors",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        },
        redirect: "follow",
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then((json) => {
        // Stocker le JSON dans une variable
        let data = json;
        console.log("Réponse du serveur :", data);

        if (data.success) {
            afficherMessage("Inscription réussie ! Vous allez être redirigé...", "success");
            setTimeout(() => {
                window.location.href = "index.html"; // Redirection après 3s
            }, 3000);
        } else if (data.code === "6") {
            afficherMessage("Erreur : " + data.error, "danger");
        } else {
            throw new Error("Problème lors de l'inscription.");
        }
    })
    .catch((error) => {
        console.error("Erreur :", error);
        afficherMessage(`Erreur : ${error.message}`, "danger");
    })
    .finally(() => {
        const submitBtn = document.getElementById("submitBtn");
        submitBtn.disabled = false;
        submitBtn.innerHTML = "S'inscrire";
    });
}
