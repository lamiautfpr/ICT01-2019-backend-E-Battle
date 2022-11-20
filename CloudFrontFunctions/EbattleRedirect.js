function handler(event) {
    return {
        statusCode: 302,
        statusDescription: 'Found',
        headers: { "location": { "value": "/prod"+event.request.uri } },
    };
}