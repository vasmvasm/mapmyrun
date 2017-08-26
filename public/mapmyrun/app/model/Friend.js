Ext.define('MapMyRun.model.Friend', {
    extend: 'Ext.data.Model',

    config: {
        fields: [
            { name: 'username', type: 'string' },
            { name: 'distance', type: 'string' },
            { name: 'avatar', type: 'string' }
            ]
    }
});


