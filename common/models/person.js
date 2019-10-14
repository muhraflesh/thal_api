'use strict';

module.exports = function(Person) {
    Person.disableRemoteMethod('upsert', true);
    Person.disableRemoteMethod('create', true);
};
