#!/usr/bin/env python3
"""Génère le répertoire du blog à partir de contenu/articles.json.

  python3 outils/blog.py

- public/blog.html : la liste des articles (entre <!--blog-liste--> et
  <!--/blog-liste-->), le reste de la page n'est pas touché ;
- public/blog/<slug>.html : une page par article, servie sur /blog/<slug>.

Pour publier un article : ajoutez une entrée dans contenu/articles.json
(slug, title, excerpt, category, date, isoDate, readTime, author, content en
HTML), relancez le script, déployez.
"""
import html, json, pathlib, re

RACINE = pathlib.Path(__file__).resolve().parent.parent
PUB = RACINE / "public"
ARTICLES = json.loads((RACINE / "contenu/articles.json").read_text(encoding="utf-8"))

# Un objet du site par catégorie, pour les cartes.
OBJETS = {"Guide": "bouclier", "Produit": "coffre", "Actualité": "tampon",
          "Technique": "engrenages", "Juridique": "balance"}
MOIS = {"janvier": 1, "février": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6, "juillet": 7,
        "août": 8, "septembre": 9, "octobre": 10, "novembre": 11, "décembre": 12}

def iso(a):
    if a.get("isoDate"):
        return a["isoDate"]
    j, m, y = a["date"].replace("1er", "1").split()
    return f"{y}-{MOIS[m]:02d}-{int(j):02d}"

ARTICLES.sort(key=iso, reverse=True)
e = lambda t: html.escape(t, quote=True)

CSS = """<!--blog--><style>
.bgsec{padding-block:clamp(40px,6vw,88px)}
.bgsec .h2{margin-bottom:22px}
.bgfil{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 28px}
.bgfil button{font:inherit;font-size:14px;font-weight:700;padding:9px 16px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink-3);cursor:pointer}
.bgfil button[aria-pressed="true"]{background:#0b0c0e;border-color:#0b0c0e;color:#f3f3ef}
.bggrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.bgc{position:relative;display:flex;flex-direction:column;gap:12px;min-height:300px;padding:26px;border-radius:24px;background:#f4f5f3;border:1px solid #e2e3de;color:#0d0e10;text-decoration:none;overflow:hidden;transition:transform .2s cubic-bezier(.2,.7,.3,1),border-color .2s}
.bgc:hover{transform:translateY(-3px);border-color:#0b0c0e}
.bgc img{position:absolute;right:20px;top:20px;width:84px;height:auto;opacity:.95;pointer-events:none}
.bgcat{align-self:flex-start;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:5px 11px;border-radius:999px;background:#aaff00;color:#0b0c0e}
.bgc h3{font-size:21px;line-height:1.2;letter-spacing:-.02em;margin:24px 0 0;max-width:22ch}
.bgc p{margin:0;color:#3a3b40;font-size:15px;line-height:1.55}
.bgmeta{margin-top:auto;font-size:13px;color:#7c7d82}
.bgc.bgun{grid-column:span 2;background:#0b0c0e;border-color:#0b0c0e;color:#f3f3ef}
.bgc.bgun p{color:#cbccc6}.bgc.bgun .bgmeta{color:#8c8e84}.bgc.bgun h3{font-size:clamp(24px,2.6vw,34px)}
.bgc.bgun img{width:150px;right:32px;top:28px}
.bgc.bgun h3,.bgc.bgun p{max-width:min(60ch,calc(100% - 170px))}
.bgc[hidden]{display:none}
@media (max-width:980px){.bggrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.bggrid{grid-template-columns:1fr}.bgc.bgun{grid-column:auto}.bgc.bgun img{width:84px;right:20px;top:20px}.bgc.bgun h3,.bgc.bgun p{max-width:none}}
.arsec{padding-block:clamp(40px,6vw,88px)}
.arin{max-width:760px;margin-inline:auto}
.arbody{color:var(--ink-2);font-size:17px;line-height:1.75}
.arbody h2{color:var(--ink);font-size:clamp(22px,2.2vw,28px);line-height:1.2;letter-spacing:-.02em;margin:2em 0 .6em}
.arbody p{margin:0 0 1.1em}
.arbody strong{color:var(--ink)}
.arbody code{font-family:"JetBrains Mono",monospace;font-size:.88em;background:rgba(128,128,128,.12);padding:.1em .35em;border-radius:6px}
.arhd .bgcat{margin-bottom:18px}
.armeta{color:#a9aaa1;font-size:15px;margin-top:14px}
.arback{display:inline-flex;gap:8px;align-items:center;font-weight:700;font-size:14px;color:inherit;text-decoration:none;margin-bottom:22px;opacity:.8}
.arback:hover{opacity:1}
.arplus{margin-top:clamp(48px,6vw,80px);padding-top:32px;border-top:1px solid var(--line)}
.arplus h2{font-size:22px;letter-spacing:-.02em;margin:0 0 20px;color:var(--ink)}
</style><!--/blog-->"""

def carte(a, une=False):
    return (f'<a class="bgc{" bgun" if une else ""}" href="blog/{e(a["slug"])}" data-cat="{e(a["category"])}">'
            f'<img src="obj/{OBJETS.get(a["category"], "contrat")}.webp" alt="" loading="lazy">'
            f'<span class="bgcat">{e(a["category"])}</span><h3>{e(a["title"])}</h3><p>{e(a["excerpt"])}</p>'
            f'<span class="bgmeta">{e(a["date"])} · {a["readTime"]} min de lecture</span></a>')

