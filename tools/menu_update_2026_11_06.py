# Aggiorna site/menu.html: piatti, prezzi, descrizioni (5 lingue), tabella allergeni, date, pulsanti PDF.
import re, sys
P = 'site/menu.html'
h = open(P, encoding='utf8').read()
L = ['it', 'en', 'de', 'sl', 'nl']
def T(d): return ''.join('<span class="%s" lang="%s">%s</span>' % (l, l, d[l]) for l in L)
VEG = '<svg class="vg" viewBox="0 0 16 16" role="img" aria-label="vegetariano"><title>Vegetariano</title><path d="M14 2C7 2 2.5 5.5 2.5 10.5c0 1.2.3 2.3.8 3.2C5 9.8 7.8 7.4 11 6c-2.8 1.8-5.2 4.6-6.6 8 1 .5 2 .7 3.1.7C12.6 14.7 14 9 14 2z" fill="#3f8f3a"/></svg>'
# (nome, prezzo, vegetariano, {it,en,de,sl,nl}, allergeni)
M = {
 'antipasti': [
  ('Toc in braide', 15, 1, dict(it='Polenta morbida con fonduta di formaggi friulani, funghi e burro fuso.', en='Soft polenta with a fondue of Friulian cheeses, mushrooms and melted butter.', de='Weiche Polenta mit einer Fondue aus friaulischen Käsesorten, Pilzen und zerlassener Butter.', sl='Mehka polenta s fondujem iz furlanskih sirov, gobami in stopljenim maslom.', nl='Zachte polenta met een fondue van Friulische kazen, paddenstoelen en gesmolten boter.'), [7, 12]),
  ('Tartar di manzo', 20, 0, dict(it='Manzo crudo battuto al coltello.', en='Raw beef, chopped by knife.', de='Rohes Rindfleisch, mit dem Messer gehackt.', sl='Surovo goveje meso, sesekljano z nožem.', nl='Rauw rundvlees, met het mes gesneden.'), [1, 7]),
  ('Jota', 15, 0, dict(it='Minestra tradizionale di fagioli, crauti e patate, con pancetta affumicata.', en='Traditional soup of beans, sauerkraut and potatoes, with smoked pancetta.', de='Traditionelle Suppe aus Bohnen, Sauerkraut und Kartoffeln mit geräuchertem Speck.', sl='Tradicionalna jota iz fižola, kislega zelja in krompirja z dimljeno panceto.', nl='Traditionele soep van bonen, zuurkool en aardappelen met gerookte pancetta.'), [1, 9, 12]),
  ("Crudo d'Osvaldo", 18, 0, dict(it='Prosciutto di Cormons leggermente affumicato, stagionato 24 mesi.', en='Lightly smoked Cormons ham, aged 24 months.', de='Leicht geräucherter Schinken aus Cormons, 24 Monate gereift.', sl='Rahlo dimljen pršut iz Cormonsa, zorjen 24 mesecev.', nl='Licht gerookte ham uit Cormons, 24 maanden gerijpt.'), []),
 ],
 'primi': [
  ('Gnocchi alla goriziana', 15, 0, dict(it='Gnocchi con gulasch di maiale, cipolla e spezie.', en='Gnocchi with pork goulash, onion and spices.', de='Gnocchi mit Schweinegulasch, Zwiebeln und Gewürzen.', sl='Njoki s svinjskim golažem, čebulo in začimbami.', nl='Gnocchi met varkensgoulash, ui en specerijen.'), [1, 3, 7, 9, 12]),
  ('Tagliolini tartufo bianco', 30, 1, dict(it='Tagliolini freschi con tartufo bianco istriano.', en='Fresh tagliolini with Istrian white truffle.', de='Frische Tagliolini mit istrischem weißem Trüffel.', sl='Sveži tagliolini z istrskim belim tartufom.', nl='Verse tagliolini met Istrische witte truffel.'), [1, 3, 7]),
  ('Tagliolini con cervo', 20, 0, dict(it='Pasta fresca con spezzatino di cervo.', en='Fresh pasta with venison stew.', de='Frische Pasta mit Hirschragout.', sl='Sveže testenine z jelenjim golažem.', nl='Verse pasta met hertenstoof.'), [1, 3, 7, 9, 12]),
  ('Canederli', 18, 1, dict(it='Canederli di spinaci freschi e ricotta.', en='Dumplings of fresh spinach and ricotta.', de='Knödel aus frischem Spinat und Ricotta.', sl='Cmoki iz sveže špinače in rikote.', nl='Knödel van verse spinazie en ricotta.'), [1, 3, 7]),
 ],
 'secondi': [
  ('Tagliata di manzo', 28, 0, dict(it='Roastbeef uruguaiano alla griglia con scaglie di Grana e rucola.', en='Grilled Uruguayan roast beef with Grana shavings and rocket.', de='Gegrilltes uruguayisches Roastbeef mit Grana-Splittern und Rucola.', sl='Na žaru pečen urugvajski rostbif z lističi sira Grana in rukolo.', nl='Gegrilde Uruguayaanse roastbeef met schilfers Grana en rucola.'), []),
  ('Cervo ai frutti rossi', 30, 0, dict(it='Filetto di cervo con salsa ai frutti rossi.', en='Venison fillet with red berry sauce.', de='Hirschfilet mit Waldbeerensauce.', sl='Jelenov file z omako iz rdečega sadja.', nl='Hertenfilet met saus van rood fruit.'), [9, 12]),
  ('Filetto di scottona di Bretagna', 34, 0, dict(it='Con tartufo e purè, oppure con purè e finocchietto.', en='With truffle and mash, or with mash and wild fennel.', de='Mit Trüffel und Püree oder mit Püree und wildem Fenchel.', sl='S tartufom in pirejem ali s pirejem in divjim koromačem.', nl='Met truffel en puree, of met puree en wilde venkel.'), [7, 9, 12]),
  ('Funghi del bosco', 20, 1, dict(it='Funghi dorati e croccanti con puntarelle e finocchio.', en='Golden, crunchy mushrooms with puntarelle and fennel.', de='Goldene, knusprige Pilze mit Puntarelle und Fenchel.', sl='Zlate in hrustljave gobe s puntarelle in koromačem.', nl='Goudbruine, knapperige paddenstoelen met puntarelle en venkel.'), [1, 3, 9, 12]),
 ],
 'contorni': [
  ('Patate in tecia', 6, 0, dict(it='Patate in padella con cipolla, dorate e croccanti.', en='Pan-fried potatoes with onion, golden and crispy.', de='Pfannenkartoffeln mit Zwiebeln, goldbraun und knusprig.', sl='Na ponvi pečen krompir s čebulo, zlat in hrustljav.', nl='Aardappelen uit de pan met ui, goudbruin en knapperig.'), [7]),
  ('Purè di patate', 6, 1, dict(it='Cremoso, con burro e latte.', en='Creamy, with butter and milk.', de='Cremig, mit Butter und Milch.', sl='Kremno, z maslom in mlekom.', nl='Romig, met boter en melk.'), [7]),
  ('Cicoria', 6, 1, dict(it='Cicoria di stagione, amarognola e appena piccante.', en='Seasonal chicory, slightly bitter and gently spicy.', de='Saisonale Chicorée, leicht bitter und mild pikant.', sl='Sezonska cikorija, rahlo grenka in nežno pikantna.', nl='Seizoenscichorei, licht bitter en een tikje pittig.'), []),
  ('Insalata autunnale', 6, 1, dict(it='Ingredienti di stagione, freschi e croccanti.', en='Seasonal ingredients, fresh and crunchy.', de='Saisonale Zutaten, frisch und knackig.', sl='Sezonske sestavine, sveže in hrustljave.', nl='Seizoensingrediënten, vers en knapperig.'), [8]),
  ('Kifeletti', 6, 1, dict(it='Mezzelune di patate, dorate e croccanti, come da tradizione.', en='Potato half-moons, golden and crispy, as tradition dictates.', de='Kartoffelhalbmonde, goldbraun und knusprig, wie es Tradition ist.', sl='Krompirjevi polmeseci, zlati in hrustljavi, kot zahteva tradicija.', nl='Aardappelhalvemaantjes, goudbruin en knapperig, zoals de traditie het wil.'), [1, 3, 7]),
 ],
 'dolci': [
  ('Tiramisù', 6, 1, dict(it='Savoiardi al caffè, crema al mascarpone e cacao.', en='Coffee-soaked ladyfingers, mascarpone cream and cocoa.', de='Löffelbiskuits mit Kaffee, Mascarponecreme und Kakao.', sl='Piškoti s kavo, mascarpone krema in kakav.', nl='Lange vingers met koffie, mascarponecrème en cacao.'), [1, 3, 7]),
  ('Pannacotta', 7, 1, dict(it='Al vino Terrano con amaretti croccanti.', en='With Terrano wine and crunchy amaretti.', de='Mit Terrano-Wein und knusprigen Amaretti.', sl='Z vinom Teran in hrustljavimi amaretti.', nl='Met Terrano-wijn en knapperige amaretti.'), [7, 8, 12]),
  ('Strudel di mele', 6, 1, dict(it='Mele, uvetta e cannella, servito tiepido.', en='Apples, raisins and cinnamon, served warm.', de='Äpfel, Rosinen und Zimt, lauwarm serviert.', sl='Jabolka, rozine in cimet, postreženo toplo.', nl='Appels, rozijnen en kaneel, lauw geserveerd.'), [1, 3, 7, 8]),
  ('Lingotto Rocher', 6, 1, dict(it='Ispirato al celebre cioccolatino, con panna e coulis di cioccolato.', en='Inspired by the famous chocolate, with cream and chocolate coulis.', de='Inspiriert von der berühmten Praline, mit Sahne und Schokoladencoulis.', sl='Navdihnjen z znano čokoladno bombonico, s smetano in čokoladnim kulijem.', nl='Geïnspireerd op de beroemde bonbon, met slagroom en chocoladecoulis.'), [1, 3, 7, 8]),
 ],
}
GRP = {'antipasti': dict(it='Antipasti', en='Starters', de='Vorspeisen', sl='Predjedi', nl='Voorgerechten'),
       'primi': dict(it='Primi', en='First courses', de='Erste Gänge', sl='Prve jedi', nl='Eerste gerechten'),
       'secondi': dict(it='Secondi', en='Main courses', de='Hauptgänge', sl='Glavne jedi', nl='Hoofdgerechten'),
       'contorni': dict(it='Contorni', en='Sides', de='Beilagen', sl='Priloge', nl='Bijgerechten'),
       'dolci': dict(it='Dolci', en='Desserts', de='Desserts', sl='Sladice', nl='Desserts')}
