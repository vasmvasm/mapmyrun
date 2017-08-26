Ext.define('MapMyRun.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    requires: [
        'Ext.TitleBar',
        'MapMyRun.view.FriendsMap'
    //    'MapMyRun.view.FriendsList'
    ],
    config: {
        tabBarPosition: 'bottom',
        activeItem:1,
        items: [
            {
                title: 'Route',
                iconCls: 'search',

                items: {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: 'Route'
                }
            },{
                title: 'Map',
                iconCls: 'maps',
                layout:'fit',
                items: [{
                    docked: 'top',
                    xtype: 'titlebar',
                    title: 'Map My Run'
                },{
                	id:'friendsMapCmp',
                	xtype:'friendsMap'
                }]
            },
            {
                title: 'Friends',
                iconCls: 'team',
				layout:'fit',
                items: [
                    {
                        docked: 'top',
                        xtype: 'titlebar',
                        title: 'Friends'
                    }
                    // ,{
                    	// xtype:'friendsList'
                    // }
                ]
            }
        ]
    }
});