# ---------- répertoire dans blog.html ----------
blog = (PUB / "blog.html").read_text(encoding="utf-8")
cats = []
for a in ARTICLES:
    if a["category"] not in cats:
        cats.append(a["category"])
filtres = ('<div class="bgfil" role="group" aria-label="Filtrer par catégorie"><button type="button" aria-pressed="true" data-cat="">Tous</button>'
           + "".join(f'<button type="button" aria-pressed="false" data-cat="{e(c)}">{e(c)}</button>' for c in cats) + "</div>")
liste = f'''<!--blog-liste-->
<section class="sec lite bgsec" id="articles">
  <div class="wrap">
    <h2 class="h2 rv">Les articles <span class="dim">({len(ARTICLES)}).</span></h2>
    {filtres}
    <div class="bggrid">{"".join(carte(a, i == 0) for i, a in enumerate(ARTICLES))}</div>
  </div>
  <script>(function(){{var b=[].slice.call(document.querySelectorAll('.bgfil button')),c=[].slice.call(document.querySelectorAll('.bggrid .bgc'));b.forEach(function(x){{x.addEventListener('click',function(){{var k=x.getAttribute('data-cat');b.forEach(function(y){{y.setAttribute('aria-pressed',y===x?'true':'false')}});c.forEach(function(a,i){{a.hidden=!!k&&a.getAttribute('data-cat')!==k;a.classList.toggle('bgun',!k&&i===0)}})}})}})}})();</script>
</section>
<!--/blog-liste-->'''
if "<!--blog-liste-->" in blog:
    blog = re.sub(r"<!--blog-liste-->.*?<!--/blog-liste-->", lambda m: liste, blog, flags=re.S)
else:
    i = blog.index("</section>", blog.index('<section class="phead">')) + len("</section>")
    blog = blog[:i] + "\n\n" + liste + blog[i:]
    blog = blog.replace('<a class="btn btn-p" href="#newsletter">S\'abonner à la newsletter</a><a class="btn btn-s" href="#solvabilite">Voir le détail</a>',
                        '<a class="btn btn-p" href="#articles">Lire les articles</a><a class="btn btn-s" href="#newsletter">S\'abonner à la newsletter</a>')
    blog = re.sub(r'\s*<p class="lead rv" style="font-size:15px;margin-top:24px">Les articles datés et les actualités[^<]*</p>', "", blog)
if "<!--blog--><style>" not in blog:
    blog = blog.replace("</head>", CSS + "</head>", 1)
else:
    blog = re.sub(r"<!--blog--><style>.*?</style><!--/blog-->", lambda m: CSS, blog, count=1, flags=re.S)
(PUB / "blog.html").write_text(blog, encoding="utf-8")

# ---------- une page par article ----------
tete, reste = blog.split('<main id="contenu">', 1)
pied = reste.split("</main>", 1)[1]
fin = re.search(r'<section class="sec dark fin" id="liste">.*?</section>', reste, re.S).group(0)
tete = tete.replace(' class="cur" aria-current="page"', "").replace(' aria-current="page"', "")
pied = pied.replace(' aria-current="page"', "")
(PUB / "blog").mkdir(exist_ok=True)
for a in ARTICLES:
    url = f"blog/{a['slug']}"
    titre = f"{a['title']} | Egicore"
    t = tete.replace("<head>", '<head>\n<base href="/">', 1)
    t = re.sub(r"<title>[^<]*</title>", lambda m: f"<title>{e(titre)}</title>", t, count=1)
    for prop in ('name="description"', 'property="og:description"'):
        t = re.sub(rf'<meta {prop} content="[^"]*">', lambda m: f'<meta {prop} content="{e(a["excerpt"])}">', t)
    t = re.sub(r'<meta property="og:title" content="[^"]*">', lambda m: f'<meta property="og:title" content="{e(titre)}">', t)
    t = re.sub(r'<meta property="og:type" content="[^"]*">', '<meta property="og:type" content="article">', t)
    ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": a["title"], "description": a["excerpt"],
          "datePublished": iso(a), "author": {"@type": "Organization", "name": "Egicore"},
          "publisher": {"@type": "Organization", "name": "Egicore"}, "articleSection": a["category"],
          "mainEntityOfPage": f"https://egicore.fr/{url}"}
    t = t.replace("</head>", '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script></head>", 1)
    t = t.replace('href="#contenu"', f'href="{url}#contenu"')
    autres = [x for x in ARTICLES if x["slug"] != a["slug"]][:3]
    main = f'''<main id="contenu">

<section class="phead arhd">
  <div class="wrap pheadin">
    <div>
      <a class="arback" href="blog#articles">← Tous les articles</a><br>
      <span class="bgcat">{e(a["category"])}</span>
      <h1 class="rv" style="max-width:22ch">{e(a["title"])}</h1>
      <p class="armeta">{e(a["date"])} · {a["readTime"]} min de lecture · {e(a["author"])}</p>
    </div>
  </div>
</section>

<section class="sec lite arsec">
  <div class="wrap">
    <article class="arin arbody">{a["content"]}</article>
    <div class="arplus">
      <h2>À lire aussi</h2>
      <div class="bggrid">{"".join(carte(x) for x in autres)}</div>
    </div>
  </div>
</section>

{fin}

</main>'''
    (PUB / f"{url}.html").write_text(t + main + pied, encoding="utf-8")
print(f"{len(ARTICLES)} articles : public/blog.html + public/blog/*.html")
