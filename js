let currentUser = null;
let adminToken = null;

// ====== GESTION DES PAGES ======
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageName).classList.add('active');
}

// ====== AUTHENTIFICATION ======
function toggleAuth() {
    document.getElementById('register-form').classList.toggle('active');
    document.getElementById('login-form').classList.toggle('active');
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!username || !email || !password) {
        alert('Tous les champs sont requis');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            loadDashboard();
            showPage('dashboard-page');
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Erreur lors de l\'inscription');
        console.error(err);
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Username et password requis');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            loadDashboard();
            showPage('dashboard-page');
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Erreur lors de la connexion');
        console.error(err);
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    showPage('auth-page');
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

// ====== DASHBOARD ======
async function loadDashboard() {
    if (currentUser) {
        document.getElementById('username-display').textContent = `Bienvenue ${currentUser.username} 👋`;
    }
    await loadWishlist();
}

async function addItem() {
    const url = document.getElementById('item-url').value;
    const title = document.getElementById('item-title').value;
    const price = document.getElementById('item-price').value;

    if (!url) {
        alert('Veuillez entrer une URL');
        return;
    }

    // Validation simple d'URL
    try {
        new URL(url);
    } catch {
        alert('URL invalide');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/wishlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url,
                title: title || extractTitleFromUrl(url),
                image_url: await fetchImageFromUrl(url),
                price
            })
        });

        if (response.ok) {
            document.getElementById('item-url').value = '';
            document.getElementById('item-title').value = '';
            document.getElementById('item-price').value = '';
            await loadWishlist();
            alert('✅ Article ajouté avec succès!');
        } else {
            alert('Erreur lors de l\'ajout');
        }
    } catch (err) {
        console.error(err);
        alert('Erreur lors de l\'ajout');
    }
}

async function loadWishlist() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const items = await response.json();
        const container = document.getElementById('wishlist-container');

        if (items.length === 0) {
            container.innerHTML = '<p class="empty-state">Aucun article pour le moment... Commencez à ajouter! 🎁</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="wishlist-item">
                <img src="${item.image_url || 'https://via.placeholder.com/200x200?text=No+Image'}" 
                     alt="${item.title}" 
                     class="item-image"
                     onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
                <div class="item-info">
                    <div class="item-title">${item.title}</div>
                    ${item.price ? `<div class="item-price">${item.price}</div>` : ''}
                    <div class="item-actions">
                        <button class="btn-visit" onclick="window.open('${item.url}', '_blank')">🔗 Voir</button>
                        <button class="btn-delete" onclick="deleteItem('${item.id}')">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function deleteItem(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/wishlist/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            await loadWishlist();
        }
    } catch (err) {
        console.error(err);
    }
}

// ====== UTILITAIRES ======
function extractTitleFromUrl(url) {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return `Article de ${domain}`;
    } catch {
        return 'Article sans titre';
    }
}

async function fetchImageFromUrl(url) {
    // En production, vous auriez besoin d'un backend qui scrape le site
    // Pour maintenant, on retourne un placeholder
    return 'https://via.placeholder.com/200x200?text=Article';
}

// ====== PANEL ADMIN ======
function showAdminModal() {
    document.getElementById('admin-modal').classList.add('show');
}

function closeAdminModal() {
    document.getElementById('admin-modal').classList.remove('show');
    document.getElementById('admin-code').value = '';
    document.getElementById('admin-error').textContent = '';
}

async function verifyAdmin() {
    const code = document.getElementById('admin-code').value;

    if (!code) {
        document.getElementById('admin-error').textContent = 'Veuillez entrer un code';
        return;
    }

    try {
        const response = await fetch('/api/admin/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (response.ok) {
            adminToken = data.token;
            localStorage.setItem('adminToken', adminToken);
            closeAdminModal();
            loadAdminPanel();
            showPage('admin-page');
        } else {
            document.getElementById('admin-error').textContent = '❌ Code invalide';
        }
    } catch (err) {
        console.error(err);
        document.getElementById('admin-error').textContent = 'Erreur serveur';
    }
}

async function loadAdminPanel() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        // Mettre à jour les statistiques
        document.getElementById('stat-users').textContent = data.total_users;
        document.getElementById('stat-items').textContent = data.total_items;

        // Remplir le tableau des utilisateurs
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = data.users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                <td>${user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : 'N/A'}</td>
                <td>${user.items_count}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        alert('Erreur lors du chargement du panel admin');
    }
}

function logoutAdmin() {
    adminToken = null;
    localStorage.removeItem('adminToken');
    showPage('dashboard-page');
}

// ====== INITIALISATION ======
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    if (adminToken) {
        loadAdminPanel();
        showPage('admin-page');
    } else if (token) {
        showPage('dashboard-page');
        loadDashboard();
    } else {
        showPage('auth-page');
    }
});

// Fermer le modal en cliquant en dehors
document.addEventListener('click', (e) => {
    const modal = document.getElementById('admin-modal');
    if (e.target === modal) {
        closeAdminModal();
    }
});
