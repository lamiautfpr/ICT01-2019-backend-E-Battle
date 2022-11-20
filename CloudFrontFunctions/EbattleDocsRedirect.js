function handler(event) {
    var request = event.request;
    var uri = request.uri.split('/');
    if(uri[2] === 'docs') {
        uri.splice(1, 2);
    }else if(uri[1] === 'docs') {
        uri.splice(1, 1);
    }
    request.uri = uri.join('/');
    return request;
}