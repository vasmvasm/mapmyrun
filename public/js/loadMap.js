var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var currentRouteIndex = 0;
var marker = [];
var friends_distance;
var markup = '<a href="#" class="list-group-item clearfix">'+
				  
				'<div class="img-thumbnail pull-left">'+
			    '<img style="height:50px;width:50px" src=${avatar}>'+
      			'</div>'+
				'<div class="col-md-5 col-sm-5" style="margin-top:3px">'+
					'<div >${username}</div>'+
					'<div>'+
						 '<h3>${distance}&nbsp<small>km<small></h3>'+
					'</div>'+
				 '</div>'+
				 '<div style="clear:both" class="progress">'+
				   '<div style="width: ${percent}%;" aria-valuemax="100" aria-valuemin="0" aria-valuenow="${percent}" role="progressbar" class="progress-bar progress-bar-success">${percent}%'+		     
				   '</div>'+
				 '</div>'+
			  '</a>';

function drawMap(){
    var mapOptions = {
             center: new google.maps.LatLng(-34.397, 150.644),
             zoom: 8
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
	return map;
}

function setRoute(map,response){
	directionsDisplay = new google.maps.DirectionsRenderer();
	directionsDisplay.setMap(map);

    directionsDisplay.setDirections(response);
	directionsDisplay.setPanel(document.getElementById('info-panel'));
	
	google.maps.event.addListener(directionsDisplay,'routeindex_changed',function(a,b,c){
		currentRouteIndex = this.routeIndex;
		 document.getElementById("friend-list").innerHTML="";
		 for(var marker_ctr=0;marker_ctr<marker.length;marker_ctr++){
		 	marker[marker_ctr].setMap(null);
		 }
		marker = [];
		calPositions(map,response,this.routeIndex);
	})	

}

function plotPosition(lat,lng,map,username,url){
	var myLatlng = new google.maps.LatLng(lat,lng);
	 marker.push (new RichMarker({
	      position: myLatlng,
	      map: map,
		  content:'<div><img width="32" height="32"  title="" src="'+url+
		          '" style="position: absolute; left: -16px; top: -39px; width: 32px; height: 32px;"><img src="https://ss0.4sqi.net/img/pin-white-transparent-212f0e4d45954fd42b85ca619365e0a8.png" style="position: absolute; left: -20px; top: -43px;"></div>'
	  }));
	
}

function calculateDistance(source,destination){
	var R = 6371; // Radius of the earth in km
	  var dLat = deg2rad(destination.lat-source.lat);  // deg2rad below
	  var dLon = deg2rad(destination.lng-source.lng); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(source.lat)) * Math.cos(deg2rad(destination.lat)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in km
	  return d * 1000;
	}

	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	}


function calPositions(map,response,route_index){
//	document.getElementById("total_distance").innerHTML =	response.routes[route_index].legs[0].distance.text;
	
  for(var distance_ctr=0; distance_ctr<friends_distance.length;distance_ctr++){

	var friends_obj = friends_distance[distance_ctr]
    var distance = friends_obj.distance*1000;
	var username = friends_obj.username;
	friends_obj.rank = distance_ctr+1;
	
	var routeDistanceStr = response.routes[route_index].legs[0].distance.text;
	routeDistanceStr = routeDistanceStr.replace(/km/g,"");
	routeDistanceStr = routeDistanceStr.replace(/,/g,"");
	var routeDistance = parseInt(routeDistanceStr);
 	var percent = (friends_obj.distance/routeDistance)*100;
	percent = Math.round(percent);
	friends_obj.percent = percent;
	
	
	$.tmpl(markup,friends_obj).appendTo("#friend-list");
	var steps = response.routes[route_index].legs[0].steps;
	var totalDistance = 0;
	for(var index in steps){
		if(totalDistance + steps[index].distance.value<=distance){
			totalDistance += steps[index].distance.value;
		}else{
			var paths = steps[index].path;
			var pathLength = paths.length;
			for(var ctr=0;ctr<=pathLength;ctr++){
				var source = {
					lat:paths[ctr].lat(),
					lng:paths[ctr].lng()
				}
				var destination = {
					lat:paths[ctr+1].lat(),
					lng:paths[ctr+1].lng()
				}
				
 				var internalDistance = calculateDistance(source,destination);
				if(totalDistance + internalDistance<=distance){
					totalDistance += internalDistance;
				}else{
					// console.log(totalDistance);
					// console.log(internalDistance);
					// console.log(source.lat);
					// console.log(source.lng);
					// console.log(ctr);
					if((totalDistance + internalDistance)-distance>distance-totalDistance){
						plotPosition(source.lat,source.lng,map,username,friends_obj.avatar);
					}else{
						plotPosition(destination.lat,destination.lng,map,username,friends_obj.avatar);
					}
					break;
				}
			}
			break;
		}
	}
  }
}

function calcRoute(start,end) {
  document.getElementById("friend-list").innerHTML="";
  $.ajax({
	  url:'/getUserInfo',
  	  type:'POST'	
  })
    .done(function(data, textStatus, jqXHR){
	   var userInfo = eval('('+data+')');
	   document.getElementById("profile_pic_header").src = userInfo.avatar;
	   document.getElementById("profile_name").innerHTML = userInfo.username;
  
  });
  var infoPanel = document.getElementById('info-panel');
  infoPanel.innerHTML = "";	
  
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.WALKING,
	  provideRouteAlternatives:true
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
	  var map = drawMap();
	  var routes = response.routes;
	  $.ajax({
		  url:'/user-data/'+date,
	  	  type:'GET'	
	  })
	    .done(function(data, textStatus, jqXHR){
		   friends_distance = eval(data);
		   var friend_list = document.getElementById('friend-list');
		   setRoute(map,response);
		   calPositions(map,response,0);
	  
	  });
    }
  });

}

