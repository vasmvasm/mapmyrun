Ext.define('MapMyRun.view.FriendsMap', {
	extend:'Ext.Panel',
	xtype:'friendsMap',
	
	// requires: [
        // 'Ext.Panel'
    // ],


	
	config:{
		layout:'fit',
		items:[{
			id:'distanceMap',
			xtype:'map'
			
	}]
	},
	
	marker:[],
	
	
	drawRoute: function(friends_distance){
	   var request = {
	      origin:'Pune',
	      destination:'Delhi',
	      travelMode: google.maps.TravelMode.WALKING,
		  provideRouteAlternatives:false
	  };
	  var directionsService = new google.maps.DirectionsService();
	  var that = this;
	  directionsService.route(request, function(response, status) {
	  	    that.response = response;
	  	    var map  = Ext.getCmp('distanceMap');
	  		that.setRoute(map,response);
	  		that.calPositions(friends_distance);
	  });
	},
	
	setRoute :function (map,response){
		var directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(map.getMap());
	
	    directionsDisplay.setDirections(response);
		directionsDisplay.setPanel(document.getElementById('info-panel'));

	},
	
	plotPosition: function (lat,lng,map,username,url){
	var myLatlng = new google.maps.LatLng(lat,lng);
	 this.marker.push (new RichMarker({
	      position: myLatlng,
	      map: map,
		  content:'<div><img width="32" height="32"  title="" src="'+url+
		          '" style="position: absolute; left: -16px; top: -39px; width: 32px; height: 32px;"><img src="https://ss0.4sqi.net/img/pin-white-transparent-212f0e4d45954fd42b85ca619365e0a8.png" style="position: absolute; left: -20px; top: -43px;"></div>'
	  }));
	
},

	calculateDistance: function (source,destination){
	var R = 6371; // Radius of the earth in km
	  var dLat = this.deg2rad(destination.lat-source.lat);  // deg2rad below
	  var dLon = this.deg2rad(destination.lng-source.lng); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(this.deg2rad(source.lat)) * Math.cos(this.deg2rad(destination.lat)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in km
	  return d * 1000;
	},

	deg2rad: function (deg) {
	  return deg * (Math.PI/180);
	},


 	calPositions: function(friends_distance){
	var map  = Ext.getCmp('distanceMap').getMap();
	var response = this.response , route_index=0;
	
	  for(var distance_ctr=0; distance_ctr<friends_distance.length;distance_ctr++){
	
		var friends_obj = friends_distance[distance_ctr]._data;
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
		
		
		// $.tmpl(markup,friends_obj).appendTo("#friend-list");
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
					};
					var destination = {
						lat:paths[ctr+1].lat(),
						lng:paths[ctr+1].lng()
					};
					
	 				var internalDistance = this.calculateDistance(source,destination);
					if(totalDistance + internalDistance<=distance){
						totalDistance += internalDistance;
					}else{
						if((totalDistance + internalDistance)-distance>distance-totalDistance){
							this.plotPosition(source.lat,source.lng,map,username,friends_obj.avatar);
						}else{
							this.plotPosition(destination.lat,destination.lng,map,username,friends_obj.avatar);
						}
						break;
					}
				}
				break;
			}
		}
	  }
	}
	
	
	
});