# 📚 BIBLIOTHÈQUE - Wishlist Personnel

Une application web moderne et épurée pour créer votre propre bibliothèque de souhaits personnelle.

## ✨ Fonctionnalités

### Pour les utilisateurs
- ✅ **Création de compte** - Inscription et connexion sécurisées
- 🏠 **Bibliothèque personnelle** - Wishlist privée à votre nom
- 🔗 **Ajouter des articles** - Collez simplement le lien du produit (Zalando, Babolat, etc.)
- 🖼️ **Images automatiques** - Les images des produits s'affichent directement
- 👆 **Redirection facile** - Clic sur l'image = accès au site officiel
- 🗑️ **Gestion d'articles** - Supprimez les articles facilement
- 💎 **Design moderne** - Interface épurée et professionnelle

### Pour l'administrateur
- 🔐 **Panel admin secret** - Code: `Admin1817`
- 👥 **Vue d'ensemble** - Voir tous les utilisateurs et leurs statistiques
- 📊 **Statistiques** - Nombre total d'utilisateurs et d'articles
- 🔍 **Suivi des connexions** - Voir la dernière connexion de chaque utilisateur

## 🚀 Installation

### Prérequis
- Node.js (v14 ou supérieur)
- npm

### Étapes

```bash
# 1. Cloner le repository
git clone https://github.com/carpalxx-netizen/BIBLIOTH-QUE.git
cd BIBLIOTH-QUE

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur
npm start

# 4. Accéder à l'application
# http://localhost:3000
```

## 📝 Utilisation

### Créer un compte
1. Remplissez le formulaire d'inscription
2. Confirmez les informations
3. Vous êtes connecté!

### Ajouter un article
1. Dans votre dashboard, collez l'URL du produit
2. Ajoutez optionnellement le titre et le prix
3. Cliquez sur "➕ Ajouter"
4. L'article apparaît dans votre galerie!

### Accéder au panel admin
1. Cliquez sur le bouton 🔐 (en bas à droite ou en haut à droite)
2. Entrez le code: `Admin1817`
3. Vous accédez au dashboard d'administration

## 🎨 Design

- **Gradient moderne** : Violet (#667eea) à Rose (#764ba2)
- **Interface épurée** : Très professionnel, pas enfantin
- **Responsive** : Fonctionne sur mobile, tablette et desktop
- **Animations fluides** : Transitions élégantes

## 📂 Structure du projet

```
BIBLIOTH-QUE/
├── server.js           # Backend Express
├── package.json        # Dépendances
├── .gitignore         # Fichiers ignorés
├── data/              # Base de données (JSON)
│   ├── users.json
│   └── items.json
└── public/
    ├── index.html     # Interface HTML
    ├── styles.css     # Styles CSS
    └── app.js         # Logique JavaScript
```

## 🔐 Sécurité

- Les mots de passe sont hashés en SHA256
- Les données sont stockées localement en JSON
- Authentification simple mais efficace

## 🎁 Bonus Features

- 📊 Affichage du prix et du titre
- 🌐 Extraction du domaine du site
- 💬 Interface bilingue français/anglais
- 🎯 Historique de connexion
- ⭐ Compteurs de statistiques

## 📝 Comptes de test

```
Username: test
Password: test123
```

## 🚀 Déploiement

Pour déployer en ligne:
- Heroku
- Railway
- Render
- Vercel (frontend)
- AWS, Google Cloud, etc.

## 💡 Améliorations futures

- 🌐 Partage de wishlists
- 👥 Collaborateurs sur une wishlist
- 🏷️ Catégories et tags
- ⭐ Système de priorités
- 💬 Commentaires sur articles
- 🔔 Notifications et reminders
- 📱 Application mobile

## 📞 Support

Pour toute question ou problème, consultez le code source ou créez une issue.

---

Fait avec ❤️ par carpalxx-netizen
