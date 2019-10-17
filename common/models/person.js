'use strict';
var multer = require ('multer');
var fs = require ('fs');
var Tesseract = require('tesseract.js')
const app = require('../../server/server');

module.exports = function (Person) {
    var hostAPI = 'http://2b9ce5ed.ngrok.io/'
    var Path = '';
    var uploadedFileName = '';
    var personID = '';
    var type = '';
    var storage = multer.diskStorage({
        destination: function (context, file, cb) {
            var url = context.url.split('/')
            let type_file = url[3]
            let person_id = url[1]
            personID = person_id
            type = type_file
            // checking and creating uploads folder where files will be uploaded
            var dirPath = `client/attachment/${personID}`
            if (!fs.existsSync(dirPath)) {
                var dir = fs.mkdirSync(dirPath);
            }
            Path = dirPath
            cb(null, dirPath + '/');
        },
        filename: function (req, file, cb) {
            // file will be accessible in `file` variable
            var ext = file.originalname.substring(file.originalname.lastIndexOf("."));
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for ( var i = 0; i < 15; i++ ) {
                result += characters.charAt(Math.floor(Math.random() * 15));
            }
            var fileName = type + result + ext;
            uploadedFileName = fileName;
            cb(null, fileName);
        }
    });

    Person.remoteMethod('uploadFiles',   {
        accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
            {arg: 'res', type: 'object', http: {source: 'res'}},
            {arg: 'person_id', type: 'string', require: true}
        ],
        returns: {arg: 'result',type: 'string'},
        http: {path: '/:person_id/uploadFiles/:type'}
    });

    Person.uploadFiles = function (req, res, context, cb) {
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

        var upload = multer({
            storage: storage
        }).array('file', 12);

        upload(req, res, function (err) {
            if (err) {
                // An error occurred when uploading
                res.json(err);
            }
        

        app.models.files.create([
            {name: uploadedFileName, path: hostAPI+'attachment/'+personID+'/'+uploadedFileName,
             type: type, upload_date: date, person_id: personID
            }
          ],function(err){
              if (err) {
                  console.log('Create Files Error')
              } else {
                  console.log('Create Files, Person ID : ' + personID + ' Success!')
                  console.log('Tipe File : '+ type) 
                  console.log('Upload Date : '+ date)
                  console.log('Path : '+ hostAPI + Path + uploadedFileName)
              } 
        })
        cb(null, uploadedFileName)
        });
    };

    Person.afterRemote('upload', function(context, remoteMethodOutput, next) {
        context.req.headers.accept= 'multipart/form-data';
    });

    /*Person.afterRemote('upload', function(context, dirPath, next){
        
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

        let url = context.args.req.url.split('/')
        let person_id = url[1]
        let type = url[4]
        console.log(uploadedFileName)
        app.models.files.create([
          {name: person_id+type+uploadedFileName, person_id: person_id, type: type,
            upload_date: date, path: hostAPI+pathImage+uploadedFileName
          }
        ],function(err){
            if (err) {
                console.log('Create Files Error')
            } else {
                console.log('Create Files Success!')
            }
            
        })
        return next();
    });*/
    

    Person.disableRemoteMethod('upsert', true);
    Person.disableRemoteMethod('create', true);
};
