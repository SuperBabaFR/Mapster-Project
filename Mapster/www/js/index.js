document.addEventListener('deviceready', onDeviceReady, false);

const date = new Date();

const data = {
    "liste":[
        {
            "id":1,
            "photo":"https://wallpapercave.com/wp/wp7205972.jpg",
            "date": date.toJSON(),
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
            "photo":"xxx",
            "date":date.toJSON(),
            "longitude":16.224012176700928,
            "latitude":-61.528382151240194,
            "distanceUser":"250m",
            "descriptions":"Enfin je me suis débarrassé de ce singe",
            "Maper":{
                "idMapper":2,
                "pseudoMapper":"Freezer",
                "photoProfil":"xx"
            }
        }
    ]
}

showListPosts();

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    showListPosts()
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
        date.innerHTML = postdata.date;

        post.appendChild(headPost);
        post.appendChild(image_post);
        post.appendChild(description);
        post.appendChild(date);

        postList.appendChild(post);

    }
}