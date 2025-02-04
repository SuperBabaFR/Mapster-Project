document.addEventListener("deviceready", onDeviceReady);
const URL = "http://miage-antilles.fr/mapper/";
const idMapper = 1;
const hashMdp = "hashedPassword";
const longitude = -61.52848293478748;
const latitude = 16.22395386679484;

// addNavInteractions();
// showListPosts();

function onDeviceReady() {
  addNavInteractions();
  showListPosts();
}

function showListPosts() {
  let data = {};
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
      // Stocker le JSON dans une variable

      data = json;
      const allPosts = data.liste;

      // alert(JSON.stringify(allPosts, null, 4));
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
// INSCRIPTION
// // INSCRIPTION
// // INSCRIPTION