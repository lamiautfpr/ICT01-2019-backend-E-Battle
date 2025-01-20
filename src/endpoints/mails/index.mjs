import fs from 'fs/promises';
import { getConn } from "/opt/nodejs/database.mjs";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand} from "@aws-sdk/client-ses";
import { info } from 'console';

function validaEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Função auxiliar para converter um stream em uma string
async function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
}

async function bodyEmail(target, email){

    // Crie uma instância do cliente S3
    const s3Client = new S3Client({ region: 'us-east-1' });

    try {
        // Crie um comando para obter o objeto (arquivo) do S3
        const getObjectCommand = new GetObjectCommand({Bucket: `ebattle-api-static-${process.env.ENVIRONMENT}`,Key: `backend_assets/${target}/index.html`});

        // Execute o comando para obter o objeto do S3
        const { Body } = await s3Client.send(getObjectCommand);

        // Leia o conteúdo do objeto (arquivo) do S3
        let htmlContent = await streamToString(Body); // Implemente a função 'streamToString' para converter o stream em uma string

        // Substituir o link no conteúdo HTML
        let update_content = (target == 'invite_email') ? 'href="https://ebattle.lamia-edu.com/register?email="' : 'href="https://ebattle.lamia-edu.com/resetPassword?email="'
        let target_content = update_content.replace('email=',`email=${email}`)
        htmlContent = htmlContent.replace(update_content,target_content);

        // Substituir as urls utilizadas de acordo com o ambiente
        update_content = 'https://static.api.ebattle.lamia-edu.com/'+process.env.ENVIRONMENT+'/'
        htmlContent = htmlContent.replace('https://static.api.ebattle.lamia-edu.com/', update_content);

        return htmlContent;
    } catch (error) {
        return error.message
    }
}

