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

    InteractModifProfil();

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

            cacherLeProfil();

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
            if (item.nav === "search") {
                document.getElementById("recherche").style.display = "flex";
            }
        });
    });

    navItems.forEach((elem) => {
        document.getElementById(elem.nav).classList.remove("selected");
        document.getElementById(elem.div).style.display = "none";
    });
}


function timeAgo(date) {
    const now = new Date();
    const nowUTC = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000)); // Convertir le temps actuel en UTC
    const secondsPast = Math.floor((nowUTC - date) / 1000);

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
        return `hier`;
    }
    if (secondsPast < 604800) {
        const days = Math.floor(secondsPast / 86400);
        return `il y a ${days} jour${days > 1 ? "s" : ""}`;
    }
    if (secondsPast < 2592000) {
        const weeks = Math.floor(secondsPast / 604800);
        return `il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
    }
    if (secondsPast < 31536000) {
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

function createCircularIcon(imageUrl, size = 64) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous"; // Permet d'éviter les problèmes CORS
    img.src = imageUrl;

    return new Promise((resolve) => {
        img.onload = () => {
            // Dessiner un cercle
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip(); // Appliquer le masque circulaire

            // Dessiner l'image à l'intérieur du cercle
            ctx.drawImage(img, 0, 0, size, size);

            resolve(canvas.toDataURL()); // Retourner l'image en base64
        };
    });
}


// Fonction pour ajouter un marqueur
async function addMarker(longitude, latitude, pseudo, photoProfil, tempsEcoule) {
    if (isNaN(longitude) || isNaN(latitude)) {
        console.error(`Coordonnées invalides pour ${pseudo}: ${longitude}, ${latitude}`);
        return;
    }

    console.log(`Ajout du marqueur : ${pseudo}, lat: ${latitude}, lon: ${longitude}`);

    let marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
    });

    let iconSrc = photoProfil ? await createCircularIcon(photoProfil, 64) : "https://www.svgrepo.com/show/526022/map-point-wave.svg";

    marker.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: iconSrc,
            scale: photoProfil ? 0.75 : 0.05,
            anchor: [0.5, 0], // Centre l'image et la place au-dessus du texte
        }),
        text: new ol.style.Text({
            text: tempsEcoule ? `${pseudo}\n🕒 ${tempsEcoule}` : `${pseudo}`,
            offsetY: photoProfil ? 70 : 60, // Met le texte en dessous de l'avatar
            scale: 1,
            font: 'bold 10px Arial, sans-serif',
            fill: new ol.style.Fill({ color: '#fff' }), // Texte en blanc pour plus de contraste
            stroke: new ol.style.Stroke({ color: 'rgba(0, 0, 0, 0.6)', width: 2 }), // Effet d'ombre légère
            backgroundFill: new ol.style.Fill({ color: '#1F8C5C' }), // Fond vert moderne
            padding: [8, 12, 8, 12], // Padding ajusté pour un effet plus aéré
            textAlign: 'center', // Centrer le texte sous l'avatar
            radius: 12 // Appliquer un effet arrondi au fond
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



// POSTER PHOTO

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

async function sendData() {
    if (!imageBase64) {
        alert("Aucune image capturée");
        return;
    }

    let textValue = document.getElementById("textArea").value;

    document.getElementById("poster").innerHTML = "<div class=\"loader-container\">\n" +
        "    <div class=\"loader\"></div>\n" +
        "    <div class=\"logo\">Publication en cours...</div>\n" +
        "</div>\n";

    let formData = new FormData();
    formData.append("idMapper", idMapper);
    formData.append("hashMdp", hashMdp);
    formData.append("photo", imageBase64);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("description", textValue);

    await fetch(URL + "post_service.php", {
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

    document.getElementById("poster").innerHTML = "<div style=\"align-items: center;\">\n" +
        "               <h2 style=\"text-align: center; color: #3D7A56;margin-top: 5px;\">Nouvelle Publication</h2>\n" +
        "            </div>\n" +
        "            <img id=\"capturedImage\" src alt=\"Votre photo apparaîtra ici\"\n" +
        "               class=\"img-fluid\"\n" +
        "               style=\"width: 100%; height: auto;margin-bottom: 5px;\" />\n" +
        "            <!-- Zone pour ajouter une description -->\n" +
        "            <div style=\"margin: 2px;width: 96%;\">\n" +
        "               <textarea id=\"textArea\"\n" +
        "                  placeholder=\"Ajoutez une description...\"\n" +
        "                  style=\"width: 96%; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;\n" +
        "                  resize: none; height: 55px; padding: 10px; background-color: #f8f8f8;\n" +
        "                  color: #333; font-family: Arial, sans-serif; outline: none;\"></textarea>\n" +
        "            </div>\n" +
        "            <!-- Bouton pour partager la photo -->\n" +
        "            <button id=\"sendBtn\"\n" +
        "               style=\"display: block; width: 20%; padding: 5px; background-color: #3D7A56; color: white; border: none; font-size: 16px; cursor: pointer; border-radius: 3px; margin: 1vw\">\n" +
        "            Partager\n" +
        "            </button>";
}


/**##########################################################################################
 *                                  CONSULTER SON PROFIL
 * ##########################################################################################
 */


let profilData = {}; // Variable globale pour stocker le profil

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
            console.log("📌 Données reçues :", data);

            if (!data.pseudo || !data.mail) {
                console.error("Erreur : Données du profil invalides ou incomplètes.");
                return;
            }

            // Stocker les données pour les utiliser plus tard
            profilData = {
                pseudo: data.pseudo,
                mail: data.mail,
                photo: data.photo || "img/default.png", // Valeur par défaut si pas de photo
                liste: data.liste || []
            };

            console.log("📌 Données stockées dans profilData :", profilData);

            // Mise à jour des éléments du profil
            document.getElementById("pseudomapper").textContent = data.pseudo;
            document.getElementById("mail").textContent = data.mail;
            document.getElementById("publication").textContent = data.liste.length + " Publications";
            document.getElementById("photo").innerHTML = `<img src="${data.photo}" alt="Profile Picture">`;

            // Mise à jour de la liste des posts
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

            ajouterEvenementsSuppression();

            // Vérification que `remplirFormulaire()` est bien appelée avec des données valides
            console.log("Appel de remplirFormulaire()");
            remplirFormulaire();
        })
        .catch((error) => console.error("Erreur lors de la requête :", error));
}

/***************************************************************/
/* Fonction utilitaire pour encoder un objet en x-www-form-urlencoded */
/***************************************************************/
function objectToUrlEncoded(obj) {
    if (!obj || typeof obj !== "object") return "";
    return Object.keys(obj)
        .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
        .join("&");
}

// =======================================================================
// ======================== Remplir le formulaire ========================
// =======================================================================

function remplirFormulaire() {
    console.log("Remplissage du formulaire avec :", profilData);

    if (!profilData.pseudo || !profilData.mail) {
        console.warn("⚠️ Données du profil manquantes. Impossible de remplir le formulaire.");
        return;
    }

    document.getElementById("pseudoForm").value = profilData.pseudo;
    document.getElementById("emailForm").value = profilData.mail;

    // Mise à jour de la photo dans le formulaire
    const photoPreview = document.getElementById("photoPreview");
    const defaultPhoto = "img/default.png";

    photoPreview.src = profilData.photo && profilData.photo !== "null" ? profilData.photo : defaultPhoto;

    photoPreview.onerror = () => {
        photoPreview.onerror = null;
        photoPreview.src = defaultPhoto;
    };

    console.log("Formulaire mis à jour avec succès !");
}

// =======================================================================
// ======================== Mise à jour du profil ========================
// =======================================================================

async function saveProfile() {
    const pseudo = document.getElementById("pseudoForm").value.trim();
    const email = document.getElementById("emailForm").value.trim();
    const password = document.getElementById("passwordForm").value.trim();
    const confirmPassword = document.getElementById("confirmPasswordForm").value.trim();
    const photoFile = document.getElementById("photoInputHidden").files[0];

    if (!pseudo || !email) {
        alert("Le pseudo et l’email sont requis.");
        return;
    }

    if (password && password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas.");
        return;
    }

    afficherLoader(true);

    let formData = new FormData();
    formData.append("idMapper", idMapper);
    formData.append("hashMdp", hashMdp);
    formData.append("pseudo", pseudo);
    formData.append("mail", email);
    if (password) {
        formData.append("mdp", password);
    }

    try {
        if (photoFile) {
            // Conversion de l'image en base64 AVANT l'envoi
            const base64Image = await convertirFichierEnBase64(photoFile);
            formData.append("photoProfilBase64", base64Image);
        } else {
            formData.append("photoProfilBase64", profilData.photo);
        }

        // Une fois la conversion terminée, on envoie la requête
        await envoyerProfil(formData);

    } catch (error) {
        console.error("Erreur lors de la conversion de l'image :", error);
        alert("Impossible de traiter l'image.");
        afficherLoader(false);
    }
}

// Fonction pour convertir un fichier en base64 de manière ASYNCHRONE
function convertirFichierEnBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// =======================================================================
// ======================== Envoi des données ============================
// =======================================================================

async function envoyerProfil(formData) {
    try {
        console.log("Envoi des données au serveur :", formData);

        const response = await fetch(URL + "updateProfile.php", {
            method: "POST",
            body: formData
        });

        console.log("Réponse brute :", response);
        const result = await response.json();
        console.log("Réponse JSON :", result);

        if (response.ok && result.id && result.pseudo && result.mail) {
            console.log("Mise à jour réussie :", result);

            await new Promise(resolve => setTimeout(resolve, 1000));

            await consulterProfil();

            profilData.pseudo = result.pseudo || profilData.pseudo;
            profilData.mail = result.mail || profilData.mail;

            // Vérification et correction de l'URL complète de la photo
            profilData.photo = result.photo.startsWith("http")
                ? result.photo
                : `http://miage-antilles.fr/mapper/${result.photo}`;

            cacherLeProfil();
            document.getElementById("profil").style.display = "block";

            alert(result.message || "✅ Profil mis à jour avec succès !");
        } else {
            throw new Error(result.message || "Une erreur inconnue s'est produite.");
        }
    } catch (error) {
        console.error("Erreur réseau ou serveur :", error);
        alert("Impossible de mettre à jour le profil.");
    } finally {
        afficherLoader(false);
    }
}

