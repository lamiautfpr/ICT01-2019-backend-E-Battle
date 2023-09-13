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

                if(body["email"] != "" && !validaEmail(body["email"])){
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

                if (body["password"] != "" && body["password"].length < 8){
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

                try {
                    const password_hash = bcrypt.hashSync(body["password"], 10);

                    results = await conn.query({
                        name: "register",
                        text: 'INSERT INTO users ("name", "email", "password", "institution", "city", "work_type", "education_level", "status") VALUES ($1, $2, $3, $4, $5, $6, $7, 1) RETURNING id',
                        values: [
                            body.name,
                            body.email,
                            password_hash,
                            body.institution,
                            body.city,
                            body.workType,
                            body.educationLevel,
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
                                error: "Email already registered",
                            })
                        };
                    }
                }

                results = await conn.query({
                    text: 'SELECT id, name, email FROM users WHERE "id" = $1',
                    values: [results.rows[0].id],
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
};
