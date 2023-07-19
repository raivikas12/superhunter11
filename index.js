const resultsContainer = document.getElementById('results'); // element to display results within
const searchTerm = document.getElementById('searchBar');
let typingTimer;                //timer identifier

// retrieve data from local storage
var storedCharactersArray = JSON.parse(localStorage.getItem("characters"));

// trigger function
searchTerm.addEventListener('keyup', async () => {
    removeAllChildNodes(resultsContainer);
    clearTimeout(typingTimer);

    if (searchTerm.value.length >= 1) {
        typingTimer = setTimeout(afterTyping, 500);
    }
});

// When user finishes typing
function afterTyping() {
    // fetch marvel api data
    getMarvelResponse(searchTerm.value);
}

// Clear previous search
function removeAllChildNodes(parent) {
    // console.log('Parent:: ', parent);
    document.querySelectorAll('.list-group-item').forEach(
        child => child.remove());
}

// Hit API and Fetch the matching characters
// you will also have to setup the referring domains on your marvel developer portal
var PRIV_KEY = "230f014ca05c295137332efffba0e13178e47845";
var PUBLIC_KEY = "547bfb64e330bb09ecef7649d1682d01";

var ts = new Date().getTime();
var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();

async function getMarvelResponse(searchTerm) {

    try {
        const response = await fetch(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&nameStartsWith=${searchTerm}&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
            .then(response => response.json()) // converting response to json
            .then(
                function (data) {
                    // to show the results on the page
                    if (data) {
                        console.log(data.data.results);
                        character = data;
                        showResults(data);
                    }
                    // else
                    //     noResult();
                }
            );
    } catch (err) {
        console.log('Error:', err);
    }
};

// displaying results
function showResults(Data) {
    // console.log('inside show results!', typeof (Data), Data);

    let maxResultsToDisplay = 1;
    Data.data.results.map(superHero => {
        if (maxResultsToDisplay > 10) {
            return;
        }
        maxResultsToDisplay++;

        console.log(superHero.comics)

        // 1. Create and Insert HTML
        let ul = document.createElement("ul");
        ul.className = "list-group";

        let li = document.createElement("li");
        li.className = "list-group-item";

        let anchorTag = document.createElement('a');
        anchorTag.className = "list-group-item list-group-item-action list-group-item-secondary large";
        anchorTag.title = superHero.name;
        anchorTag.href = "InfoPage.html?id=" + superHero.id;

        //Main div
        let flexDiv = document.createElement('div');
        flexDiv.className = "d-flex";

        // Image div
        let imgContainer = document.createElement('div');

        let heroAvatar = document.createElement('img');
        heroAvatar.className = "img-thumbnail";
        heroAvatar.src = superHero.thumbnail.path + "."+ superHero.thumbnail.extension;
        heroAvatar.alt = superHero.name + "'s thumbnail";
        heroAvatar.height = 100;
        heroAvatar.width = 100;

        // Name, id info div
        let infoContainer = document.createElement('div');
        infoContainer.className = "ml-4";

        let id = document.createElement('div');
        id.className = "superHeroID";
        id.innerHTML = superHero.id;


        let characterName = document.createElement('div');
        characterName.innerHTML = superHero.name;
        characterName.className = "font-weight-semibold superHeroName";

        // Favourite heart container
        let heart = document.createElement('div');
        let Heart_anchorTag = document.createElement('a');
        Heart_anchorTag.dataset.id = superHero.id;
        Heart_anchorTag.title = "Favourite";
        Heart_anchorTag.href = "javascript:void(0);";
        Heart_anchorTag.id = "fav-btn";
        if (initialFavStatus(Heart_anchorTag)) {
            Heart_anchorTag.className = "text-danger ml-auto mt-4 fa-solid fa-thumbs-up add ";
        } else {
            Heart_anchorTag.className = "text-secondary ml-auto mt-4 fa-regular fa-thumbs-up remove";
        }

        // let description = document.createElement('div');
        // description.innerHTML = superHero.description;

        ul.append(anchorTag);
        // initialFavStatus(Heart_anchorTag);
        anchorTag.append(flexDiv);
        flexDiv.append(imgContainer, infoContainer, Heart_anchorTag);
        imgContainer.append(heroAvatar);
        infoContainer.append(characterName, id);

        resultsContainer.append(ul); // adds all superheroes cards to DOM

        // initialFavStatus(Heart_anchorTag);
        Heart_anchorTag.addEventListener('click', function (e) {
            favourite(this);
        });
    });
}


// Initial favourite status
function initialFavStatus(anchor) {
    if (storedCharactersArray == null) {
        return false;
    } else if (storedCharactersArray.length > 0) {
        if (isFavourite(anchor.dataset.id, storedCharactersArray)) {
            return true;
        }
    }
}

// Toggle favourite
function favourite(anchor) {
    // console.log("inside fav " + anchor.dataset.id, character);

    // check browser support for localStorage and sessionStorage
    if (typeof (Storage) == "undefined") {
        window.alert("Sorry! No Web Storage support..");
        return;
    }

    storedCharactersArray = JSON.parse(localStorage.getItem("characters"));
    let favIcon = anchor.classList;

    // Handle First favourite character case
    if (storedCharactersArray == null || storedCharactersArray.length == 0) {
        var characters = [];
        for (var key in character.data.results) {
            if (character.data.results[key].id == anchor.dataset.id) {
                console.log('Add to Favourite Condition :: ', character.data.results[key].id + ' == ' + anchor.dataset.id);
                characters.push(character.data.results[key]);
            }
        }
        // characters.push(character);
        // add to local storage
        localStorage.setItem("characters", JSON.stringify(characters));
        // change icon
        favIcon.remove("fa-regular");
        favIcon.add("fa-solid");
        // alert message
        window.alert("Added to favourites.");
    } else {  // handle favourite characters exists
        // check if current character is already favourite
        if (isFavourite(anchor.dataset.id, storedCharactersArray)) {
            // remove from favourites
            if (confirm("Remove from favourites?")) {
                console.log('after confirm', character.data.results[0].id, anchor.dataset.id);
                let isRemoved = removeFromFavourite(anchor.dataset.id, storedCharactersArray);
                console.log(isRemoved);
                if (isRemoved) {
                    localStorage.setItem("characters", JSON.stringify(storedCharactersArray));
                    // change icon
                    favIcon.remove("fa-solid");
                    favIcon.add("fa-regular");
                    // alert message
                    window.alert("Removed from favourites");
                } else {
                    window.alert("OOPS! Something went wrong!");
                }
            }

        } else { // current character is not a Favourite character hence "Add to favrourites"
            try {
                for (var key in character.data.results) {
                    if (character.data.results[key].id == anchor.dataset.id) {
                        console.log('Add to Favourite Condition :: ', character.data.results[key].id + ' == ' + anchor.dataset.id);
                        console.log(character.data.results[key]);
                        storedCharactersArray.push(character.data.results[key]);
                    }
                }
                // storedCharactersArray.push(character);
                // add to local storage
                localStorage.setItem("characters", JSON.stringify(storedCharactersArray));
                // change icon
                favIcon.remove("fa-regular");
                favIcon.add("fa-solid");
                // alert message
                window.alert("Added to favourites");
            } catch (error) {
                window.alert("OOPS! Something went wrong!");
            }

        }
    }
}

// Check if character is already favourite
function isFavourite(characterId, storedCharactersArray) {
    for (let i = 0; i < storedCharactersArray.length; i++) {
        if (storedCharactersArray[i].id == characterId) {
            // console.log("isFavourite = TRUE");
            return true;
        }
    }
    return false;
}

// Remove character from the favourites
function removeFromFavourite(characterId, storedCharactersArray) {
    for (let i = 0; i < storedCharactersArray.length; i++) {
        // console.log('removeFromFavourite Condition :: ', storedCharactersArray[i].id + ' == ' + characterId);
        // console.log(storedCharactersArray[i].id == characterId);
        if (storedCharactersArray[i].id == characterId) {
            console.log("SPLICING");
            storedCharactersArray.splice(i, 1);
            return true;
        }
    }
    return false;
}


// Front Page Image Card API fetch

// Hulk  
 fetch(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&nameStartsWith=hulk&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
     .then(res => res.json()) // parse response as JSON
     .then(data => {
    //    console.log(data.data.results[1])
       document.querySelector('.hulk').innerHTML = data.data.results[0].name;
       document.querySelector('.hulk-desc').innerHTML = data.data.results[0].description;
       document.querySelector('.hulk-img').src = data.data.results[0].thumbnail.path + ".jpg";
       document.querySelector('.hulk-img').alt = data.data.results[0].name + ".jpg";
     })
     .catch(err => {
         console.log(`error ${err}`)
     });

     document.querySelector('#hulk-href').href = "InfoPage.html?id=1009351";

// Iron Man
fetch(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&nameStartsWith=iron_man&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
     .then(res => res.json()) // parse response as JSON
     .then(data => {
    //    console.log(data.data.results[1])
       document.querySelector('.ironman').innerHTML = data.data.results[0].name;
       document.querySelector('.ironman-desc').innerHTML = data.data.results[0].description;
       document.querySelector('.ironman-img').src = data.data.results[0].thumbnail.path + ".jpg";
       document.querySelector('.ironman-img').alt = data.data.results[0].name + ".jpg";
     })
     .catch(err => {
         console.log(`error ${err}`)
     });

     document.querySelector('#ironman-href').href = "InfoPage.html?id=1009368";

// Captian America
fetch(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&nameStartsWith=captain_america&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
     .then(res => res.json()) // parse response as JSON
     .then(data => {
    //    console.log(data.data.results[1])
       document.querySelector('.captain-america').innerHTML = data.data.results[0].name;
       document.querySelector('.captain-america-desc').innerHTML = data.data.results[0].description;
       document.querySelector('.captain-america-img').src = data.data.results[0].thumbnail.path + ".jpg";
       document.querySelector('.captain-america-img').alt = data.data.results[0].name + ".jpg";
     })
     .catch(err => {
         console.log(`error ${err}`)
     });

     document.querySelector('#captain-america-href').href = "InfoPage.html?id=1009220";

//Thanos
fetch(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&nameStartsWith=thanos&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
     .then(res => res.json()) // parse response as JSON
     .then(data => {
    //    console.log(data.data.results[1])
       document.querySelector('.thanos').innerHTML = data.data.results[0].name;
       document.querySelector('.thanos-desc').innerHTML = data.data.results[0].description;
       document.querySelector('.thanos-img').src = data.data.results[0].thumbnail.path + ".jpg";
       document.querySelector('.thanos-img').alt = data.data.results[0].name + ".jpg";
     })
     .catch(err => {
         console.log(`error ${err}`)
     });

     document.querySelector('#thanos-href').href = "InfoPage.html?id=1009652";

//Daredevil
fetch(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&nameStartsWith=daredevil&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
     .then(res => res.json()) // parse response as JSON
     .then(data => {
    //    console.log(data.data.results[1])
       document.querySelector('.daredevil').innerHTML = data.data.results[0].name;
       document.querySelector('.daredevil-desc').innerHTML = data.data.results[0].description;
       document.querySelector('.daredevil-img').src = data.data.results[0].thumbnail.path + ".jpg";
       document.querySelector('.daredevil-img').alt = data.data.results[0].name + ".jpg";
     })
     .catch(err => {
         console.log(`error ${err}`)
     });

     document.querySelector('#daredevil-href').href = "InfoPage.html?id=1009262";

//Thor
fetch(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&nameStartsWith=thor&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
     .then(res => res.json()) // parse response as JSON
     .then(data => {
    //    console.log(data.data.results[1])
       document.querySelector('.thor').innerHTML = data.data.results[0].name;
       document.querySelector('.thor-desc').innerHTML = data.data.results[0].description;
       document.querySelector('.thor-img').src = data.data.results[0].thumbnail.path + ".jpg";
       document.querySelector('.thor-img').alt = data.data.results[0].name + ".jpg";
     })
     .catch(err => {
         console.log(`error ${err}`)
     });

     document.querySelector('#thor-href').href = "InfoPage.html?id=1009664";
