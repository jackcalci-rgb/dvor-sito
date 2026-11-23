#!/usr/bin/env python3
"""Costruisce il blog: site/blog/index.html e un file per articolo in site/blog/.

Gli articoli stanno in tools/blog-src/<nome>.html: una prima riga JSON con i dati
(title, desc, date, cat, img, alt) e sotto il testo dell'articolo in HTML semplice.
Testata, menu, stile e piè di pagina vengono presi da site/privacy.html, così il blog
ha la stessa grafica del resto del sito anche quando questo cambia.

Uso:  python3 tools/blog.py
"""
import glob, html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
SRC = os.path.join(ROOT, 'tools', 'blog-src')
OUT = os.path.join(SITE, 'blog')
BASE = 'https://www.osteriadvor.com/'
MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto',
        'settembre', 'ottobre', 'novembre', 'dicembre']


def data_it(d):
    y, m, g = d.split('-')
    return f'{int(g)} {MESI[int(m) - 1]} {y}'


def pezzi():
    s = open(os.path.join(SITE, 'privacy.html'), encoding='utf-8').read()
    head = s[:s.find('</head>')]
    # solo i fogli di stile e i font: niente script di Next (ridisegnerebbero la pagina della privacy)
    css = ''.join(re.findall(r'<link rel="stylesheet"[^>]*/>', head))
    css += ''.join(re.findall(r'<link rel="(?:preconnect|icon|apple-touch-icon)"[^>]*/>', head))
    body = s[s.find('<body'):s.find('<main')]
    style = re.search(r'<style>.*?</style>', body, re.S).group(0)
    top = re.search(r'<header class="dv-top".*?</header>', body, re.S).group(0)
    top = top.replace('class="dv-top"', 'class="dv-top solid"', 1)
    # il menu finisce dove inizia il contenuto della pagina (div class="lg ...")
    nav = body[body.find('<div class="dv-navmenu"'):body.find('<div class="lg ')]
    nav = re.sub(r'<div class="dv-langs".*?</div>', '', nav, flags=re.S)
    nav = nav.replace('<a href="/galleria.html">Galleria</a>', '<a href="/galleria.html">Galleria</a><a href="/blog/">Blog</a>')
    tail = s[s.find('</main>'):]
    foot = re.search(r'<footer class="dv-foot">.*?</footer>', tail, re.S).group(0)
    return css, style, top, nav, foot


EXTRA_CSS = """<style>
.blog{padding:7rem 0 5rem}.blog .wrap{max-width:760px}
.blog .kick{color:var(--gold);margin:0 0 .8rem}
.blog h1{font-family:var(--serif);font-weight:400;font-size:clamp(2rem,5vw,3rem);line-height:1.15;margin:0 0 1rem}
.blog .meta{color:var(--muted);font-size:.9rem;margin:0 0 2rem}
.blog figure{margin:0 0 2.2rem}.blog figure img{width:100%;height:auto;display:block}
.blog figcaption{color:var(--muted);font-size:.85rem;margin-top:.5rem}
.blog h2{font-family:var(--serif);font-weight:400;font-size:1.7rem;margin:2.6rem 0 .8rem}
.blog h3{font-size:1.1rem;font-weight:500;margin:1.8rem 0 .5rem}
.blog p,.blog li{line-height:1.8}.blog ul,.blog ol{padding-left:1.2rem}
.blog .box{background:var(--alt);padding:1.4rem 1.6rem;margin:2rem 0}
.blog .box p:last-child{margin-bottom:0}
.blog .cta{border-top:1px solid var(--line);margin-top:3rem;padding-top:2rem}
.blog .btns{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.2rem}
.blog .btn{display:inline-block;border:1px solid var(--ink);padding:.9rem 1.5rem;text-decoration:none;font-size:.76rem;letter-spacing:.2em;text-transform:uppercase}
.blog .btn.fill,.blog .btn:hover{background:var(--ink);color:var(--bg)}
.blog .cards{display:grid;gap:2rem;margin-top:2rem}
.blog .card{display:grid;grid-template-columns:1fr;gap:1rem;text-decoration:none;border-top:1px solid var(--line);padding-top:1.6rem}
.blog .card img{width:100%;aspect-ratio:3/2;object-fit:cover}
.blog .card h2{margin:.3rem 0 .4rem;font-size:1.5rem}
.blog .card p{margin:0;color:var(--muted)}
@media (min-width:700px){.blog .card{grid-template-columns:260px 1fr}}
</style>"""

SCRIPT = """<script>(function(){var b=document.querySelectorAll('.dv-burger'),m=document.getElementById('navmenu');
function t(o){if(!m)return;if(o){m.hidden=false;requestAnimationFrame(function(){m.classList.add('open')})}else{m.classList.remove('open');setTimeout(function(){m.hidden=true},300)}
b[0]&&b[0].setAttribute('aria-expanded',o?'true':'false')}
b.forEach(function(x){x.addEventListener('click',function(){t(m.hidden)})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')t(false)})})();</script>
<script src="/analytics.js" defer></script>"""


