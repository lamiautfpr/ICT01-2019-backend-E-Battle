import { readFileSync } from 'fs';

export const handler = async () => {
    return {
        statusCode: 200,
        body: (await readFileSync("documentation.yaml", "utf8")).replace(
            "{{env}}",
            process.env.ENVIRONMENT,
        ),
    };
};
