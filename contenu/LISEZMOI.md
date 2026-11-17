# Les articles du blog

`articles.json` contient les articles du blog, avec pour chacun : `slug`,
`title`, `excerpt`, `category`, `date`, `readTime`, `author`, `coverImage`
(inutilisé) et `content` (corps en HTML). `isoDate` (AAAA-MM-JJ) est
facultatif : sans lui, la date est lue dans `date`.

Les six premiers sont ceux publiés sur l'ancien egicore.fr jusqu'au
9 novembre 2026, repris tels quels.

Après toute modification : `python3 outils/blog.py` (voir le README).
