const URL = "http://miage-antilles.fr/mapper/";
document.addEventListener("deviceready", () => {
    console.log("✅ Cordova est prêt !");
    onDeviceReady();
});
document.getElementById("sendBtn").addEventListener("click", sendData);

let idMapper, pseudo, hashMdp, photo, longitude, latitude
let imageBase64 = "";
let map = null;

let currentPosition = {}; // Stocke la position actuelle
// Options pour activer la haute précision
let geoOptions = {
    enableHighAccuracy: true, // 🔥 Active le mode GPS pour une position plus précise
    timeout: 10000,           // ⏳ Temps max d'attente en millisecondes (10s)
    maximumAge: 0             // 🕒 Ne pas utiliser une position en cache
};
// Sélection des éléments
const rangeSlider = document.getElementById("rangeSlider");
const sliderValue = document.getElementById("sliderValue");
const refreshButton = document.getElementById("refreshButton");

function onDeviceReady() {
    addNavInteractions();
    inscriptionEvent();

    // Mise à jour dynamique de la valeur affichée
    rangeSlider.addEventListener("input", () => {
        sliderValue.textContent = rangeSlider.value + 'm';
    });

    // Récupération de la valeur lorsque le bouton est cliqué
    refreshButton.addEventListener("click", () => {
        reload_post_list();
    });

    // Connexion
    const btnConnecter = document.getElementById("btnConnecter");
    btnConnecter.addEventListener("click", Connexion);
    // Passer à inscription
    const sinscire = document.getElementById("sinscrire");
    sinscire.addEventListener("click", switchToInscription);
    // Repasser à connexion
    const backButton = document.getElementById("backButton");
    backButton.addEventListener("click", switchToConnexion);

}

function loadConsulter() {
    navigator.geolocation.getCurrentPosition(onSuccessLoca, onError, geoOptions);

    document.getElementById("home").classList.add("selected");
    document.getElementById("consulter").style.display = "block";

    const nav_bar = document.getElementById("nav_bar");
    nav_bar.style.display = "grid";
}

function onSuccessLoca(position) {
    currentPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
    };
    longitude = position.coords.longitude
    latitude = position.coords.latitude
    rayon = rangeSlider.value
    showListPosts(longitude, latitude, rayon);

    // Exemple : utiliser la position pour afficher une carte Google Maps
    // updateMap(currentPosition.latitude, currentPosition.longitude);
}

function onError(error) {
    console.error("Erreur de géolocalisation :", error.message);
}

function showListPosts(longitude, latitude) {
    const formData = new FormData();
    formData.append("idMapper", idMapper);
    formData.append("hashMdp", hashMdp);
    formData.append("rayon", rayon);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);

    fetch(URL + "consulter.php", {
        method: "POST",
        body: formData,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization, X-Requested-With",
        },
        mode: "cors",
    })
        .then((response) => response.json())
        .then((json) => {
            if (json == null) {
                alert("aucune réponse")
                return;
            }

            const allPosts = json.liste;

            const postList = document.getElementById("postsList");
            postList.innerHTML = "";

            for (let i = 0; i < allPosts.length; i++) {
                const postdata = allPosts[i];

                const post = document.createElement("div");
                post.id = "post " + postdata.id;
                post.className = "post";

                const headPost = document.createElement("div");
                headPost.className = "head-post";

                const photoprofil = document.createElement("img");
                photoprofil.className = "pp";
                photoprofil.src = postdata.Maper.photoProfil;

                const infosMapster = document.createElement("div");

                const pseudo = document.createElement("p");
                pseudo.className = "pseudo";
                pseudo.innerHTML = postdata.Maper.pseudoMapper;

                const distance = document.createElement("p");
                distance.className = "distance";
                distance.innerHTML = "à " + postdata.distanceUser.toString() + "m d'ici";
                // distance.innerHTML = "à " + postdata.longitude + " d'ici";

                infosMapster.appendChild(pseudo);
                infosMapster.appendChild(distance);

                headPost.appendChild(photoprofil);
                headPost.appendChild(infosMapster);

                const image_post = document.createElement("img");
                image_post.className = "img-post";
                image_post.src = postdata.photo;

                const description = document.createElement("p");
                description.className = "descriptions";
                description.innerHTML = postdata.descriptions;

                const date = document.createElement("p");
                date.className = "date";
                date.innerHTML = timeAgo(Date.parse(postdata.date));

                post.appendChild(headPost);
                post.appendChild(image_post);
                post.appendChild(description);
                post.appendChild(date);

                postList.appendChild(post);
            }
        })
        .catch((error) => alert("Erreur :" + error));
}

