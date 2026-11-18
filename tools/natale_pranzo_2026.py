# Aggiunge a site/pranzi-cene-di-natale.html la sezione "Pranzo di Natale 2026" (menu del 25 dicembre). Idempotente.
import re
P = 'site/pranzi-cene-di-natale.html'
h = open(P, encoding='utf8').read()
if 'id="pranzo-natale"' in h: raise SystemExit('gia presente')
L = ['it', 'en', 'de', 'sl', 'nl']
def T(*d): return ''.join('<span class="%s" lang="%s">%s</span>' % (l, l, x) for l, x in zip(L, d))
VG = re.search(r'<svg class="vg".*?</svg>', open('site/menu.html', encoding='utf8').read(), re.S).group(0)
def dish(n, d, v=False): return '<div class="pn-d"><h4>%s%s</h4><p>%s</p></div>' % (n, VG if v else '', d)
def course(t, *ds): return '<div class="pn-c"><h3>%s</h3>%s</div>' % (t, ''.join(ds))
M = []
M.append('<div class="pn-c pn-ap"><h3>' + T('Aperitivo di benvenuto', 'Welcome aperitif', 'Willkommensaperitif', 'Aperitiv dobrodošlice', 'Welkomstaperitief') + '</h3><p>' +
  T('Spuma di salmone in un cestino croccante', 'Salmon mousse in a crispy basket', 'Lachsmousse im knusprigen Körbchen', 'Lososova pena v hrustljavi košarici', 'Zalmmousse in een knapperig mandje') +
  '</p><span class="pn-pill">' + T('con un calice di bollicine', 'with a glass of sparkling wine', 'mit einem Glas Schaumwein', 's kozarcem penečega vina', 'met een glas bubbels') + '</span></div>')
M.append(course(T('Antipasti', 'Starters', 'Vorspeisen', 'Predjedi', 'Voorgerechten'),
  dish(T('Vitello tonnato', 'Vitello tonnato', 'Vitello tonnato', 'Vitello tonnato', 'Vitello tonnato'),
       T('Cotto a bassa temperatura, con maionese fatta in casa e il suo fondo', 'Cooked at low temperature, with homemade mayonnaise and its own juices', 'Bei niedriger Temperatur gegart, mit hausgemachter Mayonnaise und eigenem Fond', 'Počasi kuhano pri nizki temperaturi, z domačo majonezo in svojim sokom', 'Op lage temperatuur gegaard, met huisgemaakte mayonaise en eigen jus')),
  dish(T('Flan di topinambur', 'Jerusalem artichoke flan', 'Topinambur-Flan', 'Flan iz topinamburja', 'Flan van aardpeer'),
       T('Con radicchio, fonduta e noci', 'With radicchio, cheese fondue and walnuts', 'Mit Radicchio, Käsefondue und Walnüssen', 'Z radičem, sirovo fondujo in orehi', 'Met radicchio, kaasfondue en walnoten'), True)))
M.append(course(T('Primi', 'First courses', 'Erste Gänge', 'Prve jedi', 'Eerste gangen'),
  dish(T('Žlikrofi', 'Žlikrofi', 'Žlikrofi', 'Žlikrofi', 'Žlikrofi'),
       T('Con noci e pancetta D’Osvaldo', 'With walnuts and D’Osvaldo pancetta', 'Mit Walnüssen und Pancetta von D’Osvaldo', 'Z orehi in pancetto D’Osvaldo', 'Met walnoten en pancetta van D’Osvaldo')),
  dish(T('Risotto alla barbabietola', 'Beetroot risotto', 'Rote-Bete-Risotto', 'Rižota iz rdeče pese', 'Risotto met rode biet'),
       T('Con formaggio Frant e nocciole', 'With Frant cheese and hazelnuts', 'Mit Frant-Käse und Haselnüssen', 'S sirom Frant in lešniki', 'Met Frant-kaas en hazelnoten'), True)))
