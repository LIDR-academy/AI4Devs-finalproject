const proxy = require('express-http-proxy');
const express = require('express');
const app = express();

app.use(express.static(__dirname + '/dist/fuse/browser'));
app.use('/proxy_backend', proxy('http://172.21.134.46:3000'));
app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/dist/fuse/browser/index.html');
});

app.listen(4200, () => {
    console.log("Servidor escuchando en el puerto 4200...");
});