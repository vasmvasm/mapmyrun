
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');
  var ejs = require('ejs');
  var request = require("request");
  var cookie = require('cookie');
  
  var cookieParser = require('cookie-parser');
  var faviconExpress = require("serve-favicon");
  var sessionExpress = require("cookie-session");
  var loggerExpress = require("morgan");
  var bodyParserExpress = require("body-parser");
  var methodOverrideExpress = require("method-override");
  var staticExpress = require("serve-static");
  var Sort = require("node-sort");
  var compress = require('compression')();
  var sort = new Sort();
  
  
  
    var connect = require('connect');

var app = express();

var fitbit_api = require('./fitbit.js');

var passport = require('passport');

var dbAccess = require('./dbAccess');

var flash = require('connect-flash');

var cookieMap = {};


//app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.engine('html',ejs.renderFile);
  app.set('view engine','html');
  app.use(cookieParser());
  app.use(sessionExpress({secret: '1234567890'}));

  // app.use(faviconExpress());
  app.use(loggerExpress('dev'));
  app.use(bodyParserExpress());
  app.use(methodOverrideExpress());
    app.use(flash());
  app.use(passport.initialize());
   app.use(passport.session()); 
   app.use(compress);
  app.use(staticExpress(path.join(__dirname, 'public')));

  //});

// app.configure('development', function(){
//   app.use(express.errorHandler());
// });



