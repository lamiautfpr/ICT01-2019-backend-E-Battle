let request = require("supertest");
require('dotenv').config();
request = request('https://api.ebattle.lamia-edu.com/dev');

const safeJSONParse = (text) => {
    try {
        return JSON.parse(text);
    } catch {
        return text; // Retorna texto puro se não for JSON válido
    }
};

                    /* Recomendaçõas: */
// 1. O teste é completo execute sempre tudo e nao apenas uma parte
// 2. Se tiver dando erro tente apagar do banco todo registro desse user cicd0001@gmail.com
// 3. Ao final do processo esse usuario é deletado realmente do banco

describe('Fluxo de Criação de Usuário', () => {
    const email = 'cicd0001@gmail.com';
    const password = 'Ci,Cd@2025.1';
    const username = "CiCDUserTest";
    const editUsername = 'CiCDEditTest';
    const recoverPassword = "Ci,Cd@2025.1";

    beforeAll(async () => {
        const response = await request
            .post("/login")
            .send({
                "email": process.env.CICD_MASTER_EMAIL,
                "password": process.env.CICD_MASTER_PASSWORD
            });

        const responseBody = safeJSONParse(response.text);

        expect(response.status).toBe(200);
        expect(responseBody).toHaveProperty('token'); // Verifica se o token foi realmente gerado

        masterToken = responseBody.token;
    });

    it('deve enviar um convite para o email', async () => {
        const response = await request
            .post('/mails/registermail')
            .set('Authorization', `${masterToken}`)
            .send({ "email": email });

        expect(response.status).toBe(200);

        let responseBody = safeJSONParse(response.text);

        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('email', email);
        expect(responseBody).toHaveProperty('situation');
        expect(responseBody.situation).toHaveProperty('id', 1);
        expect(responseBody.situation).toHaveProperty('description', 'Email enviado');
    });

    it('deve registrar o usuário com sucesso', async () => {
        const response = await request
            .post('/register')
            .send({
                name: username,
                email: email,
                password: password,
                status: 1,
                description: "Email utilizado para CICD",
                avatar: "avatar-9",
                institution: "Universidade Tecnológica Federal do Swagger",
                city: "SANTA HELENA",
                workType: "Ensino Fundamental",
                educationLevel: "Superior completo"
            });

        let responseBody = safeJSONParse(response.text);
        // Validações
        expect(response.status).toBe(200);  // Alterado para 201 conforme práticas REST
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('name', username);
        expect(responseBody).toHaveProperty('email', email);

        // Armazenando o ID do usuário para futuros testes
        userId = response.body.id;
    });

    it('deve logar com sucesso', async () => {
        const response = await request
            .post("/login")
            .send({"email": email, "password": password});

        expect(response.status).toEqual(200);
        let responseBody = safeJSONParse(response.text);

        expect(responseBody.name).toBe(username);
        expect(responseBody.email).toBe(email);
        expect(responseBody.role).toMatchObject({"id": 3, "name": "Professor(a)"});
        expect(responseBody.token).toBeDefined();
        userToken = responseBody.token;
    });

    it('deve recuperar as informações do usuário', async () => {
        const response = await request
            .get(`/users`)
            .set('Authorization', `${userToken}`);

        expect(response.status).toBe(200);

        let responseBody = safeJSONParse(response.text);

        // Validação completa do JSON esperado
        expect(responseBody).toMatchObject({
            id: expect.any(Number),
            status: 1,
            name: username,
            email: email,
            avatar: "avatar-9",
            description: "Email utilizado para CICD",
            createdAt: expect.any(String), // Aceita qualquer data válida no formato string
            city: "SANTA HELENA",
            education_level: "Superior completo",
            instituition: {
                id: 2,
                name: "Laboratorio de Aprendizado de Maquina e Imagens Aplicado a Industria",
                acronym: "LAMIA"
            },
            role: {
                id: 3,
                name: "Professor(a)"
            }
        });

        userId = responseBody.id;
    });

    it('deve editar as informações do usuário', async () => {
        const response = await request
            .put(`/users`)
            .set('Authorization', `${userToken}`)
            .send({
                name: editUsername,
                institution: "Universidade Tecnológica Federal do Swagger",
                city: "SANTA HELENA",
                workType: "Ensino Fundamental2",
                description: "Teste",
                avatar: "default_avatar",
                educationLevel: "Superior completo"
            });

        expect(response.status).toBe(200);

        let responseBody = safeJSONParse(response.text);

        // Validação completa do JSON esperado
        expect(responseBody).toMatchObject({
            id: expect.any(Number),
            status: 1,
            name: editUsername,
            email: email,
            avatar: "default_avatar",
            description: "Teste",
            createdAt: expect.any(String), // Aceita qualquer data válida no formato string
            city: "SANTA HELENA",
            education_level: "Superior completo",
            instituition: {
                id: 2,
                name: "Laboratorio de Aprendizado de Maquina e Imagens Aplicado a Industria",
                acronym: "LAMIA"
            },
            role: {
                id: 3,
                name: "Professor(a)"
            }
        });
    });

    it('deve enviar o e-mail de recuperação de senha', async () => {
        const response = await request
            .post('/mails/recovery')
            .send({ "email": email });

        let responseBody = safeJSONParse(response.text);

        expect(response.status).toBe(200);
        expect(responseBody).toMatchObject({
            id: expect.any(Number),
            email: email,
            situation: {
                id: 3,
                description: "Email de recuperação de senha enviado"
            }
        });
    });

    it('deve atualizar a senha do usuário com sucesso', async () => {
        const response = await request
            .post('/users')
            .send({
                "email": email,
                "password": recoverPassword
            });

        console.log('Resposta da API (Update Password):', response.status, response.text);

        expect(response.status).toBe(200);  // Apenas validação do status
    });

    it('deve logar com a senha nova com sucesso', async () => {
        const response = await request
            .post("/login")
            .send({"email": email, "password": recoverPassword});

        expect(response.status).toEqual(200);
        let responseBody = safeJSONParse(response.text);

        expect(responseBody.name).toBe(editUsername);
        expect(responseBody.email).toBe(email);
        expect(responseBody.role).toMatchObject({"id": 3, "name": "Professor(a)"});
        expect(responseBody.token).toBeDefined();
        userToken = responseBody.token;
    });

    it('deve deletar o usuário', async () => {
        expect(userId).toBeDefined(); // Garante que `userId` foi gerado
        const response = await request
            .delete(`/users?id=${userId}`)
            .set('Authorization', `${masterToken}`);
        expect(response.status).toBe(200);
    });

    it('para apagar de verdade o usuário', async () => {
        const response = await request
            .delete(`/users?id=${userId}&realDelete=true`)
            .set('Authorization', `${masterToken}`);
        expect(response.status).toBe(200);
    });

});