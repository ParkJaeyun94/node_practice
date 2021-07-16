var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var sha256 = require('sha256');
var app = express();
app.use(bodyParser.urlencoded({extended: false}))

app.use(session({
    secret: 'fsadf3@@e213t',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));


app.get('/count', function (req, res){
    if(req.session.count){
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send('count : ' + req.session.count);
});


app.get('/auth/logout',function (req, res){
    delete req.session.displayName;
    req.session.save( () => {
        res.redirect('/welcome');
    });
});

app.get('/welcome', function (req, res){
    if(req.session.displayName) {
        res.send(`
            <h1>Hello, ${req.session.displayName}</h1>
            <a href="/auth/logout">Logout</a>
        `);
    } else {
        res.send(`
            <h1>Welcome</h1>
            <a href="/auth/login">Login</a>
        `);
    }
});

app.post('/auth/login', function (req, res){
    var uname = req.body.username;
    var pwd = req.body.password;
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if(uname === user.username && sha256(pwd+user.salt) === user.password) {
            req.session.displayName = user.displayName;
            return req.session.save(() => {
                res.redirect('/welcome');
            });
        }
    }
    res.send('Who are you? <a href="/auth/login">login</a>');
});

var users = [
    {
        username: 'egoing',
        password: '844dcd28913ee4644925aa636e0726702a2cbb74e3440c86c292b3f33c24d779',
        salt: '@hfda#@sfd',
        displayName: 'Egoing'
    },
    {
        username: 'korea',
        password: '6a584f4bc484811f82d1f43142fdbe6f87496b2ac85dd7b4ac3f31f409783843',
        salt: '!#gosdjf*#f',
        displayName: 'Korea'
    }
];


app.get('/auth/login', function (req, res){
    var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>        
        <p>
            <input type="submit">
        </p>
    </form>
    `
    res.send(output);
})

app.listen(3003, function (){
    console.log('Conndected 3003 port!!');
});
