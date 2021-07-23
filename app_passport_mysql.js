var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session');
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();
var mysql = require('mysql');
var conn   = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'qlalfqjsgh1',
    database: 'o2'
});

conn.connect()

var app = express();
app.use(bodyParser.urlencoded({extended: false}))

// 세션을 사용하겠다.
app.use(session({
    secret: 'fsadf3@@e213t',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'qlalfqjsgh1',
        database: 'o2'
    })
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
    req.logout();
    req.session.save( () => {
        res.redirect('/welcome');
    });
});

app.get('/welcome', function (req, res){
    // passport가 req에 user라는 정보를 넣어줌.
    // deserializeUser의 done의 두번째 인자가 user
    if(req.user && req.user.displayName) {
        res.send(`
            <h1>Hello, ${req.user.displayName}</h1>
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

// 아래 localStrategy의 done의 두번째 인자인 user와 일치
passport.serializeUser(function(user, done) {
    // user의 고유한 값을 인자로 주면 됨. (이 스크립트 안에서는 username) -> 세션에 저장
    console.log('serializeUser', user);
    done(null, user.authId);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    var sql = 'SELECT * FROM users WHERE authId=?'
    conn.query(sql, [id], function (err, results){
        if(err){
            console.log(err);
            done('There is no user.');
        } else {
            done(null, results[0]);
        }
    });
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        // 기존 사용자가 맞는지 확인
        var uname = username;
        var pwd = password;
        var sql = 'SELECT * FROM users WHERE authId=?'
        conn.query(sql, ['local:'+uname], function (err, results){
            console.log(results)
            if(err){
                return done('There is no user.')
            }
            var user = results[0];
            console.log(user)
            return hasher({password: pwd, salt:user.salt},
                    function(err, pass, salt, hash) {
                        if (hash === user.password) {
                            // 로그인 성공 인증된 사용자임이 확인
                            console.log('LocalStrategy', user);
                            done(null, user);
                        } else {
                            done(null, false);
                        }
                    });
        })
    }
));

passport.use(new FacebookStrategy
    (
        {
            clientID: '4099624960124689',
            clientSecret: 'c8fb98c83b0ef64ccb628dd815c2e949',
            callbackURL: "http://localhost:3003/auth/facebook/callback",
            profileFields: ['id','email', 'gender', 'link', 'locale', 'name',
            'timezone', 'updated_time','verified', 'displayName']
        },
        function (aceessToken, refreshToken, profile, done){
            console.log(profile);
            var authId = 'facebook: '+profile.id;
            var sql = 'SELECT * FROM users WHERE authId=?';
            conn.query(sql, [authId], function (err, results){
                if(results.length>0){
                    done(null, results[0]);
                } else {
                    var newuser = {
                        'authId': authId,
                        'displayName': profile.displayName,
                        'email': profile.emails[0].value
                    };

                    var sql = 'INSERT INTO users SET ?'
                    conn.query(sql, [], function (err, results){
                        if(err){
                            console.log(err);
                            done('Error');
                        } else {
                            done(null, newuser);
                        }
                    })
                }
            })
        }
    )
)

app.post(
    '/auth/login',
    passport.authenticate(
        'local', // cf. facebook, 위의 new LocalStrategy의 전략이 실행되는 것
       {
            // successRedirect: '/welcome', // redirect 기능
            failureRedirect: '/auth/login',
            failureFlash: false // 인증에 실패했다는걸 알려주는 기능
        }), function(req, res) { // 해당 function이 호출되고 나서 session을 save해주는 로직을 해주고 처리함.
            req.session.save(function () {
                res.redirect('/welcome');
            });
        }
    );

// 타사인증은 왔다 갔다 하기 때문에 과정이 더 있음.
app.get(
    '/auth/facebook',
    passport.authenticate(
        'facebook'
    )
);
// app.get(
//     '/auth/facebook/callback',
//     passport.authenticate(
//         'facebook',
//         { failureRedirect: '/auth/login' }),
//     function(req, res) {
//         // Successful authentication, redirect home.
//         res.redirect('/welcome');
//     });

// facebook에 로그인한 후에 다시 원래 페이지로 돌아오는 작업이라 router가 2개가 필요한 것
app.get(
    '/auth/facebook/callback',
    passport.authenticate(
        'facebook',
        {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login'
        }));


var users =
    {
        username: 'egoing',
        password: 'o4/UB6Cl78nJCJHOE11WXNikaZGR34otgENF/ZkouisQKFaEnLR2hHppsUXQwxNl1AnURUqdrJ4R4WGw+6mbs11kV7EP2SQiGBzMk0Xu87Q71brqi7EUCQr1Y15baz90dtjn/WAJdsQKm4qEI0iJBYHwKL/Wf1dorohsz3RqOYQ=',
        salt: 'zDEnAkYbeJaOzdo+EMLF1ppW3FcjUNbYiwUiDYZuu/PV91yvtEXyNoQm/uf+31fy19YDG0Ul3/OVYaweuEqp4Q==',
        displayName: 'Egoing'
    };


app.post('/auth/register', function(req, res) {
    hasher({password: req.body.password}, function (err, pass, salt, hash) {
        var user = {
            authId: 'local:' + req.body.username,
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };

        var sql = 'INSERT INTO users SET ?';
        conn.query(sql, user, function (err, results) {
            if (err) {
                console.log(err);
                res.status(500);
            } else {
                req.login(user, function (err) {
                    req.session.save(function () {
                        res.redirect('/welcome');
                    });
                });
            }
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
    <a href="/auth/facebook">facebook</a>
    `
    res.send(output);
})

app.listen(3003, function (){
    console.log('Conndected 3003 port!!');
});
