# -*- coding: utf-8 -*-
"""Rigenera sezioni evidenza + carta di vini.html dal file Prodotti_sito_disponibili (/tmp/wines_it.json)."""
import re, sys, json, html as H
sys.path.insert(0, '/home/claude/build')
import vini_data as VD
import vini_tr1, vini_tr2, vini_tr3
LG = ['it', 'en', 'de', 'sl', 'nl']
LAST = None
W = json.load(open('/tmp/wines_it.json'))
DESC = {**vini_tr2.D, **vini_tr3.D}
import vini_add
N0 = len(W)  # 87 vini originali
for k, e in enumerate(vini_add.EXTRA):
    W.append(dict(i=N0 + k, id=0, ref='', name=e['name'], cat='', price=e['price'], qty=1, desc=e['d'][0], pair=e['p']))
    DESC[N0 + k] = tuple(e['d'][1:])
HIDE = {5, 22, 45, 94, 95}  # Casada, Valleris PG da 42 € (doppione), Gradis'ciutta Merlot 2020, sezione vini dolci (Ramandolo e Apicio) tolta su richiesta
ALL = [i for i in range(len(W)) if i not in HIDE]
def S(t): return ''.join(f'<span class="{l}" lang="{l}">{H.escape(x, quote=False)}</span>' for l, x in zip(LG, t))
def fmt(p):
    p = float(p)
    return ('%g' % p) if p == int(p) else ('%.2f' % p).replace('.', ',')

# ---- gruppi aggiuntivi
VD.G['rs'] = dict(cat='bia',
    title=('Rosati', 'Rosé', 'Roséweine', 'Rosé vina', 'Rosé'),
    info=('Freschi e fruttati, con note di piccoli frutti rossi.', 'Fresh and fruity, with notes of small red fruits.',
          'Frisch und fruchtig, mit Noten von roten Beeren.', 'Sveža in sadna, z notami drobnega rdečega sadja.',
          'Fris en fruitig, met tonen van rood klein fruit.'), pair=('', '', '', '', ''))

VD.G['ds'] = dict(cat='bia',
    title=('Vini dolci e passiti', 'Sweet and passito wines', 'Süß- und Passito-Weine', 'Sladka vina in passito', 'Zoete wijnen en passito'),
    info=('Da fine pasto o da meditazione: dolci, avvolgenti, con note di miele e frutta matura.', 'For the end of a meal or for sipping: sweet and enveloping, with notes of honey and ripe fruit.',
          'Zum Abschluss des Essens oder zum Genießen: süß und umhüllend, mit Noten von Honig und reifen Früchten.', 'Za konec obroka ali za sproščeno srkanje: sladka in obsevajoča, z notami medu in zrelega sadja.',
          'Voor na de maaltijd of om van te genieten: zoet en omhullend, met tonen van honing en rijp fruit.'), pair=('', '', '', '', ''))

