import { getConn } from "/opt/nodejs/database.mjs";
import bcrypt from "bcryptjs";

function validaEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

export const handler = async (event) => {
    const conn = await getConn();
    let results = null;

    switch (event.requestContext.http.method) {
        case "GET": {
            switch(event.routeKey){
                case "GET /users":{
                    try{
                    const user = event.requestContext.authorizer.lambda.user;
                    results = await conn.query({
                        text: `
                            SELECT 
                                u.id, u.status, u.name, u.email, 
                                u.city, work_type, education_level,
                                u.institution,
                                json_build_object('id', i.id, 'name', i.name) as instituition,
                                json_build_object('id', r.id, 'name', r.name) as role
                            FROM users u
                            INNER JOIN instituitions i ON i.id = u.instituition_id
                            INNER JOIN roles r on r.id = u.role_id
                            WHERE u."id" = $1`,
                        values: [user],
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0]),
                    };
                    }catch(e){
                        return e.message
                    }
                }
                case "GET /users/all":{
                    const user = event.requestContext.authorizer.lambda.user;
                
                    results = await conn.query({
                        text: 'SELECT role_id FROM users WHERE "id" = $1',
                        values: [user],
                    });
                    
                    //return user
                    
                    if (results.rows[0].role_id > 2){
                        return {
                            statusCode: 401,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Acesso negado",
                            }),
                        };
                    }

                    let situations = {
                        0:"Em espera de envio",
                        1:"Email enviado",
                        2:"Enviado e usuario cadastrado",
                        3:"Email de recuperação de senha enviado"
                    }

                    results = await conn.query({
                    text: `
                        SELECT
                            u.id, u.status, u.name, u.email, u.institution, u.city, u.work_type, u.education_level,
                            json_build_object('id', r.id, 'role', r.name) as role,
                            json_build_object('email', e.email, 'situation', e.situation, 'invitedAt', e."createdAt") as email_controller
                        FROM email_controller e 
                        RIGHT JOIN users u ON u.email = e.email
                        INNER JOIN roles r on r.id = u.role_id
                        WHERE e.convitedby = $1`,
                    values: [user],
                });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows),
                    };
                }
            }
        }
        case "PUT": {
            const user = event.requestContext.authorizer.lambda.user;
            const body = JSON.parse(event.body);

            if (
                !(
                    body.name &&
                    body.institution &&
                    body.city &&
                    body.workType &&
                    body.educationLevel
                )
            ) {
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
                text: ' UPDATE users SET "name" = $1, "institution" = $2, "city" = $3, "work_type" = $4, "education_level" = $5 WHERE "id" = $6 RETURNING id',
                values: [
                    body.name,
                    body.institution,
                    body.city,
                    body.workType,
                    body.educationLevel,
                    user,
                ],
            });

            results = await conn.query({
                text: 'SELECT id, name, institution, city, work_type, education_level FROM users WHERE "id" = $1',
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

    }
};
