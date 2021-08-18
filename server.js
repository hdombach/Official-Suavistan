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
app.use(require('express-session')({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session())
app.use(methodOverride('_method'))

const expressLayouts = require('express-ejs-layouts')
app.set('layout', 'layouts/layout.ejs')
app.use(expressLayouts)
app.use(express.static('public'))

const flash = require('express-flash');
require('./passportConfig')(passport);
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection;
db.on('error', error => {
	console.log('error: ');
	 console.log(error)
});
db.once('open', () => console.log('connected to mongoose'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))



app.engine('html', require('ejs').renderFile);
app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}));
app.use(flash())

app.use('/musics/playlists', require('./routes/playlists'))
app.use('/musics', require('./routes/musics'))
app.use('/',require('./routes/index'));


app.listen(3000);