# 1) piatti
for sec, dishes in M.items():
    m = re.search(r'(<section class="course" id="%s">.*?<div class="dishes">)(.*?)(</div></section>)' % sec, h, re.S)
    assert m, sec
    body = ''.join('<div class="dish"><div class="dh"><h3 lang="it">%s%s</h3><span class="pr">€&nbsp;%d</span></div><p>%s</p></div>' % (n.replace("'", '’') if False else n, VEG if v else '', p, T(d)) for n, p, v, d, a in dishes)
    h = h[:m.start(2)] + body + h[m.end(2):]
# 2) allergeni (tbody)
def dot(on): return '<td><i class="dt" role="img" aria-label="contiene"></i></td>' if on else '<td></td>'
rows = ''
for sec, dishes in M.items():
    rows += '<tr class="grp"><th colspan="15" scope="colgroup">%s</th></tr>' % T(GRP[sec])
    for n, p, v, d, a in dishes:
        rows += '<tr><th scope="row" lang="it">%s</th>%s</tr>' % (n, ''.join(dot(i in a) for i in range(1, 15)))
m = re.search(r'(<tbody>)(.*?)(</tbody>)', h, re.S); assert m
h = h[:m.start(2)] + rows + h[m.end(2):]
# 3) date
for a, b in [('Aggiornato al 30 ottobre 2026', 'Aggiornato al 6 novembre 2026'), ('Updated on 30 October 2026', 'Updated on 6 November 2026'),
             ('Bijgewerkt op 30 oktober 2026', 'Bijgewerkt op 6 november 2026'), ('Stand: 30. Oktober 2026', 'Stand: 6. November 2026'),
             ('Posodobljeno 30. oktobra 2026', 'Posodobljeno 6. novembra 2026')]:
    h = h.replace(a, b)
