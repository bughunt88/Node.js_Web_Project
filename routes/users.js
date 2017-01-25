var express  = require('express');
var router   = express.Router();
var mongoose = require('mongoose');
var User     = require('../models/User');
var async    = require('async'); // 함수를 실행할때 순서 잘 작동하게 해주는 페키지

// 유저를 생성하는 코딩

router.get('/new', function(req,res){
  res.render('app/users/new', {
                            formData: req.flash('formData')[0],
                            emailError: req.flash('emailError')[0],
                            nicknameError: req.flash('nicknameError')[0],
                            passwordError: req.flash('passwordError')[0]
                          }
  );
}); // new

router.post('/', checkUserRegValidation, function(req,res,next){
  User.create(req.body.user, function (err,user) {
    if(err) return res.json({success:false, message:err});
    res.redirect('/');
  });
}); // create


// 유저 정보 수정하는 form 보여주는 코딩
router.get('/:id/edit', isLoggedIn, function(req,res){
  if(req.user._id != req.params.id) return res.json({success:false, message:"Unauthrized Attempt"});
  User.findById(req.params.id, function (err,user) {
    if(err) return res.json({success:false, message:err});
    res.render("app/users/edit", {
                              user: user,
                              formData: req.flash('formData')[0],
                              emailError: req.flash('emailError')[0],
                              nicknameError: req.flash('nicknameError')[0],
                              passwordError: req.flash('passwordError')[0]
                             }
    );
  });
}); // edit

// 업데이트 할 정보가 맞는지 판단하는 코딩
router.put('/:id', isLoggedIn, checkUserRegValidation, function(req,res){
  if(req.user._id != req.params.id) return res.json({success:false, message:"Unauthrized Attempt"});
  User.findById(req.params.id, req.body.user, function (err,user) {
    if(err) return res.json({success:"false", message:err});
    if(user.authenticate(req.body.user.password)){
      if(req.body.user.newPassword){
        req.body.user.password = user.hash(req.body.user.newPassword);
      } else {
        delete req.body.user.password;
      }
      User.findByIdAndUpdate(req.params.id, req.body.user, function (err,user) {
        if(err) return res.json({success:"false", message:err});
        res.redirect('/users/'+req.params.id);
      });
    } else {
      req.flash("formData", req.body.user);
      req.flash("passwordError", "Invalid password");
      res.redirect('/users/'+req.params.id+"/edit");
    }
  });
}); //update


//functions

// 현제 로그인 상태인지 알려주는 함수
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

// checkUserRegValidation 메소드로 유저를 새로 등록하거나 정보를 변경할떄
//email, nickname이 이미 등록 되어있는지 확인하는 코딩
function checkUserRegValidation(req, res, next) {
  var isValid = true;
  async.waterfall( //비동기 함수들을 동기 함수처럼 사용하게 해주는것
    [function(callback) {
      //이메일은 똑같이 하고 닉네임만 바꾸기 위해 하는 코딩 $ne:는 != 와 같은 의미
      User.findOne({email: req.body.user.email, _id: {$ne: mongoose.Types.ObjectId(req.params.id)}},
        function(err,user){
          if(user){
            isValid = false;
            req.flash("emailError","This email is already resistered.");
          }
          callback(null, isValid);
        }
      );
    }, function(isValid, callback) {
      User.findOne({nickname: req.body.user.nickname, _id: {$ne: mongoose.Types.ObjectId(req.params.id)}},
        function(err,user){
          if(user){
            isValid = false;
            req.flash("nicknameError","This nickname is already resistered.");
          }
          callback(null, isValid);
        }
      );
    }], function(err, isValid) {
      if(err) return res.json({success:"false", message:err});
      if(isValid){
        return next();
      } else {
        req.flash("formData",req.body.user);
        res.redirect("back");
      }
    }
  );
}

module.exports = router;