# ---- metadati: indice -> (gruppo, cantina, vino)
M = {
0:('fr','Primosic','Friulano Collio DOC'),1:('ml','Primosic','Malvasia Collio DOC'),2:('bl','Primosic','Klin · Collio Bianco DOC'),
3:('pg','Primosic','Pinot Grigio Collio DOC'),4:('gw','Abbazia di Muri-Gries','Gewürztraminer Alto Adige DOC'),
5:('sp','Casada','Gran Cuvée Blanc de Blancs Extra Dry'),6:('ml','Urizio','Vigna Sul Mar · Malvasia Carso'),
7:('sv','Skok','Sauvignon Collio'),8:('rb','Gradis’ciutta','Ribolla Gialla Collio DOC 2024 · Magnum · Bio'),
9:('fr','Humar','Friulano Collio'),10:('fr','Humar','Friulano Collio DOC'),11:('pg','Humar','Pinot Grigio Collio'),
12:('rb','Humar','Ribolla Gialla Collio'),13:('rb','Humar','Ribolla Gialla Collio DOC'),14:('fr','Monviert','Friulano Riserva'),
15:('mc2','Il Carpino','Sauvignon Collio · macerato 2018'),16:('mc2','Il Carpino','Ribolla Gialla Collio · macerata 2018'),
17:('rb','Gradis’ciutta','Rebula Sveti Nikolaj 2022'),18:('ml','Gradis’ciutta','Malvasia Collio DOC 2024 · Bio'),
19:('mc2','Primosic','Bianco Skin 70 2022'),20:('rb','Primosic','Ribolla Gialla “Think Yellow” IGT'),
21:('sv','Primosic','Sauvignon Collio DOC'),22:('mc2','Valleris','Pinot Grigio 2023 · macerato'),
23:('mc2','Valleris','Sauvignon 2023 · macerato'),24:('rs','Lisjak','Rosé · Vipavska Dolina'),
25:('mc2','Primosic','Riserva Pinot Grigio 2020'),26:('pg','Primosic','Riserva Chardonnay 2022'),
27:('mc2','Primosic','Riserva Ribolla Gialla 2019'),28:('bl','Fiegl','Cuvée Blanc Leopold 2023 · Collio DOC'),
29:('pg','Fiegl','Pinot Bianco Collio DOC 2025'),30:('sv','Blazevi','Sauvignon · Goriška Brda'),
31:('bl','Osvaldo','Blanc dal Gigi'),32:('bl','Osvaldo','Bianco 2023'),33:('rb','Primosic','Ribolla Gialla Collio “Low Nat”'),
34:('mc2','Valleris','Pinot Grigio 2023 · macerato'),35:('ml','Blazevi','Malvazija · Goriška Brda'),
36:('ml','Lupinc','Malvasia IGT Venezia Giulia'),37:('bl','Edi Keber','Collio Bianco DOC 2021'),
38:('bl','Lis Neris','Fiore di Campo 2023 IGT'),
39:('rr','Primosic','Metamorfosis · Collio Rosso DOC'),40:('rf','Primosic','Refosco IGT'),
41:('me','Urizio','Vigna Sul Mar · Merlot Carso'),42:('cb','Humar','Cabernet Franc Collio DOC'),
43:('me','Blazevi','Merlot 1 l · Goriška Brda'),44:('cb','Gradis’ciutta','Cabernet Franc Collio DOC 2022 · Bio'),
45:('me','Gradis’ciutta','Merlot Collio DOC 2020 · Bio'),46:('me','Primosic','Merlot Collio DOC'),
47:('rr','Blazevi','Princic 105 2020 · Goriška Brda'),48:('me','Blazevi','Merlot Reserve'),
49:('cb','Blazevi','Cabernet Franc'),50:('cb','Blazevi','Cabernet Sauvignon'),
51:('rr','Fiegl','Cuvée Rouge Leopold 2019 · Collio DOC'),52:('me','Fiegl','Merlot Collio DOC 2025'),
53:('cb','Fiegl','Cabernet Sauvignon Collio DOC 2025'),54:('rf','Blazevi','Refošk 1 l · Goriška Brda'),
55:('rr','Osvaldo','Rosso D’O'),56:('rr','Primosic','Metamorfosis · Collio Rosso DOC · Magnum'),
57:('rf','Lupinc','Terrano IGT Venezia Giulia'),58:('pn','Abbazia di Muri-Gries','Pinot Nero Alto Adige DOC'),
59:('sp','Sinefinis','Rosé Vino Spumante'),60:('sp','Humar','Brut Spumante'),
61:('pr','Rebuli','Valdobbiadene Prosecco Superiore DOCG · Zerogrammi Brut'),
62:('ch','A. Bergère','Terres Blanches · Blanc de Blancs Brut Nature'),63:('ch','A. Bergère','Origine Brut'),
64:('ch','Dom Pérignon','Vintage 2015'),65:('ch','Veuve Clicquot','Brut Yellow Label'),
66:('tr','Ferrari','Perlé Millesimato · Trento DOC'),67:('mc','Piedimont','Blanc de Blancs Pas Dosé Millesimato · 42 mesi'),
68:('mc','Piedimont','Cuvée Piè di Mont Millesimato · 33 mesi'),69:('mc','Piedimont','Cuvée Piè di Mont Millesimato · 33 mesi · Magnum'),
70:('mc','Piedimont','Ribolla Gialla · 12 mesi'),71:('mc','Piedimont','Sfacciato · 48 mesi'),
72:('ch','Sophie Baron','Grande Réserve Brut'),73:('sp','Blazevi','Rosé Charmat · Goriška Brda'),
74:('sp','Primosic','RiBolla Noir'),75:('sp','Sinefinis','Rebolium'),76:('sp','Fiegl','Malvasia Frizzante IGT'),
77:('sp','Blazevi','Rebula Penina Charmat'),78:('sp','Valleris','Perla Nera · Rosé Charmat'),
79:('ch','Ruinart','Blanc de Blancs'),80:('ch','Bollinger','Special Cuvée Brut'),
81:('sp','Serena Soe','Spumante Brut · Ribolla Gialla e Chardonnay'),82:('sp','Collavini','Ribolla Gialla Brut Spumante'),
83:('mc','Pittaro','Rosé Metodo Classico'),84:('mc','Pittaro','Oro Pas Dosé 2018 · Metodo Classico'),
85:('mc','Pittaro','Oro 2020 · Metodo Classico'),86:('mc','Pittaro','Argento Metodo Classico'),
}
for k, e in enumerate(vini_add.EXTRA): M[N0 + k] = (e['g'], e['c'], e['n'])
assert len(M) == len(W) == 87 + len(vini_add.EXTRA)

