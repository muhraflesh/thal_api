'use strict'

const response = require('../config/res')
const connection = require('../config/database')
const crypto = require('crypto')
const host = require('../config/server.json').host
const port = require('../config/server.json').port
const ssl = require('../config/server.json').ssl
const multer = require('multer')
const uploadfile = require('express-fileupload')
var fs = require ('fs');

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

    if(req.query.name || req.query.desc || req.query.addr || req.query.cdate || req.query.cby) {
        connection.query(
            `SELECT * FROM project WHERE LOWER(project_name) LIKE LOWER('%${req.query.name}%') or LOWER(project_description) LIKE LOWER('%${req.query.desc}%') or LOWER(project_address) LIKE LOWER('%${req.query.addr}%') or LOWER(create_by) LIKE LOWER('%${req.query.cby}%') or create_date LIKE '${req.query.cdate}' order by project_name offset ${offset} limit ${limit}`,
            function (error, result, fields){
            if(error){
                console.log(error)
            } else{
                var dataProject = []
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    var data_getProject = {
                        "id": row.project_id,
                        "name": row.project_name,
                        "description": row.project_description,
                        "address": row.project_address,
                        "longitude": row.longitude,
                        "latitude": row.latitude,
                        "createDate": row.create_date,
                        "updateDate": row.update_date,
                        "createBy": row.create_by,
                        "updateBy": row.update_by
                    }
                    dataProject.push(data_getProject)
                }

                response.success_get(dataProject, offset, limit, i, res)
            }
        });
    } else {
        connection.query(
            `SELECT * FROM project offset ${offset} limit ${limit}`,
            function (error, result, fields){
            if(error){
                console.log(error)
            } else{
                var dataProject = []
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    var data_getProject = {
                        "id": row.project_id,
                        "name": row.project_name,
                        "description": row.project_description,
                        "address": row.project_address,
                        "longitude": row.longitude,
                        "latitude": row.latitude,
                        "createDate": row.create_date,
                        "updateDate": row.update_date,
                        "createBy": row.create_by,
                        "updateBy": row.update_by
                    }
                    dataProject.push(data_getProject)
                }

                response.success_get(dataProject, offset, limit, i, res)
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
    
    var proj_id = crypto.createHash('sha1').update('Project' + date_now).digest('hex');
    // REQ DARI CLIENT
    var proj_name = req.body.name
    var proj_desc = req.body.description
    var proj_address = req.body.address
    var longitude = req.body.longitude
    var latitude = req.body.latitude

    if(!proj_name){
        response.bad_req('Name Is Required', res)
    } else if (!proj_desc){
        response.bad_req('Description Is Required', res)
    } else if(!proj_address){
        response.bad_req('Address Is Required', res)
    } else if(!longitude){
        response.bad_req('Longitude Is Required', res)
    } else if(!latitude){
        response.bad_req('Latitude Is Required', res)
    } else {
        await connection.query(`INSERT INTO project(project_id, project_name, project_description, project_address, longitude, latitude, create_date, update_date) VALUES ('${proj_id}', '${proj_name}', '${proj_desc}', '${proj_address}', '${longitude}', '${latitude}', '${date_now}', '${date_now}')`, async function (error, result, fields){
            if(!error){
                await connection.query(`SELECT * from project where project_id='${proj_id}'`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var dataProject = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getProject = {
                                "id": row.project_id,
                                "name": row.project_name,
                                "description": row.project_description,
                                "address": row.project_address,
                                "longitude": row.longitude,
                                "latitude": row.latitude,
                                "createDate": row.create_date,
                                "updateDate": row.update_date,
                                "createBy": row.create_by,
                                "updateBy": row.update_by
                            }
                            dataProject.push(data_getProject)
                        }

                        response.success_post_put("Create project successfully", dataProject, res)
                    }
                });
            }
        });
        
    }
    
}

exports.findByID = function(req, res) {
    var proj_id = req.params.id

    connection.query(`select * FROM project WHERE project_id='${proj_id}'`, function (error, result, fields){
        if(result.rows == ''){
            response.not_found('Project Not Found', res)
        } else{
            var dataProject = []
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows[i];
                    var data_getProject = {
                        "id": row.project_id,
                        "name": row.project_name,
                        "description": row.project_description,
                        "address": row.project_address,
                        "longitude": row.longitude,
                        "latitude": row.latitude,
                        "createDate": row.create_date,
                        "updateDate": row.update_date,
                        "createBy": row.create_by,
                        "updateBy": row.update_by
                    }
                    dataProject.push(data_getProject)
                }

                response.success_getID(dataProject, res)
        }
    });
}

