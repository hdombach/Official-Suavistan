const mongoose = require('mongoose')
const Song = require('./song.js')

const playlistSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},

	description: {
		type: String
	},

	owner: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true,
		ref: 'User'
	},

	
	dateCreated :{
		type : Date,
		default : Date.now
	}
})

playlistSchema.pre('remove', function(next) {
	Song.find({playlists: this.id}, (err, books) => {
		if (err) {
			next(err)
		} else if (books.length > 0) {
			next(new Error('This playlist still has songs in it'))
		} else {
			next()
		}
	})
})

module.exports = mongoose.model('Playlist', playlistSchema)