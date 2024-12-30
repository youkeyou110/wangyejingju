const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    settings: {
        theme: {
            type: String,
            default: 'light'
        },
        shortcuts: {
            type: Map,
            of: String,
            default: {}
        }
    },
    templates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// 验证密码方法
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
