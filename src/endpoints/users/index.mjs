import { getConn } from "/opt/nodejs/database.mjs";
import bcrypt from "bcryptjs";

function validaEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

const QUERIES = {
    GET_USERS: `SELECT
                    u.id, u.status, u.name, u.email, u.avatar, u.description, u."createdAt",
                    u.city, u.education_level,
                    json_build_object('id', i.id, 'name', i.name, 'acronym', i.acronym) as instituition,
                    json_build_object('id', r.id, 'name', r.name) as role
                FROM users u
                         INNER JOIN instituitions i ON i.id = u.instituition_id
                         INNER JOIN roles r on r.id = u.role_id
                WHERE u."id" = $1;`,
    UPDATE_USERS: `UPDATE users SET "name" = $1, "city" = $2, "education_level" = $3, "description" = $4, "avatar" = $5 WHERE "id" = $6 RETURNING id;`,
    DELETE_USERS: `UPDATE users SET status = 0 WHERE id = $1 RETURNING id;`
}

export const handler = async (event) => {
    const conn = await getConn();
    let results = null;

    switch (event.requestContext.http.method) {
        case "GET": {
            switch(event.routeKey){
                case "GET /users":{
                    const user = event.requestContext.authorizer.lambda.user;
                    results = await conn.query({
                        text: QUERIES.GET_USERS,
                        values: [user],
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0]),
                    };
                }
            }
        }
        case "PUT": {
            const user = event.requestContext.authorizer.lambda.user;
            const body = JSON.parse(event.body);

            if (!(
                body.name &&
                body.city &&
                body.description &&
                body.educationLevel &&
                body.avatar
            )) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Faltam argumentos, olhe a documentação",
                    }),
                };
            }

            results = await conn.query({
                name: "update",
                text: QUERIES.UPDATE_USERS,
                values: [
                    body.name,
                    body.city,
                    body.educationLevel,
                    body.description,
                    body.avatar,
                    user,
                ],
            });

            results = await conn.query({
                text: QUERIES.GET_USERS,
                values: [results.rows[0].id],
            });

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows[0]),
            };
        }
        case "POST": {

            let body;

            try {
                body = JSON.parse(event.body);
            }catch (error){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 400,
                        status: "Bad Request",
                        errorCode: 1,
                        error: "Informações invalidas",
                    }),
                };
            }

            if ((!body.email) || (!body.password)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Faltam argumentos, revise a documentação",
                    }),
                };
            }

            if (!validaEmail(body["email"])){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 400,
                        status: "Bad Request",
                        errorCode: 1,
                        error: "Email inválido",
                    }),
                };
            }

            if(typeof(body["email"]) != "string"){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Argumentos com tipo inválido, revise a documentação",
                    }),
                };
            }

            if (body["password"] == "" || body["password"].length < 8){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 400,
                        status: "Bad Request",
                        errorCode: 3,
                        error: "Senha fraca",
                    }),
                };
            }

            results = await conn.query({
                text: `SELECT email FROM email_controller WHERE email = $1 and situation = 3 `,
                values: [body["email"]],
            });

            if (results.rows.length == 0){
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        status: "Not Found",
                        errorCode: 2,
                        error: "Email não encontrado",
                    }),
                };
            }

            results = await conn.query({
                name: "updatePassword",
                text: 'UPDATE users SET password = $2, token=NULL WHERE email = $1 RETURNING email',
                values: [results.rows[0].email,bcrypt.hashSync(body["password"], 10)],
            });

            await conn.query({
                name: "updateEmailRecoverySituation",
                text: 'UPDATE email_controller SET situation = 2 WHERE email = $1',
                values: [results.rows[0].email],
            });

            return {statusCode: 200};

        }
        case "DELETE": {
            let user = event.requestContext.authorizer.lambda.user
            if ((!event.queryStringParameters) || (!event.queryStringParameters.id)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 400,
                        status: "Bad Request",
                        errorCode: 1,
                        error: "Falta o parametro id do usuario",
                    }),
                };
            }

            const userToDelete = event.queryStringParameters.id;
            const realDelete = (event.queryStringParameters.realDelete == "true") ? true : false;

            let users_info = await conn.query({
                name: "selectUser",
                text: "SELECT id, role_id, email, instituition_id FROM users WHERE id IN ($1,$2)",
                values: [user, userToDelete],
            });

            if (users_info.rows.length < 2){
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        statusCode: 404,
                        status: "Not Found",
                        errorCode: 1,
                        error: "Usuário não encontrado",
                    }),
                };
            }

            // mapear por objeto id
            users_info = users_info.rows.reduce((acc, cur) => {
                acc[cur.id] = cur;
                return acc;
            }, {});

            // so gestor pode excluir usuario, exceto se for excluir ele mesmo
            if (
                ((users_info[user].role_id > 2) && (users !== userToDelete)) ||
                (users_info[user].instituition_id !== users_info[userToDelete].instituition_id)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 403,
                        status: "Forbidden",
                        errorCode: 1,
                        error: "Nivel de permissão insuficiente!",
                    }),
                };
            }

            if (realDelete){
                results = await conn.query({
                    name: "deleteUser",
                    text: `DELETE FROM users WHERE id = $1 RETURNING id`,
                    values: [userToDelete],
                });

                results = await conn.query({
                    name: "deleteUserMail",
                    text: `DELETE FROM email_controller WHERE email = $1 RETURNING email`,
                    values: [users_info[userToDelete].email],
                });

                return {
                    statusCode: 200,
                }
            }

            results = await conn.query({
                name: "deleteUserSingle",
                text: QUERIES.DELETE_USERS,
                values: [userToDelete],
            });

            return {
                statusCode: 200,
            };

        }
    }
};
