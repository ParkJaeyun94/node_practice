### 1. Intro

```
로그인 상태가 유지
서버가 로그인된 상태를 알고 있는 것
HTTP는 상태가 없다. 이전에 로그인했다고 해도, 그 다음에 접속했을땐 로그인한 것을 알 수 없게 만듦
넷스케이프라는 회사가 cookie 개념을 만듦
로그인 기억, 장바구니 담기 등을 알 수가 있음.
```
```
쿠키 -> 세션 -> 인증 
```
```
쿠키를 통해 사용자마다 다른 상태를 유지할 수 있음.
```

### 2. 쿠키구현(counter)

```node.js
var express = require('express')
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())

// count라는 주소로 req와 res를 주고 받는다.
app.get('/count', function(req, res){
    if(req.cookies.count) {
// HTML 요청시 res는 문자로 오게 되있음. -> parseInt라는 js내장 함수로 int화
        var count = parseInt(req.cookies.count);
    } else {
        var count = 0
    }
    count = count+1;
    res.cookie('count',count);
    res.send('count: ' + count);
})
app.listen(3000, function (){
    console.log('Conndected 3000 port!!');
});
```

*참고링크: https://expressjs.com/ko/

### 3. 쿠키구현(쇼핑카트- 장바구니)

```
서버가 웹브라우저에 데이터를 CRUD 하는 것이 쿠키이다.
```

```node.js
var express = require('express')
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())

var products = {
    1:{title: "The history of web1"},
    2:{title: "The next web"},
}
app.get('/products', function(req, res){
    var output= '';
    for( var name in products) {
        output += `
        <li>
            <a href="/cart/${name}">${products[name].title}</a>
        </li>
        `
    }
    // ${}는 ``안에서 변수 인식할 때 씀
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});

/*
cart = {
 1:2
 2:1
}
 */

app.get('/cart/:id', function (req, res){
    var id =req.params.id;
    if(req.cookies.cart){
        var cart = req.cookies.cart;
    } else {
        var cart ={};
    }
    if(!cart[id]){
        cart[id] = 0;
    }
    cart[id] = parseInt(cart[id])+1;
    res.cookie('cart', cart);
    res.redirect('/cart');
})

app.get('/cart', function(req, res){
    var cart = req.cookies.cart;
    if(!cart) {
        res.send('Empty!');
    } else {
        var output = '';
        for (var id in cart) {
            output += `<li>${products[id].title} (${cart[id]})</li>`;
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <a href="/products">Products List</a>
        `);
})


app.get('/count', function(req, res){
    if(req.cookies.count) {
        // 문자로 오게 되있음.
        var count = parseInt(req.cookies.count);
    } else {
        var count = 0
    }
    count = count+1;
    res.cookie('count',count);
    res.send('count: ' + count);
})
app.listen(3000, function (){
    console.log('Conndected 3000 port!!');
});

```

*참고링크: 서버 자동실행하려면 pm2 사용 https://velog.io/@woohyun_park/node.js-PM2-%EC%82%AC%EC%9A%A9%EB%B2%95-bym6mmx1

### 4. 쿠키&보안

```
로그인 정보일 경우 쿠키 보안 중요함.
암호화 기능 key값. 
쿠키를 구울때 key값을 주어서 암호화시키는 것.
```
```node.js
var express = require('express')
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser('d125612sdffff345'))

var products = {
    1:{title: "The history of web1"},
    2:{title: "The next web"},
}
app.get('/products', function(req, res){
    var output= '';
    for( var name in products) {
        output += `
        <li>
            <a href="/cart/${name}">${products[name].title}</a>
        </li>
        `
    }
    // ${}는 ``안에서 변수 인식할 때 씀
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
});

/*
cart = {
 1:2
 2:1
}
 */

app.get('/cart/:id', function (req, res){
    var id =req.params.id;
    if(req.signedCookies.cart){
        var cart = req.signedCookies.cart;
    } else {
        var cart ={};
    }
    if(!cart[id]){
        cart[id] = 0;
    }
    cart[id] = parseInt(cart[id])+1;
    res.cookie('cart', cart,{signed:true});
    res.redirect('/cart');
})

app.get('/cart', function(req, res){
    var cart = req.signedCookies.cart;
    if(!cart) {
        res.send('Empty!');
    } else {
        var output = '';
        for (var id in cart) {
            output += `<li>${products[id].title} (${cart[id]})</li>`;
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <a href="/products">Products List</a>
        `);
})


app.get('/count', function(req, res){
    if(req.signedCookies.count) {
        // 문자로 오게 되있음.
        var count = parseInt(req.signedCookies.count);
    } else {
        var count = 0
    }
    count = count+1;
    res.cookie('count',count, {signed:true});
    res.send('count: ' + count);
})
app.listen(3000, function (){
    console.log('Conndected 3000 port!!');
});


```


![image](https://user-images.githubusercontent.com/69338643/125733634-af278086-580f-4781-88d5-b830ee41db7d.png)

```
cookie 값에 key를 넣음
```
![image](https://user-images.githubusercontent.com/69338643/125733628-98e2a6b5-54e7-4dac-b6df-b70566bfa63b.png)

```
signedCookies 설정함
```
![image](https://user-images.githubusercontent.com/69338643/125733618-d59c2251-38b5-47aa-8bc1-c2b7bd0d9377.png)

```
cookie에 담긴 정보 암호화됨.
```

##### 다음시간 : 아이디, 비밀번호는 심각한 정보이기 때문에 cookie에 저장하지 않음. 그렇다면?
