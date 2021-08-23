const mongoose = require('mongoose');
const UserSchema  = new mongoose.Schema({
  name :{
      type  : String,
      required : true
  } ,
  email :{
    type  : String,
    required : true
    } ,
    password :{
        type  : String,
        required : true
    } ,
    dateCreated :{
        type : Date,
        default : Date.now
    },
    colorHue: {
        type: Number,
        default: Math.random() * 359
    }
});
//console.log(new Error().stack)
const User= mongoose.model('User',UserSchema);
module.exports = User;