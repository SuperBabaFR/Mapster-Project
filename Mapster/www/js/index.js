document.addEventListener('deviceready', onDeviceReady);

const URL = "https://miage-antilles.fr/mapper/"

const idMapper = 1;
const hashMdp = "HashedPassword";
let longitude = 16.22373795961566;
let latitude = -61.528672691150106;

// addNavInteractions();
// showListPosts();

function onDeviceReady() {
    addNavInteractions();
    // onSuccess Callback
    // This method accepts a Position object, which contains the
    // current GPS coordinates
    //
    var onSuccess = function(position) {
        longitude = position.coords.longitude
        latitude = position.coords.latitude

        console.log('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    showListPosts();
}

function showListPosts() {
    let data = {}
    const rayon = 1000.0;

    fetch(URL + "consulter.php", {
        method: "POST",
        body: JSON.stringify({
            idMapper: idMapper,
            hashMdp: hashMdp,
            rayon: rayon,
            longitude:longitude,
            latitude:latitude
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
        .then((response) => response.json())
        .then((json) => {
            // Stocker le JSON dans une variable
            data = json;
        });


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
        { nav: "post-nav", div: "poster" },
        { nav: "map-nav", div: "carte" },
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
            // Si le div actif est "poster", ouvrir la caméra
            if (item.div === "poster") {
                openCamera();
            }
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



//véyé sa ou ka fè
document.getElementById("account").addEventListener("click", function () {
    fetch("ConsulterProfil\Backend\consulterProfil.php") // Appel à l'API PHP
        .then(response => response.json())
        .then(data => {
            console.log(data)
            document.getElementById("pseudo").textContent = data.pseudo;
            document.getElementById("mail").textContent = data.mail;
        });
});