PAIR = ("Abbinamenti", "Pairings", "Passende Speisen", "Primerne jedi", "Past bij")
AND = ('e', 'and', 'und', 'in', 'en')
LASTLBL = ("Ultime bottiglie", "Last bottles", "Letzte Flaschen", "Zadnje steklenice", "Laatste flessen")

def pair_langs(it):
    t = it.strip().rstrip('.')
    if t.lower().startswith('cucina speziata e orientale'): atoms = ['cucina speziata e orientale']
    else:
        parts = re.split(r', ', t)
        last = parts.pop()
        m = re.split(r' e (?=[a-zà-ù])', last, maxsplit=1)
        # "formaggi stagionati come il Montasio" non contiene " e "
        atoms = parts + m
    out = []
    for li in range(5):
        xs = []
        for a in atoms:
            k = a.strip().lower()
            if k == 'cucina speziata e orientale' and li == 0: xs.append(a.strip()); continue
            if li == 0: xs.append(a.strip()); continue
            if k.startswith('prosciutto di san daniele'): k = 'prosciutto di san daniele'
            xs.append(vini_tr1.A[k][li - 1])
        if len(xs) > 1: s = ', '.join(xs[:-1]) + ' ' + AND[li] + ' ' + xs[-1]
        else: s = xs[0]
        out.append(s[0].upper() + s[1:] + '.')
    return out

def desc_langs(i):
    return [W[i]['desc']] + list(DESC[i])

TOK=[('mesi',('months','Monate','mesecev','maanden')),('macerata',('macerated','maischevergoren','maceririna','gemacereerd')),
     ('macerato',('macerated','maischevergoren','maceriran','gemacereerd')),(' e Chardonnay',(' and Chardonnay',' und Chardonnay',' in Chardonnay',' en Chardonnay')),
     ('Vino Spumante',('Sparkling wine','Schaumwein','Peneče vino','Mousserende wijn')),('Spumante',('Sparkling','Schaumwein','Peneče','Mousserend'))]
def name_html(i):
    n=M[i][2]
    if not any(t in n for t,_ in TOK): return H.escape(n,quote=False)
    outs=[]
    for li in range(5):
        x=n
        for t,tr in TOK:
            if li: x=x.replace(t,tr[li-1])
        outs.append(x)
    return S(outs)
WIMG={0: 'primosic-friulano', 2: 'primosic-klin', 5: 'h-5fad4382', 6: 'h-e05b0c6e', 7: 'h-63cb8203', 9: 'h-7a391327', 10: 'h-7a391327', 11: 'h-bf4d278a', 12: 'h-0363d63c', 13: 'h-0363d63c', 14: 'h-ca4c3329', 17: 'h-096d961b', 18: 'h-343ee3ba', 19: 'primosic-skin70', 20: 'primosic-think-yellow', 24: 'h-cd72e8cf', 25: 'primosic-pinot-grigio', 28: 'h-0fe752fa', 31: 'h-d6a42800', 32: 'h-6a2b18af', 36: 'h-da779be5', 37: 'h-a136b773', 38: 'h-477b912c', 39: 'primosic-metamorfosis', 41: 'h-e76c93bc', 42: 'h-48002bfd', 46: 'primosic-merlot', 55: 'h-296c6b42', 56: 'primosic-metamorfosis', 57: 'h-60fd4958', 58: 'h-2d86fafb', 59: 'h-8ea3743e', 60: 'h-66b829f7', 61: 'h-48e0fd26', 62: 'h-a76ce886', 63: 'h-cd7a38ec', 64: 'h-4e6f5aae', 65: 'h-67dff97b', 66: 'h-6c83a05f', 68: 'h-459fe5b4', 69: 'h-459fe5b4', 70: 'h-0b9d4dc6', 71: 'h-ba634176', 72: 'h-6f24c04c', 73: 'h-38e444b3', 74: 'primosic-ribolla-noir', 75: 'h-1344ad7d', 76: 'h-8dd3485a', 77: 'h-eff9fc0d', 79: 'h-dc606388', 80: 'h-167bc4b9', 81: 'h-0e213b7e', 82: 'h-251bbb5a', 83: 'h-19f4a14f', 86: 'h-d3f0aa7c'}
WIMG.update(vini_add.IMG)
def li_wine(i):
    w = W[i]; g, cant, name = M[i]
    d = desc_langs(i); p = pair_langs(w['pair'])
    badge = f'<span class="wlast">{S(LASTLBL)}</span>' if (LAST is not None and w['qty'] <= LAST) else ''
    im=WIMG.get(i)
    pre=f'<img class="wph" src="images/vino-{im}.png" alt="{H.escape(M[i][1]+" "+M[i][2],quote=True)}" loading="lazy">' if im else ''
    return (f'<li class="wine{" wam" if im else ""}" data-w="{i}" data-o="{OR.get(i,"")}" data-t="{VD.G[g]["cat"]}" data-c="{H.escape(cant, quote=True)}">{pre}<div class="wamb"><div class="wrow"><span class="wn"><b>{H.escape(cant, quote=False)}</b> {name_html(i)}{badge}</span>'
            f'<span class="wf" aria-hidden="true"></span><span class="wp">€&nbsp;{fmt(w["price"])}</span></div>'
            f'<p class="wdesc">{S(d)}</p><p class="wpair"><b>{S(PAIR)}</b> {S(p)}</p></div></li>')

