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
			document.getElementById('songsContainer').innerHTML = this.response
		}
	}
	xhttp.open('GET', `/musics/search?${new URLSearchParams(fd).toString()}&filters=${encodeURIComponent(JSON.stringify(filters))}`, true);
	xhttp.send()
	return false;
}

