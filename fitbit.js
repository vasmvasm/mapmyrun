var fitbit_api = {
	api:{
		request_token:'https://www.fitbit.com/oauth/request_token?',
		authenticate:'https://www.fitbit.com/oauth/authenticate?',
		access_token:'https://www.fitbit.com/oauth/access_token?',
		distance:'http://api.fitbit.com/1/user/-/activities/distance/date/',
		userInfo:'http://api.fitbit.com/1/user/-/profile.json',
		friends:'http://api.fitbit.com/1/user/-/friends.json'
	},
	
	api_credentials:{
		consumer_key: 'CONSUMER_KEY',
		consumer_secret: 'CONSUMER_SECRET'
	}
	
}

exports.get_api_credentials = function(type){
	return fitbit_api.api_credentials;
}


exports.get_api_request = function(type){
	return {url: fitbit_api.api[type]};
}



exports.build_oauth = function(body){
	var oauth = this.extractParameters(body);
	oauth['consumer_key'] = fitbit_api.api_credentials.consumer_key;
	oauth['consumer_secret'] = fitbit_api.api_credentials.consumer_secret;
	return oauth;
	
}

exports.extractParameters = function(body){
	var paramArray = body.split('&');
	var paramObj = {};
	paramArray.forEach(function(param){
		var value = param.split('=');
		value[0] = value[0].replace("oauth_","");
		paramObj[value[0]] = value[1]; 
	});
	return paramObj;
}
