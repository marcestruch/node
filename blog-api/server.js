require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutes
const postsRouter = require('./routes/posts');
const authRouter = require('./routes/auth');

app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);

// Connectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connexió a MongoDB establerta correctament.');
        app.listen(PORT, () => {
            console.log(`Servidor actiu a http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error connectant a MongoDB:', err);
    });
