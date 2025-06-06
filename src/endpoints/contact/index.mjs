import { getConn } from "/opt/nodejs/database.mjs";

function validaEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

export const handler = async (event) => {
    const conn = await getConn();

    let results;
    let missing = []
    let invalid = []

    switch (event.requestContext.http.method) {
        case "GET": {
            break;
        }
        case "POST": {

            let body;
            let required = ["name","email","message"]

            try {
                body = JSON.parse(event.body);
            } catch (err) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        error: "JSON Invalido",
                        details: err.message,
                    }),
                };
            }

            for (const field of required) {
                if (!body[field]) {
                    missing.push(field);
                }
                if (body[field] && body[field].length < 2) {
                    invalid.push(`"${field}" deve ter pelo menos 2 caracteres`);
                }
                if (field === "email" && body[field] && !validaEmail(body[field])) {
                    invalid.push(`"${field}" deve ser um email válido`);
                }
            }

            if (missing.length > 0 || invalid.length > 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 400,
                        status: "Bad Request",
                        errorCode: 1,
                        error: "Parâmetros ausentes ou inválidos",
                        missing: missing,
                        invalid: invalid,
                    }),
                };
            }

            // Cria o contato
            await conn.query({
                name: "contact_create",
                text: `INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)`,
                values: [body.name, body.email, body.message]
            });

            return {
                statusCode: 200,
                body: JSON.stringify({
                    "message":"Obrigado por entrar em contato conosco. Nossa equipe irá analisar sua mensagem e responder o mais breve possível."
                }),
            };

        }
    }

};
