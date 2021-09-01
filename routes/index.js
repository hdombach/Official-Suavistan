//start server: npm run devStart

const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const User = require('../models/user.js')
const passport = require('passport');
const authentication = require('./athentication')
const mailing = require('./mailing.js');
const { response } = require('express');
const mongoose = require('mongoose');
const { render } = require('ejs');

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
	if (process.env.ALLOW_JOINING == 'true') {
		res.render('register.ejs', {hide_nav: true});
	} else {
		res.redirect('/login?_e=' + encodeURIComponent('Registeration has been disabled'))
	}
})

//new user
router.post('/register', authentication.checkNot, async (req, res) => {
	try {
		if (!process.env.ALLOW_JOINING) {
			throw new Error('Registeration has been disabled')
		}
		if (req.body.password != req.body.password_confirmation) {
			throw new Error("Password not the same")
		}
		const hashedPassword = await bcrypt.hash(req.body.password, 10)

		const user = await User.findOne({email: {$regex: new RegExp(req.body.email, "i")}}).exec()
		if (user) {
			//error user already created
			throw new Error("User with same email was already created")
		} else { 
			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				password: hashedPassword
			});
			newUser.save().then((value) => {
				
				res.render('email.ejs', {user: newUser, url: `${req.hostname}/account/verify/${newUser.id}/${newUser.verificationKey}`}, (err, html) => {
					mailing.sendEmail(newUser.email, 'Verify you account',html);
				})

				res.redirect('/login');
			}).catch(value=> console.log(value));
		}

	} catch (error) {
		res.redirect('/register?_e=' + encodeURIComponent(error.message));
	}
})

router.get('/account', authentication.check, (req, res) => {
	res.render('account.ejs', {user: req.user});
})

router.get('/account/email', (req, res) => {
	res.render('email.ejs', {user: req.user, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"})
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
router.get('/account/verify', authentication.check, async (req, res) => {
	res.render('verify.ejs')
})
router.get('/account/verify/resend', authentication.check, async (req, res) => {
	res.render('emails/verify.ejs', {user: req.user, url: `${req.hostname}/account/verify/${req.user.id}/${req.user.verificationKey}`, layout: 'layouts/blank.ejs'}, (err, html) => {
		if (err) {
			console.log(err)
		} else {
			mailing.sendEmail(req.user.email, 'Verify your account', html);
		}
	})
	res.redirect('/account/verify')
})

//should be put but forms don't work in emails so...
router.get('/account/verify/:id/:vid', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		if (user.verificationKey == req.params.vid) {
			user.verified = true
			await user.save()
		}
	} catch (error) {
	}
	res.redirect('/')
})


//reseting password

//show reset form
router.get('/passwordReset', (req, res) => {
	res.render('passwordReset/form.ejs')
})

//submit password reset form
router.post('/passwordReset', async (req, res) => {
	try {
		let user = await User.findOne({email: {$regex: new RegExp(req.query.email, "i")}}).exec()
		user.passwordReset.key = mongoose.Types.ObjectId();
		user.passwordReset.date = Date.now()

		await user.save()

		res.render('emails/resetPassword.ejs', {user: user, url: `${req.hostname}/passwordReset/${user.id}/${user.passwordReset.key}`, layout: 'layouts/blank.ejs'}, (err, html) => {
			if (err) {
				console.log(err)
			} else {
				mailing.sendEmail(user.email, 'Reset your password', html);
				res.send('Check your email for a link to reset your password')
			}
		})
	} catch(error) {
		res.send('No user with your email has been created')
	}
})

//allow chance to include new password
router.get('/passwordReset/:id/:rid', async (req, res) => {
	var user;
	try {
		user = await User.findById(req.params.id)
		if (req.params.rid != user.passwordReset.key) {
			throw new Error('No password reset avaliable')
		}
		//elapse time is one hour
		if (1000 * 60 * 60 < Date.now() - user.passwordReset.date) {
			throw new Error('Password reset timeout')
		}
		res.render('passwordReset/new.ejs', {user: user, url: req.originalUrl})
	} catch (error) {
		if (!user) {
			error.message = 'Could not find user'
		}
		res.redirect(`/login?_e=${encodeURIComponent(error.message)}`)
	}
})

router.put('/passwordReset/:id/:rid', async (req, res) => {
	var user;
	try {
		user = await User.findById(req.params.id)
		if (req.params.rid != user.passwordReset.key) {
			throw new Error('No password reset avaliable')
		}

		if (1000 * 60 * 60 < Date.now() - user.passwordReset.date) {
			throw new Error('Password reset timeout')
		}

		if (req.body.password != req.body.passwordConfirmation) {
			throw new Error('Password not the same')
		}

		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		user.password = hashedPassword
		await user.save()

		res.redirect('/login')

	} catch (error) {
		if (!user) {
			error.message = 'could not find user'
		}
		res.redirect(`/login?_e=${encodeURIComponent(error.message)}`)
	}
})

router.delete('/logout', (req, res) => {
	req.logout();
	res.redirect('/login');
})

module.exports = router