M.append('<div class="pn-c pn-ap"><h3>' + T('Sorbetto melagrana e limone', 'Pomegranate and lemon sorbet', 'Sorbet aus Granatapfel und Zitrone', 'Sorbet iz granatnega jabolka in limone', 'Sorbet van granaatappel en citroen') + '</h3><p>' +
  T('Una dolce pausa tra i primi e il secondo', 'A sweet pause between the first courses and the main course', 'Eine süße Pause zwischen den ersten Gängen und dem Hauptgang', 'Sladek premor med prvimi jedmi in glavno jedjo', 'Een zoete pauze tussen de eerste gangen en het hoofdgerecht') + '</p></div>')
M.append(course(T('Secondo', 'Main course', 'Hauptgang', 'Glavna jed', 'Hoofdgerecht'),
  dish(T('Faraona all’arancia', 'Guinea fowl with orange', 'Perlhuhn mit Orange', 'Pegatka z pomarančo', 'Parelhoen met sinaasappel'),
       T('Con salsa all’arancia e patate al forno', 'With orange sauce and roast potatoes', 'Mit Orangensauce und Ofenkartoffeln', 'Z pomarančno omako in pečenim krompirjem', 'Met sinaasappelsaus en aardappels uit de oven'))))
M.append(course(T('Dolce', 'Dessert', 'Dessert', 'Sladica', 'Dessert'),
  dish(T('Dolce natalizio a sorpresa', 'Surprise Christmas dessert', 'Weihnachtliches Überraschungsdessert', 'Božična sladica presenečenja', 'Verrassingsdessert voor Kerst'),
       T('Dalla creatività dello chef', 'From the chef’s creativity', 'Aus der Kreativität des Küchenchefs', 'Iz ustvarjalnosti kuharskega mojstra', 'Uit de creativiteit van de chef'))))
pk = ('<div class="pn-pk"><div><h3>' + T('Menù adulti', 'Adults’ menu', 'Menü für Erwachsene', 'Meni za odrasle', 'Menu volwassenen') + '</h3><p>' +
      T('Aperitivo, antipasti, primi, sorbetto, secondo e dolce', 'Aperitif, starters, first courses, sorbet, main course and dessert', 'Aperitif, Vorspeisen, erste Gänge, Sorbet, Hauptgang und Dessert', 'Aperitiv, predjedi, prve jedi, sorbet, glavna jed in sladica', 'Aperitief, voorgerechten, eerste gangen, sorbet, hoofdgerecht en dessert') +
      '</p><b>€&nbsp;65</b><small>' + T('a persona · bevande escluse', 'per person · drinks not included', 'pro Person · Getränke nicht inbegriffen', 'na osebo · pijača ni vključena', 'per persoon · exclusief drankjes') + '</small></div>'
      '<div><h3>' + T('Menù bimbi', 'Children’s menu', 'Kindermenü', 'Otroški meni', 'Kindermenu') + '</h3><p>' +
      T('Gnocchi al ragù · Salame di cioccolato<br>Ljubljanska fritta con patate', 'Gnocchi with ragù · Chocolate salami<br>Fried Ljubljana-style cutlet with potatoes', 'Gnocchi mit Ragù · Schokoladensalami<br>Frittiertes Ljubljana-Schnitzel mit Kartoffeln', 'Njoki z ragujem · Čokoladni salam<br>Ocvrta ljubljanska z krompirjem', 'Gnocchi met ragù · Chocoladesalami<br>Gefrituurde Ljubljana-schnitzel met aardappels') +
      '</p><b>€&nbsp;20</b><small>' + T('a bambino · bevande escluse', 'per child · drinks not included', 'pro Kind · Getränke nicht inbegriffen', 'na otroka · pijača ni vključena', 'per kind · exclusief drankjes') + '</small></div></div>')
veg = ('<p class="pn-veg">' + VG + '<span><b>' + T('Menù vegetariano', 'Vegetarian menu', 'Vegetarisches Menü', 'Vegetarijanski meni', 'Vegetarisch menu') + '</b> ' +
       T('disponibile su richiesta e su prenotazione, con varianti del menù base.', 'available on request and by reservation, with variations on the base menu.', 'auf Anfrage und nach Reservierung erhältlich, mit Varianten des Grundmenüs.', 'na voljo na željo in ob rezervaciji, z različicami osnovnega menija.', 'beschikbaar op aanvraag en na reservering, met varianten van het basismenu.') + '</span></p>')
