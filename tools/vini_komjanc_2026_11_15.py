# Aggiunge i 9 vini Komjanc alla carta fissa di site/vini.html (idempotente).
# Prezzi di carta = prezzo di vendita Odoo (senza IVA) + 10%.
import re, json
P = 'site/vini.html'
h = open(P, encoding='utf8').read()
if 'data-c="Komjanc"' in h: raise SystemExit('Komjanc gia presente')
L = ['it', 'en', 'de', 'sl', 'nl']
def S(t): return ''.join('<span class="%s" lang="%s">%s</span>' % (l, l, x) for l, x in zip(L, t))
AB = S(('Abbinamenti', 'Pairings', 'Passende Speisen', 'Primerne jedi', 'Past bij'))
# (gruppo it, sezione, tipo, odoo, nome in carta, prezzo, descrizione x5, abbinamenti x5)
W = [
 ('Friulano', 'bia', 'bia', '[KOMJANC] Friulano Collio DOC 2025 - Komjanc', 'Friulano Collio DOC 2025', 33,
  ('Friulano di Komjanc, Collio: secco e sapido, con note di mandorla, fieno e fiori di campo.',
   'Friulano from Komjanc, Collio: dry and savoury, with notes of almond, hay and wildflowers.',
   'Friulano von Komjanc, Collio: trocken und würzig, mit Noten von Mandel, Heu und Wiesenblumen.',
   'Friulano Komjanc, Collio: suh in slan, z notami mandljev, sena in poljskega cvetja.',
   'Friulano van Komjanc, Collio: droog en hartig, met tonen van amandel, hooi en veldbloemen.'),
  ('Prosciutto crudo, antipasti di verdure, frittate e primi delicati.',
   'Cured ham, vegetable starters, frittatas and delicate first courses.',
   'Rohschinken, Gemüse-Vorspeisen, Frittata und zarte Primi.',
   'Pršut, zelenjavne predjedi, omlete in nežne prve jedi.',
   'Rauwe ham, groentevoorgerechten, frittata en delicate pasta- en risottogerechten.')),
 ('Ribolla Gialla · Rebula', 'bia', 'bia', '[KOMJANC] Ribolla Gialla Collio DOC 2025 - Komjanc', 'Ribolla Gialla Collio DOC 2025', 33,
  ('Ribolla Gialla di Komjanc, Collio: fresca e agrumata, con acidità vivace e finale minerale.',
   'Ribolla Gialla from Komjanc, Collio: fresh and citrusy, with lively acidity and a mineral finish.',
   'Ribolla Gialla von Komjanc, Collio: frisch und zitrusfrisch, mit lebendiger Säure und mineralischem Abgang.',
   'Rebula Komjanc, Collio: sveža in citrusna, z živahno kislino in mineralnim zaključkom.',
   'Ribolla Gialla van Komjanc, Collio: fris en citrusachtig, met levendige zuurgraad en een minerale afdronk.'),
  ('Aperitivo, crudi di pesce, frittura di mare e zuppe di pesce.',
   'Aperitif, raw fish, fried seafood and fish soups.',
   'Aperitif, roher Fisch, frittierte Meeresfrüchte und Fischsuppen.',
   'Aperitiv, surova riba, ocvrti morski sadeži in ribje juhe.',
   'Aperitief, rauwe vis, gefrituurde zeevruchten en visbouillon.')),
 ('Malvasia', 'bia', 'bia', '[KOMJANC] Malvasia Collio DOC 2025 - Komjanc', 'Malvasia Collio DOC 2025', 33,
  ('Malvasia di Komjanc, Collio: aromatica e morbida, con note di pesca, fiori bianchi e un finale di mandorla.',
   'Malvasia from Komjanc, Collio: aromatic and soft, with notes of peach, white flowers and an almond finish.',
   'Malvasia von Komjanc, Collio: aromatisch und weich, mit Noten von Pfirsich, weißen Blüten und einem Mandelabgang.',
   'Malvazija Komjanc, Collio: aromatična in mehka, z notami breskve, belega cvetja in mandljevim zaključkom.',
   'Malvasia van Komjanc, Collio: aromatisch en zacht, met tonen van perzik, witte bloemen en een amandelafdronk.'),
  ('Antipasti di mare, crostacei, risotti e formaggi freschi.',
   'Seafood starters, shellfish, risottos and fresh cheeses.',
   'Meeresfrüchte-Vorspeisen, Krustentiere, Risotti und Frischkäse.',
   'Morske predjedi, raki in školjke, rižote in sveži siri.',
   'Voorgerechten van zeevruchten, schaaldieren, risotto en verse kazen.')),
 ('Pinot Grigio, Pinot Bianco e Chardonnay', 'bia', 'bia', '[KOMJANC] Pinot Grigio Collio DOC 2025 - Komjanc', 'Pinot Grigio Collio DOC 2025', 33,
  ('Pinot Grigio di Komjanc, Collio: morbido e fruttato, con sentori di pera matura e frutta secca.',
   'Pinot Grigio from Komjanc, Collio: soft and fruity, with hints of ripe pear and dried fruit.',
   'Pinot Grigio von Komjanc, Collio: weich und fruchtig, mit Anklängen von reifer Birne und Trockenfrüchten.',
   'Sivi pinot Komjanc, Collio: mehak in sadni, z vonjem zrelih hrušk in suhega sadja.',
   'Pinot grigio van Komjanc, Collio: zacht en fruitig, met tonen van rijpe peer en gedroogd fruit.'),
  ('Antipasti, primi di verdure, pesce al forno e carni bianche.',
   'Starters, vegetable first courses, baked fish and white meats.',
   'Vorspeisen, Gemüse-Primi, Ofenfisch und weißes Fleisch.',
   'Predjedi, zelenjavne prve jedi, pečena riba in belo meso.',
   'Voorgerechten, groentegerechten, gebakken vis en wit vlees.')),
 ('Pinot Grigio, Pinot Bianco e Chardonnay', 'bia', 'bia', '[KOMJANC] Pinot Bianco Collio DOC 2025 - Komjanc', 'Pinot Bianco Collio DOC 2025', 33,
  ('Pinot Bianco di Komjanc, Collio: fine ed elegante, con note di mela, pera e crosta di pane.',
   'Pinot Bianco from Komjanc, Collio: fine and elegant, with notes of apple, pear and bread crust.',
   'Pinot Bianco von Komjanc, Collio: fein und elegant, mit Noten von Apfel, Birne und Brotkruste.',
   'Beli pinot Komjanc, Collio: fin in eleganten, z notami jabolka, hruške in kruhove skorje.',
   'Pinot bianco van Komjanc, Collio: fijn en elegant, met tonen van appel, peer en broodkorst.'),
  ('Antipasti di mare, uova, asparagi e primi delicati.',
   'Seafood starters, eggs, asparagus and delicate first courses.',
   'Meeresfrüchte-Vorspeisen, Eier, Spargel und zarte Primi.',
   'Morske predjedi, jajca, beluš in nežne prve jedi.',
   'Voorgerechten van zeevruchten, eieren, asperges en delicate pasta- en risottogerechten.')),
 ('Pinot Grigio, Pinot Bianco e Chardonnay', 'bia', 'bia', '[KOMJANC] Chardonnay Dedica Collio DOC 2024 - Komjanc', 'Chardonnay Dedica Collio DOC 2024', 38,
  ('Chardonnay Dedica di Komjanc, Collio: strutturato e avvolgente, con note di frutta a polpa gialla e vaniglia.',
   'Chardonnay Dedica from Komjanc, Collio: structured and enveloping, with notes of yellow-fleshed fruit and vanilla.',
   'Chardonnay Dedica von Komjanc, Collio: kräftig und umhüllend, mit Noten von gelbfleischigen Früchten und Vanille.',
   'Chardonnay Dedica Komjanc, Collio: strukturiran in obsevajoč, z notami rumenega sadja in vanilije.',
   'Chardonnay Dedica van Komjanc, Collio: gestructureerd en omhullend, met tonen van geel fruit en vanille.'),
  ('Pesce al forno, crostacei, risotti e carni bianche.',
   'Baked fish, shellfish, risottos and white meats.',
   'Ofenfisch, Krustentiere, Risotti und weißes Fleisch.',
   'Pečena riba, raki in školjke, rižote in belo meso.',
   'Gebakken vis, schaaldieren, risotto en wit vlees.')),
 ('Merlot', 'ros', 'ros', '[KOMJANC] Merlot Dedica Collio DOC 2021 - Komjanc', 'Merlot Dedica Collio DOC 2021', 69,
  ('Merlot Dedica di Komjanc, Collio: morbido e strutturato, con note di prugna, ciliegia e spezie dolci.',
   'Merlot Dedica from Komjanc, Collio: soft and structured, with notes of plum, cherry and sweet spices.',
   'Merlot Dedica von Komjanc, Collio: weich und strukturiert, mit Noten von Pflaume, Kirsche und süßen Gewürzen.',
   'Merlot Dedica Komjanc, Collio: mehak in strukturiran, z notami slive, češnje in sladkih začimb.',
   'Merlot Dedica van Komjanc, Collio: zacht en gestructureerd, met tonen van pruim, kers en zoete kruiden.'),
  ('Primi al ragù, carni alla griglia, arrosti e formaggi stagionati.',
   'Ragù pasta, grilled meats, roasts and aged cheeses.',
   'Pasta mit Ragù, Grillfleisch, Braten und gereifter Käse.',
   'Testenine z mesno omako, meso z žara, pečenke in zreli siri.',
   'Pasta met ragù, gegrild vlees, gebraden vlees en gerijpte kazen.')),
 ('Pinot Nero', 'ros', 'ros', '[KOMJANC] Pinot Nero Dedica Collio DOC 2021 - Komjanc', 'Pinot Nero Dedica Collio DOC 2021', 42,
  ('Pinot Nero Dedica di Komjanc, Collio: elegante e delicato, con note di piccoli frutti rossi e sottobosco.',
   'Pinot Nero Dedica from Komjanc, Collio: elegant and delicate, with notes of small red fruits and undergrowth.',
   'Pinot Nero Dedica von Komjanc, Collio: elegant und zart, mit Noten von roten Beeren und Unterholz.',
   'Pinot noir Dedica Komjanc, Collio: eleganten in nežen, z notami drobnega rdečega sadja in podrasti.',
   'Pinot nero Dedica van Komjanc, Collio: elegant en delicaat, met tonen van rood klein fruit en bosgrond.'),
  ('Salumi, primi con funghi, carni bianche, anatra e formaggi morbidi.',
   'Cured meats, mushroom first courses, white meats, duck and soft cheeses.',
   'Aufschnitt, Pilz-Primi, weißes Fleisch, Ente und Weichkäse.',
   'Suhomesnati izdelki, prve jedi z gobami, belo meso, raca in mehki siri.',
   'Vleeswaren, pastagerechten met paddenstoelen, wit vlees, eend en zachte kazen.')),
 ('Refosco, Terrano e Franconia', 'ros', 'ros', '[KOMJANC] Schioppettino IGT Venezia Giulia 2021 - Komjanc', 'Schioppettino IGT Venezia Giulia 2021', 33,
  ('Schioppettino di Komjanc, Venezia Giulia: vitigno autoctono friulano, speziato e vivace, con note di pepe e frutti di bosco.',
   'Schioppettino from Komjanc, Venezia Giulia: a native Friulian grape, spicy and lively, with notes of pepper and wild berries.',
   'Schioppettino von Komjanc, Venezia Giulia: eine autochthone friulanische Rebsorte, würzig und lebendig, mit Noten von Pfeffer und Waldbeeren.',
   'Schioppettino Komjanc, Venezia Giulia: avtohtona furlanska sorta, začinjena in živahna, z notami popra in gozdnih sadežev.',
   'Schioppettino van Komjanc, Venezia Giulia: een inheemse Friulaanse druif, kruidig en levendig, met tonen van peper en bosvruchten.'),
  ('Salumi, selvaggina, carni alla griglia e formaggi stagionati.',
   'Cured meats, game, grilled meats and aged cheeses.',
   'Aufschnitt, Wild, Grillfleisch und gereifter Käse.',
   'Suhomesnati izdelki, divjačina, meso z žara in zreli siri.',
   'Vleeswaren, wild, gegrild vlees en gerijpte kazen.')),
]
m = re.search(r'window\.DVOR_WMAP=(\{.*?\});', h, re.S); WM = json.loads(m.group(1)); nxt = max(map(int, WM)) + 1
add = {}
for k, (grp, sec, typ, odoo, nome, pr, d, ab) in enumerate(W):
    w = nxt + k; WM[str(w)] = odoo
    li = ('<li class="wine" data-w="%d" data-o="ci" data-t="%s" data-c="Komjanc"><div class="wamb"><div class="wrow"><span class="wn"><b>Komjanc</b> %s</span>'
          '<span class="wf" aria-hidden="true"></span><span class="wp">€&nbsp;%d</span></div><p class="wdesc">%s</p><p class="wpair"><b>%s</b> %s</p></div></li>'
          % (w, typ, nome, pr, S(d), AB, S(ab)))
    add.setdefault((sec, grp), []).append(li)
