var songs;
var colorHues;

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
	songIndex++;
	if (songIndex >= songs.length) {
		songIndex = 0;
	}
	playSong(songIndex);
}

function playSong(index) {
	songIndex = index;
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