function reload_post_list() {
    document.getElementById("postsList").innerHTML = "<div class=\"loader-container\">\n" +
        "    <div class=\"loader\"></div>\n" +
        "    <div class=\"logo\">Chargement...</div>\n" +
        "</div>\n";
    navigator.geolocation.getCurrentPosition(onSuccessLoca, onError, geoOptions);
}

function addNavInteractions() {
    const navItems = [
        { nav: "home", div: "consulter" },
        { nav: "search", div: "recherche" },
        { nav: "post", div: "poster" },
        { nav: "map", div: "carte" },
        { nav: "account", div: "profil" },
    ];

    navItems.forEach((item) => {
        const navElement = document.getElementById(item.nav);
        const divElement = document.getElementById(item.div);

        navElement.addEventListener("click", () => {
            navItems.forEach((i) => {
                document.getElementById(i.nav).classList.remove("selected");
                document.getElementById(i.div).style.display = "none";
            });

            if (item.nav === "post") {
                capturePhoto();
            }

            if (item.nav === "account") {
                consulterProfil();
            }

            if (item.nav === "home") {
                reload_post_list()
            }

            if (item.nav === "map") {
                LoadMap()
            }


            navElement.classList.add("selected");
            divElement.style.display = "block"; // Affiche le div correspondant
        });
    });

    navItems.forEach((elem) => {
        document.getElementById(elem.nav).classList.remove("selected");
        document.getElementById(elem.div).style.display = "none";
    });
}
function timeAgo(date) {
    const now = new Date();
    const secondsPast = Math.floor((now - date) / 1000);

    if (secondsPast < 60) {
        return `il y a ${secondsPast} sec`;
    }
    if (secondsPast < 3600) {
        const minutes = Math.floor(secondsPast / 60);
        return `il y a ${minutes} min`;
    }
    if (secondsPast < 86400) {
        const hours = Math.floor(secondsPast / 3600);
        return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    }
    if (secondsPast < 172800) {
        // moins de 2 jours
        return `hier`;
    }
    if (secondsPast < 604800) {
        // moins de 7 jours
        const days = Math.floor(secondsPast / 86400);
        return `il y a ${days} jour${days > 1 ? "s" : ""}`;
    }
    if (secondsPast < 2592000) {
        // moins d'un mois
        const weeks = Math.floor(secondsPast / 604800);
        return `il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
    }
    if (secondsPast < 31536000) {
        // moins d'un an
        const months = Math.floor(secondsPast / 2592000);
        return `il y a ${months} mois`;
    }
    const years = Math.floor(secondsPast / 31536000);
    return `il y a ${years} an${years > 1 ? "s" : ""}`;
}

// MAP
// MAP
// MAP
// MAP
// MAP
// MAP



// Fonction pour ajouter un marqueur
function addMarker(longitude, latitude, pseudo, photoProfil, tempsEcoule) {
    if (isNaN(longitude) || isNaN(latitude)) {
        console.error(`Coordonnées invalides pour ${pseudo}: ${longitude}, ${latitude}`);
        return;
    }

    console.log(`Ajout du marqueur : ${pseudo}, lat: ${latitude}, lon: ${longitude}`);

    let marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
    });

    marker.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg",
            scale: 0.05
        }),
        text: new ol.style.Text({
            text: pseudo,
            offsetY: -25,
            scale: 1.2,
            fill: new ol.style.Fill({ color: '#000' }),
            backgroundFill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.7)' })
        })
    }));

    vectorSource.addFeature(marker);

    // Vérifie si markerLayer existe déjà, sinon l'ajouter
    if (!map.getLayers().getArray().includes(markerLayer)) {
        map.addLayer(markerLayer);
    }

}

// Source des marqueurs
let vectorSource = new ol.source.Vector();

// Calque contenant les marqueurs
let markerLayer = new ol.layer.Vector({
    source: vectorSource
});


function LoadMap() {

    document.getElementById("carte").innerHTML = "<div class=\"loader-container\">\n" +
        "    <div class=\"loader\"></div>\n" +
        "    <div class=\"logo\">Chargement...</div>\n" +
        "</div>\n";

    navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        document.getElementById("carte").innerHTML = "";


        map = new ol.Map({
            target: 'carte',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([2.3522, 48.8566]), // Centre par défaut sur Paris
                zoom: 5
            })
        });

        map.addLayer(markerLayer);

        map.getView().setCenter(ol.proj.fromLonLat([longitude, latitude]));
        map.getView().setZoom(10);

        vectorSource.clear(); // Supprime les anciens marqueurs avant d'ajouter les nouveaux


        addMarker(longitude, latitude, "Vous êtes ici", "", "");


        let formData = new FormData();
        formData.append("idMapper", idMapper);
        formData.append("hashMdp", hashMdp);
        formData.append("rayon", rangeSlider.value);
        formData.append("longitude", longitude);
        formData.append("latitude", latitude);

        fetch(URL + "carte_service.php", {
            method: "POST",
            body: formData,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers":
                    "Content-Type, Authorization, X-Requested-With",
            },
            mode: "cors",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.mappers) {
                    data.mappers.forEach(mapper => {
                        mapper.posts.forEach(point => {
                            //     let popupContent = `
                            //     <div>
                            //         <img src="${mapper.photoProfil}" alt="Photo de ${mapper.pseudo}" width="50" height="50" style="border-radius: 50%;">
                            //         <p><strong>${mapper.pseudo}</strong></p>
                            //         <p>${point.tempsEcoule}</p>
                            //     </div>
                            // `;
                            addMarker(
                                parseFloat(point.longitude),
                                parseFloat(point.latitude),
                                mapper.pseudo,
                                mapper.photoProfil,
                                point.tempsEcoule
                            );
                            console.log(`Ajout du marqueur : ${mapper.pseudo}, lat: ${point.latitude}, lon: ${point.longitude}`);

                        });
                    });
                }
            })
            .catch(error => console.error("Erreur lors de la récupération des points:", error));
    }, function (error) {
        console.error("Erreur de géolocalisation :", error);
    });
}



