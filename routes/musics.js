const express = require('express');
const router = express.Router();
const Song = require('../models/song.js')
const Playlist = require('../models/playlist.js')

//list of all songs 
router.get('/', async (req, res) =>{
	let searchOptions = {}
	if (req.query.name != null && req.query.name != '') {
		searchOptions.name = new RegExp(req.query.name, 'i')
	}
	try {
		const songs = await Song.find(searchOptions)
		const playlists = await Playlist.find()
		res.render('musics/index.ejs', {songs: songs, searchOptions: req.query, playlists: playlists})
	} catch(error) {
		res.redirect('/')
	}
})

//create new song
router.post('/', async (req, res) => {
	const song = new Song({
		name: req.body.name,
		artist: req.body.artist,
		ytLink: req.body.ytLink
	})

	try {
		const newSong = await song.save()
		res.redirect('musics')
	} catch (error) {
		console.log(error);
		res.render('musics/new', {
			song: song,
			errorMessage: 'Error creating song'
		})
	}
})

//new song form
router.get('/new', (req, res) => {
	res.render('musics/new.ejs', {song: new Song() })
})

//show specific song
router.get('/:id', async (req, res) => {
	try {
		const song = await Song.findById(req.params.id).populate('playlists').exec()
		res.render('musics/show.ejs', {song: song})
	} catch (error) {
		console.log(error)
		res.redirect('/')
	}
})

//edit song
router.get('/:id/edit', async (req, res) => {
	try {
		const song = await Song.findById(req.params.id)
		res.render('musics/edit.ejs', {song: song})
	} catch (error) {
		console.log(error)
		res.redirect('/musics')
	}
})

//update song
router.put('/:id', async (req, res) => {
	let song
	try {
		song = await Song.findById(req.params.id)
		song.name = req.body.name
		song.artist = req.body.artist
		song.ytLink = req.body.ytLink

		await song.save()
		res.redirect(`/musics/${song.id}`)

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

//adds a song to a playlist
router.put('/:id/:aid', async (req, res) => {
	let song
	try {
		song = await Song.findById(req.params.id)
		
		await Playlist.findById(req.params.id)

		song.playlists.push(req.params.aid)

		await song.save()

	} catch (error) {
		
	}
	res.redirect('/musics')
})

//delete song
router.delete('/:id', async (req, res) => {
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