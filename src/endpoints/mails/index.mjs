import { getConn } from "/opt/nodejs/database.mjs";
import { SESClient, SendEmailCommand} from "@aws-sdk/client-ses";

function validaEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

export const handler = async (event) => {
    const conn = await getConn();

    let results = null;
    switch (event.requestContext.http.method) {
        case "GET": {
            return
        }
        case "POST": {
            const sesClient = new SESClient({ region: 'us-east-1' });
            const fromMail = process.env.SUPPORT_EMAIL;
            const redirectLink = process.env.REDIRECT_LINK;

            switch (event.routeKey){
                case "POST /mails/registermail":{

                    let body;

                    try {
                        body = JSON.parse(event.body);
                    }catch (error){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                statusCode: 400,
                                status: "Bad Request",
                                errorCode: 1,
                                error: "Invalid email",
                            }),
                        };
                    }

                    if (!body.email){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Faltam argumentos, revise a documentação",
                            }),
                        };
                    }

                    if (!validaEmail(body["email"])){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                statusCode: 400,
                                status: "Bad Request",
                                errorCode: 1,
                                error: "Invalid email",
                            }),
                        };
                    }

                    if(typeof(body["email"]) != "string"){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Argumentos com tipo invalido, revise a documentação",
                            }),
                        };
                    }

                    try {
                        results = await conn.query({
                            name: "registerEmail",
                            text: 'INSERT INTO email_controller ("email", "situation", "createdAt", "updatedAt") VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
                            values: [
                                body.email,
                                1 // {0:"Em espera de envio",1:"Email enviado", 2:"Enviado e usuario cadastrado"}
                            ],
                        });
                    } catch (e) {
                        if (
                            e.message == 'duplicate key value violates unique constraint "email_controller_pk"'
                        ) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    statusCode: 400,
                                    status: "Bad Request",
                                    errorCode: 2,
                                    error: "Email already registered",
                                })
                            };
                        }
                    }

                    // Começando o envio do email
                    const corpoEmail = `
                        <h1>Seja muito Bem-Vindo!</h1>
                        <p>Aprender nunca foi tão fácil!</p>
                        <p>O objetivo principal do projeto E-Battle é o de estimular o aprendizado em sala de aula através da competitividade saudável entre os jogadores.</p>
                        <a href='${redirectLink}'><button>Começar</button></a>
                        <p>Atenciosamente,<br>Support Ebattle</p>
                    `;

                    try {
                        const sendEmailCommand = new SendEmailCommand({
                            Source: fromMail,
                            ReplyToAddresses: [fromMail],
                            Destination: { ToAddresses: [body["email"]] },
                            Message: {
                                Subject: { Data: 'Confirme Seu Endereço de E-mail' },
                                Body: { Charset: "UTF-8", Html: { Data: corpoEmail } },
                            },
                        });

                        await sesClient.send(sendEmailCommand);
                    }catch (e){
                        return {
                            statusCode: 500,
                            body: JSON.stringify({
                                errorCode: 2,
                                errorMessage: e.message,
                            }),
                        };
                    }

                    // email enviado agr o retorno
                    results = await conn.query({
                        text: `SELECT
                                   json_build_object(
                                           'id', mail.id,
                                           'email', mail.email,
                                           'situation', mail.situation
                                   ) AS email
                               FROM email_controller AS mail
                               WHERE mail."id" = $1`,
                        values: [results.rows[0].id],
                    });

                    let situations = {0:"Em espera de envio",1:"Email enviado", 2:"Enviado e usuario cadastrado"}

                    results.rows[0].email.situation = {
                        "id": results.rows[0].email.situation,
                        "description": situations[results.rows[0].email.situation]
                    };

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0].email),
                    };
                }
                case "POST /mails/verify": {
                    return
                }
                case "POST /mails/invite": {
                    const body = JSON.parse(event.body);

                    if (!body.emails){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Faltam argumentos, revise a documentação",
                            }),
                        };
                    }

                    const toMails = body['emails'];
                    //const nomeCliente = body['client_name'];

                    if (!Array.isArray(toMails)){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Argumentos com tipo invalido, revise a documentação",
                            }),
                        };
                    }

                    const corpoEmail = `
                        <h1>Seja muito Bem-Vindo!</h1>
                        <p>Aprender nunca foi tão fácil!</p>
                        <p>O objetivo principal do projeto E-Battle é o de estimular o aprendizado em sala de aula através da competitividade saudável entre os jogadores.</p>
                        <a href='${redirectLink}'><button>Começar</button></a>
                        <p>Atenciosamente,<br>Support Ebattle</p>
                    `;

                    try {
                        const sendEmailCommand = new SendEmailCommand({
                            Source: fromMail,
                            ReplyToAddresses: [fromMail],
                            Destination: { ToAddresses: toMails },
                            Message: {
                                Subject: { Data: 'Confirme Seu Endereço de E-mail' },
                                Body: { Charset: "UTF-8", Html: { Data: corpoEmail } },
                            },
                        });

                        await sesClient.send(sendEmailCommand);

                        return {
                            statusCode: 200,
                            body: JSON.stringify({ "SentEmails": toMails }),
                        };
                    }catch (e){
                        return {
                            statusCode: 500,
                            body: JSON.stringify({
                                errorCode: 2,
                                errorMessage: e.message,
                            }),
                        };
                    }
                }
            }
        }
    }
};