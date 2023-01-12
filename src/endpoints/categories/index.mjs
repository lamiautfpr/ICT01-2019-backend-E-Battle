import { getConn } from "/opt/nodejs/database.mjs";

export const handler = async () => {
    const conn = await getConn();

    const results = await conn.query({
        name: "categoriesget",
        text: "SELECT id, name from categories",
    });
    return {
        statusCode: 200,
        body: JSON.stringify(results.rows),
    };
};
