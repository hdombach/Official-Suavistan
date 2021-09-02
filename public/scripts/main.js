function solo(event, f) {
	event.preventDefault();
	if (!event.defaultPrevented && f) {
		f();
	}
}

function updateColor(hue) {
	let root = document.documentElement

	root.style.setProperty('--color-highlight', hue)
}

/*function unpackFavourites(favorites, user) {
	var result = {hues: [], isFavorited: false}
	for (const favorite of favorites) {
		if (favorites.id == user.id) {
			result.isFavorited = true
		} else {
			result.hues.push(favorites.colorHue)
		}
	}
}*/

function toggleFavorite(id, sender, hue) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			if (this.response == 'true') {
				sender.children[0].style = `color: hsl(${hue}, 100%, 50%);`;
			} else {
				sender.children[0].style = "";
			}
		}
	}
	xhttp.open('PUT', `/musics/${id}/fav`, true);
	xhttp.send();
}

function search(event) {
	var xhttp = new XMLHttpRequest();
	var fd = new FormData(document.getElementById('searchForm'));
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let container = document.getElementById('songsContainer')
			container.innerHTML = this.response
			runScripts(container)
		}
	}
	xhttp.open('GET', `/musics/search?${new URLSearchParams(fd).toString()}&filters=${encodeURIComponent(JSON.stringify(filters))}`, true);
	xhttp.send()
	return false;
}

var songs;
var colorHues;

function loadSongs(songsIn, hues) {
	songs = songsIn
	colorHues = hues
}

function runScripts(element) {
	var arr = element.getElementsByTagName('script')
	for (var n = 0; n < arr.length; n++) {
		eval(arr[n].innerHTML)
	}
}