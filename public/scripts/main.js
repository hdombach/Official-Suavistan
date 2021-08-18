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