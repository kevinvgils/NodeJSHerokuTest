var http = require('http');

function onRequest(request, response) {
    console.log("Er was een request.");
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write('Hello world!');
    response.end();
}

http.createServer(onRequest).listen(process.env.PORT);

console.log('de server luistert op poort 3000');