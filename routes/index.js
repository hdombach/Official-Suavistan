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
	res.render('login.ejs', {hide_nav: true});
})

router.post('/login', authentication.checkNot, passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}))

router.get('/register', authentication.checkNot, (req, res) => {
	res.render('register.ejs', {hide_nav: true});
})

router.post('/register', authentication.checkNot, async (req, res) => {
	try {
		if (req.body.password != req.body.password_confirmation) {
			throw new Error("Password not the same")
		}
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
					res.redirect('/login', {hide_nav: true});
				}).catch(value=> console.log(value));
			}
		})
	} catch (error) {
		//error
		console.log(error);
	}
})

router.get('/account', authentication.check, (req, res) => {
	res.render('account.ejs', {user: req.user});
})

router.get('/account/edit', authentication.check, (req, res) => {
	res.render('accountEdit.ejs', {user: req.user});
})

//update account settings
router.put('/account', authentication.check, async (req, res) => {
	try {
		let user = req.user;
		user.name = req.body.name
		user.email = req.body.email
		user.colorHue = req.body.colorHue
		
		await user.save()
		res.redirect('/account')
	} catch (error) {
		console.log(error)
	}
})

router.delete('/logout', (req, res) => {
	req.logout();
	res.redirect('/login');
})

module.exports = router