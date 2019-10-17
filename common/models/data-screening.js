'use strict';
const Pool = require('pg').Pool
var connection = new Pool({
    user: 'raflesh',
    host: '127.0.0.1',
    database: 'db_thalassemia',
    password: '123',
    port: 5432,
  })

module.exports = function(Datascreening) {

    Datascreening.remoteMethod('SudahScreening', {
        accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
            {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        returns: {arg: 'result',type: 'string'},
        http: {path: '/SudahScreening', verb: 'GET'}
    });

    Datascreening.remoteMethod('BubbleChart', {
        accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
            {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        returns: {arg: 'result',type: 'string'},
        http: {path: '/BubbleChart', verb: 'GET'}
    });

    Datascreening.remoteMethod('PresentaseAnemiaTidak', {
        accepts: [
            {arg: 'req', type: 'object', http: {source: 'req'}},
            {arg: 'res', type: 'object', http: {source: 'res'}},
        ],
        returns: {arg: 'result',type: 'string'},
        http: {path: '/PresentaseAnemiaTidak', verb: 'GET'}
    });

    Datascreening.PresentaseAnemiaTidak = function (req, res, cb) {
        connection.query('SELECT lower(trim(anemia_status)) as anemia_status, ROUND(((COUNT(1) * 100.0)/(select count(1) FROM data_screening)), 2) as percentage FROM data_screening GROUP BY lower(trim(anemia_status)) ORDER BY anemia_status', (error, results) => {
            if (error) {
              throw error
            }
            res.status(200).json(results.rows)
          })
    }

    Datascreening.BubbleChart = function (req, res, cb) {
        connection.query('SELECT lower(trim(type)) as type, COUNT(1) as total FROM data_screening GROUP BY lower(trim(type)) ORDER BY type', (error, results) => {
            if (error) {
              throw error
            }
            res.status(200).json(results.rows)
          })
    }

    Datascreening.SudahScreening = function (req, res, cb) {
        // 500 Masih bisa berubah sesuai kebutuhan dilapangan
        connection.query('SELECT ROUND(((COUNT(1) * 100.0)/500), 2) as percentage, COUNT(1) as total FROM data_screening', (error, results) => {
            if (error) {
              throw error
            }
            res.status(200).json(results.rows)
          })
    }

};