def courses():
    out = ''
    for cat in ['bol', 'bia', 'mac', 'ros']:
        gs = [k for k, v in VD.G.items() if v['cat'] == cat]
        blocks = ''
        for k in gs:
            items = [i for i in ALL if M[i][0] == k]
            if not items: continue
            items.sort(key=lambda i: (float(W[i]['price']), M[i][1], M[i][2]))
            v = VD.G[k]
            blocks += (f'<div class="wg"><h3>{S(v["title"])}</h3><p class="winfo">{S(v["info"])}</p>'
                       f'<ul class="wlist">{"".join(li_wine(i) for i in items)}</ul></div>')
        out += f'<section class="course" id="{cat}"><h2>{S(VD.CATS[cat])}</h2><div class="wgroups">{blocks}</div></section>\n'
    return out

# ---- in evidenza: solo Collio italiano e sloveno
T = lambda *a: list(a)
IT_ = T('Collio italiano', 'Italian Collio', 'Collio (Italien)', 'Italijanski Collio', 'Italiaanse Collio')
SI_ = T('Collio sloveno', 'Slovenian Collio', 'Slowenisches Collio', 'Goriška Brda', 'Sloveense Collio')
LBL = T('In tavola', 'At the table', 'Am Tisch', 'Za mizo', 'Aan tafel')
H2 = T('Bottiglie in evidenza', 'Featured bottles', 'Besondere Flaschen', 'Izpostavljene steklenice', 'Uitgelichte flessen')
SUB = T('Otto etichette del Collio italiano e sloveno, con i piatti del nostro menù che le accompagnano meglio.',
        'Eight labels from the Italian and Slovenian Collio, with the dishes on our menu that go with them best.',
        'Acht Etiketten aus dem italienischen und slowenischen Collio – mit den Gerichten unserer Speisekarte, die am besten dazu passen.',
        'Osem etiket iz italijanskega in slovenskega Colia, z jedmi z našega jedilnika, ki jim najbolj pristajajo.',
        'Acht etiketten uit de Italiaanse en Sloveense Collio, met de gerechten van onze kaart die er het best bij passen.')
NOTE = T('I piatti sono quelli del menù attuale e possono variare con la stagione. Annate e disponibilità su richiesta.',
         'The dishes are from the current menu and may change with the season. Vintages and availability on request.',
         'Die Gerichte stammen von der aktuellen Speisekarte und können saisonal wechseln. Jahrgänge und Verfügbarkeit auf Anfrage.',
         'Jedi so z trenutnega jedilnika in se lahko spreminjajo glede na sezono. Letniki in razpoložljivost na zahtevo.',
         'De gerechten komen van de huidige kaart en kunnen per seizoen wisselen. Jaargangen en beschikbaarheid op aanvraag.')
