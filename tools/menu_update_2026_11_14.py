# Aggiorna site/menu.html dal nuovo Menu-Dvor-prezzi.pdf (14/11/2026):
#  - Tagliolini tartufo bianco 30 -> 34
#  - supplemento tartufo (EUR 8 al grammo) su Tagliolini, Tartar, Filetto
#  - pesi indicativi: Crudo d'Osvaldo 110 g, Tagliata 220 g, Filetto 180 g
#  - Lingotto Rocher -> Rocher di Sal De Riso (nome, descrizione, riga allergeni)
#  - legenda (vegetariano, tartufo pesato al tavolo) e coperto sotto i dolci
# Idempotente: si puo' lanciare piu' volte.
import re
P = 'site/menu.html'
h = open(P, encoding='utf8').read()
L = ['it', 'en', 'de', 'sl', 'nl']
def T(d): return ''.join('<span class="%s" lang="%s">%s</span>' % (l, l, d[l]) for l in L)
def need(c, msg):
    if not c: raise SystemExit('ERRORE: ' + msg)

VG = re.search(r'<svg class="vg".*?</svg>', h, re.S).group(0)
TF = ('<svg class="tf" viewBox="0 0 16 16" role="img" aria-label="tartufo"><title>Tartufo</title>'
      '<path d="M8 1.4c2.8-.2 5.6 1.7 6.2 4.7.7 3.2-.4 6.8-3.5 8.2-3.1 1.4-6.8.3-8.2-2.7C1.4 8.3 2.4 4 5.2 2.3 6 1.8 7 1.5 8 1.4z" fill="currentColor"/>'
      '<g class="tfd"><circle cx="5.3" cy="6.3" r=".9"/><circle cx="9.2" cy="4.7" r=".8"/><circle cx="11.3" cy="8.6" r=".9"/>'
      '<circle cx="7.2" cy="9" r=".8"/><circle cx="5.7" cy="11.4" r=".7"/><circle cx="9.8" cy="11.6" r=".8"/></g></svg>')

def dish_p(name):
    """(inizio, fine) del primo <p>..</p> dopo il titolo del piatto."""
    i = h.find('<h3 lang="it">' + name)
    need(i > 0, 'piatto non trovato: ' + name)
    a = h.find('<p>', i); b = h.find('</p>', a) + 4
    return a, b

def set_p(name, d):
    global h
    a, b = dish_p(name); h = h[:a] + '<p>' + T(d) + '</p>' + h[b:]

def append_p(name, suf):
    global h
    a, b = dish_p(name); blk = h[a:b]
    if suf['it'] in blk: return
    for l in L:
        blk = re.sub(r'(<span class="%s" lang="%s">)(.*?)(</span>)' % (l, l),
                     lambda m: m.group(1) + m.group(2) + ' ' + suf[l] + m.group(3), blk, count=1)
    h = h[:a] + blk + h[b:]

def add_note(name, d):
    global h
    a, b = dish_p(name)
    if h[b:b + 14] == '<p class="tn">': return
    h = h[:b] + '<p class="tn">' + T(d) + TF + '</p>' + h[b:]

# 1) prezzo
m = re.search(r'(Tagliolini tartufo bianco<svg.*?</svg></h3><span class="pr">€&nbsp;)(\d+)(</span>)', h, re.S)
need(m, 'prezzo tagliolini')
h = h[:m.start(2)] + '34' + h[m.end(2):]

# 2) pesi indicativi
append_p("Crudo d'Osvaldo", dict(it='Circa 110 g.', en='About 110 g.', de='Ca. 110 g.', sl='Pribl. 110 g.', nl='Ca. 110 g.'))
append_p('Tagliata di manzo', dict(it='Circa 220 g.', en='About 220 g.', de='Ca. 220 g.', sl='Pribl. 220 g.', nl='Ca. 220 g.'))
set_p('Filetto di scottona di Bretagna', dict(
    it='Servito con purè e finocchietto. Circa 180 g.',
    en='Served with mash and fennel. About 180 g.',
    de='Serviert mit Püree und Fenchel. Ca. 180 g.',
    sl='Postreženo s pirejem in koromačem. Pribl. 180 g.',
    nl='Geserveerd met puree en venkel. Ca. 180 g.'))