// POSTER PHGOTO

function capturePhoto() {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType: Camera.EncodingType.JPEG,
        correctOrientation: true
    });
}

function onSuccess(imageData) {
    imageBase64 = imageData;
    document.getElementById("capturedImage").src = imageData;
}

function onFail(message) {
    alert("Erreur: " + message);
}

function sendData() {
    if (!imageBase64) {
        alert("Aucune image capturée");
        return;
    }

    let textValue = document.getElementById("textArea").value;

    let formData = new FormData();
    formData.append("idMapper", idMapper);
    formData.append("hashMdp", hashMdp);
    formData.append("photo", imageBase64);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("description", textValue);

    fetch(URL + "post_service.php", {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (response.status === 200) {
                document.getElementById("home").click();
            } else {
                throw new Error("Code retour non OK : " + response.status);
            }
        })
        .catch(error => {
            alert("Erreur lors de l'envoi des données : " + error);
            // document.getElementById("apiResponse").style.display = "block";
            // document.getElementById("apiResponse").innerText = "Erreur lors de l'envoi des données : " + error;
        });
}


/**##########################################################################################
 *                                  CONSULTER SON PROFIL
 * ##########################################################################################
 */


function consulterProfil() {
    fetch(URL + "consulterProfil.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idMapper: idMapper,
            hashMdp: hashMdp
        })
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Données reçues :", data);

            // Remplissage des infos du profil
            document.getElementById("pseudomapper").textContent = data.pseudo;
            document.getElementById("mail").textContent = data.mail;
            document.getElementById("publication").textContent = data.liste.length + " Publications";
            document.getElementById("photo").innerHTML = `<img src="${data.photo}" alt="Profile Picture">`;

            // Remplissage de la liste des posts
            const consultBody = document.getElementById("consultBody");
            consultBody.innerHTML = "";

            data.liste.forEach((post) => {
                const postDiv = document.createElement("div");
                postDiv.className = "post2";
                postDiv.id = "photo" + post.id;

                const image_post = document.createElement("img");
                image_post.className = "img-post";
                image_post.src = post.photo;
                image_post.alt = "Post Image";

                const description = document.createElement("p");
                description.className = "description";
                description.textContent = post.description;

                const date = document.createElement("p");
                date.className = "date";
                date.textContent = new Date(post.date).toLocaleDateString();

                postDiv.appendChild(image_post);
                postDiv.appendChild(description);
                postDiv.appendChild(date);

                consultBody.appendChild(postDiv);
            });

            // 📌 Remplir le formulaire de modification avec les données reçues
            remplirFormulaire(data);

        })
        .catch((error) => console.error("Erreur lors de la requête :", error));
}


