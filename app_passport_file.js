var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

var hasher = bkfd2Password();


var app = express();
app.use(bodyParser.urlencoded({extended: false}))

// 세션을 사용하겠다.
app.use(session({
    secret: 'fsadf3@@e213t',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));

app.use(passport.initialize());
// session 사용하기 위한 코드 뒤에 작성해야함 (세션을 사용하겠다고 했는데 설정이 안되면 안됨)
app.use(passport.session());

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
            <a href="/auth/register">Register</a>
        `);
    }
});

app.post('/auth/login', function (req, res){
    var uname = req.body.username;
    var pwd = req.body.password;
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if (uname === user.username) {
            return hasher({password: pwd, salt:user.salt}, function(err, pass, salt, hash){
                if(hash === user.password){
                    req.session.displayName = user.displayName;
                    req.session.save(function (){
                        res.redirect('/welcome');
                    })
                } else {
                    res.send('Who are you? <a href="/auth/login">login</a>');
                }
            });
        }
        // if(uname === user.username && sha256(pwd+user.salt) === user.password) {
        //     req.session.displayName = user.displayName;
        //     return req.session.save(() => {
        //         res.redirect('/welcome');
        //     });
        // }
    }
});

var users = [
    {
        username: 'egoing',
        password: 'o4/UB6Cl78nJCJHOE11WXNikaZGR34otgENF/ZkouisQKFaEnLR2hHppsUXQwxNl1AnURUqdrJ4R4WGw+6mbs11kV7EP2SQiGBzMk0Xu87Q71brqi7EUCQr1Y15baz90dtjn/WAJdsQKm4qEI0iJBYHwKL/Wf1dorohsz3RqOYQ=',
        salt: 'zDEnAkYbeJaOzdo+EMLF1ppW3FcjUNbYiwUiDYZuu/PV91yvtEXyNoQm/uf+31fy19YDG0Ul3/OVYaweuEqp4Q==',
        displayName: 'Egoing'
    }
];

app.post('/auth/register', function(req, res){
    hasher({password: req.body.password}, function (err, pass, salt, hash){
        var user = {
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user);
        req.session.displayName = req.body.displayName;
        req.session.save(function(){
            res.redirect('/welcome');
        });
    });

});
app.get('/auth/register', function(req, res){
    var output = `
    <h1>Register</h1>
    <form action="/auth/register" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>          
        <p>
            <input type="password" name="password" placeholder="password">
        </p>          
        <p>
            <input type="text" name="displayName" placeholder="displayName">
        </p>    
        <p>
            <input type="submit">
        </p>
    </form>
    `
    res.send(output);
})


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
