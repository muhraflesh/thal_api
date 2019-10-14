'use strict';

module.exports = function(Project) {
    Project.beforeRemote('*.__create__person', function(context, unused, next) {
        
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for ( var i = 0; i < 6; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 6));
        }
        context.args.data.generate_code = result + context.args.data.nik
        console.log(context.args.data.generate_code);

        return Promise.reject();
    });

    Project.disableRemoteMethod('upsert', true);
    Project.disableRemoteMethod('updateAttributes', true);
    Project.disableRemoteMethod('createChangeStream', true);
    Project.disableRemoteMethod('replaceById', true);
    Project.disableRemoteMethod('findOne', true);
    Project.disableRemoteMethod('replaceOrCreate', true);
    Project.disableRemoteMethod('updateAll', true);
    Project.disableRemoteMethod('upsertWithWhere', true);
    Project.disableRemoteMethod('*__exists__head__project__id', true);
    Project.disableRemoteMethod('*__destroyById__person', true);
    Project.disableRemoteMethod('*__patchAttributes', true);

    
};
