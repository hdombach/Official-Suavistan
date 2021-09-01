if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}


//starting mongodb
//mongod --dbpath data/db
//in new tab: mongo

console.log('start server')

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts')
const flash = require('express-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const https = require('http')
const url = require('url');

app.use(require('express-session')({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session())
app.use(methodOverride('_method'))

app.set('layout', 'layouts/layout.ejs')
app.use(expressLayouts)
app.use(express.static('public'))

require('./passportConfig')(passport);
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection;
db.on('error', error => {
	console.log('error: ');
	 console.log(error)
});
db.once('open', () => console.log('connected to mongoose'));

app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))



app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}));
app.use(flash())

app.use(function (req, res, next) {
	if (req.user && req.user.colorHue) {
		res.locals = {userColorHue: req.user.colorHue}
	} else {
		res.locals = {userColorHue: 200}
	}
	const query = url.parse(req.url, true).query
	if (query._e) {
		res.locals.errorMessage = query._e;
	}
	res.locals.parentPlaylist = false;
	next();
})

app.use('/musics/playlists', require('./routes/playlists'))
app.use('/musics', require('./routes/musics'))
app.use('/',require('./routes/index'));

const httpsServer = https.createServer(app)
app.listen(3000);