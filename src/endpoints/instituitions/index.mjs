import { getConn } from "/opt/nodejs/database.mjs";

export const handler = async (event) => {
    const conn = await getConn();
    const user = event.requestContext.authorizer.lambda.user;
    let results = null;

    switch (event.requestContext.http.method) {
        case "GET":{
            results = await conn.query({
                name: "instituitionsget",
                text: "SELECT id, name FROM instituitions ",
            });
            
            return {
                statusCode: 200,
                body: JSON.stringify(results.rows),
            };
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
