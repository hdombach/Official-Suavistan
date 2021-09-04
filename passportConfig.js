
const User = require('./models/user');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function(passport){
    passport.use(
		new LocalStrategy({usernameField: 'email'}, (email,password,done)=>{
            //match user
            User.findOne({email: { $regex: new RegExp(email, "i") }})
            .then((user)=>{
                if(!user){
                    return done(null,false,{message:'Password or email is incorrect.'});
                }
                //math passwords
                bcrypt.compare(password, user.password,(err,isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        console.log(`${user.name} has logged in.`)
                        return done(null,user);
                    } else{
                        return done(null,false,{message: 'Password or email is incorrect.'});
                    }
                })
                if (!user.verified) {
                    //return done(null, false, {message: 'Check your email to verify your account.'});
                }
            })
            .catch((err)=>{console.log(err); return done(err)})
        })
    )
    passport.serializeUser(function(user,done) {
        done(null,user.id);
    })
    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user);
        })
    })
}