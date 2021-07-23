```
인증을 쉽게 구현할 수 있도록 만드는 모듈
결과적으로 인증은 쉽게 만들 수 있지만 구현하기까진 어려울 수 있음.
공신력있는 웹 애플리케이션에 사용자들은 이미 가입이 되어있음.
우리 앱에 가입하는 것이 아니라, Federation Authentication(연합 인증체계)을 사용하기도 함.
```

https://www.passportjs.org/

## 1. Configure(설정)

npm i -s passport passport-local

passport-local : 아이디, 비밀번호 직접 입력하여 로그인할 경우 사용

Middleware

#### import

```node.js
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
```

## 2. Route 

```node.js
passport.use(new LocalStrategy(
    function (username, password, done) {
        // 기존 사용자가 맞는지 확인
        var uname = username;
        var pwd = password;
        for(var i=0; i<users.length; i++){
            var user = users[i];
            if (uname === user.username) {
                return hasher({password: pwd, salt:user.salt},
                function(err, pass, salt, hash) {
                    if (hash === user.password) {
                        // 로그인 성공
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            }
        }
        done(null, false);
    }
));
```

```node.js

app.post(
    '/auth/login',
    passport.authenticate(
        'local', // cf. facebook, 위의 new LocalStrategy의 전략이 실행되는 것
       {
            successRedirect: '/welcom', // redirect 기능
            failureRedirect: '/auth/login',
            failureFlash: false // 인증에 실패했다는걸 알려주는 기능
        }
    )
);
```

## 3. Serialize

Session을 통해 로그인 유지


#### 1. serializeUser
1. 로그인 성공 후
2. serializeUser에 등록된 콜백함수 실행
3. done이란 함수에 의해 세션이 등록됨 ( 다음에 방문할 때, 세션 정보가 저장되어 있는 상태인 것)

#### 2. deserializeUser
- 세션에 저장된 유저가 들어오면 이 함수가 실행되게 되어 있음.
- 사용자를 검색하는 작업이 필요함


``` node.js
// 아래 localStrategy의 done의 두번째 인자인 user와 일치
passport.serializeUser(function(user, done) {
    // user의 고유한 값을 인자로 주면 됨. (이 스크립트 안에서는 username) -> 세션에 저장
    console.log('serializeUser', user);
    done(null, user.username);
});

passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if (user.username === id) {
            return done(null, user);
        }
    }
});
```

```node.js
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
```

## 4. Logout & Register

#### 1. Logout
```node.js
app.get('/auth/logout',function (req, res){
    req.logout();
    req.session.save( () => {
        res.redirect('/welcome');
    });
});
```
#### 2. Register
```node.js
app.post('/auth/register', function(req, res){
    hasher({password: req.body.password}, function (err, pass, salt, hash){
        var user = {
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user);
        req.login(user, function (err){
            req.session.save(function(){
                res.redirect('/welcome');
            });
        });
    });
});
```
