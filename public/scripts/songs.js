console.log(songs)

var songIndex = 0;

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



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
	} else {
		console.error("The list of songs was not passed to client")
	}
}


var player;

function onPlayerStateChange(state) {
	if (state.data == 0) {
		nextSong();
	}
}

function onPlayerReady() {
	playSong(0)
}

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '216',
		width: '384',
		playerVars: {
		'playsinline': 1
		},
		events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
		}
	});
}