# 4) pulsanti PDF
BTN = ('<div class="btns" style="margin-top:1.5rem" id="pdfmenu"><a class="btn fill" href="menu-dvor.pdf" download><span class="it" lang="it">Scarica il menù (PDF)</span><span class="en" lang="en">Download the menu (PDF)</span><span class="de" lang="de">Speisekarte herunterladen (PDF)</span><span class="sl" lang="sl">Prenesi jedilnik (PDF)</span><span class="nl" lang="nl">Download het menu (PDF)</span></a>'
       '<a class="btn" href="allergeni-dvor.pdf" download><span class="it" lang="it">Scarica gli allergeni (PDF)</span><span class="en" lang="en">Download the allergens (PDF)</span><span class="de" lang="de">Allergene herunterladen (PDF)</span><span class="sl" lang="sl">Prenesi alergene (PDF)</span><span class="nl" lang="nl">Download de allergenen (PDF)</span></a></div>')
h = re.sub(r'<div class="btns"[^>]*id="pdfmenu">.*?</div>', '', h, flags=re.S)
i = h.index('<h1><span class="it" lang="it">Il menù</span>'); j = h.index('</p>', i) + 4; j = h.index('</p>', j) + 4
h = h[:j] + BTN + h[j:]
open(P, 'w', encoding='utf8').write(h)
print('ok')
