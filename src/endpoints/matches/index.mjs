import { getConn } from "/opt/nodejs/database.mjs";

export const handler = async (event) => {
    const conn = await getConn();

    let results = null,
        results2 = null;
    let id = null;

    switch (event.requestContext.http.method) {
        case "GET": {
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

            id = event.queryStringParameters.id;

            results = await conn.query({
                name: "matchesget",
                text: 'SELECT id, game, spaces, groups, random, trivia FROM matches WHERE "id" = $1',
                values: [id],
            });

            if (results.rows.length == 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorMessage: "Matche não encontrado",
                    }),
                };
            }

            results2 = await conn.query({
                name: "gamesget",
                text: 'SELECT id, user, visibility, language, category, name, questions FROM games WHERE "id" = $1',
                values: [results.rows[0].game],
            });

            results.rows[0].game = results2.rows[0];

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows),
            };
        }
        case "PUT": {
            if (
                !(event.queryStringParameters && event.queryStringParameters.id)
            ) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage: "Falta o argumento id do match",
                    }),
                };
            }

            const id = event.queryStringParameters.id

            try{
                results = await conn.query({
                    name: "matchesget",
                    text: 'SELECT id FROM matches WHERE "id" = $1',
                    values: [id],
                });
            }catch(e){
                return e
            }

            if(!results.rows.length){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 2,
                        errorMessage: "Match não encontrado",
                    }),
                };
            }

            const body = JSON.parse(event.body);

            if(!(body.podium && body.turns)){
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 3,
                        errorMessage:
                            "Faltam dados na requisição, consulte a documentação",
                    }),
                };
            }

            for (let groups of body.podium){
                if (!(groups.group && groups.position)){
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 4,
                            errorMessage:
                                "Faltam dados no podium do game, consulte a documentação",
                        }),
                    };
                }
            }

            for (let turn of body.turns){
                if (!(turn.group && turn.response && turn.time)){
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 5,
                            errorMessage:
                                "Faltam dados nos turnos do game, consulte a documentação",
                        }),
                    };
                }
            }

            try{
                results = await conn.query({
                    name: "matchesput",
                    text: 'UPDATE matches SET "closedAt" = $1,  podium = $2, turns = $3 WHERE id = $4',
                    values: [
                        new Date(),
                        JSON.stringify(body.podium),
                        JSON.stringify(body.turns),
                        id
                    ],
                });
            }catch (e){
                return e.message
            }

            return {
                statusCode: 200,
                body: JSON.stringify(results.rowCount),
            };
        }
        case "POST": {
            const body = JSON.parse(event.body);

            if (!(body.game && body.spaces && body.groups)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage:
                            "Faltam dados na requisição, consulte a documentação",
                    }),
                };
            }

            if (body.groups.length < 2) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 1,
                        errorMessage:
                            "Não é possivel realizar a requisição com apenas um grupo",
                    }),
                };
            }

            try {
                results = await conn.query({
                    name: "creatematches",
                    text: 'INSERT INTO matches ("game", "spaces", "groups", "random", "trivia") VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    values: [
                        body.game,
                        body.spaces,
                        JSON.stringify(body.groups),
                        body.random ?? false,
                        body.trivia ?? false,
                    ],
                });
            } catch (e) {
                if (
                    e.message ==
                    'insert or update on table "matches" violates foreign key constraint "matches_games_fk"'
                ) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 1,
                            errorMessage: "game não encontrado",
                        }),
                    };
                }

                if (e.message.split(" ")[0] == "invalid") {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorMessage: "Forbidden",
                        }),
                    };
                }

                if (e.message == "permission denied for table matches") {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 1,
                            errorMessage: "Permissão negada",
                        }),
                    };
                }
            }

            results = await conn.query({
                name: "matchesget",
                text: 'SELECT id, game, spaces, groups, random, trivia FROM matches WHERE "id" = $1',
                values: [results.rows[0].id],
            });

            results2 = await conn.query({
                name: "gamesget",
                text: 'SELECT id, user, visibility, language, category, name, questions FROM games WHERE "id" = $1',
                values: [results.rows[0].game],
            });

            results.rows[0].game = results2.rows[0];

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows[0]),
            };
        }
    }
};
