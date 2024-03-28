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
            const user = event.requestContext.authorizer.lambda.user;
            results = await conn.query({
                text: 'SELECT id, status, name, email, institution, city, work_type, education_level FROM users WHERE "id" = $1',
                values: [user],
            });

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows[0]),
            };
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
