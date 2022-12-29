const http = require(`http`);

http.createServer((request, response) => {

    const myURL = new URL(request.url, `http://${request.host}`);
    response.writeHead(200, { 'Content-Type': 'text/html' });

    switch (myURL.pathname) {
        case `/test`:
            response.end(`<html><body>Test page</body></html>`);
            break;
        case `/other`:
            response.end(`<html><body>Other page</body></html>`);
            break;
        default:
            response.end(`<html><body>Home page</body></html>`);
            break;
    }    
}).listen(3000);
