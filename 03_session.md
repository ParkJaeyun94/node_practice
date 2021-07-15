## session

```
쿠키를 좀 더 안전하고 scalable하게 저장하는 효과를 내는 것
사용자 컴퓨터에 쿠키가 박혀있다면 누군가가 가져갈 수 있다는 것
이를 개선하기 위해 쿠키가 가지고 있는 기능과 서버 쪽의 데이터 베이스, 파일, 메모리 등 데이터를 저장할 수 있는 공간을 잘 조합해서 session을 만들어 사용.
```

#### session 원리
```
1. 쿠키 방식으로 사용자 컴퓨터에 저장하지만, 오직 사용자의 식별자인 id값만 브라우저에 저장함
2. 그 외의 값은 서버에 실제 데이터가 저장
( 사용자 컴퓨터- 사용자의 식별자 / 서버 컴퓨터 - 그 외 정보 )
3. 사용자가 request할 때, 그 사용자의 식별자에 해당되는 실제 데이터를 서버에서 읽어와서 사용할 수 있는 것
```

#### cookie와 session의 차이
```
1. cookie
- Set-Cookie: 쿠키를 암호화-> 서버에서 가져와서 값을 찾음 -> 그 값에 +1을 해서 count를 하는 것

2. session
- Set-Cookie: connect.sid는 있으나, count란 값은 없음. 
웹서버는 웹 브라우저에 구체적 값을 저장하는 대신 그 웹 브라우저에게 고유한 값을 전달하고 있음. 
이 값이 중복될 가능성은 거의 없음. 
이러한 값을 서버가 브라우저에게 던져줌. 
그 다음 서버에 접속할때 브라우저가 connect.sid를 계속 서버에 전달
이런 값을 가지고 있는 (= connect.sid 값이 같은 요청은) 같은 사용자의 접속이다라고 간주하게 됨.
그때 값을 서버가 받아서 +1을 한 다음 브라우저에 띄어주는 방식
- cookie를 사용하는 점은 동일함
- 사용자 웹 브라우저에 쿠키값 저장이 되지않아 안전. session id 자체에는 큰 의미가 없음
- 데이터를 사용자 컴퓨터가 아닌 서버에 저장하기 때문에 많은 데이터 저장하는 것도 가능함.
- cookie와 상충하는 것이 아닌 cookie를 바탕으로 만들어진 것이 session
```
##### cookie
![image](https://user-images.githubusercontent.com/69338643/125735955-5435d189-4950-4a03-b46c-272d8237a7e5.png)

##### session
![image](https://user-images.githubusercontent.com/69338643/125735956-b083daa2-c72b-44ca-9fce-0805522edb55.png)


#### 1. session (count)

```node.js
var express = require('express');
// express-session은 memory에 정보를 저장함. app을 껐다 켜면 session 정보는 날아가게 되있음
var session = require('express-session');
var app = express();

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

app.listen(3000, function (){
    console.log('Conndected 3000 port!!');
});

```

#### 2. session (login)

```node.js
var express = require('express');
// express-session은 memory에 정보를 저장함. app을 껐다 켜면 session 정보는 날아가게 되있음
// 1. session을 쓰기위한 모듈 불러오기
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

// session count
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

// 로그아웃 기능
app.get('/auth/logout',function (req, res){
    delete req.session.displayName;
    res.redirect('/welcome')
});

// welcome 페이지 (로그인/로그아웃)
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

// 로그인 페이지 (user정보 저장/ 입력값이 같을 경우 다를 경우 페이지 다름)
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

// 로그인 페이지
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

```

#### 3. session (file-store)

https://www.npmjs.com/package/session-file-store

