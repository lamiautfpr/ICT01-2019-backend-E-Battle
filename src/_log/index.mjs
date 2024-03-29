import { getConn } from "/opt/nodejs/database.mjs";

export const handler = async (event) => {
    const conn = await getConn();
    await conn.query({
        name: "log",
        text: "INSERT INTO _log(value) VALUES ($1)",
        values: [event],
    });
    return {
        statusCode: 200,
        body: JSON.stringify({
            status: "working",
        }),
    };
};
