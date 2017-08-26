var User = require('./models/user');

var mongoose = require('mongoose');

var db = mongoose.connection;


db.once('open', function callback () {
	console.log('We have connected to mongodb');
});

mongoose.connect('mongodb://localhost/mapmyrun')