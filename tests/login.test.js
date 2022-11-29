let request = require('supertest');

request = request('https://api.ebattle.lamia-edu.com');
const stage = 'dev';
const endpoint = '/'+stage+'/login';

describe('Login', function () {

    it('should executed successfully', async () => {
        const response = await request
            .post(endpoint)
            .send({"email": "cicd@test.com", "password": "CiCd@1.2,3"});

        expect(response.status).toEqual(200);
        expect(() => JSON.parse(response.text)).not.toThrow();
        let body;
        try{
            body = JSON.parse(response.text);
        }catch(_){}
        if(body == null){
            return;
        }
        expect(body.name).toBeDefined();
        expect(body.name).toBe("CI/CD");
        expect(body.email).toBeDefined();
        expect(body.email).toBe("cicd@test.com");
        expect(body.token).toBeDefined();
    });

    it('should fail with incorrect passord', async () => {
        const response = await request
            .post(endpoint)
            .send({"email": "cicd@test.com", "password": "wrong"});

        expect(response.status).toEqual(401);
        expect(response.text).toEqual(JSON.stringify({statusCode: 401, status: 'Unauthorized'}));
    });

    it('should fail with incorrect email', async () => {
        const response = await request
            .post(endpoint)
            .send({"email": "wrong@test.com", "password": "CiCd@1.2,3"});

        expect(response.status).toEqual(401);
        expect(response.text).toEqual(JSON.stringify({statusCode: 401, status: 'Unauthorized'}));
    });

    it('should fail only if email is sent', async () => {
        const response = await request
            .post(endpoint)
            .send({"email": "wrong@test.com"});

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', missing: ['password'], invalid: []}));
    });

    it('should fail only if password is sent', async () => {
        const response = await request
            .post(endpoint)
            .send({"password": "CiCd@1.2,3"});

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', missing: ['email'], invalid: []}));
    });

    it('should fail with empty request', async () => {
        const response = await request
            .post(endpoint);

        expect(response.status).toEqual(400);
        expect(response.text).toEqual(JSON.stringify({statusCode: 400, status: 'Bad Request', missing: ['email', 'password'], invalid: []}));
    });
});

