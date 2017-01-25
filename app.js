// import modules
var express        = require('express');
var app            = express();
var path           = require('path'); //public으로 기본 폴더 사용하는 페키지
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser'); //post session body로 읽어오는 페키지
var methodOverride = require('method-override'); //post get 메소드를 다른이름으로 저장해주는 페키지
var session        = require('express-session'); // 데이터 session에 저장하는 페키지
var flash          = require('connect-flash'); //session에 한번 저장해서 읽어오면 지워지는 페키지
var mongo          = require('mongodb');
var Grid           = require('gridfs-stream');
var fs             = require("fs");



app.use('/user',express.static('uploads'));

var mongoose = require("mongoose");
// view setting

app.set("view engine", 'ejs');

// set middlewares

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({secret:'MySecret'}));

// connect database

mongoose.connect("mongodb://root:111111@ds157078.mlab.com:57078/hanbit01");


var conn = mongoose.connection;

var gfs;

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

conn.once("open", function(){
  gfs = Grid(conn.db);
  });


app.use(session({
    saveUninitialized:true,
    resave:true,
    secret:'secretsessionkey',
    store:require('mongoose-session')(mongoose)
  }));

// passport
var passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());


// routes 각 폴더에 파일들 연결해 주는 것
app.use('/'      , require('./routes/home'));
app.use('/users' , require('./routes/users'));
app.use('/posts' , require('./routes/posts'));
app.use('/boards', require('./routes/boards'));







// start server
app.listen(3000, function(){
  console.log('Server On!');
});
