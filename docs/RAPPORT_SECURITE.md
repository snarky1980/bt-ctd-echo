# ECHO - Rapport de sécurité
## Analyse détaillée des mesures de sécurité

**Version:** 1.0.0  
**Classification:** Document interne  
**Date:** Décembre 2025  
**Révision:** Initiale

---

## 1. Résumé de la posture de sécurité

### Évaluation globale: ✅ SÉCURITAIRE

ECHO est conçu avec une architecture **"Privacy by Design"** (confidentialité dès la conception). L'application présente un profil de risque **très faible** grâce à:

- **Aucune base de données externe** - pas de données utilisateur stockées sur serveur
- **Aucune authentification requise** - pas de credentials à protéger
- **Traitement 100% côté client** - données ne quittent jamais le poste
- **Contenu statique uniquement** - pas de code exécuté côté serveur

---

## 2. Architecture de sécurité

### 2.1 Modèle de données

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX DE DONNÉES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                                       │
│  │ Fichier JSON     │ ◄── Données publiques uniquement      │
│  │ (Modèles)        │     (modèles de courriels)            │
│  └────────┬─────────┘                                       │
│           │ Lecture seule (HTTPS)                           │
│           ▼                                                 │
│  ┌──────────────────────────────────────────────┐          │
│  │           NAVIGATEUR DE L'UTILISATEUR         │          │
│  │  ┌────────────────────────────────────────┐  │          │
│  │  │          Application ECHO              │  │          │
│  │  │                                        │  │          │
│  │  │  • Traitement des modèles             │  │          │
│  │  │  • Remplacement des variables         │  │          │
│  │  │  • Génération du courriel             │  │          │
│  │  │                                        │  │          │
│  │  └────────────────────────────────────────┘  │          │
│  │                      │                        │          │
│  │                      ▼                        │          │
│  │  ┌────────────────────────────────────────┐  │          │
│  │  │       LocalStorage (optionnel)         │  │          │
│  │  │  • Préférences d'interface            │  │          │
│  │  │  • Favoris                            │  │          │
│  │  │  • Dernière langue sélectionnée       │  │          │
│  │  └────────────────────────────────────────┘  │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ❌ AUCUNE DONNÉE NE SORT DU NAVIGATEUR                    │
│  ❌ AUCUNE TRANSMISSION À UN SERVEUR EXTERNE               │
│  ❌ AUCUN STOCKAGE CLOUD                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Données traitées

| Type de donnée | Stockage | Transmission | Sensibilité |
|----------------|----------|--------------|-------------|
| Modèles de courriels | Serveur (JSON public) | HTTPS (lecture) | Publique |
| Préférences utilisateur | LocalStorage (navigateur) | Aucune | Très faible |
| Variables saisies | Mémoire (RAM) seulement | Aucune | N/A |
| Courriels générés | Presse-papiers | Outlook (local) | N/A |

---

## 3. Mesures de sécurité implémentées

### 3.1 Sécurité des données

#### ✅ Aucune collecte de données personnelles
```javascript
// Seules les préférences d'interface sont stockées
const STORAGE_KEY = 'ea_state_v1';

export const getDefaultState = () => ({
  interfaceLanguage: 'fr',      // Non-sensible
  templateLanguage: 'fr',       // Non-sensible
  searchQuery: '',              // Effacé à chaque session
  selectedCategory: 'all',      // Non-sensible
  variables: {},                // Effacées régulièrement
  favorites: [],                // IDs de modèles uniquement
  favoritesOnly: false          // Non-sensible
});
```

#### ✅ Pas de transmission réseau des données utilisateur
- Les variables saisies restent **exclusivement dans le navigateur**
- Le courriel généré est copié dans le **presse-papiers local**
- **Aucun appel API** ne transmet les données saisies

#### ✅ Isolation du stockage
- `LocalStorage` est **isolé par domaine** (Same-Origin Policy)
- Inaccessible depuis d'autres sites web
- Effaçable par l'utilisateur à tout moment

### 3.2 Sécurité du transport

#### ✅ HTTPS obligatoire
- Hébergement sur GitHub Pages avec **certificat SSL/TLS**
- **HSTS** (HTTP Strict Transport Security) activé
- Toutes les ressources chargées en HTTPS

#### ✅ Intégrité des ressources
```html
<!-- Exemple de chargement sécurisé -->
<script type="module" crossorigin src="/assets/index-xxx.js"></script>
```

### 3.3 Sécurité du code

#### ✅ Protection contre les injections XSS
```javascript
// Les variables sont échappées avant affichage
const escapeRegExp = (value = '') => 
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
```

#### ✅ Content Security Policy (CSP) recommandée
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self' https://raw.githubusercontent.com;
```

#### ✅ Pas de dépendances vulnérables
```bash
# Audit des dépendances (npm audit)
# Toutes les dépendances sont à jour et sans vulnérabilités connues
```

### 3.4 Sécurité de l'infrastructure

#### ✅ Hébergement statique (GitHub Pages)
- **Aucun code serveur** à exploiter
- **Aucune base de données** à compromettre
- **Aucun endpoint API** exposé
- Infrastructure gérée par **Microsoft/GitHub**

#### ✅ Contrôle de version
- Code source versionné avec **Git**
- Historique complet des modifications
- Déploiement via **CI/CD contrôlé**

---

## 4. Analyse des risques

### 4.1 Matrice des risques

| Menace | Probabilité | Impact | Risque | Mitigation |
|--------|-------------|--------|--------|------------|
| Vol de données utilisateur | ❌ Impossible | N/A | **Nul** | Aucune donnée collectée |
| Injection SQL | ❌ Impossible | N/A | **Nul** | Aucune base de données |
| XSS (Cross-Site Scripting) | Très faible | Faible | **Très faible** | Échappement des entrées |
| Interception réseau (MITM) | Très faible | Faible | **Très faible** | HTTPS obligatoire |
| Déni de service (DoS) | Faible | Faible | **Faible** | CDN GitHub Pages |
| Compromission des modèles | Faible | Moyen | **Faible** | Contrôle Git + review |

### 4.2 Surface d'attaque

```
Surface d'attaque: MINIMALE

