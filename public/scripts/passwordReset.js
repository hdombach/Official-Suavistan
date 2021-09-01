function requestReset() {
	var xhttp = new XMLHttpRequest();
	var fd = new FormData(document.getElementById('passwordResetForm'))
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById('result').innerHTML = this.response
		}
	}
	console.log('hi', `/passwordReset?${new URLSearchParams(fd).toString()}`)
	xhttp.open('POST', `/passwordReset?${new URLSearchParams(fd).toString()}`, true)
	xhttp.send()
	return false
}