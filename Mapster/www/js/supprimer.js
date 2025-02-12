

document.addEventListener("DOMContentLoaded", function () {
console.log("Script chargé !");
    let selectedPhotoId = null;
    let longPressTimeout = null;

    document.querySelectorAll(".photo").forEach(photo => {
        // Ajout de l'événement "touchstart" pour mobiles et "contextmenu" pour desktop
        photo.addEventListener("touchstart", function (event) {
            console.log("Touchstart detected");
            event.preventDefault();
            let currentPhoto = this;
            longPressTimeout = setTimeout(() => {
                selectedPhotoId = currentPhoto.id.replace("photo", "");
                document.getElementById("confirmationModal").style.display = "flex";
            },2000); // 500ms pour déclencher l'appui long
        });

        photo.addEventListener("touchend", function () {
            console.log("Touchstart detected");
            clearTimeout(longPressTimeout); 
        });

        
        photo.addEventListener("contextmenu", function (event) {
            event.preventDefault();
            selectedPhotoId = this.id.replace("photo", "");
            document.getElementById("confirmationModal").style.display = "flex";
        });
    });
    

    // Attendre que Cordova soit prêt pour les fonctionnalités natives.
    document.addEventListener("deviceready", function () {
        console.log("Cordova est prêt !");
        // Afficher le message dans l'interface utilisateur
        var cordovaReadyMessage = document.getElementById("cordovaReadyMessage");
        cordovaReadyMessage.style.display = "block"; // Afficher le message

        // Optionnel : Masquer le message après quelques secondes
        setTimeout(function () {
            cordovaReadyMessage.style.display = "none";
        }, 3000); // Masquer après 3 secondes
    }, false);
    // Confirmation de suppression
    document.getElementById("confirmYes").addEventListener("click", function () {
        if (selectedPhotoId) {
            fetch("http://miage-antilles.fr/mapper/supprimer.php", {
                method: "POST",
                body: JSON.stringify({ id: selectedPhotoId }),
                headers: { "Content-Type": "application/json" }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Photo supprimée !");
                        document.getElementById("photo" + selectedPhotoId).remove(); 
                    } else {
                        alert("Erreur : " + data.error);
                    }
                    document.getElementById("confirmationModal").style.display = "none";
                })
                .catch(error => {
                    console.error("Erreur :", error);
                    document.getElementById("confirmationModal").style.display = "none"; 
                });
        }
    });

    // Annuler la suppression
    document.getElementById("confirmNo").addEventListener("click", function () {
        document.getElementById("confirmationModal").style.display = "none";
    });

});
