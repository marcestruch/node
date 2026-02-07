const mongoose = require('mongoose');

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
    usuari: {
        type: String,
        required: true,
        ref: 'User' // Opcional, però bona pràctica si volem popular més tard.
        // Per ara guardarem l'email com demana l'exercici.
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);
