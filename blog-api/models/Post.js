const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'El comentari no pot estar buit']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El títol és obligatori, si us plau especifica un títol.']
    },
    text: {
        type: String,
        required: [true, 'El contingut del post és obligatori.']
    },
    estat: {
        type: String,
        required: [true, 'L\'estat del post és obligatori.'],
        enum: {
            values: ['esborrany', 'publicat'],
            message: 'L\'estat ha de ser "esborrany" o "publicat".'
        }
    },
    categoria: {
        type: String,
        required: false
    },
    etiquetes: {
        type: [String],
        required: false,
        default: []
    },
    comments: [CommentSchema],
    usuari: {
        type: String,
        required: true,
        ref: 'User'
    },
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);
