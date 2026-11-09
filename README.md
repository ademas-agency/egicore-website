# Egicore — site vitrine

Le site public d'Egicore, servi sur **egicore.fr**. Déployé sur Vercel, séparé
de la plateforme.

## Ce que ce dépôt peut faire, et ce qu'il ne peut pas

Ce dépôt ne contient que le site vitrine. Vous pouvez tout y changer : pages,
styles, scripts, structure. Déployez aussi souvent que vous voulez.

Il n'a **aucun** accès à la plateforme : ni à l'API (`api.egicore.fr`), ni à
l'application (`app.egicore.fr`), ni à la base de données, ni aux serveurs.
Un déploiement d'ici ne peut rien casser d'autre que ce site.

## Structure

```
public/            le site : 102 pages HTML, aucune compilation
  assets/          les styles et scripts partagés entre pages
  obj/             images et vidéo
api/
  liste-attente.js la fonction qui envoie les inscriptions à Brevo
vercel.json        adresses sans extension (.html masqué)
```

## Modifier une page

Les pages sont autonomes : ouvrez le fichier, modifiez, déployez. Les styles
et scripts communs à plusieurs pages sont dans `public/assets/` — une seule
modification s'y applique partout :

| Fichier | Portée |
|---|---|
| `global.css`, `global-2.css`, `global-3.css` | toutes les pages, ou presque |
| `global.js` | menus, animations, formulaires (91 pages) |
| `parcours-vendeur.css` / `parcours-acheteur.css` | les deux parcours |
| `pages-metier*.css`, `pages-metier.js` | les 70 pages métier |
| `pages-editoriales.css`, `pages-contenu.css` | pages de contenu |
| `formulaire.js` | l'envoi des formulaires |

Le reste du CSS et du JS est propre à chaque page et reste dans la page.

## Les formulaires

Les quatre formulaires du site (liste d'attente, principal, partenaire,
newsletter) gardent chacun leur validation et appellent `egicoreEnvoyer()`,
qui poste sur `/api/liste-attente`. Cette fonction serveur est le seul endroit
qui connaît la clé Brevo.

**Variables d'environnement à définir sur Vercel :**

| Variable | |
|---|---|
| `BREVO_API_KEY` | obligatoire — clé d'API v3 (Brevo → SMTP & API) |
| `BREVO_LIST_ID` | facultatif — identifiant de la liste de destination |

Sans `BREVO_API_KEY`, la fonction répond 503 et le formulaire affiche une
erreur honnête plutôt que de laisser croire à un envoi.

## Développer en local

```bash
npx vercel dev      # http://localhost:3000 — adresses sans extension, fonction incluse
```

`npx serve public` suffit pour regarder les pages, mais les formulaires ne
partiront pas : la fonction serveur n'est pas servie.

## Adresses

`vercel.json` active `cleanUrls` : les pages sont servies sans `.html`
(`/tarifs`, pas `/tarifs.html`), et les liens internes sont déjà écrits sous
cette forme. Pour ajouter une page, créez `public/ma-page.html` et liez-la
avec `href="ma-page"`.

## Ce qui reste à faire

- **Pages légales** : le site n'a ni CGU, ni CGV, ni mentions légales, ni
  politique de confidentialité, et les pieds de page n'y renvoient pas.
- **Liens vers l'application** : aucun bouton « se connecter » ou « créer un
  compte » ; tous les appels à l'action mènent à la liste d'attente.
- **En-têtes et pieds de page** : ils sont recopiés dans chaque page. Les
  factoriser demande un générateur — à faire quand le contenu sera stabilisé.