export const handler = async (event) => {
    const conn = await getConn();

    let results = null;
    switch (event.requestContext.http.method) {
        case "GET": {

            if ((!event.queryStringParameters) || (!event.queryStringParameters.email)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 400,
                        status: "Bad Request",
                        errorCode: 1,
                        error: "Falta o parametro email",
                    }),
                };
            }

            if (!validaEmail(event.queryStringParameters.email)){
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

            results = await conn.query({
                name: "selectEmails",
                text: `SELECT 
                            e.email, e.situation, json_build_object('id', i.id, 'name', i.name, 'acronym', i.acronym) as instituition
                       FROM email_controller e
                       INNER JOIN instituitions i ON e.instituition_id = i.id
                       WHERE situation = 1 and email = $1`,
                values: [event.queryStringParameters.email]
            });

            if (results.rows.length == 0){
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        statusCode: 404,
                        status: "Not Found",
                        errorCode: 1,
                        error: "Email não encontrado ou não esta em situação de convite",
                    }),
                };
            }

            return JSON.stringify({
                statusCode: 200,
                bodyEmail: results.rows[0],

            })

        }
        case "POST": {
            let body;
            const sesClient = new SESClient({ region: 'us-east-1' });
            const fromMail = process.env.SUPPORT_EMAIL;
            const redirectLink = process.env.REDIRECT_LINK;

            let user_who_invited;
            let permission_user_who_invited;
            let instituition_user_who_invited;

            if (event.requestContext.authorizer != undefined){
                user_who_invited = event.requestContext.authorizer.lambda.user
                let convitedby = await conn.query({
                    name: "selectConvitedBy",
                    text: "SELECT role_id, instituition_id as instituition FROM users WHERE id = $1",
                    values: [
                        user_who_invited
                    ],
                });

                permission_user_who_invited = convitedby.rows[0].role_id
                instituition_user_who_invited = convitedby.rows[0].instituition
            }

            let situations = {
                0:"Em espera de envio",
                1:"Email enviado",
                2:"Enviado e usuario cadastrado",
                3:"Email de recuperação de senha enviado"
            }

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

            if ((!body.email) && (!body.emails)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Faltam argumentos, revise a documentação",
                    }),
                };
            }

            switch (event.routeKey){
                case "POST /mails/registermail":{

                    if ( permission_user_who_invited > 2){
                        return {
                            statusCode: 403,
                            body: JSON.stringify({
                                statusCode: 403,
                                status: "Forbidden",
                                errorCode: 1,
                                error: "Nivel de permissão insuficiente!",
                            }),
                        };
                    }

                    if (body["instituition"] == undefined){
                        body["instituition"] = instituition_user_who_invited
                    }

                    if ((instituition_user_who_invited != body["instituition"]) && (permission_user_who_invited > 1)){
                        return {
                            statusCode: 403,
                            body: JSON.stringify({
                                statusCode: 403,
                                status: "Forbidden",
                                errorCode: 1,
                                error: "Nivel de permissão insuficiente!",
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
                            text: 'INSERT INTO email_controller ("email", "situation", "createdAt", "updatedAt", "convitedby", "instituition_id") VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4) RETURNING id',
                            values: [
                                body.email,
                                1, // {0:"Em espera de envio",1:"Email enviado", 2:"Enviado e usuario cadastrado"}
                                user_who_invited,
                                body["instituition"]
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
                    const corpoEmail = await bodyEmail('invite_email',body['email'])

                    try {
                        const sendEmailCommand = new SendEmailCommand({
                            Source: `Suporte Duoeduca <${fromMail}>`,
                            ReplyToAddresses: [fromMail],
                            Destination: { ToAddresses: [body["email"]] },
                            Message: {
                                Subject: { Data: 'Bem vindo ao Duoeduca' },
                                Body: {Html: { Data: corpoEmail } },
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

                    results.rows[0].email.situation = {
                        "id": results.rows[0].email.situation,
                        "description": situations[results.rows[0].email.situation]
                    };

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0].email),
                    };
                }
                case "POST /mails/invite": {
                    const body = JSON.parse(event.body);

                    if ( permission_user_who_invited > 2){
                        return {
                            statusCode: 403,
                            body: JSON.stringify({
                                statusCode: 403,
                                status: "Forbidden",
                                errorCode: 1,
                                error: "Nivel de permissão insuficiente!",
                            }),
                        };
                    }

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

                    // Começando o envio do email
                    const corpoEmail = await bodyEmail('invite_email',body['emails'])
                    //return body['emails']
                    try {
                        const sendEmailCommand = new SendEmailCommand({
                            Source: `Suporte Duoeduca <${fromMail}>`,
                            ReplyToAddresses: [fromMail],
                            Destination: { ToAddresses: toMails },
                            Message: {
                                Subject: { Data: 'Bem vindo ao Duoeduca' },
                                Body: {Html: { Data: corpoEmail } },
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
                case "POST /mails/recovery": {

                    if (!validaEmail(body["email"])) {
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

                    if (typeof (body["email"]) != "string") {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Argumentos com tipo invalido, revise a documentação",
                            }),
                        };
                    }

                    results = await conn.query({
                        name: "recoveryEmail",
                        text: "SELECT id, name, email FROM users WHERE email = $1",
                        values: [body.email],
                    });

                    if (results.rows.length == 0) {
                        return {
                            statusCode: 404,
                            body: JSON.stringify({
                                status: "Not Found",
                                errorCode: 2,
                                error: "Email não encontrado",
                            }),
                        };
                    }

                    await conn.query({
                        name: "updateEmailRecoverySituation",
                        text: 'UPDATE email_controller SET situation = $2 WHERE email = $1',
                        values: [
                            results.rows[0].email,
                            3 // {0:"Em espera de envio",1:"Email enviado", 2:"Enviado e usuario cadastrado", 3:"Recuperação de senha solicitada"}
                        ],
                    });

                    // Começando o envio do email
                    const corpoEmail = await bodyEmail('recovery_email', body['email'])
                    try {
                        const sendEmailCommand = new SendEmailCommand({
                            Source: `Suporte Duoeduca <${fromMail}>`,
                            ReplyToAddresses: [fromMail],
                            Destination: { ToAddresses: [body["email"]] },
                            Message: {
                                Subject: { Data: 'Recuperação de senha' },
                                Body: { Html: { Data: corpoEmail } },
                            },
                        });
                        await sesClient.send(sendEmailCommand);
                    } catch (e) {
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
                        text: `SELECT json_build_object(
                                              'id', mail.id,
                                              'email', mail.email,
                                              'situation', mail.situation
                                      ) AS email
                               FROM email_controller AS mail
                               WHERE mail.email = $1`,
                        values: [results.rows[0].email],
                    });

                    results.rows[0].email.situation = {
                        "id": results.rows[0].email.situation,
                        "description": situations[results.rows[0].email.situation]
                    };

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0].email),
                    };
                }
            }
        }
        case "DELETE": {

            if ((!event.queryStringParameters) || (!event.queryStringParameters.email)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 400,
                        status: "Bad Request",
                        errorCode: 1,
                        error: "Falta o parametro id do email",
                    }),
                };
            }

            let user = event.requestContext.authorizer.lambda.user
            let email_to_delete = event.queryStringParameters.email

            let user_info = await conn.query({
                name: "selectUser",
                text: "SELECT id, role_id, instituition_id FROM users WHERE id = $1",
                values: [user],
            });

            let email_to_delete_info = await conn.query({
                name: "selectMail",
                text: "SELECT instituition_id FROM email_controller WHERE email = $1 AND situation = 1",
                values: [email_to_delete],
            });

            if (email_to_delete_info.rows.length == 0) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        statusCode: 404,
                        status: "Not Found",
                        errorCode: 1,
                        error: "Email não encontrado",
                    }),
                };
            }

            // so gestor pode excluir invite
            if (user_info.rows[0].role_id > 2){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        statusCode: 403,
                        status: "Forbidden",
                        errorCode: 1,
                        error: "Nivel de permissão insuficiente!",
                    }),
                };
            }

            // gestor so pode excluir da propria instituição
            if ((user_info.rows[0].role_id > 1) && (user_info.rows[0].instituition_id !== email_to_delete_info.rows[0].instituition_id)){
                return {
                    statusCode: 403,
                    body: JSON.stringify({
                        statusCode: 403,
                        status: "Forbidden",
                        errorCode: 1,
                        error: "Nivel de permissão insuficiente, para deletar usuarios de outras instituições!",
                    }),
                };
            }

            results = await conn.query({
                name: "deleteEmail",
                text: "DELETE FROM email_controller WHERE email = $1 AND situation = 1",
                values: [email_to_delete],
            });

            return JSON.stringify({
                statusCode: 200,
                message: "Email deletado com sucesso",
            });

        }
    }
};
