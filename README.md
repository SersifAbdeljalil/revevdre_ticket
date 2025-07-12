# 🎫 Application de Revente de Tickets CAN2025.

Cette application permet la gestion et la revente de tickets pour la Coupe d'Afrique des Nations 2025. Le projet est divisé en deux parties principales: frontend et backend.

## ⚙️ Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants:

- **🟢 Node.js**: Téléchargez et installez depuis [le site officiel](https://nodejs.org/en)
- **🔄 Git**: Pour cloner le projet
- **🖥️ Serveur local**: XAMPP ou équivalent pour la base de données MySQL

## ✅ Vérification des installations

Après l'installation de Node.js, vérifiez que tout est correctement installé:

```bash
node -v    # Affiche la version de Node.js
npm -v     # Affiche la version de npm
npx -v     # Affiche la version de npx
```

## 🗄️ Configuration de la base de données

1. Lancez votre serveur local (XAMPP ou autre)
2. Accédez à phpMyAdmin: [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/)
3. Créez une nouvelle base de données nommée `revente_tickets_can2025`
4. Cliquez sur l'onglet "Importer" en haut
5. Sélectionnez le fichier SQL fourni et importez-le

## 📥 Installation du projet

### 📋 Clonage du dépôt

1. Ouvrez un terminal dans le dossier où vous souhaitez installer le projet
2. Initialisez Git et clonez le dépôt:

```bash
git init
git clone https://github.com/SersifAbdeljalil/revevdre_ticket
```

### ⚙️ Configuration du backend

1. Accédez au dossier backend:

```bash
cd revevdre_ticket/backend
```

2. Installez les dépendances:

```bash
npm install
```

3. Lancez le serveur:

```bash
node server
```

### 🖥️ Configuration du frontend

1. Ouvrez un nouveau terminal et accédez au dossier frontend:

```bash
cd revevdre_ticket/frontend
```

2. Installez les dépendances:

```bash
npm install
```

3. Lancez l'application:

```bash
npm start
```

L'application s'ouvrira automatiquement dans votre navigateur par défaut.

## 🔐 Connexion en tant qu'administrateur

Pour vous connecter en tant qu'administrateur, utilisez les identifiants suivants:

- **📧 Email**: admin@admin.com
- **🔑 Mot de passe**: admin@2018

## 📁 Structure du projet

```
revevdre_ticket/
│
├── backend/           # Serveur Node.js
│   ├── server.js      # Point d'entrée du serveur
│   └── ...
│
├── frontend/          # Application React
│   ├── public/        # Fichiers statiques
│   ├── src/           # Code source
│   └── ...
│
└── README.md          # Ce fichier
```

## ✨ Fonctionnalités

- 🎟️ Gestion des tickets CAN2025
- 🔒 Système d'authentification
- 👩‍💼 Interface administrateur
- 💰 Système de revente de tickets

## ❗ Problèmes courants

- **🔴 Erreur de connexion à la base de données**: Vérifiez que votre serveur local est bien lancé
- **⚠️ Module introuvable**: Assurez-vous d'avoir exécuté `npm install` dans les dossiers backend et frontend
- **🚫 Port déjà utilisé**: Modifiez les ports dans les fichiers de configuration si nécessaire

## 🤝 Contribution

Pour contribuer au projet:

1. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
2. Committez vos changements (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
3. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
4. Ouvrez une Pull Request
---

Développé par SersifAbdeljalil © 2025
