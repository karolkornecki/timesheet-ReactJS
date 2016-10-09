var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var ACCOUNT_FILE = path.join(__dirname, 'mocks/account.json');

app.set('port', (process.env.PORT || 3001));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text())

app.use(function (req, res, next) {
    //CORS header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});


app.post('/api/authentication', function (req, res) {
    if (req.body['j_username'] === 'admin' && req.body['j_password'] === 'admin') {
        res.status(200).send('Authentication success')
    } else {
        res.status(500).send('Authentication failed')
    }
});
app.post('/api/logout', function (req, res) {
    res.status(200).send('Logout success')
});

app.get('/api/account', function (req, res) {
    fs.readFile(ACCOUNT_FILE, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/account', function (req, res) {
    if (req.body['email'] === 'admin@admin.pl') {
        res.setHeader('X-Timesheetapp-Error', 'ERROR_EMAIL_EXISTS')
        res.status(400).send('Bad request')
    } else if (req.body['email'] === 'system@system.pl') {
        res.status(500).send('Internal server error')
    } else if (req.body['email'] === '404@404.pl') {
        res.status(404).send('Not found')
    } else {
        fs.readFile(ACCOUNT_FILE, function (err, data) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            var account = JSON.parse(data);
            account.firstName = req.body.firstName
            account.lastName = req.body.lastName
            account.email = req.body.email
            account.langKey = req.body.langKey
            fs.writeFile(ACCOUNT_FILE, JSON.stringify(account, null, 4), function (err) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
            });
            res.status(200).send("Success")
        });
    }
});

app.post('/api/account/change_password', function (req, res) {
    if (req.body === 'admin') {
        res.status(200).send('Password changed')
    } else if (req.body === 'system') {
        res.status(400).send('Bad request')
    } else {
        res.status(500).send('Internal server error')
    }
});

app.post('/api/register', function (req, res) {
    if (req.body['login'] === 'admin') {
        res.status(200).send('Ok')
    } else if (req.body['login'] === 'system') {
        res.status(400).send('LOGIN_ALREADY_IN_USE')
    } else if (req.body['email'] === 'system@system.pl') {
        res.status(400).send('EMAIL_ALREADY_IN_USE')
    } else {
        res.status(500).send('Internal server error')
    }
});

app.listen(app.get('port'), function () {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});