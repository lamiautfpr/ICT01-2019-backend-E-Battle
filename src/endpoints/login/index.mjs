import { getConn } from "/opt/nodejs/database.mjs";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const handler = async (event) => {
    const conn = await getConn();
    if (event["headers"]["authorization"] != null) {
        const tk = event["headers"]["authorization"];
        const results = await conn.query({
            name: "checklogin",
            text: "SELECT id, email, name, work_type FROM users WHERE token = $1 and status = 1",
            values: [tk],
        });
        if (results.rows.length == 1) {
            const user = results.rows[0];
            return {
                statusCode: 200,
                body: JSON.stringify({
                    name: user["name"],
                    email: user["email"],
                    work_type: user["work_type"],
                    token: tk,
                }),
            };
        }
    } else if (event["body"] != null) {
        const body = JSON.parse(event["body"]);
        let missing = [];
        if (body["email"] == null) {
            missing.push("email");
        }
        if (body["password"] == null) {
            missing.push("password");
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
        const results = await conn.query({
            name: "login",
            text: "SELECT id, email, password, name, work_type FROM users WHERE email = $1 and status = 1",
            values: [body["email"]],
        });
        if (results.rows.length == 1) {
            const user = results.rows[0];
            if (bcrypt.compareSync(body["password"], user["password"])) {
                const token = (await crypto.randomBytes(64)).toString("hex");
                await conn.query({
                    name: "loginsettoken",
                    text: "UPDATE users SET token = $1 WHERE id = $2",
                    values: [token, user["id"]],
                });
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        name: user["name"],
                        email: user["email"],
                        work_type: user["work_type"],
                        token: token,
                    }),
                };
            }
        }
        return {
            statusCode: 401,
            body: JSON.stringify({
                statusCode: 401,
                status: "Unauthorized",
            }),
        };
    }
    return {
        statusCode: 400,
        body: JSON.stringify({
            statusCode: 400,
            status: "Bad Request",
            errorCode: 1,
            error: "Missing or invalid parameters",
            missing: ["email", "password"],
            invalid: [],
        }),
    };
};
