import { fs } from 'fs';

exports.handler = async () => {
    return {
        statusCode: 200,
        body: (await fs.readFileSync("documentation.yaml", "utf8")).replace(
            "{{env}}",
            process.env.ENVIRONMENT,
        ),
    };
};
