let request = require('supertest');

request = request('https://api.ebattle.lamia-edu.com');
const stage = process.env.stage ?? 'dev';
const endpointLogin = '/'+stage+'/login';
const endpoint = '/'+stage+'/categories';

describe('Categories', function () {
    let token;

    beforeAll(async () => {
        const response = await request
            .post(endpointLogin)
            .send({"email": "cicd@test.com", "password": "CiCd@1.2,3"});
        token = JSON.parse(response.text).token;
    });

    it('should executed successfully', async () => {
        const response = await request
            .get(endpoint)
            .set('Authorization', token);

        expect(response.status).toEqual(200);
        expect(() => JSON.parse(response.text)).not.toThrow();
        let body;
        try{
            body = JSON.parse(response.text);
        }catch(_){}
        if(body == null){
            return;
        }
        for(let c of body){
            expect(c.id).toBeDefined();
            expect(c.name).toBeDefined();
        }
    });
});

