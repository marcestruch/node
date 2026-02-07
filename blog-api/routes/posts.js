const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');

// GET /api/posts - Obté tots els posts (Públic)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/posts/:id - Obté un post per ID (Públic)
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post no trobat' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/posts - Crea un nou post (Protegit)
router.post('/', protect, async (req, res) => {
    const { title, text, estat, categoria, etiquetes } = req.body;

    const post = new Post({
        title,
        text,
        estat,
        categoria,
        etiquetes,
        usuari: req.user.email // Afegim l'email de l'usuari autenticat
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/posts/:id - Actualitza un post existent (Protegit)
router.put('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post no trobat' });
        }

        if (req.body.title != null) post.title = req.body.title;
        if (req.body.text != null) post.text = req.body.text;
        if (req.body.estat != null) post.estat = req.body.estat;
        if (req.body.categoria != null) post.categoria = req.body.categoria;
        if (req.body.etiquetes != null) post.etiquetes = req.body.etiquetes;

        // Actualitzem l'usuari que ha modificat el post
        post.usuari = req.user.email;

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/posts/:id - Elimina un post (Protegit)
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post no trobat' });
        }

        await post.deleteOne();
        res.json({ message: 'Post eliminat correctament' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
