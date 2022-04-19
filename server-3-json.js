var http = require('http');

function onRequest(request, response) {
    console.log("Er was een request.");
    response.writeHead(200, {'Content-Type': 'text/json'});
    var json = JSON.stringify({
        tekst: "Dit is JSON!"
    });
    response.end(json);
}

http.createServer(onRequest).listen(3001);

console.log('de server luistert op poort 3000');