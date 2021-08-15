const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	artist: {
		type: String,
		required: true
	},
	ytLink: {
		type: String,
		required: true
	},
	favourites: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true,
		ref: 'User',
		default: []
	},
	playlists: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true,
		ref: 'Playlist',
		default: []
	},
	dateCreated :{
		type : Date,
		default : Date.now
	},
	explicit :{
		type: Boolean,
		defualt: false
	}
})


module.exports = mongoose.model('Song', songSchema)