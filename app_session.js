var express = require('express');
// express-session은 memory에 정보를 저장함. app을 껐다 켜면 session 정보는 날아가게 되있음
// 1. session을 쓰기위한 모듈 불러오기 (express에서 session을 사용할 수 있게 해주는 모듈)
var session = require('express-session');
var bodyparser = require('body-parser')
var app = express();
app.use(bodyparser.urlencoded({extended: false}))

// 2. session 셋팅
app.use(session({
    secret: 'fsadf3@@e213t',
    resave: false,
    saveUninitialized: true
}));

app.get('/count', function (req, res){
    if(req.session.count){
        req.session.count++;
    } else {
        req.session.count = 1;
    }

    res.send('count : ' + req.session.count);
});

/*
app.get('/tmp', function (req, res){
    res.send('result : ' + req.session.count);
});
*/

app.get('/auth/logout',function (req, res){
    delete req.session.displayName;
    res.redirect('/welcome')
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
    var user = {
        username: 'egoing',
        password: '111',
        displayName: 'Egoing'
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname === user.username && pwd == user.password){
        req.session.displayName = user.displayName;
        res.redirect('/welcome');
    } else {
        res.send('Who are you? <a href="/auth/login">login</a>');
    }
});

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

app.listen(3000, function (){
    console.log('Conndected 3000 port!!');
});
