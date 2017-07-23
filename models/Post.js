var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var postSchema = new Schema({
  post: {type: String, required: true},
  author: {type: Schema.Types.ObjectId, requires: true},
  created_at: Date
});

postSchema.pre('save', function(next) {
  if(!this.created_at)this.created_at = new Date();

      next();
  });

module.exports = mongoose.model('Post', postSchema)
