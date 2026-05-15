const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Paths pour les données
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const itemsFile = path.join(dataDir, 'items.json');

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Initialiser les fichiers JSON
function initializeData() {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(itemsFile)) {
        fs.writeFileSync(itemsFile, JSON.stringify([], null, 2));
    }
}

// Lire les données
function readUsers() {
    try {
        return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    } catch (e) {
        return [];
    }
}

function readItems() {
    try {
        return JSON.parse(fs.readFileSync(itemsFile, 'utf8'));
    } catch (e) {
        return [];
    }
}

// Écrire les données
function writeUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function writeItems(items) {
    fs.writeFileSync(itemsFile, JSON.stringify(items, null, 2));
}

// Hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Initialiser les données au démarrage
initializeData();

// ROUTES AUTHENTIFICATION

// Inscription
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const users = readUsers();

    // Vérifier si l'utilisateur existe déjà
    if (users.find(u => u.username === username || u.email === email)) {
        return res.status(400).json({ error: 'Utilisateur ou email déjà existant' });
    }

    // Créer le nouvel utilisateur
    const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    res.json({
        message: 'Inscription réussie',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        }
    });
});

// Connexion
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username et password requis' });
    }

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user || user.password !== hashPassword(password)) {
        return res.status(400).json({ error: 'Identifiants invalides' });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date().toISOString();
    writeUsers(users);

    res.json({
        message: 'Connexion réussie',
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
});

// ROUTES ARTICLES

// Ajouter un article
app.post('/api/items', (req, res) => {
    const { userId, url, title, price } = req.body;

    if (!userId || !url) {
        return res.status(400).json({ error: 'userId et url requis' });
    }

    const items = readItems();

    // Extraire le nom de domaine
    const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    const domain = domainMatch ? domainMatch[1] : 'unknown';

    const newItem = {
        id: Date.now().toString(),
        userId,
        url,
        title: title || 'Article sans titre',
        price: price || 'Prix non spécifié',
        domain,
        createdAt: new Date().toISOString()
    };

    items.push(newItem);
    writeItems(items);

    res.json({
        message: 'Article ajouté',
        item: newItem
    });
});

// Récupérer les articles d'un utilisateur
app.get('/api/items/:userId', (req, res) => {
    const { userId } = req.params;
    const items = readItems();

    const userItems = items.filter(item => item.userId === userId);

    res.json({ items: userItems });
});

// Supprimer un article
app.delete('/api/items/:itemId', (req, res) => {
    const { itemId } = req.params;
    let items = readItems();

    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Article non trouvé' });
    }

    items.splice(itemIndex, 1);
    writeItems(items);

    res.json({ message: 'Article supprimé' });
});

// ROUTES ADMIN

// Récupérer tous les utilisateurs (pour l'admin)
app.get('/api/admin/users', (req, res) => {
    const users = readUsers();
    const items = readItems();

    const usersWithStats = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        itemCount: items.filter(item => item.userId === user.id).length
    }));

    res.json({ users: usersWithStats });
});

// Récupérer les stats globales
app.get('/api/admin/stats', (req, res) => {
    const users = readUsers();
    const items = readItems();

    res.json({
        totalUsers: users.length,
        totalItems: items.length
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur BIBLIOTHÈQUE lancé sur http://localhost:${PORT}`);
    console.log(`📚 Accédez à l'application sur http://localhost:${PORT}`);
});
