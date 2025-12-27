# Audit technique ECHO

**Date** : 27 décembre 2025

---

## Résumé

Audit de qualité du code ECHO avec focus sur :

- Élimination du code dupliqué
- Centralisation des utilitaires
- Optimisation du bundle

---

## Problèmes identifiés

### 1. Duplication de code sévère

Fonctions identiques présentes dans plusieurs fichiers :

- `escapeHtml` : App.jsx, SimplePillEditor.jsx, RichTextPillEditor.jsx
- `BLOCK_ELEMENTS` : App.jsx, SimplePillEditor.jsx
- `convertPlainTextToHtml` : App.jsx, SimplePillEditor.jsx
- `guessSampleValue` : App.jsx, VariablesPopout.jsx
- `resolveVariableInfo` : App.jsx, VariablesPopout.jsx

### 2. Impact

- ~500 lignes de code dupliqué
- Bundle gonflé inutilement
- Risque de divergence lors des modifications

---

## Actions correctives

### Nouveau module : src/utils/html.js

```javascript
// Utilitaires HTML centralisés
export function escapeHtml(text) { ... }
export const BLOCK_ELEMENTS = new Set([...])
export function convertPlainTextToHtml(text) { ... }
export function selectEntirePill(selection, pillNode) { ... }
```

### Fichiers modifiés

- **App.jsx** : -360 lignes, imports depuis utils/template.js
- **VariablesPopout.jsx** : -40 lignes, imports depuis utils/template.js
- **SimplePillEditor.jsx** : -47 lignes, imports depuis utils/html.js
- **RichTextPillEditor.jsx** : -18 lignes, imports depuis utils/html.js

---

## Résultats

| Métrique | Avant | Après | Gain |
| -------- | ----- | ----- | ---- |
| Bundle index.js | 319.60 KB | 312.03 KB | -7.57 KB |
| Lignes dupliquées | ~500 | 0 | -100% |

---

## Recommandations

1. **Continuer la centralisation** : Identifier d'autres utilitaires répétés
2. **Tests unitaires** : Ajouter des tests pour utils/html.js et utils/template.js
3. **Documentation inline** : JSDoc pour les fonctions exportées

---

**Statut** : ✅ Complété
