var filterContainer = document.getElementById('filterContainer')
var filters = [];
function addFilter(type, name, id) {
	if (!filters.some(filter => filter.id == id)) {
		var thing = {type: type, name: name, id: id}
		thing.element = createView(thing)
		filters.push(thing)
	}
}

function removeFilter(id) {
	let index = filters.findIndex(filter => filter.id == id)
	if (index > -1) {
		let filter = filters.splice(index, 1)[0];
		console.log(filter)
		filterContainer.removeChild(filter.element)
	}
}

function createView(filter) {
	let view = document.createElement('span')
	view.className = 'filter'
	view.innerText = filter.name
	
	let button = document.createElement('button')
	button.className="btn btn-min"
	button.innerHTML='<span class="material-icons">close</span>'
	button.onclick = function() {
		removeFilter(filter.id)
	}

	view.appendChild(button)
	filterContainer.appendChild(view)
	return view
}