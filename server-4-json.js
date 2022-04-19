var http = require('http');

function onRequest(request, response) {
    console.log("Er was een request.");
    response.writeHead(200, {'Content-Type': 'text/plain'});

    var exampleArray = ["item1", "item2"];

    var exampleObject = {
        item1: "itemval",
        item2: "itemval"
    };
    var json = JSON.stringify({
        anArray: exampleArray,
        anObject: exampleObject,
        anOther: "item"
    });
    response.end(json);
}

http.createServer(onRequest).listen(proces.env.PORT);

console.log('de server luistert op poort 3000');