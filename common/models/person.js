'use strict';

module.exports = function(Person) {
    Person.remoteMethod('upload',   {
        accepts: [{
            arg: 'req',
            type: 'object',
            http: {
                source: 'req'
            }
        }, {
            arg: 'res',
            type: 'object',
            http: {
                source: 'res'
            }
        }],
        returns: {
             arg: 'result',
             type: 'string'
        }
    });

    Person.disableRemoteMethod('upsert', true);
    Person.disableRemoteMethod('create', true);
};
