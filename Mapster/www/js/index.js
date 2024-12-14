document.addEventListener('deviceready', onDeviceReady, false);

const date = new Date();
console.log(date.toLocaleString('en-US', { timeZone: 'America/New_York' })); // New York time
console.log(date.toLocaleString('en-GB', { timeZone: 'Europe/London' })); // London time

data = {
    "liste":[
        {
            "id":1,
            "photo":"xxx",
            "date": date.toJSON(),
            "longitude":16.224012176700928,
            "latitude":-61.528382151240194,
            "distanceUser":"200m",
            "descriptions":"Mon plus gros Ops",
            "Maper":{
                "idMapper":1,
                "pseudoMapper":"Goku",
                "photoProfil":"xx"
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



function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
    showListPosts()
}


function showListPosts () {

    const allPosts = data;

    const postList = document.getElementById('postsList');

    for (const postdata in allPosts) {

        const post = document.createElement('div');
        post.id = "post " + postdata.id;
        post.className = 'post';

        const headPost = document.createElement('div'); headPost.className = 'head-post';

        const photoprofil = document.createElement('img'); photoprofil.className = 'head-post';
        const pseudo = document.createElement('p');
        const distance = document.createElement('p');

        const image = document.createElement('img');

        const description = document.createElement('p');

        const date = document.createElement('p');

    }
}