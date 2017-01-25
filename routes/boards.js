var express  = require('express');
var app      = express();
var Board    = require('../models/Board');

var fs = require("fs");
var multer = require("multer");
var _storage = multer.diskStorage({
 destination: function (req, file, cb) {
   cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: _storage });

var mongoose = require("mongoose");

var conn = mongoose.connection;

var gfs;

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

conn.once("open", function(){
  gfs = Grid(conn.db);
  });




//설정


// 글 보여주기

var boards = function (req, res, next) {
  Board.find({category: 'question'}).populate(['author','comments.author']).sort('-createdAt').exec(function(err, xy){
    req.session.boards = xy;
    next();
  });
};

var boards1 = function (req, res, next) {
  Board.find({category: 'study'}).populate(['author','comments.author']).sort('-createdAt').exec(function(err, yy){
    req.session.boards1 = yy;
    next();
  });
};




app.get('/', [boards, boards1], function(req,res){

  console.log(req.session.boards);

  res.render("app/boards/board_index", { user:req.user, boards:req.session.boards, boards1:req.session.boards1});


  });


  //글 상세 목록 보여주는 코딩
  app.get('/:id', function(req,res){
    Board.findById(req.params.id).populate(['author','comments.author']).exec(function (err,boards) {
      if(err) return res.json({success:false, message:err});
      res.render("app/boards/board_show", {boards:boards, user:req.user});
    });
  });


//글쓰는 코딩
app.post('/', isLoggedIn, upload.single('avatar') , function(req,res){

req.body.board.author = req.user._id;

if(req.file){
req.body.board.filename = req.file.originalname;
req.body.board.fileid = req.filepath;
Board.create(req.body.board,function (err,board) {
  if(err) return res.json({success:false, message:err});
  res.redirect('/boards');
});
}else{
  Board.create(req.body.board,function (err,board) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/boards');
  });}
});



//글 수정
app.put('/:id', isLoggedIn, function(req,res){

  // var _id = req.params.id;
  // var author = req.user._id;
  // console.log(author);
  // req.body.board.updatedAt=Date.now();
  Board.findOneAndUpdate({_id:req.params.id, author:req.user._id}, req.body.board, function (err,board) {
    if(err) return res.json({success:false, message:err});
    if(!board) return res.json({success:false, message:"No data found to update"});
    res.redirect('/boards/:id/mypage');
  });
}); //update


//글 삭제
app.delete('/:id', isLoggedIn, function(req,res){
  Board.findOneAndRemove({_id:req.params.id, author:req.user._id}, function (err,board) {
    if(err) return res.json({success:false, message:err});
    if(!board) return res.json({success:false, message:"No data found to delete"});
    res.redirect('/boards/:id/mypage');
  });
});

//댓글 달기
app.post('/:id/comments', function(req,res){
  var newComment = req.body.comment;
  newComment.author = req.user._id;
  Board.update({_id:req.params.id},{$push:{comments:newComment}},function(err,post){
    if(err) return res.json({success:false, message:err});
    res.redirect("back");
  });
}); //create a comment


//댓글 삭제
app.delete('/:postId/comments/:commentId', function(req,res){
  Board.update({_id:req.params.postId},{$pull:{comments:{_id:req.params.commentId}}},
    function(err,post){
      if(err) return res.json({success:false, message:err});
      res.redirect("back");
  });
}); //destroy a comment





//마이페이지
app.get('/:id/mypage', function(req,res){
  Board.find({ author: req.user._id }).populate("author").sort('-createdAt').exec(function (err,board) {
    if(err) return res.json({success:false, message:err});
    res.render("app/boards/mypage", {board:board, user:req.user});

  });
}); // mypage







//functions


// 현제 로그인 상태인지 알려주는 함수
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  req.flash("postsMessage","Please login first.");
  res.redirect('/login');
}

module.exports = app;
