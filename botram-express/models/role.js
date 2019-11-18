'use strict'

const response = require('../config/res')
const connection = require('../config/database')
const crypto = require('crypto')

exports.get = function(req, res) {
    
    if(!req.query.offset) {
        var offset = 0
    } else {
        var offset = req.query.offset
    }
    
    if(!req.query.limit) {
        var limit = 'all'
    } else {
        var limit = req.query.limit
    }
    
    if(req.query.name || req.query.desc) {
            connection.query(
                `SELECT * FROM role WHERE LOWER(role_name) LIKE LOWER('%${req.query.name}%') or LOWER(role_description) LIKE LOWER('%${req.query.desc}%') order by role_name offset ${offset} limit ${limit}`,
                function (error, result, fields){
                if(error){
                    console.log(error)
                } else{
                    var dataRole = []
                    for (var i = 0; i < result.rows.length; i++) {
                        var row = result.rows[i];
                        var data_getRole = {
                            "id": row.role_id,
                            "name": row.role_name,
                            "description": row.role_description
                        }
                        dataRole.push(data_getRole)
                    }
                    response.success_get(dataRole, offset, limit, i, res)
                }
            });
    } else {
        connection.query(`SELECT * FROM role offset ${offset} limit ${limit};`, function (error, result, fields){
            if(error){
                console.log(error)
            } else{
                var dataRole = []
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    var data_getRole = {
                        "id": row.role_id,
                        "name": row.role_name,
                        "description": row.role_description
                    }
                    dataRole.push(data_getRole)
                }
                response.success_get(dataRole, offset, limit, i, res)
            }
        });
    }
    
}
    
exports.post = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
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
        if(seconds<10){
            seconds = 0 + "" + seconds;
        };
    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
        
    var role_id = crypto.createHash('sha1').update('Role' + date_now).digest('hex');
    // REQ DARI CLIENT
    var role_name = req.body.name
    var role_description = req.body.description

    await connection.query(`SELECT role_id from role where role_name='${role_name}';`, async function (error, result, fields){
        if(result.rowCount !== 0){
            response.bad_req('Name telah digunakan', res)
        } else {
            if(!role_name){
                response.bad_req('name Is Required', res)
            } else if (!role_description){
                response.bad_req('description Is Required', res)
            } else {
                await connection.query(`INSERT INTO role(role_id, role_name, role_description) VALUES ('${role_id}', '${role_name}', '${role_description}')`, async function (error, result, fields){
                    if(!error){
                        await connection.query(`SELECT * from role where role_id='${role_id}'`, function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else{
                                var dataRole = []
                                for (var i = 0; i < result.rows.length; i++) {
                                    var row = result.rows[i];
                                    var data_getRole = {
                                        "id": row.role_id,
                                        "name": row.role_name,
                                        "description": row.role_description
                                    }
                                    dataRole.push(data_getRole)
                                }
        
                                response.success_post_put("Role have been create", dataRole, res)
                            }
                        });
                    }
                });
            }
        }
    })
        
}
    
exports.findByID = function(req, res) {
    var role_id = req.params.id

    connection.query(`SELECT * FROM role where role_id='${role_id}'`, function (error, result, fields){
        if(error){
            console.log(error)
        } else if(result.rowCount == 0) {
            response.not_found('Role Not Found', res)
        } else{
            var dataRole = []
            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows[i];
                var data_getRole = {
                    "id": row.role_id,
                    "name": row.role_name,
                    "description": row.role_description
                }
                dataRole.push(data_getRole)
            }
            response.success_getID(dataRole, res)
        }
    });

}
 
// BELUM JADI
exports.put = async function(req, res) {
  
}
    
exports.delete = function(req, res) {
    var role_id = req.params.id
    
    connection.query(`DELETE FROM role WHERE role_id='${role_id}'`, function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Role Not Found', res)
        } else{
            response.success_delete('Role Has Been Deleted', res)
        }
    });
}

exports.getPrivileges = async function(req, res) {
    var role_id = req.params.id

    await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Role Not Found', res)
        } else {
            await connection.query(`select a.role_privileges_id, a.is_view, a.is_insert, a.is_update, a.is_delete, a.is_approval from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}'`, async function (error, result, fields){
                if(error){
                    console.log(error)
                } else {
                    var dataPrivileges = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getPrivileges = {
                                "id": row.role_privileges_id,
                                "isView": row.is_view,
                                "isInsert": row.is_insert,
                                "isUpdate": row.is_update,
                                "isDelete": row.is_delete,
                                "isApproval": row.is_approval
                            }
                            dataPrivileges.push(data_getPrivileges)
                        }

                        response.success_getID(dataPrivileges, res)
                }
            })
        }
    })
}

