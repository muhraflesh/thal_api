'use strict';
const Pool = require('pg').Pool
var datasource = require('../../server/datasources.json')
var connection = new Pool({
    user: datasource.PostgreLocal.user,
    host: datasource.PostgreLocal.host,
    database: datasource.PostgreLocal.database,
    password: datasource.PostgreLocal.password,
    port: datasource.PostgreLocal.port,
})

module.exports = function(Datascreeningthal) {
    Datascreeningthal.remoteMethod('DataPopti', {
        accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
            {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        returns: {arg: 'result',type: 'string'},
        http: {path: '/SebaranPerPopti', verb: 'GET'}
    });

    Datascreeningthal.DataPopti = function (req, res, cb) {
        connection.query('SELECT lower(trim(A.popti_city)) as popti_city, (COUNT(1)) as total, B.latitude, B.longitude FROM data_screening_thal A JOIN data_screening_thal_sebaran B ON A.popti_city = B.popti_city group by A.popti_city, B.latitude, B.longitude order by A.popti_city;', (error, results) => {
            if (error) {
              throw error
            }
            res.status(200).json(results.rows)
          })
    }
};
