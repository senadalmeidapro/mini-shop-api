# README - API Mini-shop

Ce projet est une API REST développée avec **NestJS** et **TypeORM**.  
Elle permet de gérer un site de vente en ligne (panier, commandes, paiements, avis, etc.).

---

## Technologies utilisées

- **NestJS** (framework Node.js)
- **TypeORM** (ORM pour PostgreSQL)
- **JWT** (authentification)
- **bcrypt** (hachage des mots de passe)
- **ValidationPipe** (validation des données)

---

## Structure des données

Voici les principales entités et leurs relations :

- **User** : utilisateur (email, mot de passe, rôle `user` ou `admin`).
- **Address** : adresses de livraison liées à un utilisateur.
- **Cart** : panier d’un utilisateur (un seul panier par utilisateur).
- **CartItem** : produit ajouté au panier (quantité).
- **Order** : commande créée à partir du panier.
- **OrderItem** : produit commandé (prix unitaire figé).
- **Product** : produit (nom, description, prix, stock, catégorie).
- **Category** : catégorie de produit.
- **Review** : avis laissé par un utilisateur sur un produit.
- **Payment** : paiement associé à une commande (statut, méthode).

Les relations sont gérées avec `@OneToMany`, `@ManyToOne`, `@OneToOne` et les cascades sont activées.

---

## Fonctionnalités principales

- **Authentification**  
  - Inscription (`POST /auth/register`)  
  - Connexion (`POST /auth/login`) – renvoie un token JWT  
  - Déconnexion (`POST /auth/logout`) – supprime le token côté serveur

- **Gestion des utilisateurs**  
  - Création, lecture, mise à jour, suppression (réservé admin pour certaines actions)  
  - Ajout / modification / suppression d’adresses

- **Gestion des produits et catégories**  
  - CRUD complet pour les produits (admin)  
  - CRUD complet pour les catégories (admin)

- **Panier**  
  - Ajouter / modifier / supprimer un article dans le panier  
  - Récupérer le panier d’un utilisateur

- **Commandes**  
  - Création d’une commande à partir du panier (vérification du stock)  
  - Annulation d’une commande (remise en stock)  
  - Consultation des commandes (admin voit tout, utilisateur voit les siennes)

- **Paiements**  
  - Création d’un paiement à partir d’un panier (génère une commande et vide le panier)  
  - Mise à jour du statut (pending, succeeded, failed, cancelled)  
  - Annulation d’un paiement (annule aussi la commande)

- **Avis**  
  - Création d’un avis sur un produit  
  - Modification / suppression (seul le propriétaire ou un admin peut supprimer)

---

## Installation et lancement

### 1. Cloner le projet

```bash
git clone https://github.com/senadalmeidapro/mini-shop.git
cd /mini-shop
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d’environnement

Créez un fichier `.env` à la racine avec les variables suivantes (adaptez-les à votre base de données) :

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce
JWT_SECRET=monSecretSuperSecurise
```

### 4. Lancer les migrations (si vous en avez)

```bash
npm run typeorm migration:run
```

### 5. Démarrer le serveur

```bash
npm run start:dev
```

L’API sera accessible sur `http://localhost:3000`.

---

## Exemples d’endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST    | `/auth/register` | Inscription |
| POST    | `/auth/login`    | Connexion (renvoie un token) |
| GET     | `/products`      | Liste des produits |
| POST    | `/cart/:productId` | Ajouter un produit au panier |
| GET     | `/cart`          | Récupérer le panier de l’utilisateur |
| POST    | `/payments/:cartId` | Payer le panier (crée commande + paiement) |
| GET     | `/orders`        | Commandes de l’utilisateur (admin voit tout) |
| POST    | `/reviews/:productId` | Ajouter un avis |

*Tous les endpoints protégés nécessitent le token JWT dans le header `Authorization: Bearer <token>`.*

---
