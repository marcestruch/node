const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El correu electrònic és obligatori'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Si us plau, introdueix un correu vàlid']
    },
    password: {
        type: String,
        required: [true, 'La contrasenya és obligatòria'],
        minlength: [6, 'La contrasenya ha de tenir almenys 6 caràcters']
    },
    role: {
        type: String,
        enum: ['editor', 'admin'],
        default: 'editor'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pre-save per encriptar la contrasenya
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Mètode per comparar contrasenyes
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
