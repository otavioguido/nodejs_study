const http = require(`http`);
const fs = require(`fs/promises`);
const events = require(`node:events`);
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'me',
    password: 'secret',
    database: 'my_db'
});

/*
TODO: catch path param
TODO: manipulate request queries
TODO: set response header
TODO: set response body
TODO: db manipulation
*/

const emitter = new events.EventEmitter();

emitter.on(`readFile`, async (response, htmlFile) => {
    try {
        response.end(await fs.readFile(htmlFile, `utf-8`));
    } catch (err) {
        console.error(err);
        response.statusCode = 500;
        response.end(`Failed to load the page`);
    }
});

http.createServer(async (request, response) => {

    const myURL = new URL(request.url, `http://${request.host}`);
    connection.connect((error) => {
        if (error) {
            throw error;
        }
    });

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
    
    connection.end();
}).listen(3000);
