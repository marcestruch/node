const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');

// Generar Token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Token expira en 30 dies
    });
};

// POST /api/auth/register - Registre d'un nou usuari
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Verificar si camps plens
    if (!email || !password) {
        return res.status(400).json({ message: 'Si us plau, afegeix tots els camps' });
    }

    try {
        // Verificar si l'usuari ja existeix
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'L\'usuari ja existeix' });
        }

        // Crear l'usuari
        // La contrasenya s'encripta automàticament al middleware pre-save del model User
        const user = await User.create({
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ message: 'Dades d\'usuari invàlides' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/auth/login - Autenticar usuari i obtenir token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuari per email
        const user = await User.findOne({ email });

        // Verificar contrasenya
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Credencials invàlides' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/auth/profile - Obtenir perfil de l'usuari actual
// Ruta protegida
router.get('/profile', protect, async (req, res) => {
    // req.user s'ha establert al middleware protect
    const user = {
        _id: req.user._id,
        email: req.user.email,
        createdAt: req.user.createdAt
    };

    res.json(user);
});

module.exports = router;
