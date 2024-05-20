import { getConn } from "/opt/nodejs/database.mjs";

export const handler = async (event) => {
    const conn = await getConn();

    let results;

    let relations = {
        "teaching_levels_id":"game_themes",
        "games_theme_id":"categories",
        "category_id":"subcategories"
    }


    if (!event.queryStringParameters) {
        results = await conn.query({
            name: "teaching_level_get",
            text: `SELECT tl.id as id, tl.name as name FROM teaching_levels tl GROUP BY tl.id,tl.name`
        });

        return {
            statusCode: 200,
            body: JSON.stringify(results.rows),
        };

    }

    if (Object.keys(event.queryStringParameters).length > 1){
        return {
            statusCode: 400,
            body: JSON.stringify({
                errorCode: 2,
                errorMessage: "Foram enviados mais parametros do que o necessario, revise a documentação",
            }),
        };
    }

    const queryParameter = Object.keys(event.queryStringParameters)[0]
    const id = event.queryStringParameters[queryParameter]
    const table = relations[queryParameter]

    if (!Object.keys(relations).includes(queryParameter)){
        return {
            statusCode: 400,
            body: JSON.stringify({
                errorCode: 2,
                errorMessage: `O parametro '${queryParameter}' não foi reconhecido, os parametros aceitos são: [${Object.keys(relations)}]`,
            }),
        };
    }


    if (!(/^[0-9]+$/.test(id))){
        return {
            statusCode: 400,
            body: JSON.stringify({
                errorCode: 2,
                errorMessage: `O parametro '${queryParameter}' deve ser do tipo inteiro`,
            }),
        };
    }

    results = await conn.query({
        text: `SELECT id,name FROM ${table} WHERE ${queryParameter} = ${id}`

    });

    return {
        statusCode: 200,
        body: JSON.stringify(results.rows),
    };

};