MENU = T('Vedi il menù', 'See the menu', 'Zur Speisekarte', 'Poglej jedilnik', 'Bekijk de kaart')
FEAT = [  # (indice, origine, piatti)
 (56, IT_, ['Filetto di fassona', 'Cervo ai frutti rossi', 'Tagliata di manzo']),
 (47, SI_, ['Cervo ai frutti rossi', 'Pappardelle con cervo', 'Filetto di fassona']),
 (2,  IT_, ['Trittico di mantecati', 'Canederli']),
 (16, IT_, ['Toc in braide', 'Canederli']),
 (37, IT_, ['Toc in braide', 'Trittico di mantecati']),
 (17, SI_, ['Trittico di mantecati', 'Tagliere di salumi']),
 (23, IT_, ['Toc in braide', 'Tagliere di salumi']),
 (51, IT_, ['Cervo ai frutti rossi', 'Filetto di fassona']),
]
def card(i, org, dishes):
    w = W[i]; g, cant, name = M[i]
    lis = ''.join('<li>%s</li>' % H.escape(x) for x in dishes)
    return ('<article class="wx" data-w="%d"><div class="wx-top"><span class="wx-type">%s</span><span class="wx-price">€&nbsp;%s</span></div>'
            '<h3 class="wx-name"><b>%s</b><span>%s</span></h3><p class="wx-desc">%s</p>'
            '<div class="wx-pair"><span class="wx-lbl">%s</span><ul>%s</ul></div></article>') % (
            i, S(org), fmt(w['price']), H.escape(cant, quote=False), name_html(i), S(desc_langs(i)), S(LBL), lis)
def featured():
    return ('<section class="featured" id="evidenza"><div class="wrap"><h2>%s</h2><p class="fsub">%s</p><div class="fgrid wxg">%s</div>'
            '<p class="wx-note">%s <a href="menu.html">%s →</a></p></div></section>\n') % (
            S(H2), S(SUB), ''.join(card(*f) for f in FEAT), S(NOTE), S(MENU))

CSS = ('<style id="vini2">.wine{display:block!important;padding:.95rem 0!important}'
 '.wrow{display:flex;align-items:baseline;gap:.8rem}'
 '.wdesc{margin:.35rem 0 0;color:var(--muted);font-size:.93rem;line-height:1.6;max-width:70ch}'
 '.wine .wpair{margin:.3rem 0 0;font-size:.88rem}'
 '.wlast{display:inline-block;margin-left:.6rem;padding:.05rem .55rem;border:1px solid var(--gold);color:var(--gold);'
 'font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;vertical-align:.15em;white-space:nowrap}</style>')


# ---- dash: provenienza
ORIGS=[('ci',('Collio italiano','Italian Collio','Italienisches Collio','Italijanski Collio','Italiaanse Collio')),
 ('cs',('Collio sloveno (Brda)','Slovenian Collio (Brda)','Slowenisches Collio (Brda)','Slovenska Brda','Sloveense Collio (Brda)')),
 ('ca',('Carso','Karst','Karst','Kras','Karst')),
 ('fr',('Friuli, altre zone','Friuli, other areas','Friaul, andere Gebiete','Furlanija, druga območja','Friuli, andere gebieden')),
 ('aa',('Alto Adige','South Tyrol','Südtirol','Južna Tirolska','Zuid-Tirol')),
 ('tv',('Trentino e Veneto','Trentino and Veneto','Trentino und Venetien','Trentinska in Veneto','Trentino en Veneto')),
 ('fc',('Francia · Champagne','France · Champagne','Frankreich · Champagne','Francija · Šampanja','Frankrijk · Champagne')),
 ('al',('Altre zone','Other areas','Andere Gebiete','Druga območja','Andere gebieden'))]
OR={}
for i in (0,1,2,3,46,19,20,21,25,26,27,33,39,40,56,74,9,10,11,12,13,42,60,8,18,44,45,15,16,22,23,34,78,28,29,51,52,53,76,37,7,59,75): OR[i]='ci'
for i in (17,30,35,43,47,48,49,50,54,73,77): OR[i]='cs'
for i in (6,41,36,57): OR[i]='ca'
for i in (14,31,32,55,38,82,83,84,85,86,67,68,69,70,71): OR[i]='fr'
for i in (4,58): OR[i]='aa'
for i in (61,66): OR[i]='tv'
for i in (62,63,64,65,72,79,80): OR[i]='fc'
for i in (5,24,81): OR[i]='al'
for k, e in enumerate(vini_add.EXTRA): OR[N0 + k] = e['o']
assert set(OR)==set(range(len(W))),set(range(len(W)))-set(OR)
TYPES=[('bol',VD.CATS['bol']),('bia',VD.CATS['bia']),('mac',VD.CATS['mac']),('ros',VD.CATS['ros'])]
DT=('La nostra cantina in numeri','Our cellar in numbers','Unser Keller in Zahlen','Naša klet v številkah','Onze kelder in cijfers')
DL=('etichette in carta','labels on the list','Etiketten auf der Karte','etiket na karti','etiketten op de kaart')
DP=('Per provenienza','By origin','Nach Herkunft','Po poreklu','Naar herkomst')
DY=('Per tipologia','By type','Nach Art','Po vrsti','Naar soort')
def dash():
    from collections import Counter
    co=Counter(OR[i] for i in ALL); ct=Counter(VD.G[M[i][0]]['cat'] for i in ALL)
    mx=max(co.values())
    rows=''.join(f'<li data-o="{k}"><span class="dn">{S(n)}</span><span class="db"><i style="width:{co[k]/mx*100:.1f}%"></i></span><b>{co[k]}</b></li>' for k,n in ORIGS if co[k])
    cats=''.join(f'<li data-t="{k}"><b>{ct[k]}</b><span>{S(n)}</span></li>' for k,n in TYPES)
    cant=len({M[i][1] for i in ALL})
    CL=('cantine','wineries','Weingüter','kleti','wijnhuizen')
    return (f'<section class="dash" id="numeri"><div class="wrap"><h2>{S(DT)}</h2>'
      f'<div class="dgrid"><div class="dtot"><b data-n="wines">{len(ALL)}</b><span>{S(DL)}</span><b data-n="cant">{cant}</b><span>{S(CL)}</span></div>'
      f'<div><h3>{S(DP)}</h3><ul class="dbars">{rows}</ul></div>'
      f'<div><h3>{S(DY)}</h3><ul class="dcats">{cats}</ul></div></div></div></section>\n')
