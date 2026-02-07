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

// PUT /api/posts/:id/like - Dona m'agrada a un post
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post no trobat' });
        }

        post.likes = (post.likes || 0) + 1;
        await post.save();

        res.json({ message: 'Like afegit', likes: post.likes });
    } catch (err) {
        res.status(500).json({ message: err.message });
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

// --- Comentaris ---

// POST /api/posts/:id/comments - Afegir comentari
router.post('/:id/comments', protect, async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'El contingut del comentari és obligatori' });
    }

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post no trobat' });
        }

        const newComment = {
            user: req.user._id,
            content
        };

        post.comments.push(newComment);
        await post.save();

        res.status(201).json(post.comments[post.comments.length - 1]); // Retornem el comentari creat
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/posts/:id/comments/:commentId - Eliminar comentari (Només autor o admin)
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post no trobat' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentari no trobat' });
        }

        // Comprovar permisos: autor del comentari o admin
        // req.user.role pot no estar populat si al middleware auth no hem agafat tot l'usuari o tots els camps
        // Al middleware authMiddleware: "req.user = await User.findById(decoded.id).select('-password');"
        // Això hauria de funcionar ja que hem afegit el camp 'role' al schema i mongo ens el retornarà.

        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'No autoritzat' });
        }

        comment.deleteOne(); // Mètode de subdocument Mongoose
        await post.save();

        res.json({ message: 'Comentari eliminat' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/posts/:id/comments/:commentId - Modificar comentari
router.put('/:id/comments/:commentId', protect, async (req, res) => {
    const { content } = req.body;

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post no trobat' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comentari no trobat' });
        }

        // Comprovar permisos
        if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'No autoritzat' });
        }

        if (content) {
            comment.content = content;
        }

        await post.save();
        res.json(comment);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
