'use strict';

const { getConn } = require('/opt/nodejs/database');

exports.handler = async () => {
    const conn = await getConn();

    const results = await conn.query({
        name: "categoriesget",
        text: "SELECT id, name from categories"
    });
    return {
        statusCode: 200,
        body: JSON.stringify(results.rows),
    }
}