var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodeauth');
var db = mongoose.connection;
var bcrypt = require('bcryptjs');

//user schema 
var userschema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    profileimage: {
        type: String
    }
});
var user = module.exports = mongoose.model('user', userschema);
module.exports.getuserbyid = function(id, callback) {
    user.findById(id, callback);
}
module.exports.getuserbyusername = function(username, callback) {
    var query = { username: username };
    user.findOne(query, callback);
}
module.exports.comparepassword = function(candidatepassword, hash, callback) {
    bcrypt.compare(candidatepassword, hash, function(err, isMatch) {
        callback(null, isMatch);
    })
}

module.exports.createuser = function(newuser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newuser.password, salt, function(err, hash) {
            newuser.password = hash;
            newuser.save(callback);
            // Store hash in your password DB. 
        });
    });

}