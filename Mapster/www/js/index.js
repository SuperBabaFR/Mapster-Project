const URL = "http://miage-antilles.fr/mapper/";
document.addEventListener("deviceready", onDeviceReady);
document.getElementById("sendBtn").addEventListener("click", sendData);
// let idMapper = 3;
// let hashMdp = "$2y$10$.oFmMHPz.9wmJ26/N..rvuEI1vrGKfqzBIc.UvHpRfph056ulpfiG";
// const longitude = -61.52848293478748;
// const latitude = 16.22395386679484;
let idMapper, pseudo, hashMdp, photo, longitude, latitude
let imageBase64 = "";

var currentPosition = {}; // Stocke la position actuelle
// Options pour activer la haute précision
var geoOptions = {
    enableHighAccuracy: true, // 🔥 Active le mode GPS pour une position plus précise
    timeout: 10000,           // ⏳ Temps max d'attente en millisecondes (10s)
    maximumAge: 0             // 🕒 Ne pas utiliser une position en cache
};
function onDeviceReady() {
    addNavInteractions();
    inscriptionEvent();
}

function loadConsulter() {
    navigator.geolocation.getCurrentPosition(onSuccessLoca, onError, geoOptions);

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
    showListPosts(longitude, latitude);

    // Exemple : utiliser la position pour afficher une carte Google Maps
    // updateMap(currentPosition.latitude, currentPosition.longitude);
}

function onError(error) {
    console.error("Erreur de géolocalisation :", error.message);
}

function showListPosts(longitude, latitude) {
    const rayon = 100000;
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
        document.getElementById("postsList").innerHTML = "";
        showListPosts(longitude, latitude);
      }

      navElement.classList.add("selected");
      divElement.style.display = "block"; // Affiche le div correspondant
    });
  });

  navItems.forEach((elem) => {
    document.getElementById(elem.nav).classList.remove("selected");
    document.getElementById(elem.div).style.display = "none";
  });

  document.getElementById("home").classList.add("selected");
  document.getElementById("consulter").style.display = "block";
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
    .then(data => {
        if (data.idPost) { // Si l'API retourne un idPost, le post a réussi
            alert("Post envoyé avec succès !");
            document.getElementById("home").click(); // Simule un clic sur l'onglet "home"
        } else {
            alert("Erreur lors de l'envoi du post : " + (data.message || "Réponse inattendue."));
        }
    })
    .catch(error => {
        document.getElementById("apiResponse").style.display = "block";
        document.getElementById("apiResponse").innerText = "Erreur lors de l'envoi des données : " + error;
    });
}

// POSTER PHGOTO


function consulterProfil() {
  fetch(URL + "consulterProfil.php", {
    method: "POST",
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
      data = json;

      // Mettre à jour le DOM avec les informations du profil
      document.getElementById("pseudomapper").textContent = data.pseudo;
      document.getElementById("mail").textContent = data.mail;
    })
    .catch((error) => console.error("Erreur lors de la requête :", error));
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
        body: JSON.stringify({pseudo, mail, mdp, photo})
    });

    const result = await response.json();
    const feedback = document.getElementById("feedback");
    feedback.classList.remove("d-none");

    if (result.code === 400 || result.code === 500) {
        feedback.classList.add("alert-danger");
        feedback.textContent = JSON.stringify(result,null, 4) || "Une erreur s'est produite.";
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