for (sec, grp), lis in add.items():
    s0 = h.find('<section class="course" id="%s"' % sec); assert s0 > 0, sec
    g0 = h.find('<h3><span class="it" lang="it">%s</span>' % grp, s0); assert g0 > 0, grp
    u1 = h.find('</ul>', g0); h = h[:u1] + ''.join(lis) + h[u1:]
m = re.search(r'window\.DVOR_WMAP=(\{.*?\});', h, re.S)  # ricalcolo: gli inserimenti hanno spostato le posizioni
h = h[:m.start(1)] + json.dumps(WM, ensure_ascii=False) + h[m.end(1):]
# contatori statici (la pagina li ricalcola comunque dal vivo)
h = h.replace('data-n="wines">92', 'data-n="wines">101').replace('data-n="cant">29', 'data-n="cant">30')
def bump(pat, n):
    global h
    mm = re.search(pat, h); assert mm, pat
    h = h[:mm.start(2)] + str(int(mm.group(2)) + n) + h[mm.end(2):]
bump(r'(<li data-t="bia"><b>)(\d+)', 6); bump(r'(<li data-t="ros"><b>)(\d+)', 3)
bump(r'(<li data-o="ci">.*?<b>)(\d+)(</b>)', 9) if False else None
mm = re.search(r'(<li data-o="ci">.*?<b>)(\d+)(</b>)', h, re.S); h = h[:mm.start(2)] + str(int(mm.group(2)) + 9) + h[mm.end(2):]
open(P, 'w', encoding='utf8').write(h); print('aggiunti', len(W))
