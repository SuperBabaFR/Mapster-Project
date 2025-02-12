let selectedPhotoId = null;
let longPressTimeout = null;

function ajouterEvenementsSuppression() {

    document
        .getElementById("confirmYes")
        .addEventListener("click", supprimerPhoto);

    document
        .getElementById("confirmNo")
        .addEventListener("click", fermerModalSuppression);

    document.querySelectorAll(".post2").forEach((photo) => {
        if (!photo.dataset.listenerAdded) {
            photo.dataset.listenerAdded = "true";

            photo.addEventListener("touchstart", function (event) {
                event.preventDefault();
                selectedPhotoId = this.id.replace("photo", "");

                longPressTimeout = setTimeout(() => {
                    afficherModalSuppression();
                }, 3000);
            });

            photo.addEventListener("touchend", function () {
                clearTimeout(longPressTimeout);
            });

            photo.addEventListener("contextmenu", function (event) {
                event.preventDefault();
                selectedPhotoId = this.id.replace("photo", "");
                afficherModalSuppression();
            });
        }
    });
}

function afficherModalSuppression() {
    let modal = document.getElementById("confirmationModal");
    if (!modal) {
        alert("Erreur : confirmationModal introuvable !");
        return;
    }

    modal.classList.add("show");
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
}

function supprimerPhoto() {
    if (selectedPhotoId) {
        fetch("http://miage-antilles.fr/mapper/supprimer.php", {
            method: "POST",
            body: JSON.stringify({ id: selectedPhotoId }),
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("Photo supprimée !");
                    document.getElementById("photo" + selectedPhotoId).remove();

                    fermerModalSuppression();
                } else {
                    alert("Erreur : " + data.error);
                }
            })
            .catch((error) => {
                console.error("Erreur :", error);
            });
    }
}

function fermerModalSuppression() {
    let modal = document.getElementById("confirmationModal");
    if (modal) {
        modal.classList.remove("show");
        modal.style.opacity = "0";
        modal.style.visibility = "hidden";

        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("Script chargé !");

    document.addEventListener("deviceready", function () {
        console.log("Cordova est prêt !");
    });

    ajouterEvenementsSuppression();

});