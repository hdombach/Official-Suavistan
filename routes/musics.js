const express = require('express');
const router = express.Router();
const Song = require('../models/song.js')
const Playlist = require('../models/playlist.js')
const User = require('../models/user.js')
const authentication = require('./athentication')
const url = require('url');

//list of all songs 
router.get('/', authentication.check, async (req, res) =>{
	let searchOptions = {}
	if (req.query.name != null && req.query.name != '') {
		searchOptions.name = new RegExp(req.query.name, 'i')
	}
	try {
		const songs = await Song.find(searchOptions).populate('favorites').exec()
		const users = await User.find()
		var playlists;
		await Playlist.find().populate('owner').exec((err, allPlaylists) => {
			if (err) {
				throw err
			}
			playlists = allPlaylists.filter(playlist => playlist.owner.id == req.user.id || playlist.public)
			res.render('musics/index.ejs', {songs: songs, users: users, searchOptions: req.query, playlists: playlists, user: req.user})
		})
	} catch(error) {
		console.log(error)
		res.redirect('/')
	}
})

//list of all songs but ajax
router.get('/search', authentication.check, async (req, res) => {
	var name;
	if (req.query.name != null && req.query.name != '') {
		name = new RegExp(req.query.name, 'i')
	}
	let filters = JSON.parse(req.query.filters)
	var orStatements = []
	var explicit;
	for (const filter of filters) {
		if (filter.type == 'explicit') {
			explicit = true
		} else if (filter.type == 'playlist') {
			orStatements.push({playlists: filter.id})
		} else if (filter.type == 'user') {
			orStatements.push({favorites: filter.id})
		}
	}
	var searchOptions;
	if (orStatements.length > 0) {
		searchOptions = {$or: orStatements}
	} else {
		searchOptions = {}
	}
	if (name) {
		searchOptions.name = name
	}
	if (explicit) {
		searchOptions.explicit = false
	}
	console.log(searchOptions)
	try {
		const songs = await Song.find(searchOptions).populate('favorites').exec()
		const users = await User.find()
		var playlists;
		await Playlist.find().populate('owner').exec((err, allPlaylists) => {
			playlists = allPlaylists.filter(playlist => playlist.owner.id == req.user.id || playlist.public)
			res.render('partials/songs.ejs', {songs: songs, users: users, playlists: playlists, user: req.user, layout: false})
		})
	} catch(error) {
		console.log(error)
		res.redirect('/')
	}
})

//create new song
router.post('/', authentication.check, async (req, res) => {
	const song = new Song({
		name: req.body.name,
		artist: req.body.artist,
		ytLink: req.body.ytLink,
		explicit: Boolean(req.body.explicit),
		colorHue: req.body.colorHue
	})

	try {
		const newSong = await song.save()
		res.redirect('musics')
	} catch (error) {
		console.log(error);
		res.render('musics/new.ejs', {
			song: song,
			errorMessage: 'Error creating song'
		})
	}
})

//new song form
router.get('/new', authentication.check, (req, res) => {
	res.render('musics/new.ejs', {song: new Song() })
})

//show specific song
router.get('/:id', authentication.check, async (req, res) => {
	try {
		const song = await Song.findById(req.params.id).populate('playlists').exec()
		res.render('musics/show.ejs', {song: song})
	} catch (error) {
		console.log(error)
		res.redirect('/')
	}
})

//edit song
router.get('/:id/edit', authentication.check, async (req, res) => {
	try {
		const song = await Song.findById(req.params.id)
		res.render('musics/edit.ejs', {song: song})
	} catch (error) {
		console.log(error)
		res.redirect('/musics')
	}
})

//update song
router.put('/:id', authentication.check, async (req, res) => {
	let song
	try {
		song = await Song.findById(req.params.id)
		song.name = req.body.name
		song.artist = req.body.artist
		song.ytLink = req.body.ytLink
		song.explicit = Boolean(req.body.explicit)
		console.log(req.body.colorhue)
		song.colorHue = req.body.colorHue

		await song.save()
		res.redirect('/musics')

	} catch (error) {
		console.log(error)
		if (song == null) {
			res.redirect('/')
		} else {
			res.render('musics/edit.ejs', {
				song: song,
				errorMessage: 'Error updating song'
			})
		}
	}
})

//favorite of song
router.put('/:id/fav', authentication.check, async (req, res) => {
	let song
	try {
		song = await Song.findById(req.params.id).populate('favorites').exec();
		var isFavorited = false;
		for (const favorite of song.favorites) {
			if (favorite.id == req.user.id) {
				isFavorited = true;
				break;
			}
		}
		if (isFavorited) {
			song.favorites =  song.favorites.filter(favorite => favorite.id != req.user.id)
		} else {
			song.favorites.push(req.user)
		}
		await song.save();
		res.send(!isFavorited);
	} catch (error) {
		console.log(error)
		res.send(error.message)
	}
})

//adds a song to a playlist
router.put('/:id/:aid', authentication.check, async (req, res) => {
	let song
	try {
		song = await Song.findById(req.params.id)
		
		var playlist = await Playlist.findById(req.params.aid).populate('owner').exec()
		if (!(playlist.owner.id == req.user.id || playlist.public)) {
			throw new Error('You cannot add songs to this playlist')
		}

		song.playlists.push(req.params.aid)

		await song.save()

	} catch (error) {
		
		res.redirect('/musics?_e=' + encodeURIComponent(error.message))
		return
	}

	const query = url.parse(req.url, true).query
	if (query.url) {
		res.redirect(query.url)
	} else {
		res.redirect('/musics')	}
})

//removes a song from a playlist
router.delete('/:id/:aid', authentication.check, async (req, res) => {
	let song
	try {
		song = await Song.findById(req.params.id)

		var playlist = await Playlist.findById(req.params.aid).populate('owner').exec()
		if (!(playlist.owner.id == req.user.id || playlist.public)) {
			throw new Error('You cannot remove songs from this playlist')
		}

		while (song.playlists.includes(req.params.aid)) {
			let index = song.playlists.indexOf(req.params.aid)
			song.playlists.splice(index, 1);
		}
		
		await song.save()
		res.redirect('/musics/playlists/' + req.params.aid)
	} catch (error) {
		res.redirect('/musics?_e=' + encodeURIComponent(error.message))
		return
	}
})

//delete song
router.delete('/:id', authentication.check, async (req, res) => {
	let song 
	try {
		song = await Song.findById(req.params.id)
		await song.remove()
		res.redirect('/musics')
	} catch (error) {
		console.log(error)
		if (song == null) {
			res.redirect('/')
		} else {
			res.redirect(`/musics/${song.id}`)
		}
	}
})

module.exports = router