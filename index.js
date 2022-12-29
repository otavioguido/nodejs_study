import { createServer } from "http";
import { readFile } from "fs/promises";
import { EventEmitter } from 'node:events';

const emitter = new EventEmitter();

emitter.on(`readFile`, async (response, htmlFile) => {
    try {
        response.end(await readFile(htmlFile, `utf-8`));
    } catch {
        response.statusCode = 500;
        response.end(`Failed to load the page`);
    }
})

createServer(async (request, response) => {

    const myURL = new URL(request.url, `http://${request.host}`);
    // response.writeHead(200, { 'Content-Type': 'text/html' });    

    switch (myURL.pathname) {
        case `/test`:
            emitter.emit(`readFile`, response, `./pages/test.html`)
            break;
        case `/other`:
            emitter.emit(`readFile`, response, `./pages/other.html`)
            break;
        default:
            emitter.emit(`readFile`, response, `./pages/home.html`)
            break;
    }    
}).listen(3000);