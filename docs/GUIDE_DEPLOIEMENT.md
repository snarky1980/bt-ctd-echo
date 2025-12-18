# ECHO - Guide de déploiement
## Transfert et installation sur infrastructure dédiée

**Version:** 1.0.0  
**Classification:** Document technique  
**Date:** Décembre 2025  
**Audience:** Équipes TI / Infrastructure

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Prérequis](#2-prérequis)
3. [Options de déploiement](#3-options-de-déploiement)
4. [Déploiement sur serveur web](#4-déploiement-sur-serveur-web)
5. [Déploiement VPN/Intranet](#5-déploiement-vpnintranet)
6. [Configuration avancée](#6-configuration-avancée)
7. [Maintenance](#7-maintenance)
8. [Dépannage](#8-dépannage)

---

## 1. Vue d'ensemble

### 1.1 Architecture de l'application

ECHO est une **application web statique** (Single Page Application - SPA) qui ne nécessite:

- ❌ Aucun serveur d'application (Node.js, Python, etc.)
- ❌ Aucune base de données
- ❌ Aucune configuration serveur complexe

**Requis uniquement:**
- ✅ Un serveur web capable de servir des fichiers statiques (HTML, CSS, JS)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE DÉPLOIEMENT                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Option A: GitHub Pages       Option B: Serveur dédié          │
│   (Actuel)                     (Recommandé GC)                   │
│                                                                  │
│   ┌─────────────────┐         ┌─────────────────┐               │
│   │  GitHub Pages   │         │  Serveur Web    │               │
│   │  (CDN mondial)  │         │  (Apache/Nginx) │               │
│   └────────┬────────┘         └────────┬────────┘               │
│            │                           │                         │
│            ▼                           ▼                         │
│   ┌─────────────────────────────────────────────┐               │
│   │              FICHIERS STATIQUES              │               │
│   │                                              │               │
│   │  📄 index.html                              │               │
│   │  📁 assets/                                 │               │
│   │     ├── index-xxx.js   (~320 KB)           │               │
│   │     └── index-xxx.css  (~45 KB)            │               │
│   │  📄 complete_email_templates.json (~85 KB)  │               │
│   │                                              │               │
│   │  TOTAL: ~500 KB (excluant vendor)           │               │
│   └─────────────────────────────────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Taille des fichiers

| Fichier | Taille | Description |
|---------|--------|-------------|
| `index.html` | ~5 KB | Point d'entrée |
| `assets/index-*.js` | ~320 KB | Application React |
| `assets/index-*.css` | ~45 KB | Styles |
| `complete_email_templates.json` | ~85 KB | Modèles de courriels |
| **TOTAL** | **~455 KB** | Téléchargement initial |

---

## 2. Prérequis

### 2.1 Pour la compilation (build)

| Composant | Version minimale | Recommandé |
|-----------|------------------|------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| Git | 2.30+ | Dernière |

### 2.2 Pour l'hébergement

| Serveur | Configuration |
|---------|---------------|
| **Apache** | 2.4+ avec mod_rewrite |
| **Nginx** | 1.18+ |
| **IIS** | 10+ avec URL Rewrite |
| **Caddy** | 2.x (recommandé pour simplicité) |

### 2.3 Navigateurs supportés

| Navigateur | Version minimale |
|------------|------------------|
| Chrome / Edge | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Chrome (GC) | Compatible |

---

## 3. Options de déploiement

### 3.1 Comparaison des options

| Critère | GitHub Pages | Serveur interne | VPN/Intranet |
|---------|--------------|-----------------|--------------|
| **Coût** | Gratuit | Variable | Variable |
| **Maintenance** | Minimale | Moyenne | Moyenne |
| **Accessibilité** | Internet | Réseau GC | VPN requis |
| **Contrôle** | Limité | Total | Total |
| **Conformité GC** | À valider | ✅ Préféré | ✅ Préféré |
| **Délai mise en place** | Immédiat | 1-2 semaines | 2-4 semaines |

### 3.2 Recommandation

Pour un déploiement au sein du gouvernement:

```
RECOMMANDATION: Serveur web interne sur le réseau du GC

Justification:
├── Contrôle total sur l'infrastructure
├── Conformité avec les politiques de sécurité
├── Personnalisation des modèles possible
└── Intégration avec outils existants facilitée
```

---

## 4. Déploiement sur serveur web

### 4.1 Étape 1: Obtenir le code source

```bash
# Option A: Cloner depuis GitHub
git clone https://github.com/user/bt-ctd-echo.git
cd bt-ctd-echo

# Option B: Télécharger l'archive
wget https://github.com/user/bt-ctd-echo/archive/refs/heads/main.zip
unzip main.zip
cd bt-ctd-echo-main
```

### 4.2 Étape 2: Compiler l'application

```bash
# Installer les dépendances
npm install

# Compiler pour production
npm run build

# Les fichiers de production sont dans le dossier 'dist/'
ls -la dist/
```

**Résultat attendu:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
├── complete_email_templates.json
└── ...
```

### 4.3 Étape 3: Déployer les fichiers

#### Apache

```bash
# Copier les fichiers vers le répertoire web
sudo cp -r dist/* /var/www/html/echo/

# Créer la configuration Apache
sudo nano /etc/apache2/sites-available/echo.conf
```

**Configuration Apache (`echo.conf`):**
```apache
<VirtualHost *:80>
    ServerName echo.example.gc.ca
    DocumentRoot /var/www/html/echo
    
    <Directory /var/www/html/echo>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Support pour SPA (redirection vers index.html)
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
    
    # Headers de sécurité
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Cache pour assets
    <FilesMatch "\.(js|css|woff2?)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    ErrorLog ${APACHE_LOG_DIR}/echo_error.log
    CustomLog ${APACHE_LOG_DIR}/echo_access.log combined
</VirtualHost>
```

```bash
# Activer le site
sudo a2ensite echo.conf
sudo a2enmod rewrite headers
sudo systemctl reload apache2
```

#### Nginx

```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/echo
```

**Configuration Nginx:**
```nginx
server {
    listen 80;
    server_name echo.example.gc.ca;
    root /var/www/html/echo;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
    
    # Support pour SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache pour assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Headers de sécurité
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logs
    access_log /var/log/nginx/echo_access.log;
    error_log /var/log/nginx/echo_error.log;
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/echo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 Étape 4: Configurer HTTPS (recommandé)

```bash
# Avec Let's Encrypt (si accessible depuis Internet)
sudo certbot --apache -d echo.example.gc.ca

# OU avec un certificat interne
# Placer les certificats dans /etc/ssl/certs/
# Configurer dans le fichier VirtualHost
```

---

## 5. Déploiement VPN/Intranet

### 5.1 Architecture VPN

```
┌─────────────────────────────────────────────────────────────┐
│                    DÉPLOIEMENT VPN                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   UTILISATEUR                                                │
│       │                                                      │
│       ▼                                                      │
│   ┌─────────────────┐                                       │
│   │   Client VPN    │ ◄── Authentification requise          │
│   │   (GlobalProtect│                                       │
│   │   Cisco AnyConnect)                                     │
│   └────────┬────────┘                                       │
│            │                                                 │
│            ▼                                                 │
│   ┌─────────────────────────────────────────┐               │
│   │           RÉSEAU INTERNE GC              │               │
│   │                                          │               │
│   │   ┌────────────────────────────────┐    │               │
│   │   │      Serveur Web ECHO          │    │               │
│   │   │      (Apache/Nginx)            │    │               │
│   │   │      IP: 10.x.x.x              │    │               │
│   │   │      Port: 443 (HTTPS)         │    │               │
│   │   └────────────────────────────────┘    │               │
│   │                                          │               │
│   └─────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Configuration spécifique VPN

**DNS interne:**
```
# Ajouter dans le serveur DNS interne
echo.internal.gc.ca    A    10.x.x.x
```

**Pare-feu:**
```bash
# Règles iptables (exemple)
iptables -A INPUT -p tcp --dport 443 -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -s 10.0.0.0/8 -j ACCEPT
```

### 5.3 Certificat interne

Pour un déploiement sur intranet:

```bash
# Générer un certificat auto-signé (développement seulement)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/echo.key \
    -out /etc/ssl/certs/echo.crt \
    -subj "/CN=echo.internal.gc.ca"

# RECOMMANDÉ: Utiliser l'autorité de certification interne du GC
# pour éviter les avertissements de sécurité du navigateur
```

---

## 6. Configuration avancée

### 6.1 Personnalisation de l'URL des modèles

Par défaut, l'application charge les modèles depuis:
```
https://raw.githubusercontent.com/user/bt-ctd-echo/gh-pages/complete_email_templates.json
```

Pour utiliser une source locale, modifier dans `src/App.jsx`:

```javascript
// AVANT (GitHub)
const TEMPLATE_URLS = {
  primary: 'https://raw.githubusercontent.com/user/bt-ctd-echo/gh-pages/complete_email_templates.json',
  fallback: './complete_email_templates.json'
};

// APRÈS (Serveur local)
const TEMPLATE_URLS = {
  primary: './complete_email_templates.json',
  fallback: '/api/templates.json'  // Si API interne disponible
};
```

Puis recompiler:
```bash
npm run build
```

### 6.2 Désactiver la fonctionnalité IA

Pour supprimer complètement l'IA:

```bash
# 1. Supprimer le fichier openai.js
rm src/utils/openai.js

# 2. Rechercher et supprimer les références IA
grep -r "openai\|AI\|hasOpenAIKey" src/

# 3. Commenter ou supprimer le code associé dans App.jsx

# 4. Recompiler
npm run build
```

### 6.3 Variables d'environnement

Créer un fichier `.env.production`:

```env
# URL de base de l'application
VITE_BASE_URL=/echo/

# URL des modèles (optionnel)
VITE_TEMPLATES_URL=/api/templates.json

# Désactiver l'IA (optionnel)
VITE_DISABLE_AI=true
```

---

## 7. Maintenance

### 7.1 Mise à jour de l'application

```bash
# 1. Obtenir les dernières modifications
cd bt-ctd-echo
git pull origin main

# 2. Mettre à jour les dépendances
npm install

# 3. Vérifier les vulnérabilités
npm audit
npm audit fix  # Si nécessaire

# 4. Recompiler
npm run build

# 5. Déployer
sudo cp -r dist/* /var/www/html/echo/

# 6. Vider le cache (si applicable)
sudo systemctl reload nginx  # ou apache2
```

### 7.2 Mise à jour des modèles de courriels

Les modèles peuvent être mis à jour **sans recompilation**:

```bash
# 1. Modifier le fichier JSON
nano /var/www/html/echo/complete_email_templates.json

# 2. Valider le JSON
python3 -m json.tool complete_email_templates.json > /dev/null && echo "Valid JSON"

# 3. Aucun redémarrage nécessaire - les changements sont immédiats
```

### 7.3 Sauvegarde

```bash
#!/bin/bash
# Script de sauvegarde (backup-echo.sh)

BACKUP_DIR="/backup/echo"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarder les fichiers
tar -czf $BACKUP_DIR/echo_$DATE.tar.gz /var/www/html/echo/

# Garder les 30 dernières sauvegardes
ls -tp $BACKUP_DIR/*.tar.gz | tail -n +31 | xargs -I {} rm -- {}

echo "Sauvegarde créée: $BACKUP_DIR/echo_$DATE.tar.gz"
```

### 7.4 Monitoring

```bash
# Vérifier que l'application répond
curl -s -o /dev/null -w "%{http_code}" https://echo.example.gc.ca/

# Script de monitoring simple
#!/bin/bash
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://echo.example.gc.ca/)
if [ "$STATUS" != "200" ]; then
    echo "ALERTE: ECHO ne répond pas (status: $STATUS)"
    # Envoyer notification...
fi
```

---

## 8. Dépannage

### 8.1 Problèmes courants

| Problème | Cause probable | Solution |
|----------|----------------|----------|
| Page blanche | Fichiers JS non chargés | Vérifier les chemins dans index.html |
| Erreur 404 sur refresh | SPA routing incorrect | Configurer les redirections (voir 4.3) |
| Modèles ne chargent pas | URL incorrecte ou CORS | Vérifier l'URL dans Network tab |
| Styles cassés | Cache navigateur | Ctrl+Shift+R ou vider le cache |

### 8.2 Commandes de diagnostic

```bash
# Vérifier les logs Apache
sudo tail -f /var/log/apache2/echo_error.log

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/echo_error.log

# Tester la configuration Nginx
sudo nginx -t

# Vérifier les permissions
ls -la /var/www/html/echo/

# Tester le chargement des fichiers
curl -I https://echo.example.gc.ca/assets/index.js
```

### 8.3 Contact support

| Type de problème | Contact |
|------------------|---------|
| Infrastructure / Serveur | Équipe infrastructure TI |
| Application / Code | [Mainteneur de l'application] |
| Modèles de courriels | Gestionnaire de contenu |

---

## Annexe A: Checklist de déploiement

### ☐ Préparation
- [ ] Node.js 18+ installé sur la machine de build
- [ ] Accès au dépôt Git
- [ ] Serveur web configuré (Apache/Nginx)
- [ ] Certificat SSL disponible

### ☐ Compilation
- [ ] `npm install` exécuté sans erreur
- [ ] `npm audit` ne montre pas de vulnérabilités critiques
- [ ] `npm run build` génère le dossier `dist/`

### ☐ Déploiement
- [ ] Fichiers copiés vers le serveur web
- [ ] Configuration du serveur web (redirections SPA)
- [ ] HTTPS activé
- [ ] Headers de sécurité configurés

### ☐ Validation
- [ ] Page d'accueil accessible
- [ ] Recherche de modèles fonctionne
- [ ] Copie vers Outlook fonctionne
- [ ] Refresh de page ne cause pas d'erreur 404
- [ ] Tests dans les navigateurs cibles

### ☐ Documentation
- [ ] URL de l'application documentée
- [ ] Procédure de mise à jour documentée
- [ ] Contact de support identifié

---

**Guide de déploiement - ECHO v1.0.0**  
*Document technique pour équipes TI*