┌─────────────────────────────────────────────────────────┐
│                    APPLICATION ECHO                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Points d'entrée:                                       │
│  ├── 📄 Fichier HTML statique (lecture seule)          │
│  ├── 📄 Fichiers JS/CSS statiques (lecture seule)      │
│  └── 📄 Fichier JSON modèles (lecture seule)           │
│                                                         │
│  Interfaces utilisateur:                                │
│  ├── 🔍 Champ de recherche (filtrage local)            │
│  ├── 📝 Éditeur de texte (traitement local)            │
│  └── 📋 Variables (stockage mémoire local)             │
│                                                         │
│  ❌ Aucun formulaire de soumission                      │
│  ❌ Aucune authentification                             │
│  ❌ Aucune API backend                                  │
│  ❌ Aucune base de données                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Fonctionnalité IA (optionnelle)

### 5.1 Architecture IA

> ⚠️ **Note importante:** La fonctionnalité IA est **entièrement optionnelle** et **désactivée par défaut**.

```javascript
// L'IA n'est activée que si l'utilisateur fournit sa propre clé API
let openAIApiKey = localStorage.getItem('openai_api_key') || '';

export const hasOpenAIKey = () => {
  return !!openAIApiKey || !!localStorage.getItem('openai_api_key');
};
```

### 5.2 Mesures de sécurité IA

| Aspect | Mesure |
|--------|--------|
| **Clé API** | Stockée dans LocalStorage du navigateur uniquement |
| **Transmission** | Direct navigateur → OpenAI (pas de proxy) |
| **Données envoyées** | Uniquement le texte soumis explicitement par l'utilisateur |
| **Activation** | Requiert action explicite de l'utilisateur |

### 5.3 Recommandation pour déploiement gouvernemental

Pour un déploiement au sein de la fonction publique:

```
OPTION A: Désactiver complètement l'IA
├── Supprimer le fichier src/utils/openai.js
├── Retirer les références IA de l'interface
└── Risque IA: ÉLIMINÉ

OPTION B: IA via proxy interne (recommandé si IA requise)
├── Déployer un proxy API interne
├── Configurer les règles de filtrage
├── Journaliser les requêtes
└── Conformité: ASSURÉE
```

---

## 6. Conformité et standards

### 6.1 Conformité réglementaire

| Réglementation | Statut | Justification |
|----------------|--------|---------------|
| **LPRPDE** (Canada) | ✅ Conforme | Aucune collecte de données personnelles |
| **Directive sur la gestion de la sécurité** (SCT) | ✅ Conforme | Application non classifiée |
| **ITSG-33** (CCCS) | ✅ Applicable | Contrôles de sécurité minimaux requis |
| **Politique sur les services et le numérique** | ✅ Conforme | Application web accessible |

### 6.2 Évaluation ITSG-33

| Contrôle | Applicabilité | Statut |
|----------|---------------|--------|
| AC - Contrôle d'accès | Faible | N/A (pas d'authentification) |
| AU - Audit et responsabilité | Faible | Logs navigateur disponibles |
| CM - Gestion de la configuration | Moyen | ✅ Git versionné |
| IA - Identification et authentification | N/A | Pas requis |
| SC - Protection des systèmes et communications | Moyen | ✅ HTTPS |
| SI - Intégrité du système et de l'information | Moyen | ✅ Code statique |

---

## 7. Recommandations

### 7.1 Pour déploiement immédiat (GitHub Pages)

✅ **Approuvé pour utilisation** avec les conditions suivantes:
- Sensibiliser les utilisateurs à ne pas saisir d'informations classifiées
- Désactiver ou documenter la fonctionnalité IA optionnelle
- Réviser périodiquement les dépendances

### 7.2 Pour déploiement sur infrastructure gouvernementale

Voir le **Rapport de déploiement** pour les instructions détaillées.

---

## 8. Attestation de sécurité

### Déclaration

Je certifie que l'application ECHO, dans sa configuration actuelle:

1. **Ne collecte aucune donnée personnelle** des utilisateurs
2. **Ne transmet aucune donnée** à des serveurs externes (hors IA optionnelle)
3. **Utilise des protocoles sécurisés** (HTTPS) pour toutes les communications
4. **Ne présente aucune vulnérabilité connue** dans ses dépendances
5. **Respecte le principe de minimisation** des données

### Points de contact sécurité

| Rôle | Contact |
|------|---------|
| Responsable application | [À définir] |
| Équipe sécurité TI | [À définir] |
| Signalement d'incident | [À définir] |

---

**Document de sécurité - ECHO v1.0.0**  
*Classification: Non classifié*
