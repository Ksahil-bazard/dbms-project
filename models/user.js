const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const passportLocalMogoose=require('passport-local-mongoose');

const UserSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});
UserSchema.plugin(passportLocalMogoose);
module.exports=mongoose.model('User',UserSchema);