/***************************************************************/
/* Fonction utilitaire pour encoder un objet en x-www-form-urlencoded */
/***************************************************************/
function objectToUrlEncoded(obj) {
    const params = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            params.push(
                encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
            );
        }
    }
    return params.join('&');
}


// ======================== Remplir le formulaire ========================
// =====================================================================

function remplirFormulaire(data) {
    // Retrait des champs prénom et nom
    // document.getElementById('prenom').value = data.prenom || '';
    // document.getElementById('nom').value = data.nom || '';

    // On suppose que "pseudo" et "email" existent dans le HTML
    document.getElementById('pseudo').value = data.pseudo || '';
    document.getElementById('email').value = data.mail || '';

    const photoPreview = document.getElementById('photoPreview');
    const defaultPhoto = 'img/default.png';

    // data.photo (ou data.photoProfil) selon ta base
    if (data.photo) {
        photoPreview.src = data.photo;
    } else {
        photoPreview.src = defaultPhoto;
    }

    // Sécurise l'affichage si la photo n'existe pas
    photoPreview.onerror = () => {
        photoPreview.onerror = null;
        photoPreview.src = defaultPhoto;
    };

    console.log('Formulaire profil rempli avec succès.');
}

// ======================== Mise à jour du profil ========================
// =====================================================================

async function saveProfile() {
    // Supprime la récupération de nom/prénom
    // const prenom = document.getElementById('prenom').value.trim();
    // const nom = document.getElementById('nom').value.trim();

    const pseudo = document.getElementById('pseudo').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    // Vérification basique : on exige pseudo + email
    if (!pseudo || !email) {
        alert('Le pseudo et l’email sont requis.');
        return;
    }

    if (password && password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }

    // On prépare l'objet à envoyer
    // On part du principe que "utilisateurConnecte" existe dans ton code,
    // sinon adapte avec tes variables globales (idMapper, hashMdp, etc.)
    const data = {
        action: 'updateProfile',
        idMapper: utilisateurConnecte.idMapper,    
        pseudo: pseudo,
        mail: email,
        mdp: password || '',
        photoProfil: utilisateurConnecte.photo || ''
    };

    try {
        console.log('Envoi des données au serveur :', data);

        const response = await fetch(URL + 'updateProfile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: objectToUrlEncoded(data)
        });

        if (!response.ok) {
            console.error('Erreur HTTP :', response.status, response.statusText);
            alert('Une erreur est survenue : ' + response.statusText);
            return;
        }

        const result = await response.json();

        if (result.success) {
            alert('Profil mis à jour avec succès.');
            console.log('Réponse serveur :', result);

            // Mise à jour locale de l'objet utilisateurConnecte
            utilisateurConnecte = { ...utilisateurConnecte, ...data };

            // On recharge le formulaire avec les nouvelles infos
            remplirFormulaire(utilisateurConnecte);
        } else {
            console.error('Erreur serveur :', result.error);
            alert('Erreur : ' + (result.error || 'Une erreur inconnue s\'est produite.'));
        }
    } catch (error) {
        console.error('Erreur réseau ou serveur :', error);
        alert('Impossible de mettre à jour le profil.');
    }
}

// ========================================
// Lien du bouton pour sauvegarder le profil
// ========================================
const saveButton = document.getElementById('saveProfile');
if (saveButton) {
    saveButton.addEventListener('click', saveProfile);
}
document.addEventListener("DOMContentLoaded", function () {
    const profilePage = document.getElementById("profil");
    const editProfilePage = document.getElementById("modifierProfilPage");
    const editProfileIcon = document.getElementById("editProfileIcon"); // Icône du stylo
    const backToProfileBtn = document.getElementById("backToProfileBtn");

    // 🔹 Afficher la page de modification de profil lorsqu'on clique sur l'icône
    editProfileIcon.addEventListener("click", function () {
        profilePage.style.display = "none";  // Cacher la page profil
        editProfilePage.style.display = "block";  // Afficher la page de modification
        backToProfileBtn.style.display = "block"; // Afficher le bouton retour
    });

    // 🔙 Revenir à la page profil
    backToProfileBtn.addEventListener("click", function () {
        profilePage.style.display = "block"; // Réafficher la page profil
        editProfilePage.style.display = "none"; // Cacher la page modification
        backToProfileBtn.style.display = "none"; // Cacher le bouton retour
    });
});

/***************************************************************/
/* Fin du code                                                 */
/***************************************************************/

// CONNEXION
// CONNEXION
// CONNEXION
// CONNEXION
// CONNEXION
// CONNEXION
// CONNEXION

