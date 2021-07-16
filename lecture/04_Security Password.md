```
사용자는 우리에게 비밀번호를 맡긴 것 
사용자의 비밀번호는 결코 외부에 노출되선 안됨
그 비밀번호가 털릴 수 있다는 가정 하에 차선의 상황을 만들기 위한 노력인 것임.
보안시스템은 털릴 가능성이 언제나 있음.
비밀번호가 털리면 다른 웹사이트에서도 털릴 가능성이 있는 것.

=> 어떻게 해야함? 
비밀번호를 알 수 없게 하면서, 사용자는 로그인을 할 수 있게하는 것. (암호화)
```

npm install md5 --save

*단방향 암호화: 한쪽 방향으로만 암호화가 가능한 것, 복호화(해석)하는 것은 불가능한 것

※ md5는 더이상 쓰고 있지 않음. 실습상 사용

![image](https://user-images.githubusercontent.com/69338643/125929561-d8d818b3-f147-490d-8acf-aefeb547f76c.png)
![image](https://user-images.githubusercontent.com/69338643/125929577-a89af830-8a08-4d7c-b589-ccef81505354.png)

```node.js
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var md5 = require('md5');
var app = express();
app.use(bodyParser.urlencoded({extended: false}))
```

```node.js
app.post('/auth/login', function (req, res){
    var user = {
        username: 'egoing',
        password: '698d51a19d8a121ce581499d7b701668',
        displayName: 'Egoing'
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname === user.username && md5(pwd) == user.password){
        req.session.displayName = user.displayName;
        req.session.save( () => {
            res.redirect('/welcome');
        });
    } else {
        res.send('Who are you? <a href="/auth/login">login</a>');
    }
});
```
비밀번호 받을 때도 암호화하여 저장

https://crackstation.net/

![image](https://user-images.githubusercontent.com/69338643/125929537-46af4249-b060-48e4-a099-8ae4ffe46144.png) 

자주 사용하는 비밀번호의 경우 뚫리게 됨.

#### solution

### 1. salt (사용자의 비밀번호에 부가적 정보를 더한다.)
#### 1) md5

![image](https://user-images.githubusercontent.com/69338643/125930530-c4b8b5b8-6da2-4bc2-9b0d-fa11c8809f40.png)
![image](https://user-images.githubusercontent.com/69338643/125930539-c9f55351-3876-4987-9082-9be4e1868dd5.png)

```node.js
app.post('/auth/login', function (req, res){
    var salt = 'fj341!#34!!dssd@d'
    var user = {
        username: 'egoing',
        password: 'aaf85a7a76aa6ff8d4fa6eeba9a8e3d8',
        displayName: 'Egoing'
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname === user.username && md5(pwd+salt) == user.password){
        req.session.displayName = user.displayName;
        req.session.save( () => {
            res.redirect('/welcome');
        });
    } else {
        res.send('Who are you? <a href="/auth/login">login</a>');
    }
});
```

But, 다른 사용자이지만 비밀번호가 같은 경우, 암호화 과정에서 같은 비밀번호가 됨.
악용하기 위해, 슈퍼컴퓨터로 돌려본다고 함. 한 사람의 비밀번호를 뚫게 되면, 나머지도 다 털리게 됨 (복호화가 되어버렸기 때문)

=> 서비스 차원의 salt를 없애고, 사용자마다 salt를 둔다면?

```node.js
app.post('/auth/login', function (req, res){
    var uname = req.body.username;
    var pwd = req.body.password;
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if(uname === user.username && md5(pwd+user.salt) === user.password) {
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
        password: '14cc781a22893aa44df9a488a03a5e79',
        salt: '@hfda#@sfd',
        displayName: 'Egoing'
    },
    {
        username: 'korea',
        password: '958bcbc979d782520ddd095b9dc14393',
        salt: '!#gosdjf*#f',
        displayName: 'Korea'
    }
];
```

But, md5는 더이상 암호화로 사용하지 않음. 설계상 결함들이 발견되어서 현재 쓰지 않음.
현 시점에서 쓸 괜찮은 암호화는 sha

#### 2) sha256

npm install sha256 --save

```node.js
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var sha256 = require('sha256');
var app = express();
app.use(bodyParser.urlencoded({extended: false}))
```

![image](https://user-images.githubusercontent.com/69338643/125934064-ffd2ce82-1741-4927-bcc0-1d919e4ac6d9.png)

```node.js
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
```

