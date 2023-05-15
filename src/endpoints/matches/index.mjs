import { getConn } from "/opt/nodejs/database.mjs";

export const handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext.authorizer.lambda.user;

    let results = null;

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

            let id = event.queryStringParameters.id;

            results = await conn.query({
                name: "matchesget",
                text: `SELECT
                           matches.id, matches.game, matches.spaces, matches.groups, matches.random, matches.trivia,
                           json_build_object(
                                   'user', games.user,
                                   'visibility', games.visibility,
                                   'language', games.language,
                                   'category', games.category,
                                   'name', games.name,
                                   'questions', games.questions
                               ) AS game
                       FROM matches
                                INNER JOIN games ON games.id = matches.game
                       WHERE
                           matches.id = $1 AND games.user = $2;`,
                values: [id, user],
            });

            if (results.rows.length != 1) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorMessage: "Matche não encontrado",
                    }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows),
            };
        }
        case "POST": {
            const body = JSON.parse(event.body);

            switch (event.routeKey){
                case "POST /matches/start":{

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

                    results = await conn.query({
                        name: "validatecreatematch",
                        text: "SELECT games.id, games.user FROM games WHERE games.id = $1 and games.user = $2",
                        values: [
                            body.game,
                            user,
                        ],
                    });

                    if(results.rows.length != 1){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 2,
                                errorMessage: "Jogo não encontrado",
                            }),
                        };
                    }

                    let groups = []
                    for (let group of body.groups) {

                        if(!(group.name && group.players) || (group.players.length <= 0)){
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 3,
                                    errorMessage:
                                        "Grupos sem nome ou com menos de 1 jogador não são elegiveis",
                                }),
                            };
                        }

                        groups.push({
                            "name": group.name,
                            "players": group.players
                        })
                    }

                    results = await conn.query({
                        name: "creatematches",
                        text: 'INSERT INTO matches ("game", "spaces", "groups", "random", "trivia") VALUES ($1, $2, $3, $4, $5) RETURNING id',
                        values: [
                            body.game,
                            body.spaces,
                            JSON.stringify(groups),
                            body.random ?? false,
                            body.trivia ?? false,
                        ],
                    });

                    if(results.rows.length != 1){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Não foi possivel realizar o match",
                            }),
                        };
                    }

                    results = await conn.query({
                        name: "matchesreturn",
                        text: `SELECT
                                    matches.id, matches.game, matches.spaces, matches.groups, matches.random, matches.trivia,
                                    json_build_object(
                                        'user', games.user,
                                        'visibility', games.visibility,
                                        'language', games.language,
                                        'category', games.category,
                                        'name', games.name,
                                        'questions', games.questions
                                    ) AS game
                                FROM matches
                                INNER JOIN games ON games.id = matches.game
                                WHERE
                                    matches.id = $1 AND games.user = $2;`,
                        values: [results.rows[0].id, user],
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0]),
                    };

                }
                case "POST /matches":{

                    if(!(body.match && body.podium && body.turns)){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 3,
                                errorMessage:
                                    "Faltam dados na requisição, consulte a documentação",
                            }),
                        };
                    }

                    let podium = [];
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

                        podium.push({
                            "group": groups.group,
                            "position": groups.position
                        })

                    }

                    let turns = []
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

                        turns.push({
                            "question": turn.question,
                            "group"   : turn.group,
                            "response": turn.response,
                            "time"    : turn.time,
                            "powers"  : turn.powers,
                            "walked"  : turn.walked
                        })

                    }

                    results = await conn.query({
                        name: "validateupdatematch",
                        text: `SELECT matches.id
                                FROM matches
                                INNER JOIN games ON games.id = matches.game
                                WHERE games.user = $1 AND matches.id = $2`,
                        values: [user,body.match],
                    });

                    if(results.rows.length != 1){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 2,
                                errorMessage: "Match não encontrado",
                            }),
                        };
                    }

                    results = await conn.query({
                        name: "matchesput",
                        text: 'UPDATE matches SET "closedAt" = CURRENT_TIMESTAMP,  podium = $1, turns = $2 WHERE id = $3',
                        values: [
                            JSON.stringify(podium),
                            JSON.stringify(turns),
                            body.match
                        ],
                    });

                    if(results.rowCount != 1){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 2,
                                errorMessage: "Não foi possivel salvar as informações",
                            }),
                        };
                    }

                    return {
                        statusCode: 200
                    };
                }
            }
        }
    }
};