CSS2=('<style id="vini3">.dash{padding:3.5rem 0 3rem;text-align:center}.dash h2{margin:0 0 2rem}.dash h2::before{margin-left:auto;margin-right:auto}'
 '.dgrid{display:grid;grid-template-columns:.7fr 1.6fr .8fr;gap:2.5rem;max-width:1100px;margin:0 auto;text-align:left;align-items:start}'
 '.dash h3{font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);font-family:var(--sans);font-weight:400;margin:0 0 1rem}'
 '.dtot{display:grid;gap:.1rem;border:1px solid var(--line);padding:1.5rem;background:var(--alt)}.dtot b{font:300 3.2rem/1 var(--serif)}.dtot span{color:var(--muted);font-size:.85rem;margin-bottom:.9rem}'
 '.dbars,.dcats{list-style:none;margin:0;padding:0;display:grid;gap:.55rem}'
 '.dbars li{display:grid;grid-template-columns:11rem 1fr 2rem;gap:.8rem;align-items:center;font-size:.92rem}.dbars b,.dcats b{font:400 1.1rem var(--serif);text-align:right}'
 '.db{height:.55rem;background:var(--alt);border:1px solid var(--line)}.db i{display:block;height:100%;background:var(--gold)}'
 '.dcats li{display:flex;justify-content:space-between;flex-direction:row-reverse;border-bottom:1px solid var(--line);padding:.35rem 0;font-size:.95rem}.dcats b{text-align:left}'
 '@media (max-width:860px){.dgrid{grid-template-columns:1fr;gap:1.8rem}.dbars li{grid-template-columns:8.5rem 1fr 1.8rem}.dtot{grid-template-columns:auto 1fr;align-items:baseline;gap:.2rem .8rem}.dtot span{margin:0}}</style>')

# ---- amari premium (Knez Spirits)
AM_T=('Amari premium','Premium amari','Premium-Amari','Premium amari','Premium amari')
AM_I=('La nostra selezione di amari e liquori di Knez Spirits, dal Carso triestino: senza coloranti, conservanti né caramello.',
 'Our selection of amari and liqueurs by Knez Spirits, from the Trieste Karst: no colourings, preservatives or caramel.',
 'Unsere Auswahl an Amari und Likören von Knez Spirits aus dem Triestiner Karst: ohne Farbstoffe, Konservierungsstoffe und Karamell.',
 'Naš izbor amarov in likerjev Knez Spirits s tržaškega Krasa: brez barvil, konzervansov in karamele.',
 'Onze selectie amari en likeren van Knez Spirits, uit de Triëstijnse Karst: zonder kleurstoffen, conserveermiddelen en karamel.')
