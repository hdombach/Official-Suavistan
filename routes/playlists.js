const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist.js');
const Song = require('../models/song.js')

//list all playlists owned by user
router.get('/', async (req, res) => {
	try {
		const playlists = await Playlist.find({owner: req.user.id})
		res.render('musics/playlists/index.ejs', {playlists: playlists})
	} catch(error) {			
		res.redirect('/')
	}	
})
//create playlist
router.post('/', async (req, res) => {
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



//new book form
router.get('/new', (req, res) => {
	res.render('musics/playlists/new.ejs', {playlist: new Playlist() })	
})

//show specific playlist
router.get('/:id', async (req, res) => {
	try {
		const playlists = await Playlist.find()
		const playlist = await Playlist.findById(req.params.id)
		const songs = await Song.find({playlists: req.params.id})
		res.render('musics/playlists/show.ejs', {playlist: playlist, songs: songs, playlists: playlists})
	} catch (error) {
		console.log(error)
		res.redirect('/');
	}
})

//edit playlist
router.get('/:id/edit', async (req, res) => {
	try {
		const playlist = await Playlist.findById(req.params.id)
		res.render('musics/playlists/edit.ejs', {playlist: playlist})
	} catch (error) {
		console.log(error)
		res.redirect('/musics/playlists')
	}
})

//update playlist
router.put('/:id', async (req, res) => {
	let playlist
	try {
		playlist = await Playlist.findById(req.params.id)
		playlist.name = req.body.name
		playlist.description = req.body.description

		await playlist.save()
		res.redirect(`/musics/playlists/${playlist.id}`)
	} catch {
		if (playlist == null) {
			//playlist does not exist in database
			res.redirect('/')
		} else {
			res.render('musics/playlists/edit.ejs', {
				playlist: playlist,
				errorMessage: 'Error updating playlist'
			})
		}
	}
})

//delete playlist
router.delete('/:id', async (req, res) => {
	let playlist
	try {
		playlist = await Playlist.findById(req.params.id)
		await playlist.remove()
		res.redirect('/musics/playlists')
	} catch {
		if (playlist == null) {
			res.redirect('/')
		} else {
			///maybe show warning that have to have no songs
			res.redirect(`/musics/playlists/${playlist.id}`)
		}
	}
})


module.exports = router