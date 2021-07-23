https://www.npmjs.com/package/express-session-mariadb-store </br>

npm install express-session-mariadb-store

```node.js
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
    password: '',
    database: 'o2'
});

conn.connect()
```

![image](https://user-images.githubusercontent.com/69338643/126753677-7b4275a3-4443-42ce-b7bb-c22abb7f1158.png)
![image](https://user-images.githubusercontent.com/69338643/126753682-65e57a3d-1991-462a-b221-7110af108ecb.png)

```node.js
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
```

```node.js
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

```

```node.js
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
```

```node.js
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
```
