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
                    	    m.id, m.game, m.spaces,	m.groups, m.random, m.trivia, 
                    	    g.user, g.visibility, g.language, g.category, g.name, g.questions
                       FROM matches m
                       INNER JOIN games g ON g.id = m.game
                       WHERE m.id = $1 AND g.user = $2`,
                values: [id, user],
            });

            if (results.rows.length == 0) {
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

            switch (event.rawPath){
                case "/dev/matches/start":{

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

                    let validate = null;
                    try {
                        validate = await conn.query({
                            name: "validatematch",
                            text: 'SELECT g.id, g.user FROM games g WHERE g.id = $1 and g.user = $2',
                            values: [
                                body.game,
                                user,
                            ],
                        });

                        if(!validate.rows.length){
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 2,
                                    errorMessage: "Jogo não encontrado",
                                }),
                            };
                        }
                    } catch (e) {
                        return {
                            statusCode: 500,
                            body: JSON.stringify({
                                errorCode: 0,
                                errorMessage: "Match não foi invalido",
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

                    try {
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
                    } catch (e) {
                        if (
                            e.message == 'insert or update on table "matches" violates foreign key constraint "matches_games_fk"'
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
                        text: `SELECT 
                            	    m.id, m.game, m.spaces,	m.groups, m.random, m.trivia, 
                            	    g.user, g.visibility, g.language, g.category, g.name, g.questions
                               FROM matches m
                               INNER JOIN games g ON g.id = m.game
                               WHERE m.id = $1`,
                        values: [results.rows[0].id],
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0]),
                    };
                }
                case "/dev/matches":{
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

                    let validate = null;
                    try{
                        results = await conn.query({
                            name: "validatematch",
                            text: `SELECT
                                        m.id
                                    FROM
                                        matches m
                                        INNER JOIN games g ON g.id = m.game
                                        INNER JOIN users u ON u.id = g.user
                                    WHERE
                                    	u.id = $1 AND m.id = $2`,
                            values: [user,body.match],
                        });

                        if(!results.rows.length){
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 2,
                                    errorMessage: "Match não encontrado",
                                }),
                            };
                        }
                    }catch(e){
                        return {
                            statusCode: 510,
                            body: JSON.stringify({
                                errorCode: 0,
                                errorMessage: "Match não foi validado",
                            }),
                        };
                    }

                    try{
                        results = await conn.query({
                            name: "matchesput",
                            text: 'UPDATE matches SET "closedAt" = CURRENT_TIMESTAMP,  podium = $1, turns = $2 WHERE id = $3',
                            values: [
                                JSON.stringify(podium),
                                JSON.stringify(turns),
                                body.match
                            ],
                        });
                    }catch (e){
                        return {
                            statusCode: 500,
                            body: JSON.stringify({
                                errorCode: 0,
                                errorMessage: "Não foi possivel salvar os dados da partida",
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
