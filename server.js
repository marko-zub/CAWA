var express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http'),
    httpServer = http.Server(app),
    target = '/source',
    bower = '/bower_components',
    images = '/source/app/images',
    build = '/release'
    port = 8000,
    host = '0.0.0.0';

app.use('/build/fonts', express.static(path.join(__dirname, build, 'fonts')));
app.use('/build/images', express.static(path.join(__dirname, build, 'images')));
app.use('/build/styles', express.static(path.join(__dirname, build, 'styles')));
app.use('/build/js', express.static(path.join(__dirname, build, 'js')));
app.use('/build/app.config', express.static(path.join(__dirname, build, 'app.config')));

app.get('/build/*', (req, res) => {
    res.sendFile(__dirname + build + '/index.html');
});

app.use('/bower_components', express.static(path.join(__dirname, bower)));
app.use('/images', express.static(path.join(__dirname, target, 'images')));
app.use('/styles', express.static(path.join(__dirname, target, 'styles')));
app.use('/fonts', express.static(path.join(__dirname, target, 'fonts')));
app.use('/app', express.static(path.join(__dirname, target, 'app')));
app.use('/app.config', express.static(path.join(__dirname, target, 'app.config')));

app.get('/*', (req, res) => {
    res.sendFile(__dirname + target + '/index.html');
});

app.listen(port, host);
console.log('Server is runnig at ' + host + ':' + port + '\nTarget: ' + target);
