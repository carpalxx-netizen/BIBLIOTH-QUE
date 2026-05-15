// Variables globales
let currentUser = null;
const API_BASE = '/api';

// Au chargement
document.addEventListener('DOMContentLoaded', () => {
    loadPage('auth');
    setupEventListeners();
});

// Setup des événements
function setupEventListeners() {
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const activeForm = document.querySelector('.auth-form.active');
            if (activeForm && document.getElementById('login-form').classList.contains('active')) {
                login();
            } else if (activeForm && document.getElementById('register-form').classList.contains('active')) {
                register();
            }
        }
    });
}

// Changer de page
function loadPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}-page`).classList.add('active');

    if (page === 'dashboard') {
        loadWishlist();
    } else if (page === 'admin') {
        loadAdminPanel();
    }
}

// ==================== AUTHENTIFICATION ====================

// Inscription
async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!username || !email || !password) {
        alert('Tous les champs sont requis');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Erreur lors de l\'inscription');
            return;
        }

        currentUser = data.user;
        loadPage('dashboard');
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

// Connexion
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Username et password requis');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Erreur lors de la connexion');
            return;
        }

        currentUser = data.user;
        document.getElementById('username-display').textContent = `Bienvenue, ${currentUser.username}!`;
        loadPage('dashboard');
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

// Basculer entre inscription et connexion
function toggleAuth() {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    registerForm.classList.toggle('active');
    loginForm.classList.toggle('active');
}

// Déconnexion
function logout() {
    currentUser = null;
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
    loadPage('auth');
}

// ==================== WISHLIST ====================

// Ajouter un article
async function addItem() {
    if (!currentUser) {
        alert('Connectez-vous d\'abord');
        return;
    }

    const url = document.getElementById('item-url').value;
    const title = document.getElementById('item-title').value;
    const price = document.getElementById('item-price').value;

    if (!url) {
        alert('Veuillez entrer une URL');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                url,
                title: title || extractTitleFromUrl(url),
                price: price || 'À déterminer'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Erreur lors de l\'ajout de l\'article');
            return;
        }

        // Réinitialiser les champs
        document.getElementById('item-url').value = '';
        document.getElementById('item-title').value = '';
        document.getElementById('item-price').value = '';

        loadWishlist();
    } catch (error) {
        alert('Erreur: ' + error.message);
    }
}

// Charger la wishlist
async function loadWishlist() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/items/${currentUser.id}`);
        const data = await response.json();
        const items = data.items;

        const container = document.getElementById('wishlist-container');

        if (items.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucun article pour le moment... Commencez à ajouter! 🎁</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="wishlist-item">
                <img 
                    src="${getImageFromUrl(item.url)}" 
                    alt="${item.title}" 
                    class="wishlist-item-image"
                    onclick="window.open('${item.url}', '_blank')"
                />
                <div class="wishlist-item-content">
                    <div class="wishlist-item-title">${item.title}</div>
                    <div class="wishlist-item-price">${item.price}</div>
                    <div class="wishlist-item-url">${item.domain}</div>
                    <button class="wishlist-item-delete" onclick="deleteItem('${item.id}')">🗑️ Supprimer</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
    }
}

// Supprimer un article
async function deleteItem(itemId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article?')) {
        try {
            const response = await fetch(`${API_BASE}/items/${itemId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                alert('Erreur lors de la suppression');
                return;
            }

            loadWishlist();
        } catch (error) {
            alert('Erreur: ' + error.message);
        }
    }
}

// Extraire le titre depuis l'URL
function extractTitleFromUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch (e) {
        return 'Article';
    }
}

// Obtenir une image de l'URL (utiliser une API ou fallback)
function getImageFromUrl(url) {
    // Utiliser une API de preview d'URL (exemple: microlink.io)
    // Pour une meilleure solution, utiliser un service comme og-image ou unsplash
    return `https://image.thum.io/get/width/200/crop/250/${encodeURIComponent(url)}`;
}

// ==================== ADMIN ====================

// Afficher le modal admin
function showAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.add('active');
    document.getElementById('admin-code').value = '';
    document.getElementById('admin-error').textContent = '';
}

// Fermer le modal admin
function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('active');
}

// Vérifier le code admin
async function verifyAdmin() {
    const code = document.getElementById('admin-code').value;
    const errorDiv = document.getElementById('admin-error');

    if (code === 'Admin1817') {
        document.getElementById('admin-modal').classList.remove('active');
        loadPage('admin');
    } else {
        errorDiv.textContent = '❌ Code incorrect';
        document.getElementById('admin-code').value = '';
    }
}

// Charger le panel admin
async function loadAdminPanel() {
    try {
        // Récupérer les stats
        const statsResponse = await fetch(`${API_BASE}/admin/stats`);
        const stats = await statsResponse.json();

        document.getElementById('stat-users').textContent = stats.totalUsers;
        document.getElementById('stat-items').textContent = stats.totalItems;

        // Récupérer les utilisateurs
        const usersResponse = await fetch(`${API_BASE}/admin/users`);
        const usersData = await usersResponse.json();

        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = usersData.users.map(user => `
            <tr>
                <td><strong>${user.username}</strong></td>
                <td>${user.email}</td>
                <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>${new Date(user.lastLogin).toLocaleDateString('fr-FR')} à ${new Date(user.lastLogin).toLocaleTimeString('fr-FR')}</td>
                <td><span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 5px; font-weight: 600;">${user.itemCount}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erreur lors du chargement du panel admin:', error);
    }
}

// Déconnexion depuis l'admin
function logoutAdmin() {
    loadPage('auth');
}

// Fermer le modal au clic en dehors
window.onclick = (event) => {
    const modal = document.getElementById('admin-modal');
    if (event.target === modal) {
        modal.classList.remove('active');
    }
};
