//start server: npm run devStart

const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const User = require('../models/user.js')
const passport = require('passport');
const authentication = require('./athentication')


router.get('/', authentication.check, (req, res) => {
	res.render('index.ejs', {name: req.user.name});
})

router.get('/login', authentication.checkNot, (req, res) => {
	res.render('login.ejs');
})

router.post('/login', authentication.checkNot, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}))

router.get('/register', authentication.checkNot, (req, res) => {
	res.render('register.ejs');
})

router.post('/register', authentication.checkNot, async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		User.findOne({email: req.body.email}).exec((err, user)=> {
			if (user) {
				//error user already created

			} else {
				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					password: hashedPassword
				});
				newUser.save().then((value) => {
					res.redirect('/login');
				}).catch(value=> console.log(value));
			}
		})
	} catch (error) {
		//error
		console.log(error);
	}
})

router.delete('/logout', (req, res) => {
	req.logout();
	res.redirect('/login');
})

module.exports = router