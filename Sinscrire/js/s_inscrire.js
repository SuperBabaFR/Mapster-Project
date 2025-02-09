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

            if (file && file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    userPhoto.src = e.target.result;
                    userPhoto.classList.remove("d-none");
                };
                reader.readAsDataURL(file);
            } else {
                afficherMessage("Veuillez sélectionner une image valide", "danger");
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
    const pseudo = document.getElementById("pseudo").value.trim();
    const mail = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!pseudo || !mail || !password) {
        afficherMessage("Tous les champs doivent être remplis", "danger");
        return false;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(pseudo)) {
        afficherMessage("Le pseudo doit contenir entre 3 et 20 caractères alphanumériques", "danger");
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        afficherMessage("Adresse email invalide", "danger");
        return false;
    }

    // if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password)) {
    //     afficherMessage("Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial", "danger");
    //     return false;
    // }

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
    formData.append("pseudo", document.getElementById("pseudo").value.trim());
    formData.append("mail", document.getElementById("email").value.trim());
    formData.append("mdp", document.getElementById("password").value);

    // Gestion de la photo (conversion en base64 avant envoi)
    const photoInput = document.getElementById("photoInput");
    if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const reader = new FileReader();

        reader.onloadend = function () {
            formData.append("photo", reader.result.split(',')[1]); // Enregistrer uniquement la partie base64
            envoyerRequete(formData);
        };
        reader.readAsDataURL(file);
    } else {
        envoyerRequete(formData);
    }
}

// Fonction pour envoyer la requête au serveur avec stockage de la réponse
function envoyerRequete(formData) {
    fetch("http://www.miage-antilles.fr/mapper/s_inscrire.php", {
        method: "POST",
        body: formData,
        mode: "cors",
        redirect: "follow",
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then((json) => {
        console.log("Réponse du serveur :", json);

        if (json.success) {
            afficherMessage("Inscription réussie ! Vous allez être redirigé...", "success");
            setTimeout(() => {
                window.location.href = "index.html"; 
            }, 3000);
        } else if (json.code === "6") {
            afficherMessage("Erreur : " + json.error, "danger");
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
