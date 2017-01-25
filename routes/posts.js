var express  = require('express');
var router   = express.Router();
var Post     = require('../models/Post');

var fs = require("fs");
var multer         = require("multer");
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
   cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: _storage });

app.use('/user',express.static('uploads'));

var mongoose = require("mongoose");

var conn = mongoose.connection;

var gfs;

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

conn.once("open", function(){
  gfs = Grid(conn.db);
  });


//시작 index에 user 전달
router.get('/', function(req,res){
  Post.find({}).populate("author").sort('-createdAt').exec(function (err,posts) {
    if(err) return res.json({success:false, message:err});
    res.render("app/posts/index", {posts:posts, user:req.user});

  });
});


// 글쓰기 버튼 누르면 나오는 화면
router.get('/new', isLoggedIn, function(req,res){
  res.render("app/posts/new", {user:req.user});
});


//글쓰는 코딩
router.post('/', isLoggedIn, function(req,res){
  // console.log(req.file);
  req.body.post.author = req.user._id;

  if(req.file){
  req.body.post.filename = req.file.originalname;
  req.body.post.fileid = req.filepath;
  Post.create(req.body.post,function (err,post) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
  });
}else{
  Post.create(req.body.post,function (err,post) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts');
  });}
});

//글 상세 목록 보여주는 코딩
router.get('/:id', function(req,res){
  Post.findById(req.params.id).populate(['author','comments.author']).exec(function (err,post) {
    if(err) return res.json({success:false, message:err});
    res.render("app/posts/show", {post:post, user:req.user});
  });
});

//수정화면 보여주는 코딩
router.get('/:id/edit', isLoggedIn, function(req,res){
  Post.findById(req.params.id, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!req.user._id.equals(post.author)) return res.json({success:false, message:"Unauthrized Attempt"});
    res.render("app/posts/edit", {post:post, user:req.user});
  });
}); // edit

// 수정하는 코딩
router.put('/:id', isLoggedIn, function(req,res){
  req.body.post.updatedAt=Date.now();
  Post.findOneAndUpdate({_id:req.params.id, author:req.user._id}, req.body.post, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!post) return res.json({success:false, message:"No data found to update"});
    res.redirect('/posts/'+req.params.id);
  });
}); //update

//삭제하는 코딩
router.delete('/:id', isLoggedIn, function(req,res){
  Post.findOneAndRemove({_id:req.params.id, author:req.user._id}, function (err,post) {
    if(err) return res.json({success:false, message:err});
    if(!post) return res.json({success:false, message:"No data found to delete"});
    res.redirect('/posts');
  });
}); //destroy


//댓글 달기
router.post('/:id/comments', function(req,res){
  var newComment = req.body.comment;
  newComment.author = req.user._id;
  Post.update({_id:req.params.id},{$push:{comments:newComment}},function(err,post){
    if(err) return res.json({success:false, message:err});
    res.redirect('/posts/'+req.params.id+"?"+req._parsedUrl.query);
  });
}); //create a comment

//댓글 삭제
router.delete('/:postId/comments/:commentId', function(req,res){
  Post.update({_id:req.params.postId},{$pull:{comments:{_id:req.params.commentId}}},
    function(err,post){
      if(err) return res.json({success:false, message:err});
      res.redirect('/posts/'+req.params.postId+"?"+
                   req._parsedUrl.query.replace(/_method=(.*?)(&|$)/ig,""));
  });
}); //destroy a comment







//functions


// 현제 로그인 상태인지 알려주는 함수
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  req.flash("postsMessage","Please login first.");
  res.redirect('/login');
}

module.exports = router;












// // 파일 업로드 new창 보여주는것
// router.post('/new', function(req,res){
//   // console.log(req.file);
//   res.render("app/upload/upload");
// });
//
// //파일 업로드 하는 코딩
// router.post("/upload", upload.single("avatar"), function(req, res, next){
//   //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
//   var writestream = gfs.createWriteStream({
//     filename: req.file.originalname
//   });
//   //
//   // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
//   fs.createReadStream("./uploads/" + req.file.filename)
//     .on("end", function(){fs.unlink("./uploads/"+ req.file.filename, function(err){res.render("close");});})
//       .on("err", function(){res.send("Error uploading image");})
//         .pipe(writestream);
// });


//
// //글쓰는 코딩
// router.post('/', isLoggedIn, upload.single('avatar'), function(req,res){
//
//   var writestream = gfs.createWriteStream({
//     filename: req.file.originalname
//   });
//   //
//   // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
//   fs.createReadStream("./uploads/" + req.file.filename)
//     .on("end", function(){fs.unlink("./uploads/"+ req.file.filename, function(err,file){
//
//               req.body.post.author = req.user._id;
//               req.body.post.filename = req.file.originalname;
//               req.body.post.fileid = req.filepath;
//
//               Post.create(req.body.post,function (err,post) {
//                 if(err) return res.json({success:false, message:err});
//                 res.redirect('/posts');
//               });
//
//   });})
//       .on("err", function(){res.send("Error uploading image");})
//         .pipe(writestream);
// });