AM_MS=('Prezzo e formato su richiesta.','Price and serving on request.','Preis und Ausschank auf Anfrage.','Cena in postrežba na zahtevo.','Prijs en serveerwijze op aanvraag.')
AMARI=[
 ('Knez Spirits','Amaro Pelinkovac','27% vol. · 70 cl',
  ('Amaro tipico della Venezia Giulia e dei Balcani, da una selezione di assenzio e altre erbe locali, con rabarbaro e fiori di sambuco: aroma intenso, colore molto chiaro, note erbacee, rotonde, prevalentemente amare e leggermente dolci, finale lungo.',
   'A bitter typical of Venezia Giulia and the Balkans, from a selection of wormwood and other local herbs, with rhubarb and elderflower: intense aroma, very pale colour, herbal, round notes that are mostly bitter and slightly sweet, with a long finish.',
   'Ein typischer Bitterlikör aus Julisch Venetien und vom Balkan, aus ausgewähltem Wermut und anderen lokalen Kräutern, mit Rhabarber und Holunderblüte: intensives Aroma, sehr helle Farbe, kräuterige, runde Noten, überwiegend bitter und leicht süß, langer Abgang.',
   'Grenčica, značilna za Julijsko krajino in Balkan, iz izbranega pelina in drugih lokalnih zelišč, z rabarbaro in bezgovim cvetom: intenziven vonj, zelo svetla barva, zeliščne, okrogle note, večinoma grenke in rahlo sladke, dolg zaključek.',
   'Een bitter typisch voor Venezia Giulia en de Balkan, van een selectie alsem en andere lokale kruiden, met rabarber en vlierbloesem: intens aroma, zeer lichte kleur, kruidige, ronde tonen die vooral bitter en licht zoet zijn, met een lange afdronk.')),
 ('Knez Spirits','Amaro Pelinkovac affinato in legno · Edizione limitata 2024','30% vol. · 70 cl',
  ('Il primo Pelinkovac affinato in botti di rovere di diversa tostatura con metodo Solera, bilanciato con miele biologico della Cantina Sturm di Zegla (Cormons): un amaro raffinato, elegante e armonioso, ricco e complesso.',
   'The first Pelinkovac aged in oak barrels of different toasting levels using the Solera method, balanced with organic honey from Cantina Sturm in Zegla (Cormons): a refined, elegant and harmonious amaro, rich and complex.',
   'Der erste Pelinkovac, im Solera-Verfahren in Eichenfässern unterschiedlicher Röstung gereift und mit Bio-Honig der Cantina Sturm aus Zegla (Cormons) abgerundet: ein raffinierter, eleganter und harmonischer Amaro, reich und komplex.',
   'Prvi Pelinkovac, staran po metodi Solera v hrastovih sodih različne stopnje opečenosti in uravnotežen z ekološkim medom kleti Sturm iz Zegle (Krmin): prefinjen, eleganten in harmoničen amaro, bogat in kompleksen.',
   'De eerste Pelinkovac, gerijpt volgens de solera-methode in eikenhouten vaten met verschillende toastgraad en in balans gebracht met biologische honing van Cantina Sturm in Zegla (Cormons): een verfijnde, elegante en harmonieuze amaro, rijk en complex.')),
 ('Knez Spirits','Liquore di Terrano','17% vol. · 70 cl',
  ('Liquore tradizionale dell’altopiano carsico, da vino Terrano Carso DOC con spezie e botaniche (chiodi di garofano, arancia, fava tonka, rosmarino, cannella), miele millefiori e grappa locale: rosso rubino sfumato di viola, corpo pieno addolcito dal miele. Con biscotteria secca o come goloso fine pasto.',
   'A traditional liqueur from the Karst plateau, made from Terrano Carso DOC wine with spices and botanicals (cloves, orange, tonka bean, rosemary, cinnamon), millefiori honey and local grappa: ruby red shading to violet, full-bodied and softened by honey. With dry biscuits or as a sweet after-dinner treat.',
   'Ein traditioneller Likör des Karstplateaus aus Terrano-Wein (Carso DOC) mit Gewürzen und Botanicals (Nelken, Orange, Tonkabohne, Rosmarin, Zimt), Mille-Fiori-Honig und lokalem Grappa: rubinrot mit violetten Reflexen, vollmundig und vom Honig gemildert. Zu trockenem Gebäck oder als süßer Abschluss des Essens.',
   'Tradicionalni liker s kraške planote iz vina teran (Carso DOC) z začimbami in zelišči (nageljnove žbice, pomaranča, tonka, rožmarin, cimet), večcvetnim medom in lokalno grapo: rubinasto rdeč z vijoličastimi odsevi, poln in omehčan z medom. K suhemu pecivu ali kot sladek zaključek obroka.',
   'Een traditionele likeur van het Karstplateau, van Terrano-wijn (Carso DOC) met specerijen en kruiden (kruidnagel, sinaasappel, tonkaboon, rozemarijn, kaneel), millefiori-honing en lokale grappa: robijnrood met violette tinten, vol en door de honing verzacht. Bij droge koekjes of als zoete afsluiter van de maaltijd.')),
 ('Knez Spirits','Crema di Pelinkovac','20% vol. · 70 cl',
  ('Pelinkovac con panna selezionata e aromi naturali di cacao e vaniglia: morbida e vellutata al palato, con note di crema, cacao e vaniglia e un finale che richiama il carattere erbaceo e leggermente amaro del Pelinkovac.',
   'Pelinkovac blended with selected cream and natural cocoa and vanilla flavourings: soft and velvety on the palate, with notes of cream, cocoa and vanilla and a finish that recalls the herbal, slightly bitter character of Pelinkovac.',
   'Pelinkovac mit ausgewählter Sahne und natürlichen Kakao- und Vanillearomen: weich und samtig am Gaumen, mit Noten von Sahne, Kakao und Vanille und einem Abgang, der den kräuterigen, leicht bitteren Charakter des Pelinkovac aufgreift.',
   'Pelinkovac z izbrano smetano in naravnimi aromami kakava in vanilije: mehka in žametna v ustih, z notami smetane, kakava in vanilije ter zaključkom, ki spominja na zeliščni, rahlo grenki značaj pelinkovca.',
   'Pelinkovac met geselecteerde room en natuurlijke cacao- en vanillearoma’s: zacht en fluweelzacht in de mond, met tonen van room, cacao en vanille en een afdronk die doet denken aan het kruidige, licht bittere karakter van Pelinkovac.')),
]
def amari():
    IMG=['amaro-pelinkovac','amaro-pelinkovac-affinato','liquore-terrano','crema-pelinkovac']
    lis=''.join(f'<li class="wine wam am"><img src="images/knez-{IMG[k]}.png" alt="{H.escape(c+" "+n,quote=True)}" loading="lazy" width="80" height="140"><div class="wamb"><div class="wrow"><span class="wn"><b>{H.escape(c,quote=False)}</b> {H.escape(n,quote=False)}</span><span class="wf" aria-hidden="true"></span><span class="wabv">{H.escape(a,quote=False)}</span></div><p class="wdesc">{S(d)}</p></div></li>' for k,(c,n,a,d) in enumerate(AMARI))
    return (f'<section class="course" id="amari"><h2>{S(AM_T)}</h2><div class="wgroups"><div class="wg"><p class="winfo">{S(AM_I)}</p>'
            f'<ul class="wlist">{lis}</ul><p class="wnote">{S(AM_MS)}</p></div></div></section>\n')