# 3) supplemento tartufo
EXTRA = dict(it='Tartufo in più · € 8 al grammo', en='Extra truffle · € 8 per gram', de='Trüffel extra · € 8 pro Gramm',
             sl='Dodatni tartuf · € 8 za gram', nl='Extra truffel · € 8 per gram')
ADD = dict(it='Con aggiunta di tartufo bianco · € 8 al grammo', en='With added white truffle · € 8 per gram',
           de='Mit weißem Trüffel extra · € 8 pro Gramm', sl='Z dodatkom belega tartufa · € 8 za gram',
           nl='Met extra witte truffel · € 8 per gram')
add_note('Tagliolini tartufo bianco', EXTRA)
add_note('Tartar di manzo', ADD)
add_note('Filetto di scottona di Bretagna', ADD)

# 4) Rocher di Sal De Riso
if 'Lingotto Rocher' in h:
    h = h.replace('<h3 lang="it">Lingotto Rocher', '<h3 lang="it">Rocher di Sal De Riso')
    h = h.replace('<th scope="row" lang="it">Lingotto Rocher</th>', '<th scope="row" lang="it">Rocher di Sal De Riso</th>')
    set_p('Rocher di Sal De Riso', dict(
        it='Nocciola e cioccolato, firmato dal celebre pasticcere campano.',
        en='Hazelnut and chocolate, signed by the celebrated pastry chef from Campania.',
        de='Haselnuss und Schokolade, signiert vom berühmten Konditor aus Kampanien.',
        sl='Lešnik in čokolada, delo slavnega slaščičarja iz Kampanije.',
        nl='Hazelnoot en chocolade, gesigneerd door de beroemde banketbakker uit Campanië.'))
need('Lingotto' not in h, 'Lingotto ancora presente')

# 5) legenda e coperto sotto i dolci
if 'class="mnote"' not in h:
    leg = dict(
        veg=dict(it='Piatto vegetariano', en='Vegetarian dish', de='Vegetarisches Gericht', sl='Vegetarijanska jed', nl='Vegetarisch gerecht'),
        tr=dict(it='Tartufo pesato e servito al tavolo.', en='Truffle weighed and served at the table.',
                de='Der Trüffel wird am Tisch gewogen und serviert.', sl='Tartuf se tehta in streže pri mizi.',
                nl='De truffel wordt aan tafel gewogen en geserveerd.'),
        cov=dict(it='Coperto € 3 a persona, include pane, olio d\'oliva e servizio.',
                 en='Cover charge € 3 per person, includes bread, olive oil and service.',
                 de='Gedeck € 3 pro Person, inklusive Brot, Olivenöl und Service.',
                 sl='Kuvert € 3 na osebo, vključuje kruh, oljčno olje in strežbo.',
                 nl='Couvert € 3 per persoon, inclusief brood, olijfolie en bediening.'))
    blk = ('<div class="mnote"><p class="vleg">' + VG + '<span>' + T(leg['veg']) + '</span></p>'
           '<p class="vleg">' + TF + '<span>' + T(leg['tr']) + '</span></p>'
           '<p>' + T(leg['cov']) + '</p></div>')
    i = h.find('<section class="course" id="dolci"'); need(i > 0, 'sezione dolci')
    j = h.find('</div></section>', i); need(j > 0, 'fine sezione dolci')
    h = h[:j + 6] + blk + h[j + 6:]

# 6) stile
if '.tn{' not in h:
    css = ('.tn{margin:.45rem 0 0;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}'
           '.tf{width:1.05em;height:1.05em;margin-left:.45rem;vertical-align:-.16em;color:var(--gold)}.tf .tfd{fill:var(--bg,#fff)}'
           '.vleg .tf{margin:0;color:var(--gold)}')
    k = h.find('.mnote{'); need(k > 0, 'css mnote')
    h = h[:k] + css + h[k:]

open(P, 'w', encoding='utf8').write(h)
print('menu.html aggiornato')
