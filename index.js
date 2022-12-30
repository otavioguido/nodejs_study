const http = require(`http`);
const fs = require(`fs/promises`);
const events = require(`node:events`);
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'testDB'
});

function htmlTemplate(arg1, arg2 = ``) {
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>${arg1} page</title>
</head>

<body>
    ${arg1} page: ${arg2}
</body>

</html>`;
}

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

emitter.on(`onApiFailure`, async (request, response, err) => {
    const { headers, method, url } = request;
    console.error(err);
    response.writeHead(500, { 'Content-Type': 'application/json' });
    const body = err;
    const responseBody = { headers, method, url, body };
    response.end(JSON.stringify(responseBody));
});

http.createServer(async (request, response) => {
    const { headers, method, url } = request;
    let body;
    request.on('error', (err) => {
        emitter.emit(`onApiFailure`, response, err);
    })

    response.on('error', (err) => {
        emitter.emit(`onApiFailure`, response, err);
    });

    const myURL = new URL(request.url, `http://${request.host}`);    

    if (myURL.pathname.startsWith(`/path`)) {
        const matches = myURL.pathname.match('\/path\/(.+)');

        response.writeHead(200, { 'Content-Type': 'text/html' });
        if (!matches || !matches[1]) {
            response.end(htmlTemplate(`Path`, `Not found`));
        } else {
            response.end(htmlTemplate(`Path`, matches[1]));
        }
    } else if (myURL.pathname.startsWith(`/query`)) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(htmlTemplate(`Query`, myURL.searchParams.get(`year`) || 0));
    } else if (myURL.pathname.startsWith(`/post`)) {
        if (request.method == `POST`) {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            body = { data: 'Hello World!' };
            const responseBody = { method, url, body };
            response.end(JSON.stringify(responseBody));
        }
    } else if (myURL.pathname.startsWith(`/validate`)) {
        body = [];
        request.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = JSON.parse(Buffer.concat(body).toString());

            if (body.text == `test`) {
                console.log(`success`);
            }

            response.writeHead(200, { 'Content-Type': 'application/json' });         
            const responseBody = { headers, method, url, body };
            response.end(JSON.stringify(responseBody));
        });
    } else if (myURL.pathname.startsWith(`/save`)) {
        body = [];
        request.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = JSON.parse(Buffer.concat(body).toString());            

            // connection.query(`CREATE DATABASE IF NOT EXISTS testDB;`, function (error) { if (error) throw error; });
            // connection.query(`CREATE TABLE IF NOT EXISTS test_table(text varchar(255));`, function (error) { if (error) throw error; });
            connection.query(`INSERT INTO test_table (text) VALUES ('${body.text}');`, function (error) { if (error) throw error; });

            response.writeHead(200, { 'Content-Type': 'application/json' });
            const responseBody = { headers, method, url, body };
            response.end(JSON.stringify(responseBody));
        });        
    } else {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(htmlTemplate(`Home`));
    }    

}).listen(3000);
