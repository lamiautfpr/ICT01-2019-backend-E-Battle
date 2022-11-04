'use strict';

const fs = require('fs');

exports.handler = async () => {
    return {
        statusCode: 200,
        body: await fs.readFileSync('documentation.yaml', 'utf8'),
    };
}