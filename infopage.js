/**
 * Get the URL parameters
 * source: https://css-tricks.com/snippets/javascript/get-url-variables/
 * @param  {String} url The URL
 * @return {Object}     The URL parameters
 */

function getParams(url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
};

// Get parameters from the current URL
const characterId = getParams(window.location.href).id;
var character;

// retrieve data from local storage
var storedCharactersArray = JSON.parse(localStorage.getItem("characters"));

// Get superhero details
getMarvelResponse(characterId);

// Hit API and Fetch the matching characters
async function getMarvelResponse(id) {
    var PRIV_KEY = "230f014ca05c295137332efffba0e13178e47845";
    var PUBLIC_KEY = "547bfb64e330bb09ecef7649d1682d01";
    var ts = new Date().getTime();
    var hash = CryptoJS.MD5(ts + PRIV_KEY + PUBLIC_KEY).toString();
    // console.log(hash, " ", ts);
    try {
        const response = await fetch(`https://gateway.marvel.com/v1/public/characters?ts=${ts}&id=${id}&limit=6&apikey=${PUBLIC_KEY}&hash=${hash}`)
            .then(response => response.json()) // converting response to json
            .then(
                function (data) {
                    if (data) {
                        character = data;
                        showResults(data);
                        // console.log("marvelresponse", character);
                    } else
                        noResult();
                }
            );
    } catch (err) {
        console.log('Error : ', err);
    }
}

function noResult() {
    document.body.innerHTML = "OOPS! Something went wrong."
    setTimeout(window.location.replace("index.html"), 100000);
}

// Show results
function showResults(Data) {
    // console.log("Inside showResults", Data);
    document.getElementsByClassName('card-title')[0].innerHTML = Data.data.results[0].name;

    heroAvatar = document.getElementsByClassName('card-img')[0];
    heroAvatar.src = Data.data.results[0].thumbnail.path + ".jpg";
    heroAvatar.alt = Data.data.results[0].name + "'s thumbnail";

    document.getElementById('ID').innerHTML = Data.data.results[0].id;
    document.getElementById('Description').innerHTML = Data.data.results[0].description;
    // document.getElementById('modified').innerHTML = Data.data.results[0].modified;

    for (var key in Data.data.results[0].comics.items) {
        document.getElementById('comics').innerHTML += (Number(key)+1) + ":-  " + Data.data.results[0].comics.items[key].name + "<br>";
        // console.log(Data.data.results[0].comics.items[key].name);
    }

    for (var key in Data.data.results[0].events.items) {
        document.getElementById('events').innerHTML += (Number(key)+1) + ":-  " + Data.data.results[0].events.items[key].name + "<br>";
        // console.log(Data.data.results[0].comics.items[key].name);
    }

    for (var key in Data.data.results[0].series.items) {
        document.getElementById('series').innerHTML += (Number(key)+1) + ":-  " + Data.data.results[0].series.items[key].name + "<br>";
        // console.log(Data.data.results[0].comics.items[key].name);
    }

    for (var key in Data.data.results[0].stories.items) {
        document.getElementById('stories').innerHTML += (Number(key)+1) + ":-  " + Data.data.results[0].stories.items[key].name + "<br>";
        // console.log(Data.data.results[0].comics.items[key].name);
    }

    for (var key in Data.data.results[0].urls) {
        document.getElementById('more-info').innerHTML += (Number(key)+1) + ":-  " + Data.data.results[0].urls[key].url + "<br>";
        // console.log(Data.data.results[0].comics.items[key].name);
    }
    initialFavStatus();
}

// Initial favourite status
function initialFavStatus() {
    if (storedCharactersArray == null) {
        return false;
    } else if (storedCharactersArray.length > 0) {
        let favIcon = document.getElementById('fav-btn').firstChild.classList;
        if (isFavourite(character.data.results[0].id, storedCharactersArray)) {
            favIcon.remove('fa-regular');
            favIcon.add('fa-solid');
            // console.log('initialFavStatus inside if');
        }
    }
}

// Toggle favourite
function favourite(anchor) {
    // check browser support for localStorage and sessionStorage
    if (typeof (Storage) == "undefined") {
        window.alert("Sorry! No Web Storage support..");
        return;
    }

    storedCharactersArray = JSON.parse(localStorage.getItem("characters"));
    let favIcon = anchor.firstChild.classList;

    // Handle First favourite character case
    if (storedCharactersArray == null || storedCharactersArray.length == 0) {
        var characters = [];
        characters.push(character.data.results[0]);
        // add to local storage
        localStorage.setItem("characters", JSON.stringify(characters));
        // change icon
        favIcon.remove("fa-regular");
        favIcon.add("fa-solid");
        // alert message
        window.alert(character.data.results[0].name + " is added to favourites.");
    } else {  // handle favourite characters exists
        // check if current character is already favourite
        if (isFavourite(character.data.results[0].id, storedCharactersArray)) {
            // remove from favourites
            if (confirm("Remove " + character.data.results[0].name + " from favourites?")) {
                let isRemoved = removeFromFavourite(character.data.results[0].id, storedCharactersArray);
                if (isRemoved) {
                    localStorage.setItem("characters", JSON.stringify(storedCharactersArray));
                    // change icon
                    favIcon.remove("fa-solid");
                    favIcon.add("fa-regular");
                    // alert message
                    window.alert(character.data.results[0].name + " has been removed from favourites");
                } else {
                    window.alert("OOPS! Something went wrong!");
                }
            }

        } else { // current character is not a Favourite character hence "Add to favrourites"
            try {
                storedCharactersArray.push(character.data.results[0]);
                // add to local storage
                localStorage.setItem("characters", JSON.stringify(storedCharactersArray));
                // change icon
                favIcon.remove("fa-regular");
                favIcon.add("fa-solid");
                // alert message
                window.alert(character.data.results[0].name + " added to favourites");
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
    // console.log("inside Remove Favourite");
    for (let i = 0; i < storedCharactersArray.length; i++) {
        if (storedCharactersArray[i].id == characterId) {
            console.log("SPLICING");
            storedCharactersArray.splice(i, 1);
            return true;
        }
    }
    return false;
}