const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
    user: process.env.DB_USER || 'root',
    host: process.env.DB_HOST || 'db',
    database: process.env.DB_NAME || 'hospital_help',
    password: process.env.DB_PASSWORD || 'senha123',
    port: 3306
});

const sessionStore = new MySQLStore({
    expiration: 86400000,
    createDatabaseTable: true
}, pool);


app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/img-carrosel', express.static(path.join(__dirname, 'img-carrosel')));
app.use('/img-especialidades', express.static(path.join(__dirname, 'img-especialidades')));
app.use('/img-logo', express.static(path.join(__dirname, 'img-logo')));

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 86400000
    }
}));


const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'cadastro.html'));
});

app.get('/usuario', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'usuario.html'));
});

app.get('/consultas', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'consultas.html'));
});

app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, cpf, phone, email FROM users WHERE id = ?',
            [req.session.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                error: 'Email ou senha inválidos'
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Email ou senha inválidos'
            });
        }

        req.session.user = {
            id: user.id,
            email: user.email
        };

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login realizado com sucesso',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Erro ao realizar login'
        });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { cpf, phone, email, password } = req.body;

        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR cpf = ?',
            [email, cpf]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                error: 'User already exists with this email or CPF' 
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await pool.query(
            'INSERT INTO users (cpf, phone, email, password) VALUES (?, ?, ?, ?)',
            [cpf, phone, email, hashedPassword]
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'An error occurred during registration' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 