CSS3='<style id="vini4">.wam img.wph{height:150px;width:70px;object-fit:contain;flex:0 0 70px;filter:drop-shadow(0 5px 7px rgba(0,0,0,.2))}@media (max-width:560px){.wam img.wph{height:120px;width:56px;flex-basis:56px}}.wine:not(.wam)>.wamb{display:block}.wam{display:flex!important;gap:1.2rem;align-items:center!important}.wam img{height:170px;width:150px;object-fit:contain;object-position:center;flex:0 0 150px;filter:drop-shadow(0 6px 8px rgba(0,0,0,.18))}.wamb{flex:1;min-width:0}@media (max-width:560px){.wam img{height:120px;width:100px;flex-basis:100px}.wam{gap:.9rem}}.wam .wn{max-width:none;flex:1 1 auto}.am .wrow{flex-wrap:wrap;gap:.2rem .8rem}.wabv{color:var(--muted);font-size:.85rem;white-space:nowrap}.wnote{margin:1rem 0 0;color:var(--muted);font-size:.88rem;font-style:italic}</style>'

def apply(path):
    s = open(path, encoding='utf-8').read()
    i = s.index('<section class="featured"'); j = s.index('</main>')
    wmap = {str(w['i']): w['name'] for w in W if w['id'] and w['i'] in ALL}
    mapjs = '<script>window.DVOR_WMAP=' + json.dumps(wmap, ensure_ascii=False) + ';</script>\n'
    s = s[:i] + featured() + dash() + courses() + amari() + mapjs + s[j:]
    if 'vini-stock.js' not in s: s = s.replace('</body>', '<script src="vini-stock.js" defer></script>\n</body>', 1)
    s = re.sub(r'<style id="vini[234]">.*?</style>', '', s, flags=re.S)
    s = s.replace('</head>', CSS + CSS2 + CSS3 + '</head>', 1)
    nav_it = '<a href="#amari">' + S(AM_T) + '</a>'
    s = re.sub(r'<a href="#amari">.*?</a>', '', s, flags=re.S) if False else s
    if 'href="#amari"' not in s:
        s = s.replace('<a href="#ros">', '@@ROS@@', 1)
        m = re.search(r'(@@ROS@@.*?</a>)', s, flags=re.S)
        s = s.replace(m.group(1), m.group(1).replace('@@ROS@@', '<a href="#ros">') + nav_it, 1)
    open(path, 'w', encoding='utf-8').write(s)
    print('ok', path, len(s))
if __name__ == '__main__':
    for p in sys.argv[1:]: apply(p)
