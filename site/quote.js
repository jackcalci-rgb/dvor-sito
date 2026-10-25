/* Osteria Enoteca Dvor - calcolatore di preventivo indicativo (eventi + brunch)
   Tutti i prezzi si cambiano qui sotto, in PRICES. Testi in 5 lingue (it/en/de/sl/nl). */
(function () {
  'use strict';

  /* ============ PREZZI (modificabili) ============ */
  var PRICES = {
    menus: [45, 50, 60, 70],      // € a persona (minimo 45)
    kids: 15,                     // € bambino fino a 10 anni
    minAdults: 10,                // numero minimo adulti nel calcolatore
    wineHouseLitre: 15,           // € al litro, vino della casa
    wineHouseLitresPerAdult: 0.5, // litri a persona
    wineBottle: 30,               // € bottiglia (da)
    adultsPerBottle: 3,           // 1 bottiglia ogni N adulti
    cakeKg: 50,                   // € al kg
    cakeKgPerPerson: 0.15,        // kg a persona
    gazebo: 100,                  // € gazebo in giardino
    deposit: 0.5,                 // caparra
    brunchBuffet: [25, 30]        // € a persona, brunch a buffet
  };

  var LANGS = ['it', 'en', 'de', 'sl', 'nl'];
  function T(it, en, de, sl, nl) {
    var a = [it, en, de, sl, nl], s = '';
    for (var i = 0; i < 5; i++) s += '<span class="' + LANGS[i] + '" lang="' + LANGS[i] + '">' + a[i] + '</span>';
    return s;
  }
  function lang() { var l = document.documentElement.getAttribute('data-lang') || 'it'; return LANGS.indexOf(l) < 0 ? 'it' : l; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function eur(n) {
    var r = Math.round(n * 100) / 100;
    var s = r.toLocaleString('it-IT', { minimumFractionDigits: (r % 1 ? 2 : 0), maximumFractionDigits: 2 });
    return '€ ' + s;
  }
  function eur0(n) { return '€ ' + Math.round(n).toLocaleString('it-IT'); }
  function num(v, min, max) { var n = parseInt(v, 10); if (!isFinite(n)) n = 0; if (n < min) n = min; if (max && n > max) n = max; return n; }

  /* ============ Pezzi di interfaccia ============ */
  function stepper(id, val, min, max) {
    return '<div class="qt-step" data-for="' + id + '"><button type="button" data-d="-1" aria-label="-">−</button>' +
      '<input id="' + id + '" type="number" inputmode="numeric" min="' + min + '" max="' + max + '" value="' + val + '">' +
      '<button type="button" data-d="1" aria-label="+">+</button></div>';
  }
  function formHtml(p) {
    return '<form class="qt-form" id="' + p + '-form" novalidate>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
      '<h3>' + T('Invia la richiesta', 'Send your request', 'Anfrage senden', 'Pošljite povpraševanje', 'Verstuur je aanvraag') + '</h3>' +
      '<p class="qt-note">' + T('Ti rispondiamo con una proposta e il preventivo definitivo.', 'We will reply with a proposal and the final quote.', 'Wir antworten mit einem Vorschlag und dem endgültigen Angebot.', 'Odgovorili vam bomo s predlogom in dokončno ponudbo.', 'We antwoorden met een voorstel en de definitieve offerte.') + '</p>' +
      '<div class="qt-row2">' +
      '<label class="qt-fld"><span>' + T('Nome', 'Name', 'Name', 'Ime', 'Naam') + ' *</span><input name="name" type="text" autocomplete="name" required></label>' +
      '<label class="qt-fld"><span>Email *</span><input name="email" type="email" autocomplete="email" required></label>' +
      '<label class="qt-fld"><span>' + T('Telefono', 'Phone', 'Telefon', 'Telefon', 'Telefoon') + '</span><input name="phone" type="tel" autocomplete="tel"></label>' +
      '<label class="qt-fld"><span>' + T('Data desiderata', 'Preferred date', 'Wunschtermin', 'Želeni datum', 'Gewenste datum') + '</span><input name="date" type="text" placeholder="gg/mm/aaaa"></label>' +
      '</div>' +
      '<label class="qt-fld"><span>' + T('Note o richieste', 'Notes or requests', 'Anmerkungen oder Wünsche', 'Opombe ali želje', 'Opmerkingen of wensen') + '</span><textarea name="notes" rows="3"></textarea></label>' +
      '<label class="qt-chk"><input type="checkbox" name="consent" required><span>' + T('Acconsento al trattamento dei dati per rispondere alla richiesta (<a href="privacy.html">privacy</a>).', 'I agree to my data being used to answer this request (<a href="privacy.html">privacy</a>).', 'Ich willige in die Verarbeitung meiner Daten zur Beantwortung der Anfrage ein (<a href="privacy.html">Datenschutz</a>).', 'Soglašam z obdelavo podatkov za odgovor na povpraševanje (<a href="privacy.html">zasebnost</a>).', 'Ik ga akkoord met de verwerking van mijn gegevens om de aanvraag te beantwoorden (<a href="privacy.html">privacy</a>).') + '</span></label>' +
      '<p class="qt-msg qt-err" hidden>' + T('Compila nome, email e consenso.', 'Please fill in name, email and consent.', 'Bitte Name, E-Mail und Einwilligung ausfüllen.', 'Izpolnite ime, e-pošto in soglasje.', 'Vul naam, e-mail en toestemming in.') + '</p>' +
      '<p class="qt-msg qt-ok" hidden>' + T('Grazie! Richiesta inviata: ti risponderemo al più presto.', 'Thank you! Request sent: we will reply as soon as possible.', 'Danke! Anfrage gesendet: Wir antworten so bald wie möglich.', 'Hvala! Povpraševanje je poslano, odgovorili vam bomo čim prej.', 'Bedankt! Aanvraag verstuurd: we antwoorden zo snel mogelijk.') + '</p>' +
      '<p class="qt-msg qt-fail" hidden>' + T('Invio non riuscito. Scrivici direttamente a', 'Sending failed. Please write to us at', 'Senden fehlgeschlagen. Schreiben Sie uns direkt an', 'Pošiljanje ni uspelo. Pišite nam na', 'Verzenden mislukt. Schrijf ons rechtstreeks op') + ' <a class="qt-fb" href="mailto:info@osteriadvor.com">info@osteriadvor.com</a></p>' +
      '<div class="qt-btns"><button type="submit" class="qt-btn fill">' + T('Invia richiesta', 'Send request', 'Anfrage senden', 'Pošlji povpraševanje', 'Aanvraag versturen') + '</button>' +
      '<button type="button" class="qt-btn qt-print">' + T('Stampa / salva PDF', 'Print / save PDF', 'Drucken / PDF speichern', 'Natisni / shrani PDF', 'Afdrukken / pdf opslaan') + '</button></div>' +
      '</form>';
  }
  var DISCLAIMER = T(
    'Stima indicativa e non vincolante: il preventivo definitivo viene confermato da noi in base a menù, orari e disponibilità. Caffè, amari e bevande non indicate sono esclusi.',
    'Indicative, non-binding estimate: the final quote is confirmed by us based on menu, times and availability. Coffee, digestifs and drinks not listed are not included.',
    'Unverbindliche Richtpreise: Das endgültige Angebot bestätigen wir nach Menü, Uhrzeit und Verfügbarkeit. Kaffee, Digestifs und nicht aufgeführte Getränke sind nicht enthalten.',
    'Okvirna in nezavezujoča ocena: dokončno ponudbo potrdimo glede na jedilnik, ure in razpoložljivost. Kava, žgane pijače in nenavedene pijače niso vključene.',
    'Indicatieve, vrijblijvende schatting: de definitieve offerte bevestigen wij op basis van menu, tijden en beschikbaarheid. Koffie, digestieven en niet genoemde dranken zijn niet inbegrepen.');

  /* ============ Invio (contact.php) ============ */
  function wireForm(root, prefix, reasonLabel, getSummary, getGuests) {
    var f = root.querySelector('#' + prefix + '-form');
    if (!f) return;
    var t0 = Date.now(), busy = false;
    var err = f.querySelector('.qt-err'), ok = f.querySelector('.qt-ok'), fail = f.querySelector('.qt-fail'), fb = f.querySelector('.qt-fb');
    f.querySelector('.qt-print').addEventListener('click', function () { window.print(); });
    f.addEventListener('submit', function (e) {
      e.preventDefault(); if (busy) return;
      var g = function (n) { return (f.elements[n].value || '').trim(); };
      var good = g('name') && /^\S+@\S+\.\S+$/.test(g('email')) && f.elements.consent.checked;
      err.hidden = !!good; ok.hidden = true; fail.hidden = true;
      if (!good) { (g('name') ? (/^\S+@\S+\.\S+$/.test(g('email')) ? f.elements.consent : f.elements.email) : f.elements.name).focus(); return; }
      var msg = reasonLabel + ' (preventivo indicativo dal sito)\n\n' + getSummary() + (g('notes') ? '\n\nNote del cliente:\n' + g('notes') : '');
      var fd = new FormData();
      fd.append('reason', 'event'); fd.append('lang', lang());
      fd.append('name', g('name')); fd.append('email', g('email')); fd.append('phone', g('phone'));
      fd.append('date', g('date')); fd.append('guests', String(getGuests())); fd.append('message', msg);
      fd.append('website', f.elements.website.value); fd.append('t', String(t0));
      var btn = f.querySelector('button[type=submit]'); busy = true; btn.disabled = true;
      var mail = function () { fb.href = 'mailto:info@osteriadvor.com?subject=' + encodeURIComponent(reasonLabel) + '&body=' + encodeURIComponent(g('name') + ' - ' + g('email') + '\n\n' + msg); fail.hidden = false; };
      fetch('contact.php', { method: 'POST', body: fd, credentials: 'same-origin' })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (j) { if (j && j.ok) { ok.hidden = false; } else { mail(); } })
        .catch(mail)
        .then(function () { busy = false; btn.disabled = false; });
    });
  }

  function bindSteppers(root, onchange) {
    root.addEventListener('click', function (e) {
      var b = e.target.closest('.qt-step button'); if (!b) return;
      var inp = document.getElementById(b.parentNode.getAttribute('data-for'));
      var v = num(inp.value, 0) + parseInt(b.getAttribute('data-d'), 10);
      var min = parseInt(inp.min, 10) || 0, max = parseInt(inp.max, 10) || 9999;
      inp.value = Math.max(min, Math.min(max, v));
      onchange();
    });
  }


  /* ============ PORTATE (nomi dei piatti in italiano; non cambiano il prezzo indicativo) ============ */
  var TAG = 'Tagliere di salumi e formaggi (prosciutto di San Daniele e formaggi)';
  var APER = ['Pancetta cotta nel pane con kren', 'Frico croccante', 'Toc in braide', 'Pollo in tempura', 'Polpettine', 'Frichetti', 'Frittatine', 'Lecca lecca di frico', 'Frico fritto', 'Pulled pork con insalatina di cavoli', 'Zucchine e melanzane fritte'];
  var SORB = ['Sorbetto al limone e menta', 'Sorbetto al limone e fragola', 'Sorbetto di limone e zenzero', 'Sorbetto alcolico', 'Sorbetto analcolico'];
  var LISTS = {
    45: {
      aperitivo: [],
      antipasti: [TAG, 'Polpettine', 'Frittatine', 'Lecca lecca di frico', 'Carpaccio di manzo', 'Lonza marinata con salsa carpione', 'Flan di verdure di stagione con fonduta di formaggi', 'Kipfel di patate con maionese al tartufo'],
      primi: ['Pasticcio tradizionale', 'Orzotto di verdure di stagione', 'Gnocchi con sugo di arrosto', 'Pasticcio di verdure', 'Pasta corta al ragù di cinghiale', 'Crespelle con asparagi', 'Parmigiana di melanzane', 'Orzotto con salsiccia e radicchio'],
      secondi: ['Ljubljanska alla griglia', 'Stinco di maiale al forno con polenta', 'Goulash di manzo', 'Grigliata mista (čevapčiči, spiedini, tagliata di manzo, pollo)'],
      contorni: ['Patate al forno', 'Insalata mista', 'Verdure grigliate', 'Patate in tecia', 'Kipfel'],
      sorbetto: [],
      dessert: ['Tortino di frutta di stagione', 'Pannacotta', 'Sorbetto analcolico']
    },
    50: {
      aperitivo: APER,
      antipasti: [TAG, 'Frittatine', 'Frico fritto', 'Carpaccio di bresaola', 'Carpaccio di manzo', 'Polpettine', 'Lonza marinata con salsa carpione e kren', 'Kipfel di patate con maionese al tartufo', 'Flan di erbette di campo con fonduta di formaggi e guanciale croccante', 'Flan di erbette di campo (vegano)', 'Pancetta cotta nel pane con kren', 'Tortino di zucca con fonduta di formaggio di malga', 'Pulled pork con insalatina di cavoli', 'Pollo in tempura', 'Toc in braide con funghi misti'],
      primi: ['Fusi Dvor con raguttino di pollo, zafferano e pistacchio', 'Gnocchi con sugo di arrosto', 'Gnocchi con goulash', 'Pasticcio tradizionale con fonduta di formaggi', 'Orzotto di frutti di mare', 'Orzotto con funghi porcini', 'Orzotto con salsiccia e radicchio', 'Crespelle con asparagi', 'Fuži istriani con ragù di cortile', 'Fuži istriani con ragù di San Daniele', 'Lasagna con ragù di salsiccia'],
      secondi: ['Goulash di manzo', 'Arrosto di vitello con funghi porcini', 'Guancette di manzo al refosco', 'Costicine di maiale sous vide', 'Lonza di maiale alla birra', 'Ljubljanska alla griglia', 'Stinco di maiale al forno con polenta', 'Grigliata mista (čevapčiči, spiedini, tagliata di manzo, pollo)', 'Filetto di maiale in crosta con prosciutto di San Daniele', 'Lingua alla Wellington con speck e senape', 'Scaloppa di sedano rapa in crosta di mais con vinaigrette di noci (vegetariano)', 'Tartare di barbabietola rossa (vegano)'],
      contorni: ['Contorni di stagione', 'Verdure grigliate', 'Patate al forno', 'Insalata mista', 'Verdure cotte', 'Spinaci al burro', 'Patate in tecia', 'Caponata'],
      sorbetto: SORB,
      dessert: ['Tortino di frutta di stagione', 'Pannacotta', 'Palačinke con Nutella o marmellata', 'Tiramisù', 'Torta alle mele', 'Torta rustica alle ciliegie', 'Torta rustica alle pere e cioccolato', 'Carsolina']
    },
    60: {
      aperitivo: APER,
      antipasti: ['Taglieri di salumi e formaggi di malga', 'Kipfel di patate con maionese al tartufo', 'Pomodori ripieni gratinati', 'Lonza marinata con salsa carpione e kren', 'Salmone marinato al pepe rosa', 'Flan di erbette di campo'],
      primi: ['Fusi istriani al tartufo nero e gamberoni', 'Crespelle di verdure di stagione', 'Pasticcio tradizionale con fonduta di formaggi', 'Orzotto di frutti di mare', 'Risotto con crema di zafferano rosso'],
      secondi: ['Rollè di tacchino', 'Guancette di manzo al refosco', 'Filetto di maiale al pepe verde', 'Costicine di agnello alla griglia'],
      contorni: ['Verdure cotte', 'Kipfel', 'Patate in tecia', 'Verdure grigliate', 'Patate al forno', 'Insalata mista', 'Spinaci al burro'],
      sorbetto: SORB,
      dessert: ['Tortino di frutta di stagione', 'Pannacotta', 'Tortino di cioccolato dal cuore morbido', 'Tiramisù']
    }
  };
  // Menù 70: stessa base del 60 + proposte più ricercate (Gaspare 65 e 75 del gestionale)
  LISTS[70] = {};
  var COURSE_ORDER_KEYS = ['aperitivo', 'antipasti', 'primi', 'secondi', 'contorni', 'sorbetto', 'dessert'];
  COURSE_ORDER_KEYS.forEach(function (c) { LISTS[70][c] = LISTS[60][c].slice(); });
  LISTS[70].antipasti = LISTS[70].antipasti.concat(['Carpaccio di vitello con pesche di Fiumicello e salsa carpione', 'Tortino di verdure con fonduta di formaggi di malga', 'Insalata di piovra con patate, olive e pomodorini', 'Trittico di sardoni impanati e in savor', 'Salmone marinato su finocchio crudo con salsa alla birra e senape']);
  LISTS[70].primi = LISTS[70].primi.concat(['Gnocchi alla griglia con pomodorini confit, verdure croccanti e pesto di basilico', 'Caponata con gamberi e zucchine al profumo di zafferano', 'Paccheri allo scoglio con il pescato del giorno']);
  LISTS[70].secondi = LISTS[70].secondi.concat(['Filetto di maiale in crosta con prosciutto di San Daniele, salsa di senape e birra', 'Tortino di branzino con spinaci all’olio evo e scampo, con la sua salsa', 'Turbante di branzino']);
  var MAXP = { 45: { aperitivo: 3, antipasti: 3, primi: 2, secondi: 2, contorni: 2, sorbetto: 1, dessert: 2 }, 50: { aperitivo: 3, antipasti: 3, primi: 2, secondi: 2, contorni: 3, sorbetto: 1, dessert: 2 }, 60: { aperitivo: 3, antipasti: 3, primi: 2, secondi: 2, contorni: 4, sorbetto: 1, dessert: 2 } };
  MAXP[70] = MAXP[60];
  var COURSE_ORDER = ['aperitivo', 'antipasti', 'primi', 'secondi', 'contorni', 'sorbetto', 'dessert'];
  var COURSE_TITLE = {
    aperitivo: [T('Aperitivo di benvenuto', 'Welcome aperitif', 'Willkommensaperitif', 'Pozdravni aperitiv', 'Welkomstaperitief'), 'Aperitivo'],
    antipasti: [T('Antipasti', 'Starters', 'Vorspeisen', 'Predjedi', 'Voorgerechten'), 'Antipasti'],
    primi: [T('Primi', 'First courses', 'Erste Gänge', 'Prve jedi', 'Eerste gangen'), 'Primi'],
    secondi: [T('Secondi', 'Main courses', 'Hauptgänge', 'Glavne jedi', 'Hoofdgerechten'), 'Secondi'],
    contorni: [T('Contorni', 'Sides', 'Beilagen', 'Priloge', 'Bijgerechten'), 'Contorni'],
    sorbetto: [T('Sorbetto', 'Sorbet', 'Sorbet', 'Sorbet', 'Sorbet'), 'Sorbetto'],
    dessert: [T('Dessert', 'Dessert', 'Dessert', 'Sladica', 'Dessert'), 'Dessert']
  };
  var UPTO = T('scegli fino a', 'choose up to', 'bis zu', 'izberite do', 'kies maximaal');

  /* ============ EVENTI ============ */
  var EVENTS = [
    ['matrimonio', 'Matrimonio', T('Matrimonio', 'Wedding', 'Hochzeit', 'Poroka', 'Bruiloft')],
    ['battesimo', 'Battesimo / Comunione / Cresima', T('Battesimo, comunione, cresima', 'Baptism, communion, confirmation', 'Taufe, Kommunion, Firmung', 'Krst, obhajilo, birma', 'Doop, communie, vormsel')],
    ['festa', 'Compleanno / Laurea / Anniversario / Festa privata', T('Compleanno, laurea, festa privata', 'Birthday, graduation, private party', 'Geburtstag, Abschluss, private Feier', 'Rojstni dan, diploma, zasebna zabava', 'Verjaardag, afstuderen, privéfeest')],
    ['aziendale', 'Cena / Pranzo aziendale', T('Cena o pranzo aziendale', 'Company dinner or lunch', 'Firmenessen', 'Poslovna večerja ali kosilo', 'Bedrijfsdiner of -lunch')],
    ['altro', 'Altro evento', T('Altro evento', 'Other event', 'Andere Veranstaltung', 'Drug dogodek', 'Ander evenement')]
  ];
  var MENUNAME = {
    45: T('Essenziale', 'Essential', 'Essenziell', 'Osnovni', 'Essentieel'),
    50: T('Classico', 'Classic', 'Klassisch', 'Klasični', 'Klassiek'),
    60: T('Completo', 'Complete', 'Komplett', 'Popolni', 'Compleet'),
    70: T('Superiore', 'Superior', 'Gehoben', 'Vrhunski', 'Superieur')
  };

  function initEvents(root) {
    var h = '<div class="qt-grid"><div class="qt-main">';
    h += '<fieldset class="qt-set"><legend><b>1</b>' + T('Che evento è?', 'What is the event?', 'Welche Veranstaltung?', 'Kakšen dogodek je?', 'Welk evenement is het?') + '</legend><div class="qt-chips">';
    EVENTS.forEach(function (e, i) { h += '<label class="qt-chip"><input type="radio" name="ev-type" value="' + e[0] + '"' + (i === 2 ? ' checked' : '') + '><span>' + e[2] + '</span></label>'; });
    h += '</div></fieldset>';
    h += '<fieldset class="qt-set"><legend><b>2</b>' + T('Quanti ospiti?', 'How many guests?', 'Wie viele Gäste?', 'Koliko gostov?', 'Hoeveel gasten?') + '</legend><div class="qt-two">' +
      '<div class="qt-lbl"><span>' + T('Adulti', 'Adults', 'Erwachsene', 'Odrasli', 'Volwassenen') + '</span>' + stepper('ev-ad', 30, PRICES.minAdults, 300) + '</div>' +
      '<div class="qt-lbl"><span>' + T('Bambini fino a 10 anni', 'Children up to 10', 'Kinder bis 10 Jahre', 'Otroci do 10 let', 'Kinderen tot 10 jaar') + ' <i>(' + eur0(PRICES.kids) + ')</i></span>' + stepper('ev-kd', 0, 0, 100) + '</div></div></fieldset>';
    h += '<fieldset class="qt-set"><legend><b>3</b>' + T('Scegli il menù', 'Choose the menu', 'Menü wählen', 'Izberite jedilnik', 'Kies het menu') + '</legend><div class="qt-cards">';
    PRICES.menus.forEach(function (p, i) {
      h += '<label class="qt-card"><input type="radio" name="ev-menu" value="' + p + '"' + (i === 1 ? ' checked' : '') + '><span class="qt-cb"><strong>' + eur0(p) + '</strong><em>' + MENUNAME[p] + '</em><small>' + T('a persona', 'per person', 'pro Person', 'na osebo', 'per persoon') + '</small></span></label>';
    });
    h += '</div><p class="qt-note">' + T('Cucina friulana e di confine con prodotti del Collio. Il dettaglio dei piatti lo definiamo insieme a te, in base al menù scelto e alla stagione.', 'Friulian and border cuisine with Collio produce. We define the dishes together with you, based on the menu and the season.', 'Friulanische Grenzküche mit Produkten aus dem Collio. Die Gerichte legen wir gemeinsam mit Ihnen fest, je nach Menü und Saison.', 'Furlanska in obmejna kuhinja z lokalnimi pridelki. Jedi določimo skupaj z vami glede na jedilnik in sezono.', 'Friulaanse grenskeuken met producten uit de Collio. De gerechten bepalen we samen met jou, afhankelijk van menu en seizoen.') + '</p></fieldset>';
    h += '<fieldset class="qt-set"><legend><b>4</b>' + T('Scegli le portate', 'Choose the courses', 'Gänge wählen', 'Izberite jedi', 'Kies de gangen') + '</legend><p class="qt-note" style="margin:0 0 1rem">' + T('Facoltativo: indica i piatti che preferisci. Le scelte non cambiano il prezzo indicativo e la composizione definitiva la concordiamo insieme. I nomi dei piatti sono in italiano: se hai dubbi, ti aiutiamo volentieri.', 'Optional: tell us the dishes you prefer. Choices do not change the indicative price and we agree the final selection together. Dish names are in Italian: happy to help if anything is unclear.', 'Optional: Teilen Sie uns Ihre Wunschgerichte mit. Die Auswahl ändert den Richtpreis nicht, die endgültige Zusammenstellung legen wir gemeinsam fest. Die Gerichte sind auf Italienisch benannt: Wir helfen gern weiter.', 'Neobvezno: povejte nam, katere jedi imate raje. Izbira ne spremeni okvirne cene, končno sestavo uskladimo skupaj. Imena jedi so v italijanščini: z veseljem pomagamo.', 'Optioneel: geef aan welke gerechten je het liefst hebt. De keuze verandert de indicatieve prijs niet en de definitieve samenstelling bepalen we samen. De gerechten hebben Italiaanse namen: we helpen graag.') + '</p><div id="ev-courses"></div></fieldset>';
    h += '<fieldset class="qt-set"><legend><b>5</b>' + T('Bevande', 'Drinks', 'Getränke', 'Pijače', 'Dranken') + '</legend><div class="qt-chips qt-col">' +
      '<label class="qt-chip"><input type="radio" name="ev-dr" value="none" checked><span>' + T('Le gestisco io / le scelgo con voi', 'I will arrange them / decide with you', 'Ich kümmere mich selbst / wir entscheiden gemeinsam', 'Uredim sam / se odločimo skupaj', 'Zelf regelen / samen beslissen') + '</span></label>' +
      '<label class="qt-chip"><input type="radio" name="ev-dr" value="house"><span>' + T('Vino della casa', 'House wine', 'Hauswein', 'Hišno vino', 'Huiswijn') + ' <i>(~' + PRICES.wineHouseLitresPerAdult + ' L ' + T('a adulto', 'per adult', 'pro Erwachsenem', 'na odraslega', 'per volwassene') + ', ' + eur0(PRICES.wineHouseLitre) + '/L)</i></span></label>' +
      '<label class="qt-chip"><input type="radio" name="ev-dr" value="bottles"><span>' + T('Vini in bottiglia', 'Bottled wines', 'Flaschenweine', 'Vino v steklenicah', 'Wijn op fles') + ' <i>(1 ' + T('bottiglia ogni', 'bottle every', 'Flasche pro', 'steklenica na', 'fles per') + ' ' + PRICES.adultsPerBottle + ' ' + T('adulti, da', 'adults, from', 'Erwachsene, ab', 'odrasle, od', 'volwassenen, vanaf') + ' ' + eur0(PRICES.wineBottle) + ')</i></span></label>' +
      '</div></fieldset>';
    h += '<fieldset class="qt-set"><legend><b>6</b>' + T('Extra', 'Extras', 'Extras', 'Dodatki', 'Extra') + '</legend><div class="qt-chips qt-col">' +
      '<label class="qt-chip"><input type="checkbox" id="ev-cake"><span>' + T('Torta', 'Cake', 'Torte', 'Torta', 'Taart') + ' <i>(' + (PRICES.cakeKgPerPerson * 1000) + ' g ' + T('a persona', 'per person', 'pro Person', 'na osebo', 'per persoon') + ', ' + eur0(PRICES.cakeKg) + '/kg)</i></span></label>' +
      '<label class="qt-chip"><input type="checkbox" id="ev-gz"><span>' + T('Giardino con gazebo', 'Garden with gazebo', 'Garten mit Pavillon', 'Vrt s paviljonom', 'Tuin met prieel') + ' <i>(+ ' + eur0(PRICES.gazebo) + ')</i></span></label>' +
      '</div></fieldset>';
    h += '</div>';
    h += '<aside class="qt-side"><div class="qt-sum"><span class="qt-cap">' + T('Prezzo indicativo', 'Indicative price', 'Richtpreis', 'Okvirna cena', 'Indicatieve prijs') + '</span>' +
      '<div class="qt-total" id="ev-total">–</div><div class="qt-pp" id="ev-pp"></div><ul class="qt-lines" id="ev-lines"></ul>' +
      '<div class="qt-picks" id="ev-picks"></div><div class="qt-dep" id="ev-dep"></div><p class="qt-small">' + DISCLAIMER + '</p></div></aside></div>';
    h += '<div class="qt-formwrap">' + formHtml('ev') + '</div>';
    root.innerHTML = h;

    var state = {};
    function calc() {
      var ad = num(document.getElementById('ev-ad').value, PRICES.minAdults, 300);
      var kd = num(document.getElementById('ev-kd').value, 0, 100);
      var menu = parseInt(root.querySelector('input[name=ev-menu]:checked').value, 10);
      var dr = root.querySelector('input[name=ev-dr]:checked').value;
      var cake = document.getElementById('ev-cake').checked, gz = document.getElementById('ev-gz').checked;
      var type = root.querySelector('input[name=ev-type]:checked').value;
      var L = [], total = 0;
      var m = menu * ad; total += m; L.push([T('Menù ' + menu + ' € × ' + ad + ' adulti', 'Menu ' + menu + ' € × ' + ad + ' adults', 'Menü ' + menu + ' € × ' + ad + ' Erwachsene', 'Jedilnik ' + menu + ' € × ' + ad + ' odraslih', 'Menu ' + menu + ' € × ' + ad + ' volwassenen'), m, 'Menù ' + menu + ' € × ' + ad + ' adulti']);
      if (kd) { var k = kd * PRICES.kids; total += k; L.push([T('Bambini ' + kd + ' × ' + PRICES.kids + ' €', 'Children ' + kd + ' × ' + PRICES.kids + ' €', 'Kinder ' + kd + ' × ' + PRICES.kids + ' €', 'Otroci ' + kd + ' × ' + PRICES.kids + ' €', 'Kinderen ' + kd + ' × ' + PRICES.kids + ' €'), k, 'Bambini ' + kd + ' × ' + PRICES.kids + ' €']); }
      if (dr === 'house') { var w = Math.round(ad * PRICES.wineHouseLitresPerAdult * PRICES.wineHouseLitre); total += w; L.push([T('Vino della casa (stima)', 'House wine (estimate)', 'Hauswein (Schätzung)', 'Hišno vino (ocena)', 'Huiswijn (schatting)'), w, 'Vino della casa (stima)']); }
      if (dr === 'bottles') { var nb = Math.ceil(ad / PRICES.adultsPerBottle), wb = nb * PRICES.wineBottle; total += wb; L.push([T('Vino in bottiglia: ' + nb + ' bott. da ' + PRICES.wineBottle + ' €', 'Bottled wine: ' + nb + ' bottles from ' + PRICES.wineBottle + ' €', 'Flaschenwein: ' + nb + ' Fl. ab ' + PRICES.wineBottle + ' €', 'Vino v steklenicah: ' + nb + ' steklenic od ' + PRICES.wineBottle + ' €', 'Wijn op fles: ' + nb + ' flessen vanaf ' + PRICES.wineBottle + ' €'), wb, 'Vino in bottiglia: ' + nb + ' bott. da ' + PRICES.wineBottle + ' €']); }
      if (cake) { var kg = (ad + kd) * PRICES.cakeKgPerPerson, c = Math.round(kg * PRICES.cakeKg); total += c; var kgs = (Math.round(kg * 10) / 10).toString().replace('.', ','); L.push([T('Torta (circa ' + kgs + ' kg)', 'Cake (about ' + kgs + ' kg)', 'Torte (ca. ' + kgs + ' kg)', 'Torta (približno ' + kgs + ' kg)', 'Taart (ongeveer ' + kgs + ' kg)'), c, 'Torta (circa ' + kgs + ' kg)']); }
      if (gz) { total += PRICES.gazebo; L.push([T('Giardino con gazebo', 'Garden with gazebo', 'Garten mit Pavillon', 'Vrt s paviljonom', 'Tuin met prieel'), PRICES.gazebo, 'Giardino con gazebo']); }
      state = { ad: ad, kd: kd, menu: menu, dr: dr, cake: cake, gz: gz, type: type, total: total, lines: L };
      document.getElementById('ev-total').innerHTML = T('circa ', 'about ', 'ca. ', 'približno ', 'ca. ') + eur0(total);
      document.getElementById('ev-pp').innerHTML = '≈ ' + eur0(total / (ad + kd)) + ' ' + T('a persona', 'per person', 'pro Person', 'na osebo', 'per persoon');
      document.getElementById('ev-lines').innerHTML = L.map(function (l) { return '<li><span>' + l[0] + '</span><b>' + eur0(l[1]) + '</b></li>'; }).join('');
      document.getElementById('ev-dep').innerHTML = T('Per confermare: caparra del ' + (PRICES.deposit * 100) + '% (circa ' + eur0(total * PRICES.deposit) + ').', 'To confirm: ' + (PRICES.deposit * 100) + '% deposit (about ' + eur0(total * PRICES.deposit) + ').', 'Zur Bestätigung: Anzahlung von ' + (PRICES.deposit * 100) + ' % (ca. ' + eur0(total * PRICES.deposit) + ').', 'Za potrditev: akontacija ' + (PRICES.deposit * 100) + ' % (približno ' + eur0(total * PRICES.deposit) + ').', 'Ter bevestiging: voorschot van ' + (PRICES.deposit * 100) + '% (ongeveer ' + eur0(total * PRICES.deposit) + ').');
    }

    var picks = {};
    function esc2(x) { return esc(x); }
    function renderCourses() {
      var menu = parseInt(root.querySelector('input[name=ev-menu]:checked').value, 10), L = LISTS[menu], mx = MAXP[menu], h2 = '';
      COURSE_ORDER.forEach(function (c) {
        if (!L[c].length) return;
        var sel = picks[c] || [];
        h2 += '<details class="qt-cat" data-c="' + c + '"' + (c === 'antipasti' ? ' open' : '') + '><summary>' + COURSE_TITLE[c][0] + ' <small class="qt-cnt"></small></summary><div class="qt-items"><p class="qt-note" style="margin:0 0 .6rem">' + UPTO + ' ' + mx[c] + '</p>';
        L[c].forEach(function (d, i) {
          h2 += '<label class="qt-dish"><input type="checkbox" data-c="' + c + '" data-i="' + i + '"' + (sel.indexOf(d) >= 0 ? ' checked' : '') + '><span>' + esc2(d) + '</span></label>';
        });
        h2 += '</div></details>';
      });
      document.getElementById('ev-courses').innerHTML = h2;
      limits();
    }
    function readPicks() {
      var menu = parseInt(root.querySelector('input[name=ev-menu]:checked').value, 10), L = LISTS[menu], o = {};
      [].forEach.call(root.querySelectorAll('#ev-courses input:checked'), function (cb) {
        var c = cb.getAttribute('data-c'); (o[c] = o[c] || []).push(L[c][parseInt(cb.getAttribute('data-i'), 10)]);
      });
      return o;
    }
    function limits() {
      var menu = parseInt(root.querySelector('input[name=ev-menu]:checked').value, 10), mx = MAXP[menu];
      COURSE_ORDER.forEach(function (c) {
        var boxes = root.querySelectorAll('#ev-courses input[data-c="' + c + '"]'); if (!boxes.length) return;
        var n = 0; [].forEach.call(boxes, function (b) { if (b.checked) n++; });
        [].forEach.call(boxes, function (b) { b.disabled = !b.checked && n >= mx[c]; });
        var d = root.querySelector('#ev-courses details[data-c="' + c + '"] .qt-cnt'); if (d) d.textContent = n ? '(' + n + '/' + mx[c] + ')' : '';
      });
    }
    renderCourses();
    root.addEventListener('change', function (e) {
      if (e.target.name === 'ev-menu') { prunePicks(); renderCourses(); showPicks(); }
      else if (e.target.closest && e.target.closest('#ev-courses')) { limits(); picks = readPicks(); showPicks(); }
    });
    function prunePicks() {
      var menu = parseInt(root.querySelector('input[name=ev-menu]:checked').value, 10), L = LISTS[menu], mx = MAXP[menu], o = {};
      COURSE_ORDER.forEach(function (c) {
        var k = (picks[c] || []).filter(function (d) { return L[c].indexOf(d) >= 0; }).slice(0, mx[c]);
        if (k.length) o[c] = k;
      });
      picks = o;
    }
    function showPicks() {
      var h3 = '';
      COURSE_ORDER.forEach(function (c) { if (picks[c] && picks[c].length) h3 += '<div class="qt-pk"><b>' + COURSE_TITLE[c][0] + '</b><br>' + picks[c].map(esc2).join(' · ') + '</div>'; });
      document.getElementById('ev-picks').innerHTML = h3 ? '<div class="qt-cap" style="margin:1rem 0 .4rem">' + T('Le tue scelte', 'Your choices', 'Ihre Auswahl', 'Vaša izbira', 'Jouw keuzes') + '</div>' + h3 : '';
    }
    root.addEventListener('input', calc); root.addEventListener('change', calc);
    bindSteppers(root, calc); calc();

    function typeLabel() { for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i][0] === state.type) return EVENTS[i][1]; return ''; }
    function summary() {
      var s = 'Tipo evento: ' + typeLabel() + '\nAdulti: ' + state.ad + '\nBambini: ' + state.kd + '\n\n';
      s += state.lines.map(function (l) { return '- ' + l[2] + ': ' + eur0(l[1]); }).join('\n');
      var pk = ''; COURSE_ORDER.forEach(function (c) { if (picks[c] && picks[c].length) pk += '\n' + COURSE_TITLE[c][1] + ': ' + picks[c].join('; '); });
      if (pk) s += '\n\nPORTATE SCELTE (menù ' + state.menu + ' €):' + pk;
      s += '\n\nTOTALE INDICATIVO: circa ' + eur0(state.total) + ' (caparra 50%: ' + eur0(state.total * PRICES.deposit) + ')';
      return s;
    }
    wireForm(root, 'ev', 'Richiesta preventivo evento', summary, function () { return state.ad + state.kd; });
  }

  /* ============ BRUNCH ============ */
  // [categoria, it, en, de, sl, nl, prezzo]  (prezzi del menu brunch)
  var CATS = {
    c1: T('Per cominciare', 'To start', 'Zum Start', 'Za začetek', 'Om mee te beginnen'),
    c2: T('French toast e pancakes', 'French toast and pancakes', 'French Toast und Pancakes', 'Francoski toast in palačinke', 'French toast en pannenkoekjes'),
    c3: 'Bagel',
    c4: T('Dall’orto', 'From the garden', 'Aus dem Garten', 'Z vrta', 'Uit de tuin'),
    c5: T('Uova', 'Eggs', 'Eier', 'Jajca', 'Eieren'),
    c6: T('Sapori di confine', 'Border flavours', 'Aromen der Grenze', 'Okusi ob meji', 'Smaken van de grens'),
    c7: T('Panini e burger', 'Sandwiches and burgers', 'Sandwiches und Burger', 'Sendviči in burgerji', 'Broodjes en burgers'),
    c8: T('Dolci', 'Sweets', 'Süßes', 'Sladko', 'Zoet'),
    c9: T('Caffetteria', 'Coffee and tea', 'Kaffee und Tee', 'Kava in čaj', 'Koffie en thee'),
    c10: T('Centrifugati', 'Juices', 'Säfte', 'Sokovi', 'Sappen'),
    c11: T('Breakfast cocktails', 'Breakfast cocktails', 'Breakfast Cocktails', 'Zajtrkovalni koktajli', 'Breakfast cocktails')
  };
  var BR = [
    ['c1', 'Patate dolci fritte con aioli all’aglio di Resia', 'Fried sweet potatoes with Resia garlic aioli', 'Frittierte Süßkartoffeln mit Resia-Knoblauch-Aioli', 'Ocvrt sladki krompir z aiolijem iz rezijanskega česna', 'Gefrituurde zoete aardappel met Resia-knoflookaioli', 6.5],
    ['c1', 'Frico croccante con salsa al cren', 'Crispy Montasio frico with horseradish sauce', 'Knuspriges Montasio-Frico mit Meerrettichsauce', 'Hrustljav frico iz Montasia s hrenovo omako', 'Krokante Montasio-frico met mierikswortelsaus', 7],
    ['c1', 'Polenta e pitina con ricotta affumicata', 'Toasted polenta with pitina and smoked ricotta', 'Geröstete Polenta mit Pitina und Räucherricotta', 'Popečena polenta s pitino in dimljeno rikoto', 'Geroosterde polenta met pitina en gerookte ricotta', 8],
    ['c2', 'French toast di gubana (2 pz)', 'Gubana French toast (2 pcs)', 'French Toast mit Gubana (2 Stk.)', 'Francoski toast z gubano (2 kosa)', 'French toast van gubana (2 st.)', 7],
    ['c2', 'Pancakes (3 pz)', 'Pancakes (3 pcs)', 'Pancakes (3 Stk.)', 'Ameriške palačinke (3 kosi)', 'Pancakes (3 st.)', 6],
    ['c2', 'Pancakes con cioccolato', 'Pancakes with chocolate', 'Pancakes mit Schokolade', 'Ameriške palačinke s čokolado', 'Pancakes met chocolade', 9],
    ['c2', 'Pancakes con salsa ai lamponi e panna', 'Pancakes with raspberry sauce and cream', 'Pancakes mit Himbeersauce und Sahne', 'Ameriške palačinke z malinovo omako in smetano', 'Pancakes met frambozensaus en slagroom', 9],
    ['c2', 'Pancakes con miele di acacia del Friuli', 'Pancakes with Friulian acacia honey', 'Pancakes mit friulanischem Akazienhonig', 'Ameriške palačinke z furlanskim akacijevim medom', 'Pancakes met Friulische acaciahoning', 8],
    ['c2', 'Pancakes con fragole', 'Pancakes with strawberries', 'Pancakes mit Erdbeeren', 'Ameriške palačinke z jagodami', 'Pancakes met aardbeien', 9],
    ['c3', 'Bagel Tasty (trota affumicata, avocado, uovo)', 'Bagel Tasty (smoked trout, avocado, egg)', 'Bagel Tasty (Räucherforelle, Avocado, Ei)', 'Bagel Tasty (dimljena postrv, avokado, jajce)', 'Bagel Tasty (gerookte forel, avocado, ei)', 11],
    ['c3', 'Bagel San Daniele (crudo, Montasio, rucola)', 'Bagel San Daniele (cured ham, Montasio, rocket)', 'Bagel San Daniele (Rohschinken, Montasio, Rucola)', 'Bagel San Daniele (pršut, Montasio, rukola)', 'Bagel San Daniele (rauwe ham, Montasio, rucola)', 11],
    ['c4', 'Caesar salad con pollo alla brace', 'Caesar salad with grilled chicken', 'Caesar Salad mit gegrilltem Hähnchen', 'Cezarjeva solata s piščancem z žara', 'Caesarsalade met gegrilde kip', 13],
    ['c4', 'Insalata di trota affumicata e avocado', 'Smoked trout and avocado salad', 'Salat mit Räucherforelle und Avocado', 'Solata z dimljeno postrvjo in avokadom', 'Salade met gerookte forel en avocado', 13],
    ['c5', 'Uova Traditional (pancetta, luganega, fagioli)', 'Traditional eggs (bacon, sausage, beans)', 'Eier Traditional (Speck, Wurst, Bohnen)', 'Jajca Traditional (panceta, klobasa, fižol)', 'Eieren Traditional (spek, worst, bonen)', 11.5],
    ['c5', 'Uova Benedict con San Daniele', 'Eggs Benedict with San Daniele ham', 'Eggs Benedict mit San-Daniele-Schinken', 'Jajca Benedict s pršutom San Daniele', 'Eggs Benedict met San Daniele-ham', 12],
    ['c5', 'Uova e frico con polenta', 'Eggs and frico with polenta', 'Eier und Frico mit Polenta', 'Jajca in frico s polento', 'Eieren en frico met polenta', 12],
    ['c6', 'Cjarsons con ricotta affumicata', 'Cjarsons with smoked ricotta', 'Cjarsons mit Räucherricotta', 'Cjarsons z dimljeno rikoto', 'Cjarsons met gerookte ricotta', 12],
    ['c6', 'Muset e brovada con uovo in camicia', 'Muset and brovada with poached egg', 'Muset und Brovada mit pochiertem Ei', 'Muset in brovada s poširanim jajcem', 'Muset en brovada met gepocheerd ei', 13],
    ['c6', 'Tagliere del Collio', 'Collio platter', 'Collio-Platte', 'Deska Collia', 'Collio-plank', 15],
    ['c7', 'Club sandwich con patate fritte', 'Club sandwich with fries', 'Club Sandwich mit Pommes', 'Club sendvič s pomfrijem', 'Clubsandwich met friet', 12],
    ['c7', 'Dvor burger (Angus 180 g) con patate', 'Dvor burger (Angus 180 g) with fries', 'Dvor Burger (Angus 180 g) mit Pommes', 'Dvor burger (Angus 180 g) s pomfrijem', 'Dvor burger (Angus 180 g) met friet', 16],
    ['c7', 'Frico burger (Angus 180 g) con patate', 'Frico burger (Angus 180 g) with fries', 'Frico Burger (Angus 180 g) mit Pommes', 'Frico burger (Angus 180 g) s pomfrijem', 'Frico burger (Angus 180 g) met friet', 19],
    ['c8', 'Yogurt con miele di castagno e noci', 'Yoghurt with chestnut honey and walnuts', 'Joghurt mit Kastanienhonig und Walnüssen', 'Jogurt s kostanjevim medom in orehi', 'Yoghurt met kastanjehoning en walnoten', 5],
    ['c8', 'Gubana', 'Gubana', 'Gubana', 'Gubana', 'Gubana', 5],
    ['c8', 'Gubana con grappa o Ramandolo', 'Gubana with grappa or Ramandolo', 'Gubana mit Grappa oder Ramandolo', 'Gubana z grapo ali Ramandolom', 'Gubana met grappa of Ramandolo', 8],
    ['c8', 'Cheesecake ai lamponi', 'Raspberry cheesecake', 'Himbeer-Cheesecake', 'Malinov cheesecake', 'Frambozencheesecake', 5],
    ['c9', 'Espresso', 'Espresso', 'Espresso', 'Espresso', 'Espresso', 1.5],
    ['c9', 'Doppio espresso', 'Double espresso', 'Doppelter Espresso', 'Dvojni espresso', 'Dubbele espresso', 3],
    ['c9', 'Cappuccino', 'Cappuccino', 'Cappuccino', 'Kapučino', 'Cappuccino', 2],
    ['c9', 'Latte macchiato', 'Latte macchiato', 'Latte macchiato', 'Latte macchiato', 'Latte macchiato', 3],
    ['c9', 'Caffè filtro (200 ml)', 'Filter coffee (200 ml)', 'Filterkaffee (200 ml)', 'Filtrirana kava (200 ml)', 'Filterkoffie (200 ml)', 3],
    ['c9', 'Caffè corretto grappa', 'Espresso with grappa', 'Espresso mit Grappa', 'Espresso z grapo', 'Espresso met grappa', 3],
    ['c9', 'Tè caldo o infuso', 'Hot tea or infusion', 'Heißer Tee oder Aufguss', 'Topel čaj ali poparek', 'Hete thee of kruideninfusie', 3],
    ['c10', 'Centrifugato Detox (mela, zenzero, sedano)', 'Detox juice (apple, ginger, celery)', 'Detox-Saft (Apfel, Ingwer, Sellerie)', 'Sok Detox (jabolko, ingver, zelena)', 'Detoxsap (appel, gember, selderij)', 6],
    ['c10', 'Centrifugato ACE (carota, arancia, limone)', 'ACE juice (carrot, orange, lemon)', 'ACE-Saft (Karotte, Orange, Zitrone)', 'Sok ACE (korenje, pomaranča, limona)', 'ACE-sap (wortel, sinaasappel, citroen)', 6],
    ['c10', 'Spremuta d’arancia', 'Fresh orange juice', 'Frisch gepresster Orangensaft', 'Sveže stisnjen pomarančni sok', 'Verse sinaasappelsap', 4],
    ['c11', 'Bacon old fashioned', 'Bacon old fashioned', 'Bacon Old Fashioned', 'Bacon old fashioned', 'Bacon old fashioned', 9],
    ['c11', 'Bloody Dvor', 'Bloody Dvor', 'Bloody Dvor', 'Bloody Dvor', 'Bloody Dvor', 9],
    ['c11', 'Sbagliato di Ribolla', 'Sbagliato di Ribolla', 'Sbagliato di Ribolla', 'Sbagliato di Ribolla', 'Sbagliato di Ribolla', 9],
    ['c11', 'Mimosa del Collio', 'Collio Mimosa', 'Collio-Mimosa', 'Mimoza iz Collia', 'Collio-mimosa', 8],
    ['c11', 'Spritz Furlan', 'Friulian Spritz', 'Friulanischer Spritz', 'Furlanski spritz', 'Friulische spritz', 8]
  ];

  function initBrunch(root) {
    var h = '<div class="qt-grid"><div class="qt-main">';
    h += '<fieldset class="qt-set"><legend><b>1</b>' + T('Come lo vuoi?', 'How would you like it?', 'Wie möchten Sie es?', 'Kako ga želite?', 'Hoe wil je het?') + '</legend><div class="qt-chips">' +
      '<label class="qt-chip"><input type="radio" name="br-mode" value="buffet" checked><span>' + T('Brunch a buffet', 'Buffet brunch', 'Brunch-Buffet', 'Brunch na bifeju', 'Brunchbuffet') + '</span></label>' +
      '<label class="qt-chip"><input type="radio" name="br-mode" value="carta"><span>' + T('Alla carta', 'À la carte', 'À la carte', 'Po jedilniku', 'À la carte') + '</span></label></div></fieldset>';
    h += '<fieldset class="qt-set"><legend><b>2</b>' + T('Quante persone?', 'How many people?', 'Wie viele Personen?', 'Koliko oseb?', 'Hoeveel personen?') + '</legend><div class="qt-two">' +
      '<div class="qt-lbl"><span>' + T('Adulti', 'Adults', 'Erwachsene', 'Odrasli', 'Volwassenen') + '</span>' + stepper('br-ad', 8, 1, 200) + '</div>' +
      '<div class="qt-lbl" id="br-kdwrap"><span>' + T('Bambini fino a 10 anni', 'Children up to 10', 'Kinder bis 10 Jahre', 'Otroci do 10 let', 'Kinderen tot 10 jaar') + ' <i>(' + eur0(PRICES.kids) + ')</i></span>' + stepper('br-kd', 0, 0, 100) + '</div></div></fieldset>';
    h += '<div id="br-buffet"><fieldset class="qt-set"><legend><b>3</b>' + T('Formula buffet', 'Buffet option', 'Buffet-Variante', 'Možnost bifeja', 'Buffetvariant') + '</legend><div class="qt-cards">';
    PRICES.brunchBuffet.forEach(function (p, i) { h += '<label class="qt-card"><input type="radio" name="br-buf" value="' + p + '"' + (i === 0 ? ' checked' : '') + '><span class="qt-cb"><strong>' + eur0(p) + '</strong><small>' + T('a persona', 'per person', 'pro Person', 'na osebo', 'per persoon') + '</small></span></label>'; });
    h += '</div><p class="qt-note">' + T('Dolce e salato a buffet, con prodotti del territorio. Il contenuto lo concordiamo insieme.', 'Sweet and savoury buffet with local produce. We agree the content together.', 'Süßes und Herzhaftes vom Buffet mit regionalen Produkten. Den Inhalt stimmen wir gemeinsam ab.', 'Sladek in slan bife z lokalnimi pridelki. Vsebino uskladimo skupaj.', 'Zoet en hartig buffet met lokale producten. De inhoud spreken we samen af.') + '</p></fieldset></div>';
    h += '<div id="br-carta" hidden><fieldset class="qt-set"><legend><b>3</b>' + T('Scegli i piatti', 'Choose the dishes', 'Gerichte wählen', 'Izberite jedi', 'Kies de gerechten') + '</legend>';
    var last = '', idx = 0;
    BR.forEach(function (r, i) {
      if (r[0] !== last) { if (last) h += '</div></details>'; h += '<details class="qt-cat"' + (r[0] === 'c1' ? ' open' : '') + '><summary>' + CATS[r[0]] + '</summary><div class="qt-items">'; last = r[0]; }
      h += '<div class="qt-item"><div class="qt-in">' + T(r[1], r[2], r[3], r[4], r[5]) + '<i>' + eur(r[6]) + '</i></div>' + stepper('bi-' + i, 0, 0, 99) + '</div>';
    });
    h += '</div></details></fieldset></div>';
    h += '</div>';
    h += '<aside class="qt-side"><div class="qt-sum"><span class="qt-cap">' + T('Prezzo indicativo', 'Indicative price', 'Richtpreis', 'Okvirna cena', 'Indicatieve prijs') + '</span>' +
      '<div class="qt-total" id="br-total">–</div><div class="qt-pp" id="br-pp"></div><ul class="qt-lines" id="br-lines"></ul>' +
      '<p class="qt-small">' + DISCLAIMER + '</p></div></aside></div>';
    h += '<div class="qt-formwrap">' + formHtml('br') + '</div>';
    root.innerHTML = h;

    var state = {};
    function calc() {
      var mode = root.querySelector('input[name=br-mode]:checked').value;
      var ad = num(document.getElementById('br-ad').value, 1, 200), kd = num(document.getElementById('br-kd').value, 0, 100);
      document.getElementById('br-buffet').hidden = mode !== 'buffet';
      document.getElementById('br-carta').hidden = mode !== 'carta';
      document.getElementById('br-kdwrap').style.display = mode === 'buffet' ? '' : 'none';
      var L = [], total = 0, people = ad;
      if (mode === 'buffet') {
        var p = parseInt(root.querySelector('input[name=br-buf]:checked').value, 10);
        total += p * ad; L.push([T('Brunch a buffet ' + p + ' € × ' + ad + ' adulti', 'Buffet brunch ' + p + ' € × ' + ad + ' adults', 'Brunch-Buffet ' + p + ' € × ' + ad + ' Erwachsene', 'Brunch na bifeju ' + p + ' € × ' + ad + ' odraslih', 'Brunchbuffet ' + p + ' € × ' + ad + ' volwassenen'), p * ad, 'Brunch a buffet ' + p + ' € × ' + ad + ' adulti']);
        if (kd) { total += kd * PRICES.kids; people += kd; L.push([T('Bambini ' + kd + ' × ' + PRICES.kids + ' €', 'Children ' + kd + ' × ' + PRICES.kids + ' €', 'Kinder ' + kd + ' × ' + PRICES.kids + ' €', 'Otroci ' + kd + ' × ' + PRICES.kids + ' €', 'Kinderen ' + kd + ' × ' + PRICES.kids + ' €'), kd * PRICES.kids, 'Bambini ' + kd + ' × ' + PRICES.kids + ' €']); }
      } else {
        BR.forEach(function (r, i) {
          var q = num(document.getElementById('bi-' + i).value, 0, 99);
          if (q) { var v = q * r[6]; total += v; L.push([q + ' × ' + T(r[1], r[2], r[3], r[4], r[5]), v, q + ' × ' + r[1]]); }
        });
        if (!L.length) L.push(['<em>' + T('Aggiungi i piatti dalla lista', 'Add dishes from the list', 'Gerichte aus der Liste hinzufügen', 'Dodajte jedi s seznama', 'Voeg gerechten toe uit de lijst') + '</em>', 0, '']);
      }
      state = { mode: mode, ad: ad, kd: mode === 'buffet' ? kd : 0, total: total, lines: L };
      document.getElementById('br-total').innerHTML = total ? T('circa ', 'about ', 'ca. ', 'približno ', 'ca. ') + eur0(total) : '–';
      document.getElementById('br-pp').innerHTML = total && people ? '≈ ' + eur0(total / people) + ' ' + T('a persona', 'per person', 'pro Person', 'na osebo', 'per persoon') : '';
      document.getElementById('br-lines').innerHTML = L.map(function (l) { return '<li><span>' + l[0] + '</span>' + (l[1] ? '<b>' + eur(l[1]) + '</b>' : '') + '</li>'; }).join('');
    }
    root.addEventListener('input', calc); root.addEventListener('change', calc);
    bindSteppers(root, calc); calc();

    function summary() {
      var s = 'Formula: ' + (state.mode === 'buffet' ? 'brunch a buffet' : 'brunch alla carta') + '\nAdulti: ' + state.ad + (state.kd ? '\nBambini: ' + state.kd : '') + '\n\n';
      s += state.lines.filter(function (l) { return l[2]; }).map(function (l) { return '- ' + l[2] + ': ' + eur(l[1]); }).join('\n');
      s += '\n\nTOTALE INDICATIVO: circa ' + eur0(state.total);
      return s;
    }
    wireForm(root, 'br', 'Richiesta brunch', summary, function () { return state.ad + state.kd; });
  }

  function boot() {
    var a = document.getElementById('qt-events'), b = document.getElementById('qt-brunch');
    if (a) initEvents(a);
    if (b) initBrunch(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
