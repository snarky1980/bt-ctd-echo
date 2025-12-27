# ECHO - Assistant de modèles de courriels

> Application web de gestion de modèles de courriels avec édition de texte riche, variables dynamiques et support bilingue (FR/EN).

[![Demo](https://img.shields.io/badge/demo-live-success)](https://echomt.jskennedy.net/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()

---

## Fonctionnalités

### Éditeur de texte riche
- Mise en forme complète (gras, italique, souligné, barré)
- Surlignage en 6 couleurs, 8 couleurs de texte
- Sélection de polices et tailles avec prévisualisation
- Listes à puces et numérotées

### Gestion des variables
- Variables dynamiques : `<<NomClient>>`, `<<DateLivraison>>`
- Affichage visuel en "pills" éditables
- Panneau de variables détachable (popout)
- Synchronisation automatique

### Bibliothèque de modèles
- Modèles bilingues français/anglais
- Organisation par catégories
- Recherche intelligente avec synonymes
- Système de favoris

### Export et intégration
- Copie directe vers Outlook (classique/web)
- Export PDF, Word, HTML, EML
- Préservation du formatage riche

---

## Démarrage rapide

### Utilisation en ligne
**[https://echomt.jskennedy.net/](https://echomt.jskennedy.net/)**

### Développement local

```bash
# Cloner et installer
git clone https://github.com/snarky1980/bt-ctd-echo.git
cd bt-ctd-echo
npm install

# Développement
npm run dev

# Production
npm run build
```

---

## Structure du projet

```
bt-ctd-echo/
├── src/                    # Code source React
│   ├── components/         # Composants React
│   ├── constants/          # Constantes et textes
│   ├── hooks/              # Hooks personnalisés
│   └── utils/              # Utilitaires
├── admin/                  # Interface d'administration
├── docs/                   # Documentation
└── scripts/                # Scripts utilitaires
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Guide Admin](docs/ADMIN-CSV-IMPORT-GUIDE.md) | Import/export de modèles et variables |
| [Rapport exécutif](docs/RAPPORT_EXECUTIF_ECHO.md) | Présentation pour la gestion |
| [Rapport sécurité](docs/RAPPORT_SECURITE.md) | Architecture et conformité |

---

## Technologies

- **React 18** + **Vite 6** - Framework et build
- **Tailwind CSS 4** - Styles
- **Radix UI** - Composants accessibles
- **Fuse.js** - Recherche floue

---

## Sécurité

- **100% côté client** - Aucune donnée transmise à un serveur
- **LocalStorage** - Préférences stockées localement uniquement
- **Contenu statique** - Modèles publics, pas de données sensibles

---

## Administration

L'interface d'administration (`admin/admin-simple.html`) permet de :
- Éditer les modèles et variables
- Importer/exporter en JSON ou Excel
- Gérer les catégories

---

## Licence

MIT License

---

**Bureau de la traduction - Centre de traduction et documentation**

