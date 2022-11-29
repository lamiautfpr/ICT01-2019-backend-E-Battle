'use strict';

const { getConn } = require('/opt/nodejs/database');

exports.handler = async (event) => {
    const conn = await getConn();
    if(event["headers"]["authorization"]!=null){
        const tk = event["headers"]["authorization"]
        const results = await conn.query({
            name: 'checklogin',
            text: 'SELECT id, email, name FROM users WHERE token = $1 and status = 1',
            values: [tk],
        });
        if(results.rows.length == 1){
            const user = results.rows[0];
            return {
                isAuthorized: true,
                context: {
                    user: user['id'],
                },
            };
        }
    }
    return {
        isAuthorized: false,
    }
}