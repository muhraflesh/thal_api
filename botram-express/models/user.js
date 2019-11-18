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
    
    if(req.query.name || req.query.mail || req.query.phone || req.query.cnum || req.query.gender) {
            connection.query(
                `SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" WHERE LOWER(firstname) LIKE LOWER('%${req.query.name}%') or LOWER(lastname) LIKE LOWER('%${req.query.name}%') or LOWER(username) LIKE LOWER('%${req.query.name}%') or telephone LIKE '%${req.query.phone}%' or LOWER(email) LIKE LOWER('%${req.query.mail}%') or LOWER(card_number) LIKE LOWER('%${req.query.cnum}%') or LOWER(gender) LIKE LOWER('%${req.query.gender}%') order by firstname offset ${offset} limit ${limit}`,
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
        connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" offset ${offset} limit ${limit};`, function (error, result, fields){
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
        
    var user_id = crypto.createHash('sha1').update('User/Member' + date_now).digest('hex');
    // REQ DARI CLIENT
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
                                await connection.query(`INSERT INTO "user" (user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, role_id, create_date, update_date) VALUES ('${user_id}', '${firstname}', '${lastname}', '${username}', '${mail}', '${phone}', '${card_member}', '${card_number}', '${gender}', '${birthdate}', '${role_id}', '${date_now}', '${date_now}');`, function (error, result, fields){
                                    if(error){
                                        console.log(error)
                                    } else {
                                        connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" where user_id='${user_id}';`, function (error, result, fields){
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
                            
                                                response.success_post_put("User have been create", dataMember, res)
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
    
exports.findByID = function(req, res) {
    var user_id = req.params.id

    connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" where user_id='${user_id}'`, function (error, result, fields){
        if(error){
            console.log(error)
        } else if(result.rowCount == 0) {
            response.not_found('User Not Found', res)
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
            response.success_getID(dataMember, res)
        }
    });

}
  
//BELUM JADI
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
    
        var user_id = req.params.id
    
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
    
        await connection.query(`select user_id from "user" where user_id='${user_id}'`, async function (error, result, fields){
            if(result.rowCount == 0){
                response.not_found('User Not Found', res)
            } else {
                var promise1 = { 
                    if(firstname){
                        connection.query(`UPDATE "user" SET firstname = '${firstname}' where user_id='${user_id}';`, function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else{
                                console.log('firstname Berhasil Diubah')
                            }
                        });
                    }
                }
                var promise2 = {
                    if(lastname){
                        connection.query(`UPDATE "user" SET lastname = '${lastname}' where user_id='${user_id}';`, function (error, result, fields){
                            if(error){
                                console.log(error)
                            } else{
                                console.log('lastname Berhasil Diubah')
                            }
                        });
                    }
                }
                // if(username){
                //     await connection.query(`UPDATE "user" SET username = '${username}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('username Berhasil Diubah')
                //         }
                //     });
                // }
                // if(password){
                //     await connection.query(`UPDATE "user" SET password = '${password}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('password Berhasil Diubah')
                //         }
                //     });
                // }
                // if(email){
                //     await connection.query(`UPDATE "user" SET email = '${email}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('email Berhasil Diubah')
                //         }
                //     });
                // }
                // if(phone){
                //     await connection.query(`UPDATE "user" SET telephone = '${phone}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('telephone Berhasil Diubah')
                //         }
                //     });
                // }
                // if(card_member){
                //     await connection.query(`UPDATE "user" SET card_member = '${card_member}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('card_member Berhasil Diubah')
                //         }
                //     });
                // }
                // if(card_number){
                //     await connection.query(`UPDATE "user" SET card_number = '${card_number}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('card_number Berhasil Diubah')
                //         }
                //     });
                // }
                // if(gender){
                //     await connection.query(`UPDATE "user" SET gender = '${gender}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('gender Berhasil Diubah')
                //         }
                //     });
                // }
                // if(birth_date){
                //     await connection.query(`UPDATE "user" SET birth_date = '${birth_date}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('birth_date Berhasil Diubah')
                //         }
                //     });
                // }
                // if(role_id){
                //     await connection.query(`UPDATE "user" SET role_id = '${role_id}' where user_id='${user_id}';`, function (error, result, fields){
                //         if(error){
                //             console.log(error)
                //         } else{
                //             console.log('role_id Berhasil Diubah')
                //         }
                //     });
                // }
            
                var promise3 = new Promise(async function(){
                    connection.query(`SELECT user_id, firstname, lastname, username, email, telephone, card_member, card_number, gender, birth_date, is_active, is_login, create_date, update_date, role_id FROM "user" where user_id='${user_id}'`, function (error, result, fields){
                        if(error){
                            console.log(error)
                        } else if(result.rowCount == 0) {
                            response.not_found('User Not Found', res)
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
                            response.success_getID(dataMember, res)
                        }
                    });
                })
                    
                Promise.all([promise1, promise2, promise3])
            }
        });
    
}
    
exports.delete = function(req, res) {
    var user_id = req.params.id
    
    connection.query(`DELETE FROM "user" WHERE user_id='${user_id}'`, function (error, result, fields){
        if(result.rowCount == 0){
            response.not_found('User Not Found', res)
        } else{
            response.success_delete('User Has Been Deleted', res)
        }
    });
}