function solo(event, f) {
	event.preventDefault();
	if (!event.defaultPrevented && f) {
		f();
	}
}