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
        case "POST": {
            switch(event.routeKey){
                case "POST /register":{
                    if(event.body != null){
                        const body = JSON.parse(event.body);

                        let missing = [];
                        let invalid = [];

                        if(body["name"] == null){
                            missing.push("name")
                        }if(body["email"] == null){
                            missing.push("email")
                        }if(body["password"] == null){
                            missing.push("password")
                        }

                        if (missing.length > 0) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    statusCode: 400,
                                    status: "Bad Request",
                                    errorCode: 1,
                                    error: "Missing or invalid parameters",
                                    missing: missing,
                                    invalid: [],
                                }),
                            };
                        }

                        if(body["email"] == "" || !validaEmail(body["email"])){
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    statusCode: 400,
                                    status: "Bad Request",
                                    errorCode: 3,
                                    error: "invalid email format",
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
                                    error: "Insecure password",
                                }),
                            };
                        }

                        for (var val in body){
                            if(body[val] == ""){
                                invalid.push(val);
                            }
                        }

                        if (invalid.length > 0) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    statusCode: 400,
                                    status: "Bad Request",
                                    errorCode: 1,
                                    error: "Missing or invalid parameters",
                                    missing: [],
                                    invalid: invalid,
                                }),
                            };
                        }

                        results = await conn.query({
                            name: "verifyemail",
                            text: 'SELECT email, convitedby FROM email_controller WHERE email = $1 and situation = 1',
                            values: [
                                body.email,
                            ],
                        });

                        if (results.rows.length == 0){
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    statusCode: 400,
                                    status: "Bad Request",
                                    errorCode: 2,
                                    error: "Unauthorized email",
                                }),
                            };
                        }

                        results = await conn.query({
                            name: "permissionlevel",
                            text: 'SELECT permission_level FROM users WHERE id = $1',
                            values: [
                                results.rows[0].convitedby,
                            ],
                        });

                        try {
                            const password_hash = bcrypt.hashSync(body["password"], 10);

                            results = await conn.query({
                                name: "register",
                                text: 'INSERT INTO users ("name", "email", "password", "institution", "city", "work_type", "education_level", "status", "permission_level") VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8) RETURNING id',
                                values: [
                                    body.name,
                                    body.email,
                                    password_hash,
                                    body.institution,
                                    body.city,
                                    body.workType,
                                    body.educationLevel,
                                    results.rows[0].permission_level+1,
                                ],
                            });
                        } catch (e) {
                            if (
                                e.message == 'duplicate key value violates unique constraint "users_pk"'
                            ) {
                                return {
                                    statusCode: 400,
                                    body: JSON.stringify({
                                        statusCode: 400,
                                        status: "Bad Request",
                                        errorCode: 2,
                                        error: "Email ja registrado!",
                                    })
                                };
                            } else {
                                return {
                                    statusCode: 500,
                                    body: JSON.stringify({
                                        statusCode: 500,
                                        status: "Bad Request",
                                        errorCode: 6589,
                                        error: "Um erro inesperado ocorreu, cod 6589!!",
                                    })
                                };
                            }
                        }

                        results = await conn.query({
                            text: 'SELECT id, name, email FROM users WHERE "id" = $1',
                            values: [results.rows[0].id],
                        });

                        await conn.query({
                            name: "updateSituation",
                            text: `UPDATE email_controller SET situation = 2 WHERE email = $1 RETURNING id`,
                            values: [body.email],
                        });

                        return {
                            statusCode: 200,
                            body: JSON.stringify(results.rows[0]),
                        };

                    }else{
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                statusCode: 400,
                                status: "Bad Request",
                                errorCode: 1,
                                error: "Missing or invalid parameters",
                                missing: ["name","email","password"],
                                invalid: [],
                            }),
                        };
                    }
                }
            }
        }
    }
};
