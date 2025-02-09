document.addEventListener("deviceready", onDeviceReady);
const URL = "http://miage-antilles.fr/mapper/";
// let idMapper = 3;
// let hashMdp = "$2y$10$.oFmMHPz.9wmJ26/N..rvuEI1vrGKfqzBIc.UvHpRfph056ulpfiG";
let idMapper, pseudo, hashMdp, photo
// const longitude = -61.52848293478748;
// const latitude = 16.22395386679484;

var currentPosition = {}; // Stocke la position actuelle
// Options pour activer la haute précision
var geoOptions = {
    enableHighAccuracy: true, // 🔥 Active le mode GPS pour une position plus précise
    timeout: 10000,           // ⏳ Temps max d'attente en millisecondes (10s)
    maximumAge: 0             // 🕒 Ne pas utiliser une position en cache
};
function onDeviceReady() {
    addNavInteractions();
    // InscriptionInteract();
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
    showListPosts(position.coords.longitude, position.coords.latitude);

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

      if (item.div === "poster") {
        takePicture();
      }

      if (item.nav === "account") {
        consulterProfil();
      }

      if (item.nav === "consulter") {
        document.getElementById("postsList").innerHTML = "";
        showListPosts();
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

function takePicture() {
  navigator.camera.getPicture(onSuccess, onFail, {
    quality: 50,
    destinationType: Camera.DestinationType.DATA_URL,
    encodingType: Camera.EncodingType.JPEG,
    correctOrientation: true,
  });
}

function onSuccess(imageData) {
  console.log("Image capturée !");

  var image = document.getElementById("monImage");
  image.style.display = "block";
  image.src = `${imageData}`;
  alert(imageData);

  // Vérifier que l'image s'affiche bien
  image.onload = function () {
    console.log("Image chargée avec succès !");
  };

  image.onerror = function () {
    console.error("Erreur lors du chargement de l'image");
    alert("L'image ne s'est pas chargée correctement !");
  };
}

function onFail(message) {
  console.error("Erreur lors de la capture : " + message);
  alert("Échec :" + message);
}

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


function InscriptionInteract () {
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
