import { getConn } from "/opt/nodejs/database.mjs";

function removerNull(objeto) {
    for (let chave in objeto) {
        if (objeto[chave] && typeof objeto[chave] === 'object') {
            objeto[chave] = removerNull(objeto[chave]);
            if (Object.keys(objeto[chave]).length === 0) {
                delete objeto[chave];
            }
        }
        if (objeto[chave] === null) {
            delete objeto[chave];
        }
    }
    return objeto;
}

function transformarObjeto(listaObjetos) {
    let resultado = {};

    for (let obj of listaObjetos) {
        let hierarquia = obj.hierarch || {};
        for (let [nivelStr, conteudo] of Object.entries(hierarquia)) {
            let nivel = parseInt(nivelStr);
            let resultadoNivel = resultado[nivel] || {};
            resultado[nivel] = resultadoNivel;

            // Nível de Ensino
            let nivelEnsino = conteudo.theaching_level;
            if (nivelEnsino) {
                resultadoNivel.theaching_level = nivelEnsino.name;
            }

            // Tema do Jogo
            let temaJogo = conteudo.game_theme;
            if (temaJogo) {
                let temaId = temaJogo.id;
                let resultadoTema = resultadoNivel[temaId] || {};
                resultadoNivel[temaId] = resultadoTema;
                resultadoTema.games_theme = temaJogo.name;
            }

            // Categoria
            let categoria = conteudo.category;
            if (!categoria) {
                continue; // Passa para a próxima iteração se categoria não existe
            }

            let categoriaId = categoria.id;
            let resultadoCategoria = resultadoNivel[categoriaId] || {};
            resultadoNivel[categoriaId] = resultadoCategoria;
            resultadoCategoria.category = categoria.name;

            // Subcategoria
            let subcategoria = conteudo.subcategory;
            if (!subcategoria) {
                continue; // Passa para a próxima iteração se subcategoria não existe
            }

            let subcategoriaId = subcategoria.id;
            let resultadoSubcategoria = resultadoCategoria[subcategoriaId] || {};
            resultadoCategoria[subcategoriaId] = resultadoSubcategoria;
            resultadoSubcategoria.subcategory = subcategoria.name;
        }
    }

    resultado = removerNull(resultado);

    return resultado;
}

export const handler = async () => {
    const conn = await getConn();

    const results = await conn.query({
        name: "categoriesget",
        text: ` SELECT
                    json_object_agg(tl.id,
                            json_build_object(
                                'theaching_level', json_build_object('id', tl.id, 'name', tl.name),
                                'game_theme', json_build_object('id', gt.id, 'name', gt.name),
                                'category', json_build_object('id', c.id, 'name', c.name),
                                'subcategory', json_build_object('id', s.id, 'name', s.name)
                            )
                    ) as hierarch
                FROM teaching_levels tl
                    INNER JOIN public.game_themes gt on tl.id = gt.teaching_levels_id
                    LEFT JOIN public.categories c on gt.id = c.games_theme_id
                    LEFT JOIN subcategories s on c.id = s.category_id
                GROUP BY tl.id, tl.name, gt.id, gt.name, c.id, c.name, s.id, s.name;`,
    });

    const hierarch = transformarObjeto(results.rows)

    return {
        statusCode: 200,
        body: JSON.stringify(hierarch),

    };
};
