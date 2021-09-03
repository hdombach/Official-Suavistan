
var songIndex = 0;

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


let toggleIcon = document.getElementById('toggleIcon')
function toggleSong() {
	let state = player.getPlayerState()
	if (state == 1) {
		player.pauseVideo()
	} else if (state == 2) {
		player.playVideo()
	}
}

function previousSong() {
	//if it is now yet 2 seconds then goto previous song else reset
	if (isShuffled) {
		playSong(previousRandomSong())
		return;
	}
	if (player.getCurrentTime() > 5) {
		playSong(songIndex);
	} else {
		songIndex--;
		if (0 > songIndex) {
			songIndex = songs.length - 1;
		}
		playSong(songIndex);
	}
}

function nextSong() {
	if (isShuffled) {
		playSong(randomSongIndex())
		return;
	}
	songIndex++;
	if (songIndex >= songs.length) {
		songIndex = 0;
	}
	playSong(songIndex);
}

var lastSongIndex;

function playSong(index) {
	let tableBody = document.getElementById('songTableBody')
	if (lastSongIndex != undefined) {
		tableBody.children[lastSongIndex].classList.remove('highlighted')
	}
	songIndex = index;
	lastSongIndex = index;
	tableBody.children[lastSongIndex].classList.add('highlighted')

	//console.log(colorHues, songs)
	if (songs) {
		function youtube_parser(url){
			var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
			var match = url.match(regExp);
			return (match&&match[7].length==11)? match[7] : false;
		}

		player.loadVideoById(youtube_parser(songs[index]), 0)
		updateColor(colorHues[index])
	} else {
		console.error("The list of songs was not passed to client")
	}
}


var player;

function onPlayerStateChange(state) {
	if (state.data == 0) {
		nextSong();
	} else if (state.data == 1) {
		toggleIcon.innerHTML = 'pause_circle'
	} else if (state.data == 2) {
		toggleIcon.innerHTML = 'play_circle'
	}
}

function onPlayerReady() {
	//playSong(0)
}

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '200',
		width: '324',
		playerVars: {
		'playsinline': 1
		},
		events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
		}
	});
}


let toggle = document.getElementById('viewerToggle');
toggle.addEventListener('click', function() {
	document.getElementById('player').classList.toggle('hidden');
	let icon = toggle.children[0].innerHTML
	if (icon == 'expand_less') {
		toggle.children[0].innerHTML = 'expand_more';
	} else {
		toggle.children[0].innerHTML = 'expand_less';
	}
});

var isShuffled = false;
let shuffle = document.getElementById('shuffleToggle')
shuffle.addEventListener('click', function() {
	let icon = shuffle.children[0].innerHTML
	console.log(icon)
	if (icon == 'shuffle') {
		shuffle.children[0].innerHTML = 'shuffle_on';
		isShuffled = true;
	} else {
		shuffle.children[0].innerHTML = 'shuffle';
		isShuffled = false;
	}
});


var shuffleHistory = [];


function randomSongIndex() {
	if (shuffleHistory.length == songs.length) {
		let index = shuffleHistory.shift()
		shuffleHistory.push(index)
		return index
	} else {
		var index;
		do {
			index = Math.floor(Math.random() * songs.length);
		} while (shuffleHistory.includes(index))
		shuffleHistory.push(index)
		return index;
	}
}

function previousRandomSong() {
	if (shuffleHistory.length > 0) {
		return shuffleHistory.pop()
	} else {
		return Math.floor(Math.random() * songs.length);
	}
}