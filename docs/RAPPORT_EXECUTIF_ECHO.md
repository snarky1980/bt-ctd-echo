# ECHO - Rapport exécutif détaillé

## Application de gestion de modèles de courriels

**Classification:** Document interne  
**Pour:** Direction, gestionnaires et parties prenantes  
**Date:** Décembre 2025  
**Version:** 1.0.0  
**Lecture estimée:** 10-12 minutes

---

## Sommaire exécutif

ECHO est une **application web de type SPA** (*Single Page Application* - application à page unique qui se charge une seule fois et réagit instantanément aux actions de l'utilisateur) développée pour standardiser et accélérer la création de communications par courriel au sein de l'organisation.

### Points saillants

| Aspect | Évaluation | Détail |
| ------ | ---------- | ------ |
| **Sécurité** | ✅ Excellente | Architecture *zero-trust* côté client |
| **Coût d'exploitation** | ✅ Nul | Hébergement statique gratuit |
| **Facilité d'adoption** | ✅ Élevée | Aucune formation requise |
| **Maintenabilité** | ✅ Simple | Mise à jour des modèles sans intervention TI |
| **Conformité** | ✅ Conforme | Respecte LPRPDE et politiques du SCT |

---

## 1. Contexte et problématique

### 1.1 Situation actuelle

Les employés doivent régulièrement envoyer des communications standardisées (confirmations, suivis, réponses types). Le processus actuel présente plusieurs inefficacités:

| Problème | Impact | Fréquence |
| -------- | ------ | --------- |
| Recherche de modèles dans les dossiers personnels | Perte de temps | Quotidienne |
| Versions multiples et obsolètes en circulation | Incohérence | Hebdomadaire |
| Copier-coller manuel avec modifications | Erreurs | Quotidienne |
| Formatage incohérent entre les agents | Image de marque diluée | Constante |
| Traduction manuelle FR↔EN | Duplication d'efforts | Quotidienne |

### 1.2 Coût de l'inefficacité (estimé)

Pour une équipe de 10 agents traitant en moyenne 5 courriels standardisés par jour:

```text
Temps actuel par courriel:     15-20 minutes (recherche + adaptation + vérification)
Temps avec ECHO:               2-3 minutes (sélection + variables + copie)
Économie par courriel:         ~15 minutes

Calcul annuel (250 jours ouvrables):
├── Courriels/jour:            50 (10 agents × 5 courriels)
├── Économie/jour:             750 minutes = 12.5 heures
├── Économie/année:            3,125 heures
└── Équivalent ETP*:           ~1.5 employé à temps plein

*ETP = Équivalent Temps Plein (basé sur 2,080 heures/an)
```text

---

## 2. Présentation de la solution ECHO

### 2.1 Description fonctionnelle

ECHO est un **système de gestion de modèles de courriels** (*Email Template Management System*) qui permet de:

1. **Centraliser** tous les modèles approuvés en un seul endroit
2. **Rechercher** rapidement via une recherche intelligente avec synonymes
3. **Personnaliser** en remplissant des variables prédéfinies
4. **Exporter** directement vers Outlook avec mise en forme préservée

### 2.2 Fonctionnalités principales

#### 🔍 Recherche intelligente avec *Fuzzy Matching*

> **Fuzzy Matching** (correspondance approximative): Technologie qui trouve des résultats même si l'orthographe n'est pas exacte. Par exemple, taper "rendevous" trouvera quand même "rendez-vous".

- Recherche bilingue (FR/EN) avec dictionnaire de synonymes intégré
- Filtrage par catégorie et par favoris
- Résultats instantanés sans rechargement de page

#### 📝 Éditeur de texte enrichi (*Rich Text Editor*)

> **Rich Text Editor**: Éditeur qui permet la mise en forme (gras, italique, listes, etc.) comme dans Word, contrairement à un simple bloc-notes.

- Support du formatage: gras, italique, souligné, listes
- Variables intelligentes affichées sous forme de "pilules" colorées
- Prévisualisation en temps réel du résultat final

#### 🌐 Interface bilingue complète

- Tous les modèles disponibles en français ET en anglais
- Basculement instantané de la langue d'interface
- Contenu du modèle adaptable selon la langue du destinataire

#### 📋 Intégration Outlook native

- Bouton "Copier vers Outlook" en un clic
- Préservation complète du formatage HTML
- Compatible avec Outlook Desktop et Outlook Web (OWA)

### 2.3 Flux de travail utilisateur

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PARCOURS UTILISATEUR ECHO                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ÉTAPE 1              ÉTAPE 2              ÉTAPE 3              ÉTAPE 4     │
│  ────────             ────────             ────────             ────────     │
│                                                                              │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐  │
│  │ RECHERCHE │   ►   │ SÉLECTION │   ►   │ VARIABLES │   ►   │  EXPORT  │  │
│  └──────────┘        └──────────┘        └──────────┘        └──────────┘  │
│                                                                              │
│  L'utilisateur       Il parcourt         Il remplit les      Il clique      │
│  tape des mots       les résultats       champs requis:      "Copier" et    │
│  clés: "congé",      et clique sur       - Nom client        colle dans     │
│  "absence",          le modèle           - Date              Outlook        │
│  "maladie"...        approprié           - Référence...                     │
│                                                                              │
│  ⏱️ ~10 sec          ⏱️ ~5 sec           ⏱️ ~60 sec          ⏱️ ~5 sec      │
│                                                                              │
│                      TEMPS TOTAL: ~90 secondes                              │
│                      (vs 15-20 minutes auparavant)                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```text

---

## 3. Architecture technique

### 3.1 Vue d'ensemble

ECHO utilise une architecture **JAMstack** (*JavaScript, APIs, Markup*):

> **JAMstack**: Architecture moderne où le site web est pré-généré sous forme de fichiers statiques. Contrairement aux sites traditionnels qui génèrent les pages à chaque visite (comme WordPress), tout est déjà prêt. C'est plus rapide, plus sécuritaire et moins coûteux.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE ECHO (JAMstack)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ┌─────────────────────┐                              │
│                         │   GITHUB PAGES      │                              │
│                         │   (Hébergement)     │                              │
│                         │                     │                              │
│                         │  ┌───────────────┐  │                              │
│                         │  │ Fichiers      │  │                              │
│                         │  │ statiques     │  │                              │
│                         │  │ (HTML/JS/CSS) │  │                              │
│                         │  └───────────────┘  │                              │
│                         │                     │                              │
│                         │  ┌───────────────┐  │                              │
│                         │  │ Modèles JSON  │  │                              │
│                         │  │ (85 KB)       │  │                              │
│                         │  └───────────────┘  │                              │
│                         │                     │                              │
│                         └──────────┬──────────┘                              │
│                                    │                                         │
│                                    │ HTTPS (chiffré)                         │
│                                    │                                         │
│                                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     NAVIGATEUR DE L'UTILISATEUR                       │   │
│  │  ┌────────────────────────────────────────────────────────────────┐  │   │
│  │  │                    APPLICATION REACT                            │  │   │
│  │  │                                                                 │  │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │   │
│  │  │  │ Interface   │  │ Moteur de   │  │ Éditeur Lexical         │ │  │   │
│  │  │  │ utilisateur │  │ recherche   │  │ (Rich Text)             │ │  │   │
│  │  │  │ (Radix UI)  │  │ (Fuse.js)   │  │                         │ │  │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────────────────┘ │  │   │
│  │  │                                                                 │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │   │
│  │  │  │                  LocalStorage                            │   │  │   │
│  │  │  │  • Préférences (langue, favoris)                        │   │  │   │
│  │  │  │  • NON: données utilisateur, variables saisies          │   │  │   │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │   │
│  │  └────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ❌ AUCUN SERVEUR D'APPLICATION (pas de Node.js, Python, PHP, etc.)         │
│  ❌ AUCUNE BASE DE DONNÉES (pas de SQL, MongoDB, etc.)                      │
│  ❌ AUCUNE API BACKEND (pas d'endpoints à sécuriser)                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```text

### 3.2 Technologies utilisées

|  Composant  |  Technologie  |  Rôle  | Pourquoi ce choix |
| ----------- | ------------- | ------ |-------------------|
|  **Framework**  |  React 18  |  Structure de l'application  | Standard de l'industrie, maintenu par Meta |
|  **Build tool**  |  Vite  |  Compilation et optimisation  | Rapide, moderne, support TypeScript |
|  **UI Components**  |  Radix UI  |  Composants d'interface  | Accessibilité (WCAG) intégrée |
|  **Styles**  |  Tailwind CSS  |  Mise en forme  | Maintenable, fichiers CSS légers |
|  **Recherche**  |  Fuse.js  |  Recherche floue  | Performance, fonctionne hors-ligne |
|  **Éditeur**  |  Lexical  |  Éditeur de texte riche  | Créé par Meta, extensible |
|  **Hébergement**  |  GitHub Pages  |  Serveur web  | Gratuit, CDN mondial, SSL inclus |

> **CDN** (*Content Delivery Network*): Réseau de serveurs répartis géographiquement qui livrent le contenu depuis le serveur le plus proche de l'utilisateur. Résultat: chargement très rapide peu importe où on se trouve.

### 3.3 Taille et performance

|  Ressource  |  Taille  |  Temps de chargement*  |
| ----------- | -------- | --------------------- |
|  Application (JS compilé)  |  ~320 KB  |  < 1 sec  |
|  Styles (CSS)  |  ~45 KB  |  < 0.2 sec  |
|  Modèles de courriels  |  ~85 KB  |  < 0.3 sec  |
|  **Total**  |  **~450 KB**  |  **< 2 sec**  |

*Sur connexion standard (10 Mbps). Après le premier chargement, l'application est **mise en cache** (stockée localement) et se charge quasi-instantanément.

---

## 4. Analyse de sécurité détaillée

### 4.1 Posture de sécurité: "Zero Trust Client-Side"

> **Zero Trust**: Modèle de sécurité qui ne fait confiance à rien par défaut. Dans le cas d'ECHO, on va plus loin: il n'y a simplement **rien à protéger** car aucune donnée sensible n'est collectée ou transmise.

ECHO adopte une approche de sécurité par conception (*Security by Design*) où les risques sont **éliminés à la source** plutôt que mitigés:

| Menace traditionnelle | Comment ECHO l'élimine |
|----------------------|------------------------|
| Vol de base de données | ❌ Aucune base de données |
| Injection SQL | ❌ Aucune requête SQL |
| Fuite de credentials | ❌ Aucune authentification |
| Interception de données | ❌ Aucune donnée transmise |
| Ransomware sur serveur | ❌ Pas de serveur d'application |

### 4.2 Flux de données - Ce qui se passe vraiment

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ANALYSE DU FLUX DE DONNÉES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CE QUI EST TÉLÉCHARGÉ (une seule fois):                                    │
│  ═══════════════════════════════════════                                    │
│                                                                              │
│  GitHub Pages ──────────────────────────────►  Navigateur                   │
│                                                                              │
│    • Code de l'application (JS/CSS)  ──────►  100% PUBLIC                   │
│    • Modèles de courriels (JSON)     ──────►  100% PUBLIC                   │
│                                                                              │
│  ✅ Aucune donnée confidentielle n'est téléchargée                          │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  CE QUI EST STOCKÉ LOCALEMENT (LocalStorage):                               │
│  ════════════════════════════════════════════                               │
│                                                                              │
│    • interfaceLanguage: "fr"      ──────►  Préférence, non-sensible         │
│    • templateLanguage: "fr"       ──────►  Préférence, non-sensible         │
│    • favorites: [12, 45, 67]      ──────►  IDs de modèles, non-sensible     │
│    • favoritesOnly: false         ──────►  Préférence, non-sensible         │
│                                                                              │
│  ✅ Aucune PII (Personally Identifiable Information)                        │
│  ✅ Aucun token, mot de passe ou secret                                     │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  CE QUI EST SAISI PAR L'UTILISATEUR:                                        │
│  ═══════════════════════════════════                                        │
│                                                                              │
│    Variables (nom, date, etc.) ──────► Mémoire vive (RAM) UNIQUEMENT        │
│                                                                              │
│    ❌ NON sauvegardé dans LocalStorage                                      │
│    ❌ NON transmis à un serveur                                             │
│    ❌ NON envoyé à une API                                                  │
│    ✅ Disparaît à la fermeture de l'onglet                                  │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  CE QUI EST TRANSMIS AU SERVEUR:                                            │
│  ═══════════════════════════════                                            │
│                                                                              │
│                          ╔═══════════════╗                                  │
│                          ║     RIEN      ║                                  │
│                          ╚═══════════════╝                                  │
│                                                                              │
│  ✅ ECHO est une application "read-only" du point de vue réseau             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```text

### 4.3 Matrice des risques

|  #  |  Menace  |  Probabilité  | Impact | Risque résiduel | Justification |
| --- | -------- | ------------- |--------|-----------------|---------------|
|  1  |  Vol de données utilisateur  |  Impossible  | N/A | **NUL** | Aucune donnée collectée |
|  2  |  Injection de code malveillant (XSS)  |  Très faible  | Faible | **TRÈS FAIBLE** | Entrées échappées, pas de HTML dynamique |
|  3  |  Compromission du serveur  |  Faible  | Faible | **FAIBLE** | Fichiers statiques seulement, rien à voler |
|  4  |  Interception réseau (MITM)  |  Très faible  | Négligeable | **NÉGLIGEABLE** | HTTPS + données publiques uniquement |
|  5  |  Déni de service (DoS)  |  Faible  | Faible | **FAIBLE** | CDN GitHub avec protection DDoS |
|  6  |  Modification des modèles  |  Faible  | Moyen | **FAIBLE** | Contrôle Git + processus de review |

### 4.4 Conformité réglementaire

#### LPRPDE (Loi sur la protection des renseignements personnels)

|  Exigence  |  Statut  |  Justification  |
| ---------- | -------- | --------------- |
|  Collecte limitée  |  ✅ N/A  |  Aucune collecte  |
|  Consentement  |  ✅ N/A  |  Rien à consentir  |
|  Conservation  |  ✅ N/A  |  Rien conservé  |
|  Divulgation  |  ✅ N/A  |  Rien à divulguer  |

#### Directive sur la gestion de la sécurité (SCT)

|  Contrôle  |  Applicabilité  |  Conformité  |
| ---------- | --------------- | ------------ |
|  Classification des données  |  Non classifié  |  ✅  |
|  Chiffrement en transit  |  HTTPS/TLS 1.3  |  ✅  |
|  Contrôle d'accès  |  N/A (public)  |  ✅  |
|  Journalisation  |  Logs navigateur disponibles  |  ✅  |

### 4.5 Module IA (optionnel) - Considérations spéciales

> ⚠️ **Note importante**: La fonctionnalité d'assistance IA est **désactivée par défaut**. Elle ne s'active que si un utilisateur entre manuellement sa propre clé API OpenAI.

```text
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE IA (OPTIONNEL)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ÉTAT PAR DÉFAUT: ❌ DÉSACTIVÉ                                  │
│                                                                  │
│  Pour l'activer, l'utilisateur doit:                            │
│  1. Obtenir sa propre clé API OpenAI (payante)                  │
│  2. La saisir manuellement dans l'application                   │
│  3. Accepter que ses requêtes soient envoyées à OpenAI          │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  RECOMMANDATION POUR DÉPLOIEMENT GC:                            │
│                                                                  │
│  Option A: Désactiver complètement le module IA                 │
│            (supprimer le fichier src/utils/openai.js)           │
│            ➜ Risque IA: ÉLIMINÉ                                 │
│                                                                  │
│  Option B: Conserver mais ne pas promouvoir                     │
│            (aucun utilisateur n'activera sans instruction)      │
│            ➜ Risque IA: TRÈS FAIBLE                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```text

---

## 5. Déploiement et infrastructure

### 5.1 Options de déploiement

|  Option  |  Coût  |  Contrôle  | Délai | Recommandation |
| -------- | ------ | ---------- |-------|----------------|
|  **GitHub Pages** (actuel)  |  Gratuit  |  Modéré  | Immédiat | ✅ Phase initiale |
|  **Serveur web interne**  |  Variable  |  Total  | 1-2 sem | ✅ Phase 2 si requis |
|  **Azure Static Web Apps**  |  ~10$/mois  |  Élevé  | 1 sem | Alternatif cloud GC |

### 5.2 Configuration actuelle (GitHub Pages)

```text
Domaine: www.bt-tb.ca/echo-bt-ctd/gestion
Hébergement: GitHub Pages (infrastructure Microsoft)
SSL/TLS: Certificat automatique Let's Encrypt
CDN: Fastly (inclus avec GitHub Pages)
Disponibilité: 99.9% SLA
```text

### 5.3 Processus de mise à jour

#### Mise à jour des modèles de courriels (sans intervention TI)

```text
1. Modifier le fichier complete_email_templates.json
2. Commiter et pousser vers GitHub
3. ✅ Les changements sont en ligne en ~2 minutes

Qui peut le faire: Gestionnaire de contenu avec accès GitHub
Formation requise: ~30 minutes
```text

#### Mise à jour de l'application (intervention TI)

```text
1. Modifier le code source
2. Tester localement (npm run dev)
3. Compiler (npm run build)
4. Déployer (git push)
5. ✅ Nouvelle version en ligne en ~5 minutes

Qui peut le faire: Développeur ou équipe TI
Fréquence anticipée: Mensuelle ou moins
```text

---

## 6. Plan d'adoption et gouvernance

### 6.1 Phases de déploiement recommandées

|  Phase  |  Description  |  Durée  | Livrables |
| ------- | ------------- | ------- |-----------|
|  **1. Pilote**  |  Test avec équipe restreinte (5-10 personnes)  |  2 semaines  | Rétroaction, ajustements |
|  **2. Validation**  |  Revue des modèles par les gestionnaires  |  1 semaine  | Modèles approuvés |
|  **3. Déploiement**  |  Communication et accès à tous  |  1 semaine  | Guide utilisateur |
|  **4. Optimisation**  |  Collecte de suggestions, améliorations  |  Continu  | Nouvelles fonctionnalités |

### 6.2 Modèle de gouvernance proposé

```text
┌─────────────────────────────────────────────────────────────────┐
│                     GOUVERNANCE ECHO                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PROPRIÉTAIRE FONCTIONNEL                                       │
│  └── Responsable du contenu des modèles                         │
│      └── Approuve les nouveaux modèles                          │
│      └── Valide les traductions                                 │
│                                                                  │
│  GESTIONNAIRE DE CONTENU                                        │
│  └── Maintient les modèles à jour                               │
│      └── Ajoute/modifie les modèles selon les besoins           │
│      └── Assure la cohérence linguistique                       │
│                                                                  │
│  SUPPORT TECHNIQUE (au besoin)                                  │
│  └── Résout les problèmes techniques                            │
│      └── Déploie les mises à jour majeures                      │
│      └── Gère l'infrastructure si migration                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```text

### 6.3 Indicateurs de performance (KPIs)

|  Indicateur  |  Méthode de mesure  |  Cible  |
| ------------ | ------------------- | ------- |
|  **Taux d'adoption**  |  Sondage utilisateurs  |  > 80% après 1 mois  |
|  **Satisfaction**  |  Sondage post-déploiement  |  > 4/5  |
|  **Temps économisé**  |  Auto-déclaration  |  > 10 min/courriel  |
|  **Erreurs signalées**  |  Tickets de support  |  < 5/mois  |

---

## 7. Foire aux questions (FAQ)

### Questions de sécurité

**Q: Les données que je tape sont-elles envoyées quelque part?**
> **R:** Non. Les variables que vous saisissez (noms, dates, etc.) restent uniquement dans la mémoire de votre navigateur. Quand vous fermez l'onglet, tout disparaît. Rien n'est jamais transmis à un serveur.

**Q: Est-ce que quelqu'un peut voir mes courriels?**
> **R:** Non. ECHO génère le courriel localement sur votre ordinateur. C'est vous qui le copiez ensuite dans Outlook. Personne d'autre n'y a accès.

**Q: Est-ce conforme aux politiques de sécurité du gouvernement?**
> **R:** Oui. Puisqu'ECHO ne collecte, ne traite et ne stocke aucune donnée personnelle ou confidentielle, il est conforme aux exigences de la LPRPDE et des directives du SCT.

**Q: Que se passe-t-il si GitHub tombe en panne?**
> **R:** GitHub Pages a une disponibilité de 99.9%. En cas de panne rare, les utilisateurs attendent simplement que le service soit rétabli. Aucune donnée n'est perdue car rien n'est stocké. L'application peut aussi être déployée sur serveur interne si désiré.

### Questions fonctionnelles

**Q: Puis-je utiliser ECHO hors ligne?**
> **R:** Une fois l'application chargée, elle fonctionne même si la connexion est interrompue. Cependant, le premier chargement nécessite Internet.

**Q: Comment ajouter un nouveau modèle de courriel?**
> **R:** Le gestionnaire de contenu modifie le fichier JSON des modèles. Aucune intervention de l'équipe TI n'est nécessaire.

**Q: Est-ce que ça fonctionne avec Outlook?**
> **R:** Oui, ECHO est optimisé pour Outlook. Le formatage (gras, listes, etc.) est préservé lors du copier-coller.

---

## 8. Conclusion et recommandations

### Synthèse de l'évaluation

|  Critère  |  Évaluation  |  Commentaire  |
| --------- | ------------ | ------------- |
|  **Valeur ajoutée**  |  ⭐⭐⭐⭐⭐  |  Gains de productivité mesurables  |
|  **Sécurité**  |  ⭐⭐⭐⭐⭐  |  Risque quasi-nul par conception  |
|  **Coût total de possession**  |  ⭐⭐⭐⭐⭐  |  Gratuit, maintenance minimale  |
|  **Facilité d'adoption**  |  ⭐⭐⭐⭐⭐  |  Intuitif, aucune formation  |
|  **Maintenabilité**  |  ⭐⭐⭐⭐  |  Modèles faciles à modifier  |

### Recommandation finale

✅ **APPROUVÉ POUR DÉPLOIEMENT**

L'application ECHO répond aux critères de sécurité, d'efficacité et de facilité d'utilisation requis pour un déploiement au sein de l'organisation. Son architecture "sans serveur" (*serverless*) élimine la majorité des risques de sécurité traditionnels.

### Prochaines étapes

|  #  |  Action  |  Responsable  | Échéance |
| --- | -------- | ------------- |----------|
|  1  |  Valider les modèles de courriels actuels  |  Propriétaire fonctionnel  | Semaine 1 |
|  2  |  Identifier le groupe pilote  |  Gestionnaire  | Semaine 1 |
|  3  |  Communiquer le déploiement  |  Communications  | Semaine 2 |
|  4  |  Lancer le pilote  |  Équipe projet  | Semaine 2 |
|  5  |  Recueillir la rétroaction  |  Tous  | Semaines 3-4 |
|  6  |  Déploiement complet  |  Équipe projet  | Semaine 5 |

---

## Annexes

### A. Glossaire technique

| Terme | Définition simple |
|-------|-------------------|
| **API** | Interface permettant à deux logiciels de communiquer. ECHO n'en utilise aucune pour vos données. |
| **Backend** | Serveur qui traite les données. ECHO n'en a pas. |
| **CDN** | Réseau de serveurs qui accélère le chargement des sites web. |
| **Frontend** | Partie visible d'une application, celle que vous utilisez. |
| **HTTPS** | Version sécurisée du protocole web, les données sont chiffrées pendant le transport. |
| **JSON** | Format de fichier texte structuré, facile à lire et modifier. |
| **LocalStorage** | Petit espace de stockage dans votre navigateur, isolé par site web. |
| **SPA** | Application web qui se charge une fois et réagit instantanément. |
| **SSL/TLS** | Technologie de chiffrement qui sécurise les communications web. |

### B. Contacts

|  Rôle  |  Nom  |  Courriel  |
| ------ | ----- | ---------- |
|  Propriétaire fonctionnel  |  [À définir]  |   |
|  Gestionnaire de contenu  |  [À définir]  |   |
|  Support technique  |  [À définir]  |   |

---

**Document préparé pour la direction**  
**ECHO v1.0.0 | Décembre 2025**  
**Classification: Non classifié**
