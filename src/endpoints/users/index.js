const { getConn } = require("/opt/nodejs/database");

exports.handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext.authorizer.lambda.user;
    let results = null;

    switch (event.requestContext.http.method) {
        case "GET": {
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
    }
};
