Ext.define('MapMyRun.controller.Friend', {
    extend: 'Ext.app.Controller',


    init: function(){
    	Ext.getStore('Friends').on('load',this.onStoreLoad,Ext.getStore('Friends'));
    },
    
    onStoreLoad:function(){
    	var friendsMap =  Ext.getCmp('friendsMapCmp');
    	friendsMap.drawRoute(this.data.items);
    }
    
});


