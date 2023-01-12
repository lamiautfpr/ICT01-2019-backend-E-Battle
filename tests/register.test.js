let request = require('supertest');

request = request('https://api.ebattle.lamia-edu.com');
const stage = process.env.stage ?? 'dev';
const endpoint = '/'+stage+'/register';

describe('Register', function () {

    it('should executed successfully', async () => {
        const randCode = Math.floor(+new Date() / 1000);
        const response = await request
            .post(endpoint)
            .send({
                "name": "CI/CD-"+randCode,
                "email": "cicd"+randCode+"@test.com",
                "password": "CiCd@1.2,3",
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
        expect(body.email).toBe("cicd"+randCode+"@test.com");
    });

    // it('should fail with empty name', async () => {
    //     const randCode = Math.floor(+new Date() / 1000)+"i1";
    //     const response = await request
    //         .post(endpoint)
    //         .send({
    //             "name": "",
    //             "email": "cicd"+randCode+"@test.com",
    //             "password": "",
    //             "institution": "Lamia",
    //             "city": "São Paulo",
    //             "workType": "Estudante",
    //             "educationLevel": "Graduação",
    //         });
    //
    //     expect(response.status).toEqual(400);
    //     expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 1, error: "Missing or invalid parameters", missing: [], invalid: ['name']}));
    // });
    //
    // it('should fail with empty email', async () => {
    //     const response = await request
    //         .post(endpoint)
    //         .send({
    //             "name": "CI/CD",
    //             "email": "",
    //             "password": "CiCd@1.2,3",
    //             "institution": "Lamia",
    //             "city": "São Paulo",
    //             "workType": "Estudante",
    //             "educationLevel": "Graduação",
    //         });
    //
    //     expect(response.status).toEqual(400);
    //     expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 1, error: "Missing or invalid parameters", missing: [], invalid: ['email']}));
    // });
    //
    // it('should fail with empty password', async () => {
    //     const randCode = Math.floor(+new Date() / 1000)+"i2";
    //     const response = await request
    //         .post(endpoint)
    //         .send({
    //             "name": "CI/CD-"+randCode,
    //             "email": "cicd"+randCode+"@test.com",
    //             "password": "",
    //             "institution": "Lamia",
    //             "city": "São Paulo",
    //             "workType": "Estudante",
    //             "educationLevel": "Graduação",
    //         });
    //
    //     expect(response.status).toEqual(400);
    //     expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 1, error: "Missing or invalid parameters", missing: [], invalid: ['password']}));
    // });
    //
    // it('should fail with empty request', async () => {
    //     const response = await request
    //         .post(endpoint);
    //
    //     expect(response.status).toEqual(400);
    //     expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 1, error: "Missing or invalid parameters", missing: ['name', 'email', 'password'], invalid: []}));
    // });
    //
    // it('should executed successfully with only basic info', async () => {
    //     const randCode = Math.floor(+new Date() / 1000)+"bi1";
    //     const response = await request
    //         .post(endpoint)
    //         .send({
    //             "name": "CI/CD-"+randCode,
    //             "email": "cicd"+randCode+"@test.com",
    //             "password": "CiCd@1.2,3",
    //         });
    //
    //     expect(response.status).toEqual(200);
    //     expect(() => JSON.parse(response.text)).not.toThrow();
    //     let body;
    //     try{
    //         body = JSON.parse(response.text);
    //     }catch(_){}
    //     if(body == null){
    //         return;
    //     }
    //     expect(body.id).toBeDefined();
    //     expect(body.name).toBeDefined();
    //     expect(body.name).toBe("CI/CD-"+randCode);
    //     expect(body.email).toBeDefined();
    //     expect(body.email).toBe("cicd"+randCode+"@test.com");
    // });
    //
    // it('should fail with already registered email', async () => {
    //     const response = await request
    //         .post(endpoint)
    //         .send({
    //             "name": "CI/CD",
    //             "email": "cicd@test.com",
    //             "password": "CiCd@1.2,3",
    //             "institution": "Lamia",
    //             "city": "São Paulo",
    //             "workType": "Estudante",
    //             "educationLevel": "Graduação",
    //         });
    //
    //     expect(response.status).toEqual(400);
    //     expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 2, error: "Email already registered"}));
    // });
    //
    // it('should fail with insecure password', async () => {
    //     const randCode = Math.floor(+new Date() / 1000)+"i3";
    //     const response = await request
    //         .post(endpoint)
    //         .send({
    //             "name": "CI/CD-"+randCode,
    //             "email": "cicd"+randCode+"@test.com",
    //             "password": "123",
    //             "institution": "Lamia",
    //             "city": "São Paulo",
    //             "workType": "Estudante",
    //             "educationLevel": "Graduação",
    //         });
    //
    //     expect(response.status).toEqual(400);
    //     expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', errorCode: 3, error: "Insecure password"}));
    // });
});

