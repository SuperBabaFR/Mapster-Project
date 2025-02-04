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

// Fonction pour envoyer les données au serveur
function envoyerDonnees() {
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Inscription en cours...';

    // Création de l'objet JSON au lieu de FormData
    let data = {
        action: "create",
        nom: document.getElementById("nom").value.trim(),
        prenom: document.getElementById("prenom").value.trim(),
        mail: document.getElementById("email").value.trim(),
        pays: document.getElementById("pays").value,
        mdp: document.getElementById("password").value,
        pseudo: document.getElementById("pseudo").value,
        photo: "" // Par défaut vide
    };

    // Vérification et conversion de l'image en base64
    const photoInput = document.getElementById("photoInput");
    if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function () {
            data.photo = reader.result.split(",")[1]; // Convertir en base64
            envoyerRequete(data);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        envoyerRequete(data);
    }
}

// Fonction pour envoyer la requête au serveur
function envoyerRequete(data) {
    fetch("http://www.miage-antilles.fr/mapper/s_inscrire.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data), 
        redirect: "follow",
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json(); // Convertir la réponse en JSON
    })
    .then((data) => {
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
