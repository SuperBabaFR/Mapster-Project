document.addEventListener('deviceready', onDeviceReady);
const URL = "http://miage-antilles.fr/mapper/"
const idMapper = 1;
const hashMdp = "hashedPassword";
const longitude = -61.52848293478748;
const latitude = 16.22395386679484;

// addNavInteractions();
// showListPosts();

function onDeviceReady() {
    addNavInteractions();
    showListPosts();

    if (window.caches) {
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    }


    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Appliquer le thème en fonction du mode actuel
    if (prefersDarkScheme.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Écouter les changements du mode système
    prefersDarkScheme.addEventListener('change', (event) => {
        if (event.matches) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
}

function showListPosts () {
    let data = {}
    const rayon = 1000;
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
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
        },
        mode:"cors"
    })
        .then((response) => response.json())
        .then((json) => {
            // Stocker le JSON dans une variable
            data = json;
        })
        .catch(error => console.error("Erreur :", error));

    const allPosts = data.liste;

    const postList = document.getElementById('postsList');

    for (let i = 0; i < allPosts.length; i++) {
        const postdata = allPosts[i];

        const post = document.createElement('div');
            post.id = "post " + postdata.id;
            post.className = 'post';

        const headPost = document.createElement('div');
            headPost.className = 'head-post';

            const photoprofil = document.createElement('img');
            photoprofil.className = 'pp';
            photoprofil.src = postdata.Maper.photoProfil;

            const infosMapster = document.createElement('div');

            const pseudo = document.createElement('p');
            pseudo.className = 'pseudo';
            pseudo.innerHTML = postdata.Maper.pseudoMapper;

            const distance = document.createElement('p');
            distance.className = 'distance';
            distance.innerHTML = "à " + postdata.distanceUser + " d'ici";

            infosMapster.appendChild(pseudo);
            infosMapster.appendChild(distance);

        headPost.appendChild(photoprofil);
        headPost.appendChild(infosMapster);

        const image_post = document.createElement('img');
        image_post.className = 'img-post';
        image_post.src = postdata.photo;

        const description = document.createElement('p');
        description.className = 'description';
        description.innerHTML = postdata.descriptions;

        const date = document.createElement('p');
        date.className = 'date';
        date.innerHTML = timeAgo(Date.parse(postdata.date));

        post.appendChild(headPost);
        post.appendChild(image_post);
        post.appendChild(description);
        post.appendChild(date);

        postList.appendChild(post);

    }
}


function addNavInteractions() {
    const navItems = [
        { nav: "home", div: "consulter" },
        { nav: "search", div: "recherche" },
        { nav: "post", div: "poster" },
        { nav: "map", div: "carte" },
        { nav: "account", div: "profil" }
    ];

    navItems.forEach(item => {
        const navElement = document.getElementById(item.nav);
        const divElement = document.getElementById(item.div);

        navElement.addEventListener("click", () => {
            navItems.forEach(i => {
                document.getElementById(i.nav).classList.remove("selected");
                document.getElementById(i.div).style.display = "none";
            });

            navElement.classList.add("selected");
            divElement.style.display = "block"; // Affiche le div correspondant
        });
    });

    navItems.forEach(elem => {
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
        return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    if (secondsPast < 172800) { // moins de 2 jours
        return `hier`;
    }
    if (secondsPast < 604800) { // moins de 7 jours
        const days = Math.floor(secondsPast / 86400);
        return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
    if (secondsPast < 2592000) { // moins d'un mois
        const weeks = Math.floor(secondsPast / 604800);
        return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    }
    if (secondsPast < 31536000) { // moins d'un an
        const months = Math.floor(secondsPast / 2592000);
        return `il y a ${months} mois`;
    }
    const years = Math.floor(secondsPast / 31536000);
    return `il y a ${years} an${years > 1 ? 's' : ''}`;
}