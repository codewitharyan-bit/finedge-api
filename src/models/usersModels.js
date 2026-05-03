const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
     username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
    }
,
});

 userSchema.methods.generateAccessToken = function() {
    const token = jwt.sign(
        { id: this._id, role: this.role ,email: this.email,username: this.username},
         process.env.JWT_SECRET, 
         { expiresIn: '1h' });
         return token;
  }

  userSchema.methods.generateRefreshToken = function() {
    const refreshToken = jwt.sign(
        { id: this._id, role: this.role ,email: this.email,username: this.username},
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
    );
    return refreshToken;
  }

module.exports = mongoose.model('User', userSchema);