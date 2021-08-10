function playSong(link) {
	function youtube_parser(url){
		var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
		var match = url.match(regExp);
		return (match&&match[7].length==11)? match[7] : false;
	}

	const special = document.getElementById('ytFrame')

	special.src="https://www.youtube.com/embed/" + youtube_parser(link) + "?autoplay=1"
}