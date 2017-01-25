var mongoose   = require('mongoose'); //mongodb를 사용하게 해주는 페키지

var postSchema = mongoose.Schema({
  title:      {type:String, required:true},
  body:       {type:String, required:true},
  author:     {type:mongoose.Schema.Types.ObjectId, ref:'user', require:true},
  comments:   [{
   body:      {type:String, required:true},
   author:    {type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
   createdAt: {type:Date, default:Date.now}
 }],
  createdAt:  {type:Date, default:Date.now},
  updatedAt:  Date,
  filename:   {type:String},
  fileid: {type:String}
});

var Post = mongoose.model('post',postSchema);

module.exports = Post;
