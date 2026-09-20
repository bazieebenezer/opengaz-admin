# Création d'un compte administrateur OpenGaz

Ce document explique comment créer un nouveau compte administrateur pour le panneau d'administration OpenGaz.

## Contexte

Il n'existe **aucune interface web** permettant de créer un compte admin. Le panneau d'administration (`src/app/page.tsx`) sert uniquement à se connecter avec des identifiants existants et refuse tout utilisateur dont le rôle n'est pas `ADMIN`.

La création d'admin se fait exclusivement via un **script CLI** exécuté sur le backend, ce qui limite l'exposition aux seuls membres de l'équipe ayant accès au terminal et à la base de données.

## Prérequis

- Backend cloné en local : `Project/Opengaz/Backend`
- Dépendances installées : `npm install`
- Fichier `.env` configuré (copier `.env.example` en `.env`) :
  ```env
  DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
  JWT_SECRET="..."
  ```

> **Important** : le `DATABASE_URL` doit pointer vers la **même base de données** que celle utilisée par le backend déployé sur Render (`https://opengaz-backend.onrender.com`). Sinon, le compte créé ne fonctionnera pas sur le panneau admin en ligne.

## Créer un compte admin

Depuis le dossier `Project/Opengaz/Backend` :

```bash
npm run create-admin -- --email admin@opengaz.com --password "Mot2passe!" --name "Nom Admin"
```

Le script affiche alors un récapitulatif du compte créé.

### Formats de commande acceptés

| Format | Exemple |
| --- | --- |
| Options longues | `npm run create-admin -- --email a@opengaz.bf --password "pass" --name "Admin"` |
| Options courtes | `npm run create-admin -- -e a@opengaz.bf -p "pass" -n "Admin"` |
| Positionnel | `npm run create-admin -- a@opengaz.bf "pass" "Admin"` |

### Options

| Option | Alias | Description |
| --- | --- | --- |
| `--email` | `-e` | Email du compte (requis) |
| `--password` | `-p` | Mot de passe du compte (requis) |
| `--name` | `-n` | Nom affiché (défaut : `Super Admin`) |

## Règles de comportement

- L'email est normalisé en minuscules avant création.
- Le script **refuse** de créer un compte si un utilisateur possède déjà cet email (un message d'erreur s'affiche et rien n'est créé).
- Le mot de passe est haché avec bcrypt avant insertion en base — il n'est jamais stocké en clair.
- Le compte est créé avec `role: 'ADMIN'` et `isValidated: true`, il est donc immédiatement utilisable.

## Se connecter

Une fois le compte créé :

1. Ouvrir le panneau admin : `http://localhost:3000`
2. Renseigner l'email et le mot de passe du compte créé
3. Choisir un mot de passe fort et le communiquer à l'intéressé par un canal sûr (jamais par email/chat)

## Sécurité

- **Aucune page de création publique** : le lien de création ne peut pas « tomber dans de mauvaises mains ».
- Le secret à protéger est l'accès au terminal + la base de données, pas une URL.
- En cas de compromission, il suffit de changer le mot de passe du compte concerné (via `prisma` ou un nouveau script).

## Références

| Élément | Emplacement |
| --- | --- |
| Script de création | `Backend/src/create-admin.ts` |
| Script npm | `Backend/package.json` → `create-admin` |
| Hachage mot de passe | `Backend/src/utils/auth.ts` → `hashPassword` |
| Login admin (frontend) | `Admin/src/app/page.tsx` |
| Garde du rôle ADMIN | `Admin/src/app/page.tsx` (vérification `role !== "ADMIN"`) |
| Statistiques / commandes admin | `Backend/src/controllers/admin.controller.ts`, `Backend/src/routes/admin.routes.ts` |

## Foire aux questions

**Le compte admin est-il utilisable immédiatement ?** Oui, `isValidated` est mis à `true` à la création.

**Que se passe-t-il si l'email existe déjà ?** Le script affiche une erreur et ne modifie rien.

**Peut-on créer plusieurs admins ?** Oui, il suffit d'exécuter le script une fois par compte.

**Faut-il redéployer le backend après création ?** Non, le compte est directement écrit en base, le backend en ligne le voit tout de suite.