const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist.js');
const Song = require('../models/song.js')
const User = require('../models/user.js')
const authentication = require('./athentication')

//list all playlists owned by user
router.get('/', authentication.check, async (req, res) => {
	try {
		const playlists = await Playlist.find().populate('owner').exec();
		res.render('musics/playlists/index.ejs', {playlists: playlists, user: req.user})
	} catch(error) {a
		console.log(error)			
		res.redirect('/')
	}	
})
//create playlist
router.post('/', authentication.check, async (req, res) => {
	const playlist = new Playlist({
		name: req.body.name,
		description: req.body.description,
		owner: req.user.id
	})

	try {
		const newPlaylist = await playlist.save()
		res.redirect('/musics/playlists')
	} catch (error) {
		console.log(error);
		res.render('/musics/playlists/new', {
			playlist: playlist,
			errorMessage: 'Error creating playlist'
		})

	}
})



//new playlist form
router.get('/new', authentication.check, (req, res) => {
	res.render('musics/playlists/new.ejs', {playlist: new Playlist() })	
})

//show specific playlist
router.get('/:id', authentication.check, async (req, res) => {
	let searchOptions = {}
	if (req.query.name != null && req.query.name != '') {
		searchOptions.name = new RegExp(req.query.name, 'i')
	}

	try {
		await Playlist.find().populate('owner').exec(async (err, allPlaylists) => {
			playlists = allPlaylists.filter(playlist => playlist.owner.id == req.user.id || playlist.public)
			
			const playlist = await Playlist.findById(req.params.id).populate('owner').exec()
			const songs = await Song.find({playlists: req.params.id}).populate('favorites').collation({'locale':'en'}).sort('name').exec()
			var searchedSongs = []
			if (searchOptions.name) {
				let name = req.query.name.toLowerCase()
				if (name == 'all' || name == 'everything') {
					searchedSongs = await Song.find()
				} else {
					searchedSongs = await Song.find(searchOptions)
				}
			}
			res.render('musics/playlists/show.ejs', {playlist: playlist, songs: songs, playlists: playlists, searchOptions: req.query, searchedSongs: searchedSongs, user: req.user})
		})

	} catch (error) {
		console.log(error)
		res.redirect('/');
	}
})

//edit playlist
router.get('/:id/edit', authentication.check, async (req, res) => {
	try {
		const playlist = await Playlist.findById(req.params.id).populate('owner').exec()
		if (playlist.owner.id != req.user.id) {
			throw new Error("You do not own this playlist")
		}
		res.render('musics/playlists/edit.ejs', {playlist: playlist})
	} catch (error) {
		res.redirect('/musics/playlists?_e=' + encodeURIComponent(error.message))
	}
})

//update playlist
router.put('/:id', authentication.check, async (req, res) => {
	let playlist
	try {
		playlist = await Playlist.findById(req.params.id).populate('owner').exec()

		if (playlist.owner.id != req.user.id) {
			res.locals = {errorMessage: "You do no own this playlist"}
			throw new Error()
		}

		playlist.name = req.body.name
		playlist.description = req.body.description
		playlist.public = Boolean(req.body.public)

		await playlist.save()
		res.redirect(`/musics/playlists/${playlist.id}`)
	} catch (error) {
		if (playlist == null) {
			//playlist does not exist in database
			res.redirect('/')
		} else {
			res.render('musics/playlists/edit.ejs', {
				playlist: playlist,
				errorMessage: error.message
			})
		}
	}
})

//delete playlist
router.delete('/:id', authentication.check, async (req, res) => {
	let playlist
	var isOwner = true;
	try {
		playlist = await Playlist.findById(req.params.id).populate('owner').exec()

		if (req.user.id != playlist.owner.id) {
			ifOwner = false;
		}
		await playlist.remove()
		res.redirect('/musics/playlists')
	} catch {
		if (playlist == null) {
			res.redirect('/')
		} else {
			var message = "";
			if (isOwner) {
				message = "You have to remove all songs before deleting playlist"
			} else {
				message = "You do not own this playlist"
			}
			res.redirect(`/musics/playlists/${playlist.id}?_e=${encodeURIComponent(message)}`)
		}
	}
})


module.exports = router