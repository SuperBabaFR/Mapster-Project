document.addEventListener('deviceready', onDeviceReady, false);

// ExempleS
const date1 = new Date();
date1.setMinutes(date1.getMinutes() - 5);
console.log(timeAgo(date1)); // il y a 5 min

const date2 = new Date();
date2.setDate(date2.getDate() - 1);
console.log(timeAgo(date2)); // hier

const date3 = new Date();
date3.setHours(date3.getHours() - 2);
console.log(timeAgo(date3)); // il y a 2 heures

const data = {
    "liste":[
        {
            "id":1,
            "photo":"https://wallpapercave.com/wp/wp7205972.jpg",
            "date": date2,
            "longitude":16.224012176700928,
            "latitude":-61.528382151240194,
            "distanceUser":"200m",
            "descriptions":"Mon plus gros Ops",
            "Maper":{
                "idMapper":1,
                "pseudoMapper":"Goku",
                "photoProfil":"https://avatarfiles.alphacoders.com/243/thumb-1920-243239.jpg"
            }
        },
        {
            "id":2,
            "photo":"https://res.cloudinary.com/jerrick/image/upload/q_auto,w_720/h0ykfhwykixazkaxrvqi.jpg",
            "date":date3,
            "longitude":16.224012176700928,
            "latitude":-61.528382151240194,
            "distanceUser":"250m",
            "descriptions":"Enfin je me suis débarrassé de ce singe",
            "Maper":{
                "idMapper":2,
                "pseudoMapper":"Freezer",
                "photoProfil":"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1bd1afe0-c6ed-45b9-a819-396c9de281f0/dfbr40z-c7622f6b-846c-4098-b477-c873126f39a0.png/v1/fill/w_733,h_1090,q_70,strp/dragon_ball_super___black_freezer_by_deviantart_psycho_pp_dfbr40z-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjA3MCIsInBhdGgiOiJcL2ZcLzFiZDFhZmUwLWM2ZWQtNDViOS1hODE5LTM5NmM5ZGUyODFmMFwvZGZicjQwei1jNzYyMmY2Yi04NDZjLTQwOTgtYjQ3Ny1jODczMTI2ZjM5YTAucG5nIiwid2lkdGgiOiI8PTEzOTIifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.hnMI0lKjkvjs_3Bxx-68DZNA_Z4_A9GnGWubKyvqPec"
            }
        }
    ]
}

addNavInteractions();
showListPosts();

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    // addNavInteractions();
    // showListPosts();
}


function showListPosts () {

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
        date.innerHTML = timeAgo(postdata.date);

        post.appendChild(headPost);
        post.appendChild(image_post);
        post.appendChild(description);
        post.appendChild(date);

        postList.appendChild(post);

    }
}


function addNavInteractions() {

    document.getElementById("item-1").classList.add("selected");

    for (let i = 1; i < 6; i++) {
        let navItem = document.getElementById("item-" + i);
        navItem.addEventListener("click", () => {
            for (let i = 1; i < 6; i++) {
                let navItem = document.getElementById("item-" + i);
                navItem.classList.remove("selected");
            }
            navItem.classList.add("selected");
        })
    }


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