// =======================================================================
// ======================== Gestion du loader ============================
// =======================================================================

function afficherLoader(etat) {
    const loader = document.querySelector(".loader-container");
    if (loader) {
        loader.style.display = etat ? "flex" : "none";
    }
}


/**
 * Fonction pour afficher ou masquer le loader
 */
function afficherLoader(etat) {
    const loader = document.getElementById("profileLoader");
    if (loader) {
        loader.style.display = etat ? "flex" : "none";
    }
}
// =======================================================================
// ======================== Gestion de l'affichage =======================
// =======================================================================

function InteractModifProfil() {
    console.log("Chargement de la page...");

    const profilePage = document.getElementById("profil");
    const editProfilePage = document.getElementById("modifierProfilPage");
    const editProfileIcon = document.getElementById("editProfileIcon");
    const backToProfileBtn = document.getElementById("backToProfileBtn");
    const saveButton = document.getElementById("saveProfile");

    if (saveButton) {
        saveButton.addEventListener("click", saveProfile);
    }

    // Quand on clique sur l'icône pour modifier le profil
    editProfileIcon.addEventListener("click", function () {
        console.log("Ouverture du formulaire de modification");
        remplirFormulaire(); // Appel ici pour s'assurer que les données sont mises à jour avant affichage

        cacherLeProfil();
        editProfilePage.style.display = "block";
        backToProfileBtn.style.display = "block";
    });

    // Quand on clique sur le bouton retour
    backToProfileBtn.addEventListener("click", function () {
        cacherLeProfil();
        profilePage.style.display = "block";
    });

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
}

function cacherLeProfil() {
    document.querySelectorAll("#profil, #modifierProfilPage").forEach((section) => {
        section.style.display = "none";
    });
}


// =======================================================================
// ======================== Gestion modal photo  =======================
// =======================================================================

// Gestion de l'aperçu de la photo
document.getElementById("photoPreview").addEventListener("click", function () {
    const modal = document.getElementById("photoModal");
    const modalImg = document.getElementById("photoModalImg");

    modal.style.display = "block";
    modalImg.src = this.src;
});

// Fermer le modal d'aperçu en cliquant sur le bouton de fermeture
document.querySelectorAll(".modal .close").forEach(closeBtn => {
    closeBtn.addEventListener("click", function () {
        this.closest(".modal").style.display = "none";
    });
});

// Fermer le modal d'aperçu en cliquant en dehors de l'image
document.getElementById("photoModal").addEventListener("click", function (event) {
    if (event.target === this) {
        this.style.display = "none";
    }
});

document.getElementById("editPhoto").addEventListener("click", function () {
    document.getElementById("photoOptionsModal").style.display = "block";
});

// Fermer le modal de sélection en cliquant en dehors
document.getElementById("photoOptionsModal").addEventListener("click", function (event) {
    if (event.target === this) {
        this.style.display = "none";
    }
});

// Prendre une photo
document.getElementById("takePhoto").addEventListener("click", function () {
    document.getElementById("photoOptionsModal").style.display = "none";

    navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType: Camera.EncodingType.JPEG,
        correctOrientation: true
    });
});

// Importer une photo
document.getElementById("choosePhoto").addEventListener("click", function () {
    document.getElementById("photoOptionsModal").style.display = "none";
    document.getElementById("photoInputHidden").click();
});

// Gestion du choix de fichier depuis la galerie
document.getElementById("photoInputHidden").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("photoPreview").src = e.target.result;
            profilData.photo = e.target.result; // Mettre à jour les données du profil
        };
        reader.readAsDataURL(file);
    }
});

// Callback si la photo est prise avec la caméra
function onPhotoSuccess(imageData) {
    const imageSrc = "data:image/jpeg;base64," + imageData;
    document.getElementById("photoPreview").src = imageSrc;
    profilData.photo = imageSrc; // Mettre à jour les données du profil
}

// Callback en cas d'échec
function onPhotoFail(message) {
    console.error("Erreur lors de la prise de photo :", message);
}

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
                    nbpubli = Number(document.getElementById("publication").textContent.split(" ")[0])
                    document.getElementById("publication").textContent = (nbpubli - 1).toString() + " Publications";
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