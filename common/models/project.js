'use strict';

module.exports = function(Project) {
    Project.beforeRemote('*.__create__person', function(context, unused, next) {
        
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for ( var i = 0; i < 6; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 6));
        }

        let date = new Date();
        let day = date.getUTCDate(), month = date.getUTCMonth()+1;
        let hours = date.getHours();
        let minutes = date.getMinutes()

        if(day<10){
            day = 0 + "" + day ;
        };
        if(month<10){
            month = 0 + "" + month;
        };
        if(hours<10){
            hours = 0 + "" + hours;
        };
        if(minutes<10){
            minutes = 0 + "" + minutes;
        };
        date = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes;

        context.args.data.create_date = date
        context.args.data.update_date = date
        context.args.data.generate_code = result + context.args.data.nik
        console.log(context.args.data.generate_code);

        return Promise.reject();
    });

    Project.beforeRemote('create', function(context, unused, next) {
        let date = new Date();
        let day = date.getUTCDate(), month = date.getUTCMonth()+1;
        let hours = date.getHours();
        let minutes = date.getMinutes()
        /*var month = new Array(12);
        month[0] = "1";
        month[1] = "2";
        month[2] = "3";
        month[3] = "4";
        month[4] = "5";
        month[5] = "6";
        month[6] = "7";
        month[7] = "8";
        month[8] = "9";
        month[9] = "10";
        month[10] = "11";
        month[11] = "12";
        month[12] = "13";*/

            if(day<10){
                day = 0 + "" + day ;
            };
            if(month<10){
                month = 0 + "" + month;
            };
            if(hours<10){
                hours = 0 + "" + hours;
            };
            if(minutes<10){
                minutes = 0 + "" + minutes;
            };
        date = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes;

        console.log(date)
        context.args.data.create_date = date
        context.args.data.update_date = date
        
        return Promise.reject();
    })

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
