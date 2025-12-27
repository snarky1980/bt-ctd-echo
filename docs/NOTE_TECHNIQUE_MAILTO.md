# Note technique : Fonction « Ouvrir dans un courriel »

**Date** : 27 décembre 2025  
**Objet** : Analyse de sécurité de la fonction mailto dans ECHO  
**Destinataire** : Gestion

---

## Résumé exécutif

La fonction « Ouvrir dans un courriel » utilise le protocole standard `mailto:`, un mécanisme web existant depuis 1995. **Cette fonction ne présente aucun risque de sécurité** car elle ne peut ni envoyer de courriels automatiquement, ni être exploitée pour des attaques de masse.

---

## Fonctionnement technique

### Ce que fait la fonction

```text
Texte saisi par l'usager → URL mailto: encodée → Navigateur → Outlook ouvre un BROUILLON
```

1. L'application prend le texte **que l'usager a lui-même saisi**
2. Encode ce texte dans une URL `mailto:?subject=...&body=...`
3. Le navigateur demande à Windows d'ouvrir le client courriel par défaut
4. Outlook crée un **brouillon** (nouveau message non envoyé)
5. **L'usager doit manuellement cliquer sur « Envoyer »**

### Ce que la fonction NE PEUT PAS faire

| Action | Possible ? |
| ------ | ---------- |
| Envoyer un courriel automatiquement | ❌ Non |
| Accéder au carnet d'adresses | ❌ Non |
| Créer plusieurs courriels en boucle | ❌ Non |
| Contourner l'authentification Exchange | ❌ Non |
| Transmettre des données à un serveur externe | ❌ Non |

---

## Analyse du scénario de menace

### Crainte exprimée

> « Un hacker pourrait créer des courriels en masse pour flooder le système »

### Pourquoi ce scénario est techniquement impossible

1. **Aucun serveur d'envoi** : ECHO est une application 100% côté client. Il n'y a aucun serveur SMTP, aucune API d'envoi, aucun backend.

2. **Intervention humaine obligatoire** : Chaque courriel nécessite :
   - Un clic sur le bouton « Ouvrir dans un courriel »
   - Une session Outlook authentifiée
   - Un clic sur « Envoyer » dans Outlook

3. **Protection du navigateur** : Les navigateurs modernes bloquent les appels `mailto:` répétés automatiquement (anti-popup).

4. **Pour réellement flooder Exchange**, un attaquant aurait besoin de :
   - Accès direct au serveur SMTP, ou
   - Compromission d'un compte Outlook avec API, ou
   - Accès physique au poste de travail

   Dans tous ces cas, l'attaquant pourrait causer des dommages bien plus graves que d'utiliser ECHO.

---

## Comparaison avec d'autres sites

La fonction `mailto:` est utilisée par des millions de sites web, incluant :

- Sites gouvernementaux (canada.ca, gc.ca)
- Sites bancaires (liens « Contactez-nous »)
- Sites d'entreprises (formulaires de contact)

Aucune organisation ne considère les liens `mailto:` comme un vecteur d'attaque.

---

## Décision

Malgré l'absence de risque technique, la fonction a été **retirée** de l'application ECHO à la demande de la gestion, afin de répondre aux préoccupations exprimées.

Les usagers peuvent utiliser la fonction **« Copier Tout »** comme alternative, qui offre l'avantage supplémentaire de conserver le formatage riche (gras, couleurs, surlignage).

---

## Conclusion

| Question | Réponse |
| -------- | ------- |
| La fonction mailto représente-t-elle un risque ? | Non |
| Un attaquant peut-il l'exploiter pour du spam ? | Non |
| La retirer améliore-t-elle la sécurité ? | Non |
| La retirer nuit-elle aux usagers ? | Impact mineur (alternative disponible) |

---

**Préparé par** : Équipe de développement ECHO  
**Classification** : Non classifié
