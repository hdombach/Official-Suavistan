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
}
});
//console.log(new Error().stack)
const User= mongoose.model('user',UserSchema);
module.exports = User;