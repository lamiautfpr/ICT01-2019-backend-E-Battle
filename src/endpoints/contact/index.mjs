import { getConn } from "/opt/nodejs/database.mjs";

function validaEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function sanitize(input) {
    if (!input || typeof input !== "string") {
        return null;
    }
    return input
        .normalize("NFD")                       // Separa letras de acentos
        .replace(/[\u0300-\u036f]/g, "")       // Remove acentos
        .replace(/[\s\/]+/g, "-")              // Substitui espaço e / por -
        .toUpperCase();                        // Converte para MAIÚSCULO
}


export const handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext?.authorizer?.lambda?.user || null;
    const VALID_REASONS = ["DUVIDA", "SUGESTAO","FEEDBACK", "ERRO-BUG", "PARCERIA","SUPORTE-TECNICO","OUTROS"]

    let results;
    let missing = []
    let invalid = []


    switch (event.requestContext.http.method) {
        case "GET": {
            break;
        }
        case "POST": {
            let body;
            let required = ["name","email","reason","message"]

            try{
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
                    missing.push(`'${field}' não pode estar vazio ou ausente`);
                }
                if (body[field] && body[field].length < 2) {
                    invalid.push(`'${field}' deve ter pelo menos 2 caracteres`);
                }
                if (field === "email" && body[field] && !validaEmail(body[field])) {
                    invalid.push(`'${field}' deve ser um email válido`);
                }
            }

            let reason = sanitize(body.reason)
            if (reason && !VALID_REASONS.includes(reason)) {
                invalid.push(`'reason' invalido (${body.reason}), deve ser um dos seguintes valores: ${VALID_REASONS.join(", ")}`);
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

            try{
                // Cria o contato
                await conn.query({
                    name: "contact_create",
                    text: `INSERT INTO user_contacts (user_id, name, email, reason, message) VALUES ($1, $2, $3, $4, $5)`,
                    values: [
                        user || null,
                        body.name,
                        body.email,
                        reason,
                        body.message
                    ]
                });

            } catch (err) {
                console.error("Erro ao inserir contato:", err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        error: "Erro ao inserir contato no banco de dados",
                        details: err.message,
                    }),
                }
            }
            return {
                statusCode: 200,
                body: JSON.stringify({
                    "message":"Obrigado por entrar em contato conosco. Nossa equipe irá analisar sua mensagem e responder o mais breve possível."
                }),
            };

        }
    }

};