def pagina(path, title, desc, img, ld, main, parts):
    css, style, top, nav, foot = parts
    url = BASE + path
    e = html.escape
    return ('<!DOCTYPE html><html lang="it" data-lang="it"><head><meta charSet="utf-8"/>'
            '<meta name="viewport" content="width=device-width, initial-scale=1"/>'
            f'<title>{e(title)}</title><meta name="description" content="{e(desc)}"/>'
            '<meta name="robots" content="index, follow, max-image-preview:large"/>'
            f'<link rel="canonical" href="{url}"/>'
            f'<meta property="og:title" content="{e(title)}"/><meta property="og:description" content="{e(desc)}"/>'
            '<meta property="og:site_name" content="Osteria Enoteca Dvor"/><meta property="og:locale" content="it"/>'
            f'<meta property="og:image" content="{BASE}images/{img}"/><meta property="og:type" content="article"/>'
            '<meta name="twitter:card" content="summary_large_image"/>'
            '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&amp;family=Jost:wght@300;400;500&amp;display=swap" rel="stylesheet"/>'
            f'{css}<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>'
            f'</head><body>{style}{EXTRA_CSS}{top}{nav}<main>{main}</main>{foot}{SCRIPT}</body></html>')


def main():
    parts = pezzi()
    os.makedirs(OUT, exist_ok=True)
    arts = []
    for f in sorted(glob.glob(os.path.join(SRC, '*.html'))):
        slug = os.path.splitext(os.path.basename(f))[0]
        raw = open(f, encoding='utf-8').read()
        first, body = raw.split('\n', 1)
        m = json.loads(first)
        m['slug'] = slug
        arts.append(m)
        path = f'blog/{slug}.html'
        ld = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": m['title'],
              "description": m['desc'], "datePublished": m['date'], "dateModified": m.get('updated', m['date']),
              "image": BASE + 'images/' + m['img'], "inLanguage": "it", "mainEntityOfPage": BASE + path,
              "author": {"@type": "Organization", "name": "Osteria Enoteca Dvor"},
              "publisher": {"@type": "Organization", "name": "Osteria Enoteca Dvor", "logo": BASE + "images/logo-dark.png"}}
        art = (f'<article class="blog"><div class="wrap"><p class="kick dv-k"><a href="/blog/">Blog</a> · {html.escape(m["cat"])}</p>'
               f'<h1>{html.escape(m["title"])}</h1><p class="meta">{data_it(m["date"])} · Osteria Enoteca Dvor, San Floriano del Collio</p>'
               f'<figure><img src="/images/{m["img"]}" alt="{html.escape(m["alt"])}"/></figure>'
               f'{body}</div></article>')
        open(os.path.join(SITE, path), 'w', encoding='utf-8').write(
            pagina(path, m['title'] + ' | Osteria Enoteca Dvor', m['desc'], m['img'], ld, art, parts))
    arts.sort(key=lambda a: a['date'], reverse=True)
    cards = ''.join(
        f'<a class="card" href="/blog/{a["slug"]}.html"><img src="/images/{a["img"]}" alt="{html.escape(a["alt"])}" loading="lazy"/>'
        f'<div><p class="kick dv-k">{html.escape(a["cat"])} · {data_it(a["date"])}</p><h2>{html.escape(a["title"])}</h2>'
        f'<p>{html.escape(a["desc"])}</p></div></a>' for a in arts)
    idx = ('<section class="blog"><div class="wrap"><p class="kick dv-k">Blog</p><h1>Dal Collio, a tavola</h1>'
           '<p class="meta">Il Collio, la cucina del confine, i vini e le occasioni per stare insieme, raccontati da chi lavora qui.</p>'
           f'<div class="cards">{cards}</div></div></section>')
    ld = {"@context": "https://schema.org", "@type": "Blog", "name": "Blog dell'Osteria Enoteca Dvor",
          "url": BASE + 'blog/', "inLanguage": "it"}
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(
        pagina('blog/', "Blog | Osteria Enoteca Dvor, San Floriano del Collio",
               "Il Collio, la cucina del confine, i vini e le occasioni per stare insieme, raccontati dall'Osteria Enoteca Dvor.",
               arts[0]['img'] if arts else 'hero-giardino.jpg', ld, idx, parts))
    # sitemap
    sm = os.path.join(SITE, 'sitemap.xml')
    if os.path.exists(sm):
        x = open(sm, encoding='utf-8').read()
        for loc in ['blog/'] + [f'blog/{a["slug"]}.html' for a in arts]:
            if BASE + loc not in x:
                x = x.replace('</urlset>', f'  <url><loc>{BASE}{loc}</loc></url>\n</urlset>')
        open(sm, 'w', encoding='utf-8').write(x)
    print('Blog:', len(arts), 'articoli in site/blog/')


if __name__ == '__main__':
    main()
