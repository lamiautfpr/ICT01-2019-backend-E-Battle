const { getConn } = require("/opt/nodejs/database");

const bcrypt = require("bcryptjs");

exports.handler = async (event) => {
    const conn = await getConn();

    let results = null;

    switch (event.requestContext.http.method) {
        case "POST": {
            const body = JSON.parse(event.body);

            if (
                !(
                    body.name &&
                    body.email &&
                    body.password &&
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
                    e.message ==
                    'duplicate key value violates unique constraint "users_pk"'
                ) {
                    return {
                        errorCode: 406,
                        errorMessge:
                            "O email ja esta cadastrado em outra conta",
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
        }
    }
};
