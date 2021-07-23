https://www.npmjs.com/package/express-session-mariadb-store </br>

npm install express-session-mariadb-store

```node.js
var session = require('express-session');
var MariaDBStore = require('express-session-mariadb-store');

app.use(session({
    secret: 'fsadf3@@e213t',
    resave: false,
    saveUninitialized: true,
    store: new MariaDBStore({
        host: 'localhost',
        port: 3306,
        user: '',
        password: '',
        database: 'o2'
    })
}));
```

```sql
CREATE TABLE session(
  sid                     VARCHAR(100) PRIMARY KEY NOT NULL,   
  session                 VARCHAR(2048) DEFAULT '{}',   
  lastSeen                DATETIME DEFAULT NOW() 
);
```

>npm install mariadb -s
