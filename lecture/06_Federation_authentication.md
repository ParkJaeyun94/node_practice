## 1. Facebook

npm install passport-facebook --s
https://developers.facebook.com/

```node.js
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();
```
```node.js
passport.use(new FacebookStrategy
    (
        {
            clientID: '4099624960124689',
            clientSecret: 'c8fb98c83b0ef64ccb628dd815c2e949',
            callbackURL: "/auth/facebook/callback"
        },
        function (aceessToken, refreshToken, profile, done){
            console.log(profile);
        }
    )
)
```

```node.js
// 타사인증은 왔다 갔다 하기 때문에 과정이 더 있음.
app.get(
    '/auth/facebook',
    passport.authenticate(
        'facebook'
    )
);
app.get(
    '/auth/facebook/callback',
    passport.authenticate(
        'facebook',
        { failureRedirect: '/auth/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/welcome');
    });
```

https://www.npmjs.com/package/localtunnel
