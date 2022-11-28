'use strict';

const { getConn } = require('/opt/nodejs/database');

exports.handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext.authorizer.lambda.user;

    let results = null;

    switch (event.requestContext.http.method) {
        case 'GET':

            if (!(event.queryStringParameters && event.queryStringParameters.id)){
                results = await conn.query({
                    name: "gamesget",
                    text: "SELECT id, language, category, name, questions FROM games WHERE \"user\" = $1",
                    values: [user],
                });
            }else{
                results = await conn.query({
                    name: "gamesgetone",
                    text: "SELECT id, language, category, name, questions FROM games WHERE \"id\" = $1 and \"user\" = $2",
                    values: [event.queryStringParameters.id, user],
                });
            }

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows),
            }
        case 'POST':
            const body = JSON.parse(event.body);

            if(!(body.language && body.category && body.language && body.name && body.questions)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Faltam argumentos, olhe a documentação"
                    })
                }
            }

            if(body.questions.length == 0){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "É necessario ter ao menos uma pergunta"
                    })
                }
            }

            for(let question of body.questions){
                if(!(question.text && question.answer && question.answers && question.time && (question.answers.length > 1))){
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 1,
                            errorMessage: "Alguma pergunta não segue o padrão dos jogos"
                        })
                    }
                }
            }

            try{

                results = await conn.query({
                    name: "gamescreate",
                    text: "INSERT INTO games (\"user\", \"language\", \"category\", \"name\", \"questions\") VALUES ($1, $2, $3, $4, $5) RETURNING id",
                    values: [user, body.language, body.category, body.name,  JSON.stringify(body.questions)],
                });

            }catch(e){

                if(e.message == 'insert or update on table "games" violates foreign key constraint "games_categories_fk"'){
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 1,
                            errorMessage: "Categoria inexistente"
                        })
                    }
                }

                if(e.message == 'insert or update on table "games" violates foreign key constraint "games_languages_fk"'){
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 1,
                            errorMessage: "Linguagem inexistente"
                        })
                    }
                }
            }

            results = await conn.query({
                text: "SELECT id, language, category, name, questions FROM games WHERE \"id\" = $1",
                values: [results.rows[0].id],
            });

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows[0]),
            }
        case 'DELETE':
            console.log('Opa');

            if (!(event.queryStringParameters && event.queryStringParameters.id)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Falta o argumento id do game"
                    })
                }
            }

            results = await conn.query({
                name: "gamesdelete",
                text: "DELETE FROM games WHERE \"id\" = $1 RETURNING id",
                values: [event.queryStringParameters.id],
            });

            if( results.rowCount == 0 ){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorMessage: "Não foi encontrado nenhum game com esse id"
                    })
                }
            }else{
                return {
                    statusCode: 200,
                    //body: JSON.stringify(results.rows[0]),
                }
            }
    }
}