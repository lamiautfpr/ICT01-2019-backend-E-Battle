const { getConn } = require("/opt/nodejs/database");

exports.handler = async () => {
    const conn = await getConn();

    const results = await conn.query({
        name: "languagesget",
        text: "SELECT id, name FROM languages ",
    });

    return {
        statusCode: 200,
        body: JSON.stringify(results.rows),
    };
};
