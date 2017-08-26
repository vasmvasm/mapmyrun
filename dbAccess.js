var User = require('./models/user');

var mongoose = require('mongoose');

var db = mongoose.connection;


db.once('open', function callback () {
	console.log('We have connected to mongodb');
});

mongoose.connect('mongodb://localhost/mapmyrun')

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password!=password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
  console.log("--------serialize--------"+user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("---------to deserialize-------- "+id);
  User.findById(id, function(err, user) {
	console.log("---------deserialize-------- ");
    done(err, user);
  });
});

module.exports = {
	updateUser:function(condition,update){
		
		User.update(condition,update,function(err,rows,raw){
			console.log("Update error--------------->"+err);
			console.log("Rows Updated--------------->"+rows);
			console.log("Raw Value--------------->"+raw);
		});
	},
	getUserInfo:function(condition,callback){
			User.find(condition,callback);
	}
	
};