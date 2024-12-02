import { getConn } from "/opt/nodejs/database.mjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext.authorizer.lambda.user;
    let results = null;

    switch (event.requestContext.http.method) {
        case "GET": {
            switch(event.routeKey){
                case "GET /games": {
                    if (
                        !(event.queryStringParameters && event.queryStringParameters.id)
                    ) {
                        results = await conn.query({
                            name: "gamesget",
                            text: `SELECT
                                       json_build_object(
                                               'id', games.id,
                                               'language', json_build_object('id', languages.id, 'name', languages.name),
                                               'teaching_level', json_build_object('id', teaching_levels.id, 'name', teaching_levels.name),
                                               'theme', json_build_object('id', game_themes.id, 'name', game_themes.name),
                                               'category', json_build_object('id', categories.id, 'name', categories.name),
                                               'subcategory', json_build_object('id', subcategories.id, 'name', subcategories.name),
                                               'name', games.name,
                                               'author', json_build_object('id', author.id, 'name', author.name, 'instituition', instituitions.name),
                                               'visibility', games.visibility,
                                               'description', games.description,
                                               'questions', games.questions,
                                               'updatedAt', games."updatedAt"
                                       ) AS game
                                   FROM games
                                            INNER JOIN users AS author ON author.id = games.author
                                            INNER JOIN languages ON languages.id = games.language
                                            INNER JOIN teaching_levels ON teaching_levels.id = games.teaching_level
                                            INNER JOIN game_themes ON game_themes.id = games.theme
                                            INNER JOIN instituitions ON instituitions.id = author.instituition_id
                                            LEFT JOIN categories ON categories.id = games.category
                                            LEFT JOIN subcategories ON subcategories.id = games.subcategory
                                   WHERE games.status = 1 AND games."user" = $1
                                   ORDER BY games."createdAt" DESC;`,
                            values: [user],
                        });
                    } else {
                        results = await conn.query({
                            name: "gamesgetone",
                            text: `SELECT
                                       json_build_object(
                                            'id', games.id,
                                           'language', json_build_object('id', languages.id, 'name', languages.name),
                                           'teaching_level', json_build_object('id', teaching_levels.id, 'name', teaching_levels.name),
                                           'theme', json_build_object('id', game_themes.id, 'name', game_themes.name),
                                           'category', json_build_object('id', categories.id, 'name', categories.name),
                                           'subcategory', json_build_object('id', subcategories.id, 'name', subcategories.name),
                                           'name', games.name,
                                           'author', json_build_object('id', author.id, 'name', author.name, 'instituition', instituitions.name),
                                           'visibility', games.visibility,
                                           'description', games.description,
                                           'questions', games.questions,
                                           'updatedAt', games."updatedAt"
                                       ) AS game
                                   FROM games
                                        INNER JOIN users AS author ON author.id = games.author
                                        INNER JOIN languages ON languages.id = games.language
                                        INNER JOIN teaching_levels ON teaching_levels.id = games.teaching_level
                                        INNER JOIN game_themes ON game_themes.id = games.theme
                                        INNER JOIN instituitions ON instituitions.id = author.instituition_id
                                        LEFT JOIN categories ON categories.id = games.category
                                        LEFT JOIN subcategories ON subcategories.id = games.subcategory
                                   WHERE games.status = 1 AND games."id" = $1 AND games."user" = $2`,
                            values: [event.queryStringParameters.id, user],
                        });
                    }

                    if (results.rows.length == 0){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 2,
                                errorMessage: "Nenhum jogo não encontrado",
                            }),
                        };
                    }

                    for (let body of results.rows) {
                        for (let question of body.game.questions) {
                            if (question.img) {
                                question.img = 'https://static.api.ebattle.lamia-edu.com/' + question.img;
                            }
                        }
                    }

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows.map((game) => game.game)),
                    };

                    break;
                }
                case "GET /games/community":{

                    let queryParts = {'limit': '', 'name': '', 'category':'', 'language':''};

                    if (event.queryStringParameters !== undefined){
                        for (let filter of Object.keys(event.queryStringParameters)) {
                            if (Object.keys(queryParts).includes(filter) && event.queryStringParameters[filter] !== undefined){

                                if(filter === 'name' && event.queryStringParameters[filter].length > 60){ continue; }

                                queryParts[filter] = event.queryStringParameters[filter]
                            }
                        }
                    }

                    results = await conn.query({
                        text: `SELECT
                                   json_build_object(
                                        'id', games.id,
                                        'language', json_build_object('id', languages.id, 'name', languages.name),
                                        'teaching_level', json_build_object('id', teaching_levels.id, 'name', teaching_levels.name),
                                        'theme', json_build_object('id', game_themes.id, 'name', game_themes.name),
                                        'category', json_build_object('id', categories.id, 'name', categories.name),
                                        'subcategory', json_build_object('id', subcategories.id, 'name', subcategories.name),
                                        'name', games.name,
                                        'author', json_build_object('id', author.id, 'name', author.name, 'instituition', instituitions.name),
                                        'visibility', games.visibility,
                                        'description', games.description,
                                        'questions', games.questions,
                                        'updatedAt', games."updatedAt"
                                   ) AS game
                               FROM games
                                    INNER JOIN users AS author ON author.id = games.author
                                    INNER JOIN languages ON languages.id = games.language
                                    INNER JOIN teaching_levels ON teaching_levels.id = games.teaching_level
                                    INNER JOIN game_themes ON game_themes.id = games.theme
                                    INNER JOIN instituitions ON instituitions.id = author.instituition_id
                                    LEFT JOIN categories ON categories.id = games.category
                                    LEFT JOIN subcategories ON subcategories.id = games.subcategory
                               WHERE games.author IN (221,276) AND games.status = 1 AND games.visibility=1 AND (
                                   ( $1::text IS NOT NULL AND games.name ILIKE '%' || $1 || '%' ) OR
                                   ( $2::integer IS NOT NULL AND games.category = $2 ) OR
                                   ( $3::integer IS NOT NULL AND games.language = $3 ) OR TRUE)
                               ORDER BY games."createdAt" DESC
                                   LIMIT $4`,
                        values: [(queryParts['name'] === '') ? null : queryParts['name'] , parseInt(queryParts['category']) || null, parseInt(queryParts['language']) || null, parseInt(queryParts['limit']) || 10]
                    });

                    for (let body of results.rows) {
                        for (let question of body.game.questions) {
                            if (question.img) {
                                question.img = 'https://static.api.ebattle.lamia-edu.com/' + question.img;
                            }
                        }
                    }

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows.map((game) => game.game)),
                    };
                }
                case "GET /games/visibility":{
                    if (!(event.queryStringParameters && event.queryStringParameters.id)) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Falta o argumento id do game",
                            }),
                        };
                    }

                    results = await conn.query({
                        text: 'SELECT visibility FROM games WHERE id = $1',
                        values: [event.queryStringParameters.id],
                    });

                    if (results.rows.length == 0) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 2,
                                errorMessage: "Nenhum jogo não encontrado",
                            }),
                        };
                    }

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0])
                    };

                    break;
                }
            }
            break;
        }
        case "POST": {

            let create_game_errors = {
                '"games_categories_fk"': 'Categoria',
                '"games_subcategory_fk"': 'Subcategoria',
                '"games_languages_fk"': 'Linguagem',
                '"games_teaching_level_fk"': 'Nivel de ensino',
                '"games_theme_fk"': 'Tema'
            };

            switch(event.routeKey){
                case "POST /games":{
                    const body = JSON.parse(event.body);
                    const category = body.category
                    if (
                        !(
                            body.language        &&
                            category.teaching_level  &&
                            category.theme           &&
                            body.name            &&
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

                    // caso sejam undefined
                    if (category.category === undefined){
                        category.category = null;
                    }
                    if (category.subcategory === undefined){
                        category.subcategory = null;
                    }

                    // Convertendo strings vazias para null
                    if (typeof category.category == "string"){
                        category.category = category.category.trim() || null;
                    }

                    if (typeof category.subcategory == "string"){
                        category.subcategory = category.subcategory.trim() || null;
                    }

                    if (category.category == null && category.subcategory != null){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Argumentos invalidos, revise a documentação",
                            }),
                        }
                    }

                    if ((category.category !== null && !(/^\d+$/.test(category.category))) ||
                        (category.subcategory !== null && !(/^\d+$/.test(category.subcategory)))) {
                        return {
                            statusCode: 404,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Algum dos elementos [Categoria, Subcategoria] estão inválidos, revise a documentação",
                            }),
                        };
                    }

                    for (let question of body.questions) {

                        if (!(Array.isArray(question.answers))){
                            return {

                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage:
                                        "Alguma pergunta não segue o padrão dos jogos",
                                }),
                            };
                        }

                        if (question.answers.length != 0 && !(question.answers.length > 1)){
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage:
                                        "Alguma pergunta não segue o padrão dos jogos",
                                }),
                            };
                        }
                        if (!(question.text && question.time)) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage:
                                        "Alguma pergunta não segue o padrão dos jogos",
                                }),
                            };
                        }

                        if ( question.text.length > 1310 || question.answer.length > 122 ) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage:
                                        "Numero de caracteres excedido",
                                }),
                            };
                        }

                        for (let answer of question.answers){
                            if ( answer.length > 122 ) {
                                return {
                                    statusCode: 400,
                                    body: JSON.stringify({
                                        errorCode: 1,
                                        errorMessage:
                                            "Numero de caracteres das alternativas excedido",
                                    }),
                                };
                            }
                        }

                    }

                    let questions = [];
                    const s3 = new S3Client();

                    let dataAtual = new Date();

                    let date = `${dataAtual.getFullYear()}/${(dataAtual.getMonth()+1).toString().padStart(2,'0')}/${dataAtual.getDate().toString().padStart(2,'0')}`
                    let time = `${dataAtual.getHours().toString().padStart(2,'0')}${dataAtual.getMinutes().toString().padStart(2,'0')}${dataAtual.getSeconds().toString().padStart(2,'0')}`

                    let keys = await Promise.all(body['questions'].map(async question => {
                        if(question.img && question.img){
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
                            text: `INSERT INTO games ( "user", "language", "teaching_level","theme","category","subcategory",
                                                       "name", "visibility", "description", "questions", "author", "updatedAt") 
                                                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $1, CURRENT_TIMESTAMP) RETURNING id`,
                            values: [
                                user,
                                body.language,
                                category.teaching_level,
                                category.theme,
                                category.category ?? null,
                                category.subcategory ?? null,
                                body.name,
                                body.visibility ?? null,
                                body.description ?? null,
                                JSON.stringify(questions)
                            ],
                        });

                    } catch (e) {

                        if (create_game_errors.hasOwnProperty(e.message.split('constraint ')[1])){
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage: `${create_game_errors[e.message.split('constraint ')[1]]} inexistente`,
                                }),
                            };
                        }

                        return e.message
                    }

                    results = await conn.query({
                        text: `SELECT
                                   json_build_object(
                                           'id', games.id,
                                           'language', json_build_object('id', languages.id, 'name', languages.name),
                                           'category', json_build_object(
                                                   'teaching_level', json_build_object('id', teaching_levels.id, 'name', teaching_levels.name),
                                                   'theme', json_build_object('id', game_themes.id, 'name', game_themes.name),
                                                   'category', json_build_object('id', categories.id, 'name', categories.name),
                                                   'subcategory', json_build_object('id', subcategories.id, 'name', subcategories.name)),
                                           'name', games.name,
                                           'author', json_build_object('id', author.id, 'name', author.name, 'instituition', instituitions.name),
                                           'visibility', games.visibility,
                                           'description', games.description,
                                           'questions', games.questions,
                                           'updatedAt', games."updatedAt"
                                   ) AS game
                               FROM games
                                        INNER JOIN users AS author ON author.id = games.author
                                        INNER JOIN languages ON languages.id = games.language
                                        INNER JOIN teaching_levels ON teaching_levels.id = games.teaching_level
                                        INNER JOIN game_themes ON game_themes.id = games.theme
                                        INNER JOIN instituitions ON instituitions.id = author.instituition_id
                                        LEFT JOIN categories ON categories.id = games.category
                                        LEFT JOIN subcategories ON subcategories.id = games.subcategory
                               WHERE games.status = 1 AND games."id" = $1`,
                        values: [results.rows[0].id],
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0].game),
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
                        text: 'UPDATE games SET visibility = $3 WHERE status = 1 AND "id" = $1 AND "user" = $2',
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
                    break;
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
                            text:  `INSERT INTO games ("user", "language", "teaching_level","theme","category","subcategory", "name", "visibility", "description", "questions", "author", "updatedAt")
                                    SELECT
                                        $1, "language", "teaching_level","theme","category","subcategory", "name" || ' - DUPLICATED', 0, "description", "questions", "author", CURRENT_TIMESTAMP
                                    FROM games
                                    WHERE status = 1 AND id = $2 AND ("user" = $1 OR visibility = 1) RETURNING id`,
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

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows[0]),
                    };

                    break;
                }
            }
            break;
        }
        case "PUT": {
            try{
                const body = JSON.parse(event.body);
                const category = body.category
                if (
                    !(
                        body.language        &&
                        category.teaching_level  &&
                        category.theme           &&
                        body.name            &&
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


                // Convertendo strings vazias para null
                if (typeof category.category == "string"){
                    category.category = category.category.trim() || null;
                }

                if (typeof category.subcategory == "string"){
                    category.subcategory = category.subcategory.trim() || null;
                }

                if (category.category == null && category.subcategory != null){
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 1,
                            errorMessage: "Argumentos invalidos, revise a documentação",
                        }),
                    }
                }

                if ((category.category !== null && (typeof category.category !== 'number' || !Number.isInteger(category.category))) ||
                    (category.subcategory !== null && (typeof category.subcategory !== 'number' || !Number.isInteger(category.subcategory)))) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({
                            errorCode: 1,
                            errorMessage: "Algum dos elementos [Categoria, Subcategoria] estão inválidos, revise a documentação",
                        }),
                    };
                }

                for (let question of body.questions) {

                    if (!(Array.isArray(question.answers))){
                        return {

                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage:
                                    "Alguma pergunta não segue o padrão dos jogos",
                            }),
                        };
                    }

                    if (question.answers.length != 0 && !(question.answers.length > 1)){
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage:
                                    "Alguma pergunta não segue o padrão dos jogos",
                            }),
                        };
                    }
                    if (!(question.text && `${question.answer}` && question.time)) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage:
                                    "Alguma pergunta não segue o padrão dos jogos",
                            }),
                        };
                    }

                    if ( question.text.length > 1310 || question.answer.length > 122 ) {
                        return {
                            statusCode: 400,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage:
                                    "Numero de caracteres excedido",
                            }),
                        };
                    }

                    for (let answer of question.answers){
                        if ( answer.length > 122 ) {
                            return {
                                statusCode: 400,
                                body: JSON.stringify({
                                    errorCode: 1,
                                    errorMessage:
                                        "Numero de caracteres das alternativas excedido",
                                }),
                            };
                        }
                    }

                }

                let questions = [];
                const s3 = new S3Client();

                let dataAtual = new Date();

                let date = `${dataAtual.getFullYear()}/${(dataAtual.getMonth()+1).toString().padStart(2,'0')}/${dataAtual.getDate().toString().padStart(2,'0')}`
                let time = `${dataAtual.getHours().toString().padStart(2,'0')}${dataAtual.getMinutes().toString().padStart(2,'0')}${dataAtual.getSeconds().toString().padStart(2,'0')}`

                let keys = await Promise.all(body['questions'].map(async question => {
                    if(question.img && question.img){
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

                results = await conn.query({
                    name: "gamesupdate",
                    text:`UPDATE games SET language = $1, teaching_level = $2,  theme = $3,category = $4, subcategory = $5, name = $6, visibility = $7, description = $8, questions = $9, "updatedAt" = CURRENT_TIMESTAMP WHERE status = 1 AND id = $10 AND "user" = $11 RETURNING id`,
                    values: [
                        body.language,
                        category.teaching_level,
                        category.theme,
                        category.category ?? null,
                        category.subcategory ?? null,
                        body.name,
                        body.visibility ?? null,
                        body.description ?? null,
                        JSON.stringify(questions),
                        event.queryStringParameters.id,
                        user,
                    ],
                });

                if (results.rows.length == 0){
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            errorCode: 2,
                            errorMessage: "Nenhum jogo não encontrado",
                        }),
                    };
                }

                results = await conn.query({
                    text: `SELECT
                               json_build_object(
                                       'id', games.id,
                                       'language', json_build_object('id', languages.id, 'name', languages.name),
                                       'category', json_build_object(
                                               'teaching_level', json_build_object('id', teaching_levels.id, 'name', teaching_levels.name),
                                               'theme', json_build_object('id', game_themes.id, 'name', game_themes.name),
                                               'category', json_build_object('id', categories.id, 'name', categories.name),
                                               'subcategory', json_build_object('id', subcategories.id, 'name', subcategories.name)),
                                       'name', games.name,
                                       'author', json_build_object('id', author.id, 'name', author.name, 'instituition', instituitions.name),
                                       'visibility', games.visibility,
                                       'description', games.description,
                                       'questions', games.questions,
                                       'updatedAt', games."updatedAt"
                               ) AS game
                           FROM games
                                    INNER JOIN users AS author ON author.id = games.author
                                    INNER JOIN languages ON languages.id = games.language
                                    INNER JOIN teaching_levels ON teaching_levels.id = games.teaching_level
                                    INNER JOIN game_themes ON game_themes.id = games.theme
                                    INNER JOIN instituitions ON instituitions.id = author.instituition_id
                                    LEFT JOIN categories ON categories.id = games.category
                                    LEFT JOIN subcategories ON subcategories.id = games.subcategory
                           WHERE games.status = 1 AND games."id" = $1`,
                    values: [results.rows[0].id],
                });

                return {
                    statusCode: 200,
                    body: JSON.stringify(results.rows[0].game),
                };
                break;
            } catch(e){
                return e.message
            }
        }
        case "DELETE": {
            try{
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
                    text: `UPDATE games SET status = 0 WHERE status = 1 AND id = $1 AND "user" = $2 RETURNING id`,
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
                break;
            }catch (e){
                return e.message
            }
        }
    }
};