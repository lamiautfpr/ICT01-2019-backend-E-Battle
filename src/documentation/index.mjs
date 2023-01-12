import { fs } from 'fs';

export const handler = async () => {
    return {
        statusCode: 200,
        body: (await fs.readFileSync("documentation.yaml", "utf8")).replace(
            "{{env}}",
            process.env.ENVIRONMENT,
        ),
    };
};
