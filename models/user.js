var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passport = require('passport');


var userSchema = mongoose.Schema({
	username:String,
	password:String,
	oauth:[
	{
		token:String,
		token_secret:String,
		encoded_user_id:String,
		consumer_key:String,
		consumer_secret:String
	
	}],
	friends:[String],
	avatar:String
	
});

module.exports = mongoose.model('users', userSchema);