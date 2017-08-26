Ext.define('MapMyRun.store.Friends', {
    extend: 'Ext.data.Store',

    requires: [
        'MapMyRun.model.Friend'
    ],

    config: {
        model: 'MapMyRun.model.Friend',
        autoLoad: true,

        proxy: {
            type: 'ajax',
            url: '/user-data/2014-01-01',
            reader: {
                type: 'json',
                rootProperty: 'friends'
            }
        }

    }
});