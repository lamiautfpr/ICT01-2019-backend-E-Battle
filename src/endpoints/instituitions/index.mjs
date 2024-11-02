import { getConn } from "/opt/nodejs/database.mjs";

export const handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext.authorizer.lambda.user;
    let results = null;

    switch (event.requestContext.http.method) {
        case "GET":{
            switch(event.routeKey){
                case "GET /instituitions":{
                    results = await conn.query({
                        name: "instituitionsget",
                        text: "SELECT id, name FROM instituitions ",
                    });
                    
                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows),
                    };
                }
                case "GET /instituitions/mails":{
                    let user = event.requestContext.authorizer.lambda.user
            
                    let infos = await conn.query({
                        text: `SELECT u.instituition_id, r.permission_level FROM users u INNER JOIN roles r on r.id = u.role_id WHERE u.id = $1`,
                        values: [user],
                    });
                    
                    let instituition = infos.rows[0].instituition_id
                    let permission = infos.rows[0].permission_level
                    
                    // So gestor pode ter essas informaç~çoes da instituição
                    if (permission > 2){
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

                    results = await conn.query({
                        text: `
                            SELECT
                                e.email,
                                e."convitedby",
                                e."createdAt",
                                e."updatedAt",
                                json_build_object('id', i.id, 'name', i.name, 'acronym', i.acronym) as instituition,
                                json_build_object('id', s.id, 'situation', s.description) as situation
                            FROM email_controller e
                            INNER JOIN instituitions i ON i.id = e.instituition_id
                            INNER JOIN situations s on s.id = e.situation
                            WHERE e.instituition_id = $1`,
                        values: [instituition],
                    });
                    
                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows),
                    };
                }
                case "GET /instituitions/users":{
                    let user = event.requestContext.authorizer.lambda.user
            
                    let infos = await conn.query({
                        text: `SELECT u.instituition_id, r.permission_level  FROM users u INNER JOIN roles r on r.id = u.role_id WHERE u.id = $1`,
                        values: [user],
                    });
                    
                    let instituition = infos.rows[0].instituition_id
                    let permission = infos.rows[0].permission_level
                    
                    if (permission > 2){
                        return {
                            statusCode: 403,
                            body: JSON.stringify({
                                errorCode: 1,
                                errorMessage: "Acesso negado",
                            }),
                        };
                    }

                    results = await conn.query({
                        text: `
                            SELECT 
                                u.id, u.status, u.name, u.email, u."createdAt",
                                u.city, u.education_level,
                                (SELECT COUNT(*) FROM games g2 WHERE g2.user = u.id) as created_games,
                                json_build_object('id', i.id, 'name', i.name, 'acronym', i.acronym) as instituition,
                                json_build_object('id', r.id, 'name', r.name) as role
                            FROM users u
                            INNER JOIN instituitions i ON i.id = u.instituition_id
                            INNER JOIN roles r on r.id = u.role_id
                            INNER JOIN games g on g.user = u.id
                            WHERE u.instituition_id = $1 AND u.status = 1`,
                        values: [instituition],
                    });

                    return {
                        statusCode: 200,
                        body: JSON.stringify(results.rows),
                    };
                }
            }
        }
        case "POST":{
            if (!event.body){
                return {
                    statusCode: 403,
                    body: JSON.stringify({
                        errorCode: 0,
                        errorMessage: "Informações sobre cadastro nao encontradas",
                    }),
                };
            }
            
            const body = JSON.parse(event.body);
            
            // verificar nivel de permissao do usuario
            results = await conn.query({
                name: "usersget",
                text: "SELECT role_id FROM users WHERE id = $1",
                values: [user],
            });
            
            if (results.rows[0].role_id !== 1) {
                return {
                    statusCode: 403,
                    body: JSON.stringify({
                        errorCode: 0,
                        errorMessage: "Nivel de permissão insuficiente",
                    }),
                };
            }

            // Apenas a descrição é nao obrigatória
            if (
                !(
                    body.name           &&
                    body.plan_id        &&
                    body.acronym        &&
                    body.city           &&
                    body.state          
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

            // verificar plano
            results = await conn.query({
                name: "plansget",
                text: "SELECT id FROM plans WHERE id = $1",
                values: [body.plan_id],
            });

            if (results.rowCount === 0) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        errorCode: 2,
                        errorMessage: "Plano não encontrado",
                    }),
                };
            }
            
            try{

            // tudo certo so cadastrar a instituicao
            results = await conn.query({
                name: "instituitionsinsert",
                text: "INSERT INTO instituitions (name, description, plan_id, acronym, city, state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name",
                values: [body.name, body.description, body.plan_id, body.acronym, body.city, body.state],
            });
            
            }catch(e){
                return e.message
            }

            return {
                statusCode: 200,
                body: JSON.stringify(results.rows[0]),
            };
        }
    }
};