app.post('/authenticate',passport.authenticate('local', { 
	  								successRedirect: '/successRedirect',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

app.post('/user-service',
  passport.authenticate('local'),
  function(req, res) {

    res.write(JSON.stringify({success:true}));
	res.end();
  });


app.get('/successRedirect',function(req,res){
	if(req.user==null){
		res.redirect('/login');
	}
	res.redirect('/map');	
});


app.get('/mapmyrun/index.html',function(req,res){
	console.log("in nodejs");
	if(req.user==null){
		res.redirect('/mapmyrun/login.html');
	}
	res.render('index');	
});

app.get('/pre-processor',function(req,res){
	if(req.user==null){
		res.redirect('/login');
	}
	if(req.user.oauth.length>0){
		var oauth = req.user.oauth[0];
		var user_info_params = fitbit_api.get_api_request('userInfo');
		user_info_params.oauth = oauth.toJSON();
		user_info_params.json = true;
		request.post(user_info_params,function(e, r, body){
			console.log(req.user.username);
			dbAccess.updateUser({username:req.user.username},{$set:{avatar:body.user.avatar}});
			res.redirect('/home/2014-01-01');	
		});
	}else {
		res.redirect('/map');
	}

});

app.get('/login', function(req,res){
	if(req.user&&req.user.username){
	  	res.writeHead(303, { 'location': '/home/2014-01-01'});
	  	res.end();
	}else{
	
		var err_message = req.flash('error')[0];
		if(err_message==undefined){
			err_message = "";
		}
		res.render('login-old',{message:err_message});	
	}
});

app.get('/', function(req,res){
	res.redirect('/map');
});

app.get('/map', function(req,res){
	if(req.user==null){
		res.redirect('/login');
	}
	
	if(req.user.oauth!=null&&req.user.oauth.length>0){
	  	res.writeHead(303, { 'location': '/pre-processor'});
	  	res.end();
	}else{
		console.log("Request Token");
		var api_credentials = fitbit_api.get_api_credentials();
		var	temp_oauth = { 
				consumer_key: api_credentials.consumer_key,
				consumer_secret: api_credentials.consumer_secret,
				callback:'http://localhost:3000/callback'
			};

		req.session.temp_oauth = temp_oauth;
			
		var request_token_params = fitbit_api.get_api_request('request_token');
		
		request_token_params.oauth= temp_oauth;
		request.post(request_token_params,function(e, r, body){
			var params = fitbit_api.extractParameters(body);
			req.session.temp_oauth['token_secret'] = params['token_secret'];
    	  	var authorizeURL = fitbit_api.get_api_request("authenticate").url+body;
			
		  	res.writeHead(303, { 'location': authorizeURL});
		  	res.end();
		});	
	}
});

app.get('/callback', function(req,res){
	
	var temp_oauth = req.session.temp_oauth;
	temp_oauth['token'] = req.query.oauth_token;
	temp_oauth['verifier'] = req.query.oauth_verifier;	
	console.log("token: "+req.query.oauth_token);
	console.log("verifier: "+req.query.oauth_verifier);
	var access_token_params = fitbit_api.get_api_request('access_token');
	access_token_params.oauth= temp_oauth;
	
	request.post(access_token_params,function(e, r, body){
		var oauth = fitbit_api.build_oauth(body);
		req.session.oauth = oauth;
		dbAccess.updateUser({username:req.user.username},{$set:{oauth:oauth}});
	  	res.writeHead(303, { 'location': '/map'});
	  	res.end();
	})
});



app.get('/home/:date',function(req,res){
	//  res.render('login',{distance:200});

	if(req.user==null){
		res.redirect('/login');
	}
	
	if(req.user.oauth.length>0){
			res.render('loadMap',{date:req.params.date});
	}
	else{
 		 res.redirect('/map');
	}

});

app.get('/user-data/:date',function(req,res){
	//  res.render('login',{distance:200});
	
	var friends_distance = [];
	
	function calculateDistance(e, r, body){
		var activity_array = body['activities-distance'];
		var totalDistance = 0;
		if(activity_array!=null&&activity_array.length>0){
			activity_array.forEach(function(distance){
				totalDistance += parseFloat(distance.value);
			});
			totalDistance = Math.round(totalDistance*10)/10;
			console.log(totalDistance);
			var friend_obj = {
				username:r.request.info.username,
				distance:totalDistance,
				avatar: r.request.info.avatar
			};
			friends_distance.push(friend_obj);
    	}
		if(friends_distance.length==(req.user.friends.length+1)){
			sort.insertionSort(friends_distance,function(a,b){
				if (a.distance < b.distance) return 1;
				if (a.distance > b.distance) return -1;
				return 0;
			});
			res.write(JSON.stringify(friends_distance));
			res.end();
		}
	}
	
	if(req.user==null){
		res.redirect('/login');
	}
	
	if(req.user.oauth.length>0){
 		var oauth = req.user.oauth[0];
		
		var param = fitbit_api.get_api_request('distance');
		
		request.get({
			url:param.url +req.params.date+'/today.json',
			oauth: oauth.toJSON(),
			info:{username:req.user.username,
   				  avatar:req.user.avatar},
			json:true
		},calculateDistance);
		
		var friends = req.user.friends;
		
		for(var friend_ctr=0;friend_ctr<friends.length;friend_ctr++){
			dbAccess.getUserInfo({username:friends[friend_ctr]},function(err,docs,x){
				if(docs.length>0&&docs[0].oauth.length>0){
					request.get({
						url:param.url +req.params.date+'/today.json',
						oauth: docs[0].oauth[0].toJSON(),
						info: {
							username:docs[0].username,
							avatar:docs[0].avatar
						},
						json:true
					},calculateDistance);
				}else{
					req.user.friends.splice(req.user.friends.indexOf(docs[0].username),1);
					console.log(req.user.friends);
					calculateDistance(null,null,{});
				}
			})
		}
	}
	else{
 		 res.redirect('/map');
	}

});


app.post('/getUserInfo',function(req,res){
	//  res.render('login',{distance:200});
	if(req.user==null){
		res.redirect('/login');
	}
		
	
	if(req.user.oauth.length>0){
 		var oauth = req.user.oauth[0];		
		res.write(JSON.stringify({
			username:req.user.username,
			avatar: req.user.avatar
		}));
		res.end();
	}
	else{
 		 res.redirect('/map');
	}

});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
