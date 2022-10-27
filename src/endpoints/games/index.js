'use strict';

const { getConn } = require('/opt/nodejs/database');

exports.handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext.authorizer.lambda.user;

    switch (event.requestContext.http.method) {
        case 'GET':
            const results = await conn.query({
                name: "gamesget",
                text: "SELECT id, language, category, name FROM games WHERE \"user\" = $1",
                values: [user],
            });
            return {
                statusCode: 200,
                body: JSON.stringify(results.rows),
            }
    }
}