leg = ('<p class="pn-leg">' + VG + ' ' + T('Piatto vegetariano · Per gli allergeni chiedere al personale di sala.', 'Vegetarian dish · Please ask our dining-room staff about allergens.', 'Vegetarisches Gericht · Bei Allergenen fragen Sie bitte unser Servicepersonal.', 'Vegetarijanska jed · Za alergene vprašajte osebje v jedilnici.', 'Vegetarisch gerecht · Vraag voor allergenen het zaalpersoneel.') + '</p>')
btn = ('<div class="btns" style="justify-content:center"><a class="btn fill" href="prenota.html"><span class="it" lang="it">Prenota il pranzo di Natale</span><span class="en" lang="en">Book Christmas lunch</span>'
       '<span class="de" lang="de">Weihnachtsessen reservieren</span><span class="sl" lang="sl">Rezervirajte božično kosilo</span><span class="nl" lang="nl">Reserveer de kerstlunch</span></a></div>')
css = ('<style>#pranzo-natale .pn{max-width:760px;margin:0 auto;text-align:center}#pranzo-natale h2{margin:.4rem 0 .3rem}'
       '#pranzo-natale .pn-when{font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin:0 0 2rem}'
       '#pranzo-natale .pn-c{margin:0 0 1.6rem}#pranzo-natale .pn-c>h3{font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--gold);margin:0 0 .8rem}'
       '#pranzo-natale .pn-ap>h3{font-size:1.3rem;letter-spacing:0;text-transform:none;font-style:italic}#pranzo-natale .pn-d{margin:0 0 .9rem}'
       '#pranzo-natale h4{margin:0;font-size:1.15rem;font-weight:600}#pranzo-natale .pn-c p,#pranzo-natale .pn-d p{margin:.15rem 0 0;color:var(--muted)}'
       '#pranzo-natale .vg{width:.8em;height:.8em;margin-left:.45rem;vertical-align:-.04em}'
       '#pranzo-natale .pn-pill{display:inline-block;margin-top:.5rem;border:1px solid var(--gold);color:var(--gold);padding:.15rem .9rem;border-radius:99px;font-style:italic}'
       '#pranzo-natale .pn-pk{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;border-top:1px solid var(--gold);margin-top:2rem;padding-top:1.6rem}'
       '#pranzo-natale .pn-pk h3{margin:0 0 .4rem;font-size:1.2rem;font-style:italic}#pranzo-natale .pn-pk p{margin:0;color:var(--muted);font-size:.92rem}'
       '#pranzo-natale .pn-pk b{display:block;font-size:2rem;margin:.6rem 0 .1rem}#pranzo-natale .pn-pk small{color:var(--muted)}'
       '#pranzo-natale .pn-veg{margin:1.6rem 0 .8rem;padding:.8rem 1.1rem;border:1px solid var(--gold);display:flex;gap:.7rem;align-items:center;justify-content:center;text-align:left}'
       '#pranzo-natale .pn-leg{font-size:.8rem;color:var(--muted);margin:0 0 1.6rem}'
       '@media(max-width:620px){#pranzo-natale .pn-pk{grid-template-columns:1fr}}</style>')
sec = ('<section class="alt" id="pranzo-natale">' + css + '<div class="wrap"><div class="pn"><span class="tag">' + T('Natale 2026', 'Christmas 2026', 'Weihnachten 2026', 'Božič 2026', 'Kerst 2026') + '</span>'
       '<h2>' + T('Pranzo di Natale', 'Christmas lunch', 'Weihnachtsessen', 'Božično kosilo', 'Kerstlunch') + '</h2>'
       '<p class="pn-when">' + T('Venerdì 25 dicembre · ore 12:30', 'Friday 25 December · 12:30 pm', 'Freitag, 25. Dezember · 12:30 Uhr', 'Petek, 25. december · ob 12.30', 'Vrijdag 25 december · 12:30 uur') + '</p>'
       + ''.join(M) + pk + veg + leg + btn + '</div></div></section>\n')
a = '<section class="alt" id="natale">'
assert a in h
h = h.replace(a, sec + a, 1)
open(P, 'w', encoding='utf8').write(h); print('ok')