exports.postPrivileges = async function(req, res) {
    let date = new Date();
    let day = date.getUTCDate(), month = date.getUTCMonth()+1;
    let hours = date.getHours();
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
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
        if(seconds<10){
            seconds = 0 + "" + seconds;
        };
    var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    var privileges_id = crypto.createHash('sha1').update('Privileges' + date_now).digest('hex');
    console.log(privileges_id)
    // REQ DARI CLIENT
    var role_id = req.params.id
    var is_view = req.body.isView
    var is_insert = req.body.isInsert
    var is_update = req.body.isUpdate
    var is_delete = req.body.isDelete
    var is_approval = req.body.isApproval

    await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Role Not Found', res)
        } else {
            await connection.query(`select a.role_privileges_id from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}'`, async function (error, result, fields){
                if(result.rowCount !== 0){
                    response.bad_req('Role Have Privileges', res)
                } else {
                    if(!is_view){
                        response.bad_req('isView Is Required', res)
                    } else if (!is_insert){
                        response.bad_req('isInsert Is Required', res)
                    } else if(!is_update){
                        response.bad_req('isUpdate Is Required', res)
                    } else if(!is_delete){
                        response.bad_req('isDelete Is Required', res)
                    } else if(!is_approval){
                        response.bad_req('isApproval Is Required', res)
                    } else {
                        await connection.query(`INSERT INTO role_privileges(role_privileges_id, is_view, is_insert, is_update, is_delete, is_approval, role_id) VALUES('${privileges_id}', '${is_view}', '${is_insert}', '${is_update}', '${is_delete}', '${is_approval}', '${role_id}');`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                await connection.query(`select a.role_privileges_id, a.is_view, a.is_insert, a.is_update, a.is_delete, a.is_approval from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}'`, async function (error, result, fields){
                                    if(error){
                                        console.log(error)
                                    } else {
                                        var dataPrivileges = []
                                            for (var i = 0; i < result.rows.length; i++) {
                                                var row = result.rows[i];
                                                var data_getPrivileges = {
                                                    "id": row.role_privileges_id,
                                                    "isView": row.is_view,
                                                    "isInsert": row.is_insert,
                                                    "isUpdate": row.is_update,
                                                    "isDelete": row.is_delete,
                                                    "isApproval": row.is_approval
                                                }
                                                dataPrivileges.push(data_getPrivileges)
                                            }
                                            response.success_post_put("Privilege have been create", dataPrivileges, res)
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    })
}

exports.getPrivilegesID = async function(req, res) {
    var role_id = req.params.id
    var privileges_id = req.params.pid

    await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Role Not Found', res)
        } else {
                await connection.query(
                    `select a.role_privileges_id, a.is_view, a.is_insert, a.is_update, a.is_delete, a.is_approval from role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}' and a.role_privileges_id='${privileges_id}';`,
                    function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else if(result.rowCount == 0){
                        response.not_found('Privileges Not Found', res)
                    } else{
                        var dataPrivilegesID = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getPrivilegesID = {
                                "id": row.role_privileges_id,
                                "isView": row.is_view,
                                "isInsert": row.is_insert,
                                "isUpdate": row.is_update,
                                "isDelete": row.is_delete,
                                "isApproval": row.is_approval
                            }
                            dataPrivilegesID.push(data_getPrivilegesID)
                        }
                        response.success_getID(dataPrivilegesID, res)
                    }
                });
        }
    })
}

// BELUM JADI
exports.putPrivilegesID = async function(req, res) {
    
}

exports.deletePrivilegesID = async function(req, res) {
    var role_id = req.params.id
    var privileges_id = req.params.pid

    await connection.query(`select role_id from role where role_id='${role_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Role Not Found', res)
        } else {
            await connection.query(`SELECT a.role_privileges_id FROM role_privileges a left join role b on a.role_id=b.role_id where a.role_id='${role_id}' and a.role_privileges_id='${privileges_id}';`, async function (error, result, fields){
                if(result.rowCount == 0){
                    response.not_found('Privileges in the Role Not Found', res)
                } else {
                    await connection.query(`DELETE FROM role_privileges WHERE role_id='${role_id}' and role_privileges_id='${privileges_id}';`, function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else if(result.rowCount == 0){
                            response.not_found('Privileges Not Found', res)
                        } else {
                            response.success_delete('Privileges have been delete', res)
                        }
                    })
                }
            })
        }
    })
}