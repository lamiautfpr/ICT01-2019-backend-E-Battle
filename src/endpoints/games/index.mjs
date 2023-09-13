import { getConn } from "/opt/nodejs/database.mjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext.authorizer.lambda.user;

    let results = null;

    switch (event.requestContext.http.method) {
        case "GET": {

            if (
                !(event.queryStringParameters && event.queryStringParameters.id)
            ) {
                results = await conn.query({
                    name: "gamesget",
                    text: 'SELECT id, language, category, name, author, visibility, description, questions, "updatedAt" FROM games WHERE "user" = $1',
                    values: [user],
                });
            } else {
                results = await conn.query({
                    name: "gamesgetone",
                    text: 'SELECT id, language, category, name, author, visibility, description, questions, "updatedAt" FROM games WHERE "id" = $1 and "user" = $2',
                    values: [event.queryStringParameters.id, user],
                });
            }

            for (let body of results.rows) {
                for(let question of body.questions){
                    if(question.img){
                        question.img = 'https://static.api.ebattle.lamia-edu.com/'+question.img;
                    }
                }
            }

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows),
            };

            break;
        }
        case "POST": {
            switch(event.routeKey){
                case "POST /games":{
                    const body = JSON.parse(event.body);

                    if (
                        !(
                            body.language &&
                            body.category &&
                            body.name &&
                            body.questions
                        )
                    ) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Faltam argumentos, revise a documentação",
                            }),
                        };
                    }

                    if (body.questions.length == 0) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "É necessario ter ao menos uma pergunta",
                            }),
                        };
                    }

                    for (let question of body.questions) {

                        if (
                            !(
                                question.text &&
                                `${question.answer}` &&
                                question.answers &&
                                question.time &&
                                question.answers.length > 1
                            )
                        ) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage:
                                        "Alguma pergunta não segue o padrão dos jogos",
                                }),
                            };
                        }
                    }

                    let questions = [];
                    const s3 = new S3Client();

                    let dataAtual = new Date();

                    let date = `${dataAtual.getFullYear()}/${(dataAtual.getMonth()+1).toString().padStart(2,'0')}/${dataAtual.getDate().toString().padStart(2,'0')}`
                    let time = `${dataAtual.getHours().toString().padStart(2,'0')}${dataAtual.getMinutes().toString().padStart(2,'0')}${dataAtual.getSeconds().toString().padStart(2,'0')}`

                    let keys = await Promise.all(body['questions'].map(async question => {
                        if(question.img && question.img){
                            return question.img.length > 200 ?  "https://static.api.ebattle.lamia-edu.com/games/questions/2023/06/05/7-175449-1.png" : question.img // TODO Temporario, remover depois dos testes da unity
                            let key = `games/questions/${date}/${user}-${time}-${body['questions'].indexOf(question)}.png`;
                            const buf = Buffer.from(question.img.replace(/^data:image\/\w+;base64,/, ""),'base64');

                            await s3.send(new PutObjectCommand({
                                Bucket: 'ebattle-api-static-'+process.env.ENVIRONMENT,
                                Key: key,
                                Body: buf,
                                ContentType: 'image/png',
                            }));

                            if(buf.length > (20*1024*1024)){
                                return 'Tamanho excede o permitido'
                            }

                            return key;
                        }
                        return undefined;
                    }));

                    for (let question of body.questions) {
                        questions.push({
                            "text":question.text,
                            "tip":question.tip,
                            "answer":question.answer,
                            "time":question.time ,
                            "answers":question.answers,
                            "img": keys[body.questions.indexOf(question)],
                        });
                    }

                    try {
                        results = await conn.query({
                            name: "gamescreate",
                            text: 'INSERT INTO games ("user", "language", "category", "name", "visibility", "description", "questions", "author", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $1, CURRENT_TIMESTAMP) RETURNING id',
                            values: [
                                user,
                                body.language,
                                body.category,
                                body.name,
                                body.visibility ?? null,
                                body.description ?? null,
                                JSON.stringify(questions),
                            ],
                        });
                    } catch (e) {
                        if (
                            e.message == 'insert or update on table "games" violates foreign key constraint "games_categories_fk"'
                        ) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage: "Categoria inexistente",
                                }),
                            };
                        }

                        if (
                            e.message == 'insert or update on table "games" violates foreign key constraint "games_languages_fk"'
                        ) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage: "Linguagem inexistente",
                                }),
                            };
                        }
                    }
                    results = await conn.query({
                        text: 'SELECT id, language, category, name, author, visibility, description, questions, "updatedAt" FROM games WHERE "id" = $1',
                        values: [results.rows[0].id],
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0]),
                    };
                }
                case "POST /games/visibility":{

                    if (!(event.queryStringParameters && event.queryStringParameters.id)) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Falta o argumento id do game",
                            }),
                        };
                    }

                    const body = JSON.parse(event.body);

                    if (!`${body.visibility}`){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Falta o argumento visibility, revise a documentação",
                            }),
                        };
                    }

                    if(body.visibility != 0 && body.visibility != 1){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Dados incoerentes, revise a documentação",
                            }),
                        };
                    }

                    results = await conn.query({
                        name: "gamesvisibility",
                        text: 'UPDATE games SET visibility = $3 WHERE "id" = $1 and "user" = $2',
                        values: [event.queryStringParameters.id, user, body.visibility],
                    });

                    if (results.rowCount == 1){
                        return {
                            statusCode: 200,
                        };
                    } else {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorMessage:
                                    "Não foi encontrado nenhum game com esse id",
                            }),
                        };
                    }
                }
                case "POST /games/duplicate":{
                    if (!(event.queryStringParameters && event.queryStringParameters.id)) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Falta o argumento id do game",
                            }),
                        };
                    }

                    try{
                        results = await conn.query({
                            text:  `INSERT INTO games ("user", "language", "category", "name", "visibility", "description", "questions", "author", "updatedAt")
                                    SELECT
                                        $1, "language", "category", "name", 0, "description", "questions", "author", CURRENT_TIMESTAMP
                                    FROM games
                                    WHERE id = $2 AND ("user" = $1 OR visibility = 1) RETURNING id`,
                            values: [user, event.queryStringParameters.id],
                        });
                    }catch(e){
                        return e.message
                    }

                    if (results.rowCount == 0) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorMessage:
                                    "Não foi encontrado nenhum game com esse id",
                            }),
                        };
                    }

                    results = await conn.query({
                        text: 'SELECT id, language, category, name, author, visibility, description, questions, "updatedAt" FROM games WHERE "id" = $1',
                        values: [results.rows[0].id],
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0]),
                    };
                }
            }
        }
        case "PUT": {

            if (!(event.queryStringParameters && event.queryStringParameters.id)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Falta o argumento id do game",
                    }),
                };
            }

            const body = JSON.parse(event.body);

            if (
                !(
                    body.language &&
                    body.category &&
                    body.name &&
                    body.questions
                )
            ) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Faltam argumentos, revise a documentação",
                    }),
                };
            }

            if (body.questions.length == 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "É necessario ter ao menos uma pergunta",
                    }),
                };
            }

            for (let question of body.questions) {

                if (
                    !(
                        question.text &&
                        `${question.answer}` &&
                        question.answers &&
                        question.time &&
                        question.answers.length > 1
                    )
                ) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 1,
                            errorMessage:
                                "Alguma pergunta não segue o padrão dos jogos",
                        }),
                    };
                }
            }

            let questions = [];
            const s3 = new S3Client();

            let dataAtual = new Date();

            let date = `${dataAtual.getFullYear()}/${(dataAtual.getMonth()+1).toString().padStart(2,'0')}/${dataAtual.getDate().toString().padStart(2,'0')}`
            let time = `${dataAtual.getHours().toString().padStart(2,'0')}${dataAtual.getMinutes().toString().padStart(2,'0')}${dataAtual.getSeconds().toString().padStart(2,'0')}`

            let keys = await Promise.all(body['questions'].map(async question => {
                if(question.img && question.img){
                    return question.img.length > 200 ?  "https://static.api.ebattle.lamia-edu.com/games/questions/2023/06/05/7-175449-1.png" : question.img // TODO Temporario, remover depois dos testes da unity
                    let key = `games/questions/${date}/${user}-${time}-${body['questions'].indexOf(question)}.png`;
                    const buf = Buffer.from(question.img.replace(/^data:image\/\w+;base64,/, ""),'base64');

                    await s3.send(new PutObjectCommand({
                        Bucket: 'ebattle-api-static-'+process.env.ENVIRONMENT,
                        Key: key,
                        Body: buf,
                        ContentType: 'image/png',
                    }));

                    if(buf.length > (20*1024*1024)){
                        return 'Tamanho excede o permitido'
                    }

                    return key;
                }
                return undefined;
            }));

            for (let question of body.questions) {
                questions.push({
                    "text":question.text,
                    "answer":question.answer,
                    "time":question.time ,
                    "answers":question.answers,
                    "img": keys[body.questions.indexOf(question)],
                });
            }
            //return body, user, event.queryStringParameters.id
            try{
                results = await conn.query({
                    name: "gamesupdate",
                    text:`UPDATE games SET language = $1, category = $2, name = $3, visibility = $4, description = $5, questions = $6, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $7 AND "user" = $8 RETURNING id`,
                    values: [
                        body.language,
                        body.category,
                        body.name,
                        body.visibility ?? null,
                        body.description ?? null,
                        JSON.stringify(questions),
                        event.queryStringParameters.id,
                        user,
                    ],
                });
            }catch(e){
                return e.message
            }

            results = await conn.query({
                text: 'SELECT id, language, category, name, author, visibility, description, questions, "updatedAt" FROM games WHERE id = $1',
                values: [results.rows[0].id],
            });

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows[0]),
            };
        }
        case "DELETE": {
            if (
                !(event.queryStringParameters && event.queryStringParameters.id)
            ) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Falta o argumento id do game",
                    }),
                };
            }

            results = await conn.query({
                name: "gamesdelete",
                text: 'DELETE FROM games WHERE "id" = $1 and "user" = $2 RETURNING id',
                values: [event.queryStringParameters.id, user],
            });

            if (results.rowCount == 1) {
                return {
                    statusCode: 200,
                };
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorMessage:
                            "Não foi encontrado nenhum game com esse id",
                    }),
                };
            }
        }
    }
};
