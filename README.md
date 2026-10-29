# Rose Planner 🌸

Application locale React + Vite, en français, sans compte ni serveur de données.

## Lancer sur ordinateur

Installez Node.js (version 22 LTS recommandée), puis dans ce dossier :

```sh
npm install
npm run dev
```

Ouvrez l’adresse affichée (habituellement http://localhost:5173).

```sh
npm test
npm run build
npm run preview
```

`dist/` contient la version de production et le service worker. Le mode développement ne fournit pas le fonctionnement hors ligne de production.

## Installation Android

Hébergez le contenu de `dist/` sur un hébergement statique HTTPS, à la racine du domaine (aucun serveur de données nécessaire). Ouvrez cette adresse dans Chrome Android puis menu ⋮ → **Installer l’application** ou **Ajouter à l’écran d’accueil**. Selon Chrome, le bouton Installer apparaît aussi dans la page Sauvegarde.

Une adresse HTTP sur le réseau local permet de consulter l’interface mais ne permet généralement pas l’installation PWA ni le service worker. Après une première ouverture de la version HTTPS avec réseau, l’application fonctionne hors ligne. Les polices en ligne sont facultatives et disposent de polices de remplacement.

## Données et calculs

Les événements et notes sont conservés dans `localStorage` sous `rose-planner-v1`, avec des identifiants uniques. Aucune donnée fictive n’est injectée au démarrage. Exportez régulièrement un JSON depuis **Sauvegarde**, notamment avant de changer d’appareil ou d’adresse web. Le stockage dépend de l’appareil, du navigateur et de l’origine du site ; l’import remplace les données après confirmation et validation. Une sauvegarde locale illisible n’est jamais écrasée automatiquement.

Les revenus sont calculés à partir des seules prestations **terminées**, pour le mois de leur date : total terminé, encaissé (payées) et restant à encaisser (non payées). Les annulations et les rendez-vous sont exclus. Aucun suivi de date d’encaissement distincte n’est effectué. Le PDF reprend toutes les prestations du mois avec leurs statuts, puis ces mêmes totaux.

Les rappels sont visibles dans l’application (aujourd’hui et les deux prochains jours). Le champ de rappel 1/2/3 jours est conservé pour une future version. **Aucune notification en arrière-plan n’est envoyée.**

## Redéployer la PWA sur Netlify

Les changements PWA concernent uniquement la configuration Vite, les en-têtes HTTP Netlify et les contrôles de production. Le stockage `rose-planner-v1`, les fonctionnalités et le design ne sont pas modifiés.

```sh
npm run build
npm run check:pwa
```

Le contrôle vérifie le manifeste généré, les chemins, la portée, l'enregistrement du service worker dans le JavaScript de production, les icônes PNG (signature, dimensions, CRC et décompression), le précache et la présence des en-têtes Netlify.

- **Déploiement manuel** : dans les déploiements du site Netlify existant, déposez le dossier `dist` fraîchement compilé. Ses fichiers `index.html`, `manifest.webmanifest`, `sw.js`, `workbox-*.js`, les deux icônes, `_headers` et `assets/` doivent être à la racine du déploiement. N'envoyez pas le dossier du projet à la place de `dist`.
- **Déploiement Git** : envoyez les changements au dépôt connecté. `netlify.toml` configure la commande `npm run build && npm run check:pwa` et le dossier publié `dist`.

Conservez **le même site et la même adresse HTTPS** pour retrouver les données locales de cette adresse. Ne supprimez pas les données de Chrome pour forcer une mise à jour. Par précaution, exportez votre sauvegarde JSON avant toute opération sur le stockage du navigateur.

Sur Android : ouvrez l'adresse HTTPS habituelle du site dans Chrome (hors navigation privée), rechargez avec le réseau actif, puis fermez et rouvrez l'onglet une fois pour charger la nouvelle version. Réessayez ensuite le menu ⋮ → Installer l'application.

Sur le site publié, `/manifest.webmanifest` doit renvoyer le JSON avec le type `application/manifest+json`, `/sw.js` du JavaScript, et `/icon-192.png` ainsi que `/icon-512.png` des images PNG accessibles publiquement, sans écran de connexion. Une compilation valide ne prouve pas à elle seule la réussite de l'installation Android : il faut aussi vérifier ces réponses sur le domaine de production et réessayer sur l'appareil.