function Connexion() {
    // event.preventDefault(); // Empêche le rechargement de la page

    // Sélection des éléments du DOM
    const mailInput = document.getElementById("emailconnexion");
    const mdpInput = document.getElementById("passwordconnexion");

    if (!mailInput || !mdpInput) {
        console.error("Erreur : Les champs email ou mot de passe sont introuvables !");
        return false;
    }

    // Récupération des valeurs des champs
    const mail = mailInput.value.trim();
    const mdp = mdpInput.value.trim();
    document.getElementById("mail").value = mail;

    // Vérification que les champs ne sont pas vides
    if (mail === "" || mdp === "") {
        alert("Veuillez remplir tous les champs !");
        return false;
    }

    let user = {
        "mail": mail,
        "mdp": mdp
    };

    console.log("Données envoyées :", user); // Debugging

    // Requête vers l'API connection.php
    fetch(URL + "connection.php", { // Correction du chemin
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization, X-Requested-With",
        },
        body: JSON.stringify(user),
        mode: "no-cors"
    })
        .then(response => {
            console.log("Réponse brute :", response);
            if (!response.ok) {
                throw new Error("Erreur serveur : " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Données reçues :", data);
            if (data.status === "success") {
                document.getElementById("message").innerHTML = "Connexion réussie !";
                idMapper = data.ID;
                hashMdp = data.MDP;

                // CACHE La connexion
                const CONNEXION = document.getElementById("connexion");
                CONNEXION.style.display = "none"
                // CHARGE LA page accueil
                loadConsulter();

            } else {
                document.getElementById("message").innerHTML = "Erreur : " + data.message;
            }
        })
        .catch(error => {
            console.error("Erreur lors de la requête :", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        });
}


function switchToInscription() {
    // CACHE La connexion
    const CONNEXION = document.getElementById("connexion");
    CONNEXION.style.display = "none"

    // AFFICHE inscription
    const inscription = document.getElementById("Inscription");
    inscription.style.display = "block"
}

function switchToConnexion() {
    // CACHE inscription
    const inscription = document.getElementById("Inscription");
    inscription.style.display = "none"

    // AFFICHE connexion
    const CONNEXION = document.getElementById("connexion");
    CONNEXION.style.display = "block"
}


// INSCRIPTION
// INSCRIPTION
// INSCRIPTION
// INSCRIPTION
// INSCRIPTION
// INSCRIPTION
// INSCRIPTION

async function inscription() {
    const pseudo = document.getElementById("pseudo").value.trim();
    const mail = document.getElementById("email").value.trim();
    const mdp = document.getElementById("password").value.trim();
    const photo = document.getElementById("userPhoto").src;

    document.getElementById("mail").value = mail;
    document.getElementById("pseudomapper").value = mail;


    if (!pseudo || !mail || !mdp) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    const response = await fetch(URL + "inscription.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers":
                "Content-Type, Authorization, X-Requested-With",
        },
        mode: "cors",
        body: JSON.stringify({ pseudo, mail, mdp, photo })
    });

    const result = await response.json();
    const feedback = document.getElementById("feedback");
    feedback.classList.remove("d-none");

    if (result.code === 400 || result.code === 500) {
        feedback.classList.add("alert-danger");
        feedback.textContent = JSON.stringify(result, null, 4) || "Une erreur s'est produite.";
        return;
    }
    feedback.classList.add("alert-success");
    feedback.textContent = "Inscription réussie !";

    idMapper = result.id;
    hashMdp = result.mdp;

    // CACHE L'inscription
    const INSCRIPTION = document.getElementById("Inscription");
    INSCRIPTION.style.display = "none"
    // CHARGE LA page accueil
    loadConsulter();
}

function inscriptionEvent() {
    document.getElementById("registerBtn").addEventListener("click", inscription);
    const photoInput = document.getElementById("photoInput");
    const userPhoto = document.getElementById("userPhoto");


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

/**##############################################################################################
 *                                    Supprimer une photo
 * ##############################################################################################
 */
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
                }, 1000);
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
        console.log("Erreur : confirmationModal introuvable !");
        return;
    }

    modal.classList.add("show");
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
}

function supprimerPhoto() {
    if (selectedPhotoId) {
        fetch(URL + "supprimer.php", {
            method: "POST",
            body: JSON.stringify({ id: selectedPhotoId }),
            headers: { "Content-Type": "application/json" },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log("Photo supprimée !");
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