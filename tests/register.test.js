let request = require('supertest');

request = request('https://api.ebattle.lamia-edu.com');
const stage = process.env.stage ?? 'dev';
const endpoint = '/'+stage+'/register';
const email = "cicdtest@gmail.com";
const password = "CiCd@1.2,3";
describe('Register', function () {

    it('should executed successfully', async () => {
        let mail2 = 'cicd0001@gmail.com';
        const randCode = "test";//Math.floor(+new Date() / 1000);
        const response = await request
            .post(endpoint)
            .send({
                "name": "CI/CD-"+randCode,
                "email": mail2,
                "password": password,
                "institution": "Lamia",
                "city": "São Paulo",
                "workType": "Estudante",
                "educationLevel": "Graduação",
            });

        expect(response.status).toEqual(200);
        expect(() => JSON.parse(response.text)).not.toThrow();
        let body;
        try{
            body = JSON.parse(response.text);
        }catch(_){}
        if(body == null){
            return;
        }
        expect(body.id).toBeDefined();
        expect(body.name).toBeDefined();
        expect(body.name).toBe("CI/CD-"+randCode);
        expect(body.email).toBeDefined();
        expect(body.email).toBe(mail2);
    });

    it('should fail with empty name', async () => {
        const randCode = Math.floor(+new Date() / 1000)+"i1";
        const response = await request
            .post(endpoint)
            .send({
                "name": "",
                "email": email,
                "password": "12345678",
                "institution": "Lamia",
                "city": "São Paulo",
                "workType": "Estudante",
                "educationLevel": "Graduação",
            });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 1, error: "Missing or invalid parameters", missing: [], invalid: ['name']}));
    });

    it('should fail with empty email', async () => {
        const response = await request
            .post(endpoint)
            .send({
                "name": "CI/CD",
                "email": "",
                "password": password,
                "institution": "Lamia",
                "city": "São Paulo",
                "workType": "Estudante",
                "educationLevel": "Graduação",
            });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 3, error: "invalid email format"}));
    });

    it('should fail with empty password', async () => {
        const randCode = Math.floor(+new Date() / 1000)+"i2";
        const response = await request
            .post(endpoint)
            .send({
                "name": "CI/CD-"+randCode,
                "email": email,
                "password": "",
                "institution": "Lamia",
                "city": "São Paulo",
                "workType": "Estudante",
                "educationLevel": "Graduação",
            });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 3, error: "Insecure password"}));
    });

    it('should fail with empty request', async () => {
        const response = await request
            .post(endpoint);

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 1, error: "Missing or invalid parameters", missing: ['name', 'email', 'password'], invalid: []}));
    });

    it('should fail with already registered email', async () => {
        const response = await request
            .post(endpoint)
            .send({
                "name": "CI/CD",
                "email": email,
                "password": password,
                "institution": "Lamia",
                "city": "São Paulo",
                "workType": "Estudante",
                "educationLevel": "Graduação",
            });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 2, error: "Unauthorized email"}));
    });

    it('should fail with insecure password', async () => {
        const randCode = Math.floor(+new Date() / 1000)+"i3";
        const response = await request
            .post(endpoint)
            .send({
                "name": "CI/CD-"+randCode,
                "email": email,
                "password": "123",
                "institution": "Lamia",
                "city": "São Paulo",
                "workType": "Estudante",
                "educationLevel": "Graduação",
            });

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 3, error: "Insecure password"}));
    });
});

