const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    style: {
        width: String,
        height: String,
        background: String,
        fontFamily: String,
        fontSize: String,
        color: String,
        padding: String,
        borderRadius: String,
        boxShadow: String
    },
    content: {
        layout: String,
        quote: String,
        author: String,
        source: String
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    downloads: {
        type: Number,
        default: 0
    },
    rating: {
        score: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新时间中间件
templateSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Template', templateSchema);