// MASIH ADA BUG
exports.put = async function(req, res) {
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

    var proj_id = req.params.id

    var proj_name = req.body.name
    var proj_desc = req.body.description
    var proj_address = req.body.address
    var longitude = req.body.longitude
    var latitude = req.body.latitude

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            if(proj_name){
                connection.query(`UPDATE project SET project_name = '${proj_name}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Project Name Berhasil Diubah')
                    }
                });
            }
            if(proj_desc){
                connection.query(`UPDATE project SET project_description = '${proj_desc}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Project Description Berhasil Diubah')
                    }
                });
            }
            if(proj_address){
                connection.query(`UPDATE project SET project_address = '${proj_address}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Project Address Berhasil Diubah')
                    }
                });
            }
            if(longitude){
                connection.query(`UPDATE project SET longitude = '${longitude}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Longitude Berhasil Diubah')
                    }
                });
            }
            if(latitude){
                connection.query(`UPDATE project SET latitude = '${latitude}' where project_id='${proj_id}';`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        console.log('Latitude Berhasil Diubah')
                    }
                });
            }
        }
        await connection.query(`UPDATE project SET update_date = '${date_now}' where project_id='${proj_id}';`, async function (error, result, fields){
            if(!error){
                await connection.query(`SELECT * FROM project WHERE project_id='${proj_id}'`, function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var dataProject = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getProject = {
                                "id": row.project_id,
                                "name": row.project_name,
                                "description": row.project_description,
                                "address": row.project_address,
                                "longitude": row.longitude,
                                "latitude": row.latitude,
                                "createDate": row.create_date,
                                "updateDate": row.update_date,
                                "createBy": row.create_by,
                                "updateBy": row.update_by
                            }
                            dataProject.push(data_getProject)
                        }

                        response.success_post_put('Update Project Successfully', dataProject, res)
                    }
                });
            }
        });
    });

}

exports.delete = function(req, res) {
    var proj_id = req.params.id

    connection.query(`DELETE FROM project WHERE project_id='${proj_id}'`, function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else{
            response.success_delete('Project Has Been Deleted', res)
        }
    });
}

exports.getMember = async function(req, res) {
    var proj_id = req.params.id

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

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            if(req.query.name || req.query.mail || req.query.phone || req.query.cnum || req.query.gender) {
                await connection.query(
                    `SELECT * FROM "user" WHERE (LOWER(firstname) LIKE LOWER('%${req.query.name}%') or LOWER(lastname) LIKE LOWER('%${req.query.name}%') or LOWER(username) LIKE LOWER('%${req.query.name}%') or LOWER(email) LIKE LOWER('%${req.query.mail}%') or LOWER(telephone) LIKE LOWER('%${req.query.phone}%') or LOWER(card_number) LIKE LOWER('%${req.query.cnum}%') or LOWER(gender) LIKE LOWER('%${req.query.gender}%')) and project_id='${proj_id}' order by firstname offset ${offset} limit ${limit}`,
                    function (error, result, fields){
                    
                    if(error){
                        console.log(error)
                    } else{
                        var dataMember = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getMember = {
                                "id": row.user_id,
                                "firstName": row.firstname,
                                "lastName": row.lastname,
                                "userName": row.username,
                                "mail": row.email,
                                "phone": row.telephone,
                                "cardMember": row.card_member,
                                "cardNumber": row.card_number,
                                "gender": row.gender,
                                "birthDate": row.birth_date,
                                "isActive": row.is_active,
                                "isLogin": row.is_login,
                                "createDate": row.create_date,
                                "updateDate": row.update_date,
                                "roleId": row.role_id
                            }
                            dataMember.push(data_getMember)
                        }

                        response.success_get(dataMember, offset, limit, i, res)
                    }
                    });
            } else {
                await connection.query(
                    `SELECT a.user_id, a.firstname, a.lastname, a.username, a.email, a.telephone, a.card_member, a.card_number, a.gender, a.birth_date, a.is_active, a.is_login, a.create_date, a.update_date, a.role_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' offset ${offset} limit ${limit};`,
                    function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else{
                        var dataMember = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getMember = {
                                "id": row.user_id,
                                "firstName": row.firstname,
                                "lastName": row.lastname,
                                "userName": row.username,
                                "mail": row.email,
                                "phone": row.telephone,
                                "cardMember": row.card_member,
                                "cardNumber": row.card_number,
                                "gender": row.gender,
                                "birthDate": row.birth_date,
                                "isActive": row.is_active,
                                "isLogin": row.is_login,
                                "createDate": row.create_date,
                                "updateDate": row.update_date,
                                "roleId": row.role_id
                            }
                            dataMember.push(data_getMember)
                        }

                        response.success_get(dataMember, offset, limit, i, res)
                    }
                });
            }
        }
    })
}

exports.postMember = async function(req, res) {
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
    console.log(date_now)
    var user_id = crypto.createHash('sha1').update('User/Member' + date_now).digest('hex');
    console.log(user_id)
    // REQ DARI CLIENT
    var proj_id = req.params.id
    var firstname = req.body.firstName
    var lastname = req.body.lastName
    var username = req.body.userName
    var mail = req.body.mail
    var phone = req.body.phone
    var card_member = req.body.cardMember
    var card_number = req.body.cardNumber
    var gender = req.body.gender
    var birthdate = req.body.birthDate
    var role_id = req.body.roleId

    await connection.query(`SELECT project_id from project where project_id='${proj_id}';`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found("Project Not Found", res)
        } else {
            await connection.query(`SELECT user_id from "user" where email='${mail}';`, async function (error, result, fields){
                if(result.rowCount !== 0){
                    response.bad_req('Email telah digunakan', res)
                } else {
                    await connection.query(`SELECT user_id from "user" where username='${username}';`, async function (error, result, fields){
                        if(result.rowCount !== 0){
                            response.bad_req('Username telah digunakan', res)
                        } else {
                            await connection.query(`SELECT user_id from "user" where telephone='${phone}';`, async function (error, result, fields){
                                if(result.rowCount !== 0){
                                    response.bad_req('No. Telephone telah digunakan', res)
                                } else {
                                    if(!firstname){
                                        response.bad_req('firstName Is Required', res)
                                    } else if (!lastname){
                                        response.bad_req('lastName Is Required', res)
                                    } else if(!username){
                                        response.bad_req('userName Is Required', res)
                                    } else if(!mail){
                                        response.bad_req('mail Is Required', res)
                                    } else if(!phone){
                                        response.bad_req('phone Is Required', res)
                                    } else if(!card_member){
                                        response.bad_req('cardMember Is Required', res)
                                    } else if(!card_number){
                                        response.bad_req('cardNumber Is Required', res)
                                    } else if(!gender){
                                        response.bad_req('gender Is Required', res)
                                    } else if(!birthdate){
                                        response.bad_req('birthDate Is Required', res)
                                    } else if(!role_id){
                                        response.bad_req('roleId Is Required', res)
                                    } else {
                                        await connection.query(`INSERT INTO "user" (user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, role_id, create_date, update_date, project_id) VALUES ('${user_id}', '${firstname}', '${lastname}', '${username}', '${mail}', '${phone}', '${card_member}', '${card_number}', '${gender}', '${birthdate}', '${role_id}', '${date_now}', '${date_now}', '${proj_id}');`, function (error, result, fields){
                                            if(error){
                                                console.log(error)
                                            } else {
                                                connection.query(`SELECT a.user_id, a.firstname, a.lastname, a.username, a.email, a.telephone, a.card_member, a.card_number, a.birth_date, a.is_active, a.is_login, a.create_date, a.update_date, a.role_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, function (error, result, fields){
                                                    if(error){
                                                        console.log(error)
                                                    } else{
                                                        var dataMember = []
                                                        for (var i = 0; i < result.rows.length; i++) {
                                                            var row = result.rows[i];
                                                            var data_getMember = {
                                                                "id": row.user_id,
                                                                "firstName": row.firstname,
                                                                "lastName": row.lastname,
                                                                "userName": row.username,
                                                                "mail": row.email,
                                                                "phone": row.telephone,
                                                                "cardMember": row.card_member,
                                                                "cardNumber": row.card_number,
                                                                "gender": row.gender,
                                                                "birthDate": row.birth_date,
                                                                "isActive": row.is_active,
                                                                "isLogin": row.is_login,
                                                                "createDate": row.create_date,
                                                                "updateDate": row.update_date,
                                                                "roleId": row.role_id
                                                            }
                                                            dataMember.push(data_getMember)
                                                        }
                                
                                                        response.success_post_put("Member have been create", dataMember, res)
                                                    }
                                                });
                                            }
                                        });
                                        
                                    }
                                }
                            })
                        }
                    })
                }
            })
            
        }
    })
    
}

exports.getMemberID = async function(req, res) {
    var proj_id = req.params.id
    var user_id = req.params.mid

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
                await connection.query(
                    `SELECT a.user_id, a.firstname, a.lastname, a.username, a.email, a.telephone, a.card_member, a.card_number, a.gender, a.birth_date, a.is_active, a.is_login, a.create_date, a.update_date, a.role_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`,
                    function (error, result, fields){
                    if(error){
                        console.log(error)
                    } else if(result.rowCount == 0){
                        response.not_found('Member Not Found', res)
                    } else{
                        var dataMemberID = []
                        for (var i = 0; i < result.rows.length; i++) {
                            var row = result.rows[i];
                            var data_getMemberID = {
                                "id": row.user_id,
                                "firstName": row.firstname,
                                "lastName": row.lastname,
                                "userName": row.username,
                                "mail": row.email,
                                "phone": row.telephone,
                                "cardMember": row.card_member,
                                "cardNumber": row.card_number,
                                "gender": row.gender,
                                "birthDate": row.birth_date,
                                "isActive": row.is_active,
                                "isLogin": row.is_login,
                                "createDate": row.create_date,
                                "updateDate": row.update_date,
                                "roleId": row.role_id
                            }
                            dataMemberID.push(data_getMemberID)
                        }

                        response.success_getID(dataMemberID, res)
                    }
                });
        }
    })
}

// BELUM JADI
exports.putMemberID = async function(req, res) {
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

    var proj_id = req.params.id
    var user_id = req.params.mid

    var firstname = req.body.firstName
    var lastname = req.body.lastName
    var username = req.body.userName
    var password = req.body.password
    var email = req.body.mail
    var phone = req.body.phone
    var card_member = req.body.cardMember
    var card_number = req.body.cardNumber
    var gender = req.body.gender
    var birth_date = req.body.birthDate
    var role_id = req.body.roleId

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            await connection.query(`SELECT a.user_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, async function (error, result, fields){
                if(result.rowCount == 0){
                    response.not_found('Member in the Project Not Found', res)
                } else {
                    async function update() {
                        if(firstname){
                            await connection.query(`UPDATE "user" SET firstname = '${firstname}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('firstname Berhasil Diubah')
                                }
                            });
                        }
                        if(lastname){
                            await connection.query(`UPDATE "user" SET lastname = '${lastname}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('lastname Berhasil Diubah')
                                }
                            });
                        }
                        if(username){
                            await connection.query(`UPDATE "user" SET username = '${username}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('username Berhasil Diubah')
                                }
                            });
                        }
                        if(password){
                            await connection.query(`UPDATE "user" SET password = '${password}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('password Berhasil Diubah')
                                }
                            });
                        }
                        if(email){
                            await connection.query(`UPDATE "user" SET email = '${email}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('email Berhasil Diubah')
                                }
                            });
                        }
                        if(phone){
                            await connection.query(`UPDATE "user" SET telephone = '${phone}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('telephone Berhasil Diubah')
                                }
                            });
                        }
                        if(card_member){
                            await connection.query(`UPDATE "user" SET card_member = '${card_member}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('card_member Berhasil Diubah')
                                }
                            });
                        }
                        if(card_number){
                            await connection.query(`UPDATE "user" SET card_number = '${card_number}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('card_number Berhasil Diubah')
                                }
                            });
                        }
                        if(gender){
                            await connection.query(`UPDATE "user" SET gender = '${gender}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('gender Berhasil Diubah')
                                }
                            });
                        }
                        if(birth_date){
                            await connection.query(`UPDATE "user" SET birth_date = '${birth_date}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('birth_date Berhasil Diubah')
                                }
                            });
                        }
                        if(role_id){
                            await connection.query(`UPDATE "user" SET role_id = '${role_id}' where project_id='${proj_id}' and user_id='${user_id}';`, function (error, result, fields){
                                if(error){
                                    console.log(error)
                                } else{
                                    console.log('role_id Berhasil Diubah')
                                }
                            });
                        }
                    }
                    update()
                    .then(async () => {
                        await connection.query(`UPDATE "user" SET update_date = '${date_now}' where project_id='${proj_id}' and user_id='${user_id}';`, async function (error, result, fields){
                            if(!error){
                                await connection.query(`SELECT a.user_id, a.firstname, a.lastname, a.username, a.email, a.telephone, a.card_member, a.card_number, a.birth_date, a.is_active, a.is_login, a.create_date, a.update_date, a.role_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, function (error, result, fields){
                                    if(error){
                                        console.log(error)
                                    } else{
                                        var dataMember = []
                                        for (var i = 0; i < result.rows.length; i++) {
                                            var row = result.rows[i];
                                            var data_getMember = {
                                                "id": row.user_id,
                                                "firstName": row.firstname,
                                                "lastName": row.lastname,
                                                "userName": row.username,
                                                "mail": row.email,
                                                "phone": row.telephone,
                                                "cardMember": row.card_member,
                                                "cardNumber": row.card_number,
                                                "gender": row.gender,
                                                "birthDate": row.birth_date,
                                                "isActive": row.is_active,
                                                "isLogin": row.is_login,
                                                "createDate": row.create_date,
                                                "updateDate": row.update_date,
                                                "roleId": row.role_id
                                            }
                                            dataMember.push(data_getMember)
                                        }
                
                                        response.success_post_put("Member have been update", dataMember, res)
                                    }
                                });
                            }
                        });
                    })
                }
                
            })

    }
        
    });

}

exports.deleteMemberID = async function(req, res) {
    var proj_id = req.params.id
    var user_id = req.params.mid

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            await connection.query(`SELECT a.user_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, async function (error, result, fields){
                if(result.rowCount == 0){
                    response.not_found('Member in the Project Not Found', res)
                } else {
                    await connection.query(`DELETE FROM "user" WHERE project_id='${proj_id}' and user_id='${user_id}'`, function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else{
                            response.success_delete('Member Has Been Deleted', res)
                        }
                    });
                }
            })

    }
        
    });

}

exports.getMemberDoc = async function(req, res) {
    var proj_id = req.params.id
    var user_id = req.params.mid

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
    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            await connection.query(`SELECT a.user_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, async function (error, result, fields){
                if(result.rowCount == 0){
                    response.not_found('Member in the Project Not Found', res)
                } else {
                    if(req.query.name || req.query.type ) {
                        await connection.query(`SELECT a.document_id, a.name, a.path, a.type, a.upload_date FROM document a LEFT JOIN "user" b on a.user_id=b.user_id WHERE a.user_id='${user_id}' and (LOWER(a.name) LIKE LOWER('%${req.query.name}%') or LOWER(a.type) LIKE LOWER('%${req.query.type}%')) offset ${offset} limit ${limit};`, function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var dataDocument = []
                                for (var i = 0; i < result.rows.length; i++) {
                                    var row = result.rows[i];
                                    var data_getDocument = {
                                        "id": row.document_id,
                                        "name": row.name,
                                        "path": row.path,
                                        "type": row.type,
                                        "createDate": row.upload_date
                                    }
                                    dataDocument.push(data_getDocument)
                                }
                                console.log(i)
                                response.success_get(dataDocument, offset, limit, i, res)
                            }
                        })
                    } else {
                        await connection.query(`SELECT a.document_id, a.name, a.path, a.type, a.upload_date FROM document a LEFT JOIN "user" b on a.user_id=b.user_id WHERE a.user_id='${user_id}' offset ${offset} limit ${limit};`, function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                var dataDocument = []
                                for (var i = 0; i < result.rows.length; i++) {
                                    var row = result.rows[i];
                                    var data_getDocument = {
                                        "id": row.document_id,
                                        "name": row.name,
                                        "path": row.path,
                                        "type": row.type,
                                        "createDate": row.upload_date
                                    }
                                    dataDocument.push(data_getDocument)
                                }
                                console.log(i)
                                response.success_get(dataDocument, offset, limit, i, res)
                            }
                        })
                    }
                }
            })
        }
    })
}

exports.postMemberDoc = async function(req, res) {
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

    if(!req.files.file) {
        response.bad_req('Missing Property File', res)
    } else if(!req.body.type) {
        response.bad_req('Check Your Type', res)
    } else {
    
        var date_now = date.getUTCFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

        var document_id = crypto.createHash('sha1').update('Document' + date_now + type).digest('hex');
        
        var proj_id = req.params.id
        var user_id = req.params.mid
        var file = req.files.file
        var type = req.body.type

        var ext = file.name.substring(file.name.lastIndexOf("."));
        var result           = '';
        var characters       = 'ABCDEFGH23456IJKLMNOPQRShijklmnTUVWXYZabcdefgopqrstuvwxyz01789';
        for ( var i = 0; i < 25; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 15));
        }
        var uploadedFileName = result + ext;
        var path = ssl + host + ":" + port + "/uploadfile/" + user_id + '/' + type + '/' + uploadedFileName

        await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
            if(result.rowCount == 0){
                response.not_found('Project Not Found', res)
            } else {
                await connection.query(`SELECT a.user_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, async function (error, result, fields){
                    if(result.rowCount == 0){
                        response.not_found('Member in the Project Not Found', res)
                    } else {
                        var dirPath_id = `./storage/uploadfile/${user_id}/`
                        var dirPath_type = `./storage/uploadfile/${user_id}/${type}/`
                        if (!fs.existsSync(dirPath_id)) {
                            var dir = fs.mkdirSync(dirPath_id);
                        }
                        if (!fs.existsSync(dirPath_type)) {
                            var dir = fs.mkdirSync(dirPath_type);
                        }
                        file.name = uploadedFileName
                        file.mv(dirPath_type + file.name, function(error, result) {
                            if (error){
                                console.log(error)
                            } else {
                                console.log('Image Berhasil Disimpan Dilocal')
                            }
                        })
                        await connection.query(`INSERT INTO document (document_id, name, path, type, upload_date, user_id) VALUES ('${document_id}', '${uploadedFileName}', '${path}', '${type}', '${date_now}', '${user_id}');`, async function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else {
                                await connection.query(`SELECT a.document_id, a.name, a.path, a.type, a.upload_date FROM document a LEFT JOIN "user" b on a.user_id=b.user_id WHERE a.user_id='${user_id}' and a.document_id='${document_id}';`, function (error, result, fields){
                                    if(error){
                                        console.log(error)
                                    } else {
                                        var dataDocument = []
                                            for (var i = 0; i < result.rows.length; i++) {
                                                var row = result.rows[i];
                                                var data_getDocument = {
                                                    "id": row.document_id,
                                                    "name": row.name,
                                                    "path": row.path,
                                                    "type": row.type,
                                                    "createDate": row.upload_date
                                                }
                                                dataDocument.push(data_getDocument)
                                            }
                                
                                            response.success_post_put("Document have been upload", dataDocument, res)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
}

exports.getMemberDocID = async function(req, res) {
    var proj_id = req.params.id
    var user_id = req.params.mid
    var document_id = req.params.did

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            await connection.query(`SELECT a.user_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, async function (error, result, fields){
                if(result.rowCount == 0){
                    response.not_found('Member in the Project Not Found', res)
                } else {
                    await connection.query(`SELECT a.document_id, a.name, a.path, a."type", a.upload_date FROM document a LEFT JOIN "user" b on a.user_id=b.user_id WHERE a.user_id='${user_id}' and a.document_id='${document_id}';`, function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else if(result.rowCount == 0){
                            response.not_found('Document Not Found', res)
                        } else {
                            var dataDocument = []
                                for (var i = 0; i < result.rows.length; i++) {
                                    var row = result.rows[i];
                                    var data_getDocument = {
                                        "id": row.document_id,
                                        "name": row.name,
                                        "path": row.path,
                                        "type": row.type,
                                        "createDate": row.upload_date
                                    }
                                    dataDocument.push(data_getDocument)
                                }
                    
                                response.success_getID(dataDocument, res)
                        }
                    })
                }
            })
        }
    })
}

exports.deleteMemberDocID = async function(req, res) {
    var proj_id = req.params.id
    var user_id = req.params.mid
    var document_id = req.params.did

    await connection.query(`select project_id from project where project_id='${proj_id}'`, async function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('Project Not Found', res)
        } else {
            await connection.query(`SELECT a.user_id FROM "user" a left join project b on a.project_id=b.project_id where a.project_id='${proj_id}' and a.user_id='${user_id}';`, async function (error, result, fields){
                if(result.rowCount == 0){
                    response.not_found('Member in the Project Not Found', res)
                } else {
                    await connection.query(`DELETE FROM document WHERE user_id='${user_id}' and document_id='${document_id}';`, function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else if(result.rowCount == 0){
                            response.not_found('Document Not Found', res)
                        } else {
                            response.success_delete('Document have been delete', res)
                        }
                    })
                }
            })
        }
    })
}