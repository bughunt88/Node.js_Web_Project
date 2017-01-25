var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var Post     = require('../models/Post');
var session  = require('express-session'); // 데이터 session에 저장하는 페키지



var path = require('path') ;
router.use(express.static(path.join(__dirname, 'public')));


router.use(session({ //세션에 담아 올 수 있는 것
    secret: '1234DSFs@adf1234!@#$asd',
    resave: false,
    saveUninitialized: true,
}));

router.get('/visualization', function(req,res){
  res.render("app/visualization/d3Stack", {user:req.user});
});




// set home routes

router.get('/', function (req,res) {

  Post.find({}).populate(["author",'comments.author']).sort('-createdAt').exec(function (err,post) {
    if(err) return res.json({success:false, message:err});
    res.render("app/main/index_main", {post:post, user:req.user, email:req.flash("email")[0], loginError:req.flash('loginError')});
  });



  // res.render('app/main/index_main', {user:req.user, email:req.flash("email")[0], loginError:req.flash('loginError')});
  //res.render('app/partials/nav', {user:req.user});
});

//
// router.get('/login', function (req,res) {
//   res.render('app/login/login',{email:req.flash("email")[0], loginError:req.flash('loginError')});
// });


router.post('/login',
  function (req,res,next){
    req.flash("email"); // flush email data
    if(req.body.email.length === 0 || req.body.password.length === 0){
      req.flash("email", req.body.email);
      req.flash("loginError","Please enter both email and password.");
      res.redirect('/login');
    } else {
      next();
    }
  }, passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/',
    failureFlash : true
  })
);

//댓글 달기
router.post('/:id/comments', function(req,res){
  var newComment = req.body.comment;
  newComment.author = req.user._id;
  Post.update({_id:req.params.id},{$push:{comments:newComment}},function(err,post){
    if(err) return res.json({success:false, message:err});
res.redirect("back");
  });
}); //create a comment

//댓글 삭제
router.delete('/:postId/comments/:commentId', function(req,res){
  Post.update({_id:req.params.postId},{$pull:{comments:{_id:req.params.commentId}}},
    function(err,post){
      if(err) return res.json({success:false, message:err});
      res.redirect("back");
  });
}); //destroy a comment











router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
