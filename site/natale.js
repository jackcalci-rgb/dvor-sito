/* Osteria Enoteca Dvor - calcolatore pranzi e cene aziendali di Natale (Essential / Premium)
   Prezzi e piatti: natale-data.js. PDF generato nel browser (jsPDF), copia inviata a info@ da natale-mail.php. */
(function () {
  'use strict';
  var root = document.getElementById('natale-calc'), D = window.DVOR_NATALE;
  if (!root || !D) return;

  var PRICE = { e: 45, p: 65 }, KIDS = 15, MIN_ADULTS = 10, DEPOSIT = 0.5, WINE_BTL = 15, GLASSES = 4;
  var PHONE = '+39 0481 090740', MAIL = 'info@osteriadvor.com', IBAN = 'IT21A0863112400000001044257';
  var COURSES = ['antipasti', 'primi', 'secondi', 'dessert'];
  var LANGS = ['it', 'en', 'de', 'sl', 'nl'];
  var CN = { antipasti: ['Antipasto', 'Starter', 'Vorspeise', 'Predjed', 'Voorgerecht'], primi: ['Primo', 'First course', 'Erster Gang', 'Prva jed', 'Eerste gerecht'],
    secondi: ['Secondo', 'Main course', 'Hauptgang', 'Glavna jed', 'Hoofdgerecht'], dessert: ['Dolce', 'Dessert', 'Dessert', 'Sladica', 'Dessert'] };
  var AL_IT = D.al.it, AL_EN = D.al.en;
  var LEAF_SVG = '<svg class="nt-leaf" viewBox="0 0 16 16" aria-label="vegetariano" role="img"><path d="M14 2C7 2 2.5 5.5 2.5 10.5c0 1.2.3 2.3.8 3.2C5 9.8 7.8 7.4 11 6c-2.8 1.8-5.2 4.6-6.6 8 1 .5 2 .7 3.1.7C12.6 14.7 14 9 14 2z" fill="#3f8f3a"/></svg>';

  function T(it, en, de, sl, nl) { var a = [it, en, de, sl, nl], s = ''; for (var i = 0; i < 5; i++) s += '<span class="' + LANGS[i] + '" lang="' + LANGS[i] + '">' + a[i] + '</span>'; return s; }
  function lang() { var l = document.documentElement.getAttribute('data-lang') || 'it'; return LANGS.indexOf(l) < 0 ? 'it' : l; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function eur(n) { var r = Math.round(n * 100) / 100; return '€ ' + r.toLocaleString('it-IT', { minimumFractionDigits: (r % 1 ? 2 : 0), maximumFractionDigits: 2 }); }
  function num(v, min, max) { var n = parseInt(v, 10); if (!isFinite(n)) n = 0; return Math.max(min, Math.min(max || 9999, n)); }

  var st = { pkg: 'e', pick: {}, busy: false };
  var t0 = Date.now();

  function pkgCard(k, name, price, sub) {
    return '<label class="nt-pk"><input type="radio" name="nt-pkg" value="' + k + '"' + (k === st.pkg ? ' checked' : '') + '><span class="nt-pkb"><em>' + name + '</em><strong>' + price + ' €</strong><small>' + sub + '</small></span></label>';
  }
  function step(id, val, min, max) {
    return '<div class="nt-step" data-for="' + id + '"><button type="button" data-d="-1" aria-label="-">−</button><input id="' + id + '" type="number" inputmode="numeric" min="' + min + '" max="' + max + '" value="' + val + '"><button type="button" data-d="1" aria-label="+">+</button></div>';
  }
  function build() {
    root.innerHTML =
      '<div class="nt-head"><h2>' + T('Calcola il tuo preventivo di Natale', 'Calculate your Christmas quote', 'Berechnen Sie Ihr Weihnachtsangebot', 'Izračunajte svojo božično ponudbo', 'Bereken je kerstofferte') + '</h2>' +
      '<p>' + T('Scegli il pacchetto, i piatti e il numero di ospiti: scarichi il preventivo in PDF. Per confermare, chiamaci o scrivici.', 'Choose the package, the dishes and the number of guests, then download your quote as a PDF. To confirm, call or write to us.', 'Wählen Sie Paket, Gerichte und Gästezahl und laden Sie Ihr Angebot als PDF herunter. Zur Bestätigung rufen Sie uns an oder schreiben Sie uns.', 'Izberite paket, jedi in število gostov ter prenesite ponudbo v PDF. Za potrditev nas pokličite ali nam pišite.', 'Kies pakket, gerechten en aantal gasten en download je offerte als pdf. Bel of mail ons om te bevestigen.') + '</p></div>' +
      '<div class="nt-grid"><div class="nt-main">' +
      '<fieldset class="nt-set"><legend><b>1</b>' + T('Pacchetto', 'Package', 'Paket', 'Paket', 'Pakket') + '</legend><div class="nt-pks">' +
      pkgCard('e', 'Essential', 45, T('Antipasto, primo, secondo e dolce · vino del Collio a consumo', 'Starter, first, main and dessert · Collio wine by consumption', 'Vorspeise, erster Gang, Hauptgang und Dessert · Collio-Wein nach Verbrauch', 'Predjed, prva jed, glavna jed in sladica · vino iz Collia po porabi', 'Voorgerecht, eerste, hoofdgerecht en dessert · Collio-wijn naar verbruik')) +
      pkgCard('p', 'Premium', 65, T('Menù con piatti di mare, tartufo e selvaggina · vini con la sommelier', 'Menu with seafood, truffle and game · wines with our sommelier', 'Menü mit Meeresfrüchten, Trüffel und Wild · Weine mit unserer Sommelière', 'Meni z morskimi jedmi, tartufi in divjačino · vina s sommelierko', 'Menu met zeevruchten, truffel en wild · wijnen met onze sommelier')) +
      '</div></fieldset>' +
      '<fieldset class="nt-set"><legend><b>2</b>' + T('Pranzo o cena, ospiti', 'Lunch or dinner, guests', 'Mittag- oder Abendessen, Gäste', 'Kosilo ali večerja, gostje', 'Lunch of diner, gasten') + '</legend>' +
      '<div class="nt-chips"><label class="nt-chip"><input type="radio" name="nt-kind" value="0" checked><span>' + T('Pranzo', 'Lunch', 'Mittagessen', 'Kosilo', 'Lunch') + '</span></label><label class="nt-chip"><input type="radio" name="nt-kind" value="1"><span>' + T('Cena', 'Dinner', 'Abendessen', 'Večerja', 'Diner') + '</span></label></div>' +
      '<div class="nt-two"><div class="nt-lbl"><span>' + T('Adulti (min. 10)', 'Adults (min. 10)', 'Erwachsene (mind. 10)', 'Odrasli (najmanj 10)', 'Volwassenen (min. 10)') + '</span>' + step('nt-ad', 20, MIN_ADULTS, 200) + '</div>' +
      '<div class="nt-lbl"><span>' + T('Bambini fino a 10 anni (15 €)', 'Children up to 10 (€ 15)', 'Kinder bis 10 Jahre (15 €)', 'Otroci do 10 let (15 €)', 'Kinderen tot 10 jaar (€ 15)') + '</span>' + step('nt-kd', 0, 0, 100) + '</div></div></fieldset>' +
      '<fieldset class="nt-set"><legend><b>3</b>' + T('Scegli i piatti', 'Choose your dishes', 'Gerichte wählen', 'Izberite jedi', 'Kies je gerechten') + '</legend>' +
      '<p class="nt-note">' + T('Un piatto per portata, uguale per tutti gli ospiti. Il simbolo <span class="nt-lf"></span> indica i piatti vegetariani; i supplementi sono a persona.', 'One dish per course, the same for every guest. The <span class="nt-lf"></span> symbol marks vegetarian dishes; supplements are per person.', 'Ein Gericht pro Gang, für alle Gäste gleich. Das Symbol <span class="nt-lf"></span> kennzeichnet vegetarische Gerichte; Zuschläge gelten pro Person.', 'Ena jed na hod, enaka za vse goste. Znak <span class="nt-lf"></span> označuje vegetarijanske jedi; doplačila so na osebo.', 'Eén gerecht per gang, voor alle gasten hetzelfde. Het symbool <span class="nt-lf"></span> markeert vegetarische gerechten; toeslagen gelden per persoon.') + '</p>' +
      '<div id="nt-dishes"></div></fieldset>' +
      '<form class="nt-form" id="nt-form" novalidate><fieldset class="nt-set"><legend><b>4</b>' + T('I tuoi dati', 'Your details', 'Ihre Daten', 'Vaši podatki', 'Je gegevens') + '</legend>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">' +
      '<div class="nt-two">' +
      fld('name', 'text', T('Nome e cognome', 'Full name', 'Name', 'Ime in priimek', 'Naam'), 'name', true) + fld('company', 'text', T('Azienda', 'Company', 'Firma', 'Podjetje', 'Bedrijf'), 'organization') +
      fld('email', 'email', 'Email', 'email', true) + fld('phone', 'tel', T('Telefono', 'Phone', 'Telefon', 'Telefon', 'Telefoon'), 'tel', true) +
      fld('date', 'date', T('Data desiderata', 'Preferred date', 'Wunschtermin', 'Želeni datum', 'Gewenste datum'), 'off') + fld('time', 'time', T('Orario di inizio', 'Start time', 'Beginn', 'Začetek', 'Starttijd'), 'off') + '</div>' +
      '<label class="nt-f"><span>' + T('Note, allergie o intolleranze', 'Notes, allergies or intolerances', 'Anmerkungen, Allergien oder Unverträglichkeiten', 'Opombe, alergije ali intolerance', 'Opmerkingen, allergieën of intoleranties') + '</span><textarea name="notes" rows="3"></textarea></label>' +
      '<label class="nt-chk"><input type="checkbox" name="consent"><span>' + T('Acconsento al trattamento dei dati per rispondere alla richiesta (<a href="privacy.html">privacy</a>) e all’invio di una copia del preventivo a Osteria Enoteca Dvor.', 'I agree to my data being processed to answer this request (<a href="privacy.html">privacy</a>) and to a copy of the quote being sent to Osteria Enoteca Dvor.', 'Ich willige in die Verarbeitung meiner Daten zur Beantwortung der Anfrage (<a href="privacy.html">Datenschutz</a>) und in den Versand einer Kopie des Angebots an Osteria Enoteca Dvor ein.', 'Soglašam z obdelavo podatkov za odgovor na povpraševanje (<a href="privacy.html">zasebnost</a>) in s pošiljanjem kopije ponudbe Osteria Enoteca Dvor.', 'Ik ga akkoord met de verwerking van mijn gegevens om de aanvraag te beantwoorden (<a href="privacy.html">privacy</a>) en met het verzenden van een kopie van de offerte aan Osteria Enoteca Dvor.') + '</span></label>' +
      '<p class="nt-msg nt-err" hidden>' + T('Compila nome, email, telefono e consenso.', 'Please fill in name, email, phone and consent.', 'Bitte Name, E-Mail, Telefon und Einwilligung ausfüllen.', 'Izpolnite ime, e-pošto, telefon in soglasje.', 'Vul naam, e-mail, telefoon en toestemming in.') + '</p>' +
      '<p class="nt-msg nt-ok" hidden>' + T('Preventivo scaricato e copia inviata a Osteria Dvor e alla tua email. Per confermare, contattaci come indicato qui sotto.', 'Quote downloaded and a copy sent to Osteria Dvor and to your email. To confirm, contact us as shown below.', 'Angebot heruntergeladen und Kopie an Osteria Dvor und an Ihre E-Mail gesendet. Zur Bestätigung kontaktieren Sie uns wie unten angegeben.', 'Ponudba je prenesena, kopija poslana Osteria Dvor in na vaš e-naslov. Za potrditev nas kontaktirajte, kot je navedeno spodaj.', 'Offerte gedownload en kopie naar Osteria Dvor en naar je e-mail gestuurd. Neem voor bevestiging contact op zoals hieronder.') + '</p>' +
      '<p class="nt-msg nt-fail" hidden>' + T('Il PDF è stato scaricato ma non siamo riusciti a inviarne copia: scrivici a', 'The PDF was downloaded but we could not send a copy: please write to', 'Das PDF wurde heruntergeladen, die Kopie konnte aber nicht gesendet werden: schreiben Sie an', 'PDF je prenesen, vendar kopije nismo mogli poslati: pišite na', 'De pdf is gedownload maar de kopie kon niet worden verzonden: mail naar') + ' <a href="mailto:' + MAIL + '">' + MAIL + '</a> ' + T('allegando il preventivo.', 'attaching the quote.', 'und fügen Sie das Angebot bei.', 'in priložite ponudbo.', 'met de offerte als bijlage.') + '</p>' +
      '<p class="nt-msg nt-lib" hidden>PDF…</p>' +
      '<div class="nt-btns"><button type="submit" class="nt-btn fill">' + T('Scarica il preventivo (PDF)', 'Download quote (PDF)', 'Angebot herunterladen (PDF)', 'Prenesi ponudbo (PDF)', 'Offerte downloaden (pdf)') + '</button></div>' +
      '</fieldset></form></div>' +
      '<aside class="nt-side"><div class="nt-box" id="nt-sum" aria-live="polite"></div>' +
      '<div class="nt-box nt-how"><h3>' + T('Come confermare', 'How to confirm', 'So bestätigen Sie', 'Kako potrditi', 'Zo bevestig je') + '</h3><p>' + T('Chiamaci al', 'Call us on', 'Rufen Sie uns an unter', 'Pokličite nas na', 'Bel ons op') + ' <a href="tel:+390481090740">' + PHONE + '</a> ' + T('oppure scrivi a', 'or write to', 'oder schreiben Sie an', 'ali pišite na', 'of mail naar') + ' <a href="mailto:' + MAIL + '">' + MAIL + '</a>, ' + T('allegando il preventivo o indicandoci il numero del preventivo.', 'attaching the quote or giving us the quote number.', 'mit dem Angebot im Anhang oder unter Angabe der Angebotsnummer.', 's priloženo ponudbo ali navedbo številke ponudbe.', 'met de offerte als bijlage of onder vermelding van het offertenummer.') + '</p></div></aside></div>';
  }
  function fld(n, type, label, ac, req) {
    return '<label class="nt-f"><span>' + label + (req ? ' *' : '') + '</span><input name="' + n + '" type="' + type + '" autocomplete="' + ac + '"' + '' + '></label>';
  }

  function dishes() {
    var h = '', m = D[st.pkg];
    COURSES.forEach(function (c) {
      var list = m[c], cn = CN[c];
      if (st.pick[st.pkg + c] === undefined) st.pick[st.pkg + c] = 0;
      h += '<div class="nt-course"><h3>' + T(cn[0], cn[1], cn[2], cn[3], cn[4]) + '</h3>';
      list.forEach(function (d, i) {
        h += '<label class="nt-dish"><input type="radio" name="nt-c-' + c + '" value="' + i + '"' + (st.pick[st.pkg + c] === i ? ' checked' : '') + '><span><b>' + esc(d[0]) + '</b>' + (d[2] ? LEAF_SVG : '') +
          (d[1] ? '<i>+ ' + d[1] + ' €</i>' : '') + (d[3].length ? '<small>' + d[3].map(function (a) { return AL_IT[a]; }).join(', ') + '</small>' : '') + '</span></label>';
      });
      h += '</div>';
    });
    root.querySelector('#nt-dishes').innerHTML = h;
  }

  function calc() {
    var ad = num(root.querySelector('#nt-ad').value, MIN_ADULTS, 200), kd = num(root.querySelector('#nt-kd').value, 0, 100);
    var m = D[st.pkg], base = PRICE[st.pkg], supp = 0, sel = [];
    COURSES.forEach(function (c) { var d = m[c][st.pick[st.pkg + c] || 0]; sel.push({ c: c, d: d }); supp += d[1]; });
    var food = base * ad + kd * KIDS, sup = supp * ad, btl = 0, wines = [], vini = 0;
    if (st.pkg === 'e') {
      /* vino del Collio: 4 calici a testa, bottiglie da 1 litro = 10 calici; bianchi e rossi a meta' (come nel programma preventivi) */
      btl = Math.ceil(ad * GLASSES / 10);
      var w = Math.round(btl / 2), r = btl - w;
      wines = [['Blaževi Goriška Brda Merlot', Math.floor(r / 2) + (r % 2)], ['Blaževi Goriška Brda Refošk', Math.floor(r / 2)], ['Blaževi Goriška Brda Sivi Pinot', w]];
      vini = btl * WINE_BTL;
    }
    var tot = Math.round((food + sup + vini) * 100) / 100;
    return { ad: ad, kd: kd, base: base, supp: supp, sup: sup, food: food, per: base + supp, tot: tot, dep: Math.round(tot * DEPOSIT * 100) / 100, btl: btl, wines: wines, vini: vini, wine: vini, sel: sel };
  }
  function summary() {
    var c = calc(), h = '<h3>' + T('Il tuo preventivo', 'Your quote', 'Ihr Angebot', 'Vaša ponudba', 'Je offerte') + '</h3><dl>' +
      '<div><dt>' + (st.pkg === 'e' ? 'Essential' : 'Premium') + ' · ' + c.ad + ' × ' + eur(c.base) + '</dt><dd>' + eur(c.base * c.ad) + '</dd></div>';
    if (c.sup) h += '<div><dt>' + T('Supplementi', 'Supplements', 'Zuschläge', 'Doplačila', 'Toeslagen') + ' · ' + c.ad + ' × ' + eur(c.sup) + '</dt><dd>' + eur(c.sup * c.ad) + '</dd></div>';
    if (c.kd) h += '<div><dt>' + T('Bambini', 'Children', 'Kinder', 'Otroci', 'Kinderen') + ' · ' + c.kd + ' × ' + eur(KIDS) + '</dt><dd>' + eur(c.kd * KIDS) + '</dd></div>';
    if (c.vini) h += '<div><dt>' + T('Vino del Collio', 'Collio wine', 'Collio-Wein', 'Vino iz Collia', 'Collio-wijn') + ' · ' + c.btl + ' × ' + eur(WINE_BTL) + '</dt><dd>' + eur(c.vini) + '</dd></div>';
    h += '<div class="nt-tot"><dt>' + T('Totale', 'Total', 'Gesamt', 'Skupaj', 'Totaal') + '</dt><dd>' + eur(c.tot) + '</dd></div>' +
      '<div><dt>' + T('Acconto alla conferma (50%)', 'Deposit on confirmation (50%)', 'Anzahlung bei Bestätigung (50%)', 'Akontacija ob potrditvi (50 %)', 'Aanbetaling bij bevestiging (50%)') + '</dt><dd>' + eur(c.dep) + '</dd></div></dl>';
    h += '<p class="nt-note">' + (st.pkg === 'e'
      ? T('Vino a consumo: ' + c.btl + ' bottiglie da 1 litro consigliate (4 calici a persona); nel conto finale solo il vino effettivamente bevuto.', 'Wine by consumption: ' + c.btl + ' one-litre bottles recommended (4 glasses per person); the final bill only includes the wine actually drunk.', 'Wein nach Verbrauch: empfohlen ' + c.btl + ' Ein-Liter-Flaschen (4 Gläser pro Person); abgerechnet wird nur der tatsächlich getrunkene Wein.', 'Vino po porabi: priporočenih ' + c.btl + ' enolitrskih steklenic (4 kozarci na osebo); v končnem računu samo dejansko popito vino.', 'Wijn naar verbruik: ' + c.btl + ' flessen van 1 liter aanbevolen (4 glazen per persoon); op de eindrekening alleen de werkelijk gedronken wijn.')
      : T('I vini si scelgono con la nostra sommelier e si pagano a consumo.', 'Wines are chosen with our sommelier and charged on consumption.', 'Die Weine wählen Sie mit unserer Sommelière; Abrechnung nach Verbrauch.', 'Vina izberete s sommelierko; plačilo po porabi.', 'De wijnen kies je met onze sommelier; afrekening naar verbruik.')) +
      ' ' + T('Pane incluso; caffè, acqua e altre bevande a parte.', 'Bread included; coffee, water and other drinks extra.', 'Brot inklusive; Kaffee, Wasser und andere Getränke extra.', 'Kruh je vključen; kava, voda in druge pijače posebej.', 'Brood inbegrepen; koffie, water en andere dranken apart.') + '</p>';
    root.querySelector('#nt-sum').innerHTML = h;
  }

  /* ---------- PDF ---------- */
  var JSPDF = 'jspdf.umd.min.js';
  function loadPdf() {
    return new Promise(function (res, rej) {
      if (window.jspdf) return res(window.jspdf.jsPDF);
      var s = document.createElement('script'); s.src = JSPDF; s.onload = function () { res(window.jspdf.jsPDF); }; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function quoteNumber() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }, r = '';
    for (var i = 0; i < 3; i++) r += 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.charAt(Math.floor(Math.random() * 32));
    return p(d.getDate()) + p(d.getMonth() + 1) + d.getFullYear() + 'WEB' + p(d.getHours()) + p(d.getMinutes()) + r;
  }
  var PL = {
    it: { t: 'Preventivo', sub: 'Pranzi e cene aziendali di Natale 2026', no: 'Preventivo n.', cl: 'Cliente', co: 'Azienda', dt: 'Data desiderata', ev: 'Evento', lunch: 'Pranzo', dinner: 'Cena', pk: 'Pacchetto', gu: 'Ospiti', ad: 'adulti', kd: 'bambini',
      menu: 'Menù scelto', sup: 'Supplementi', kids: 'Bambini', tot: 'Totale', dep: 'Acconto alla conferma (50%)', wine: 'Vino del Collio a consumo: consigliate {n} bottiglie (circa {e}), non incluse nel totale.', som: 'I vini si scelgono con la nostra sommelier e si pagano a consumo.',
      notes: 'Note del cliente', how: 'Come confermare', howt: 'Per confermare chiamaci al ' + PHONE + ' oppure scrivi a ' + MAIL + ' allegando questo preventivo o indicando il numero del preventivo. Il preventivo è valido salvo disponibilità alla data richiesta.', al: 'Allergeni (Reg. UE 1169/2011)', alt: 'Piatti vegetariani: (V). Segnalateci allergie e intolleranze: non possiamo garantire l’assenza totale di allergeni.',
      terms: 'Condizioni', tl: ['Acconto del 50% all’accettazione del preventivo su IBAN ' + IBAN + ' intestato a HORECA FVG SRL; il saldo il giorno dell’evento.', 'Il pane è incluso; caffè, acqua e tutte le bevande non indicate sono a parte.', 'Il vino è conteggiato a consumo: la quantità indicata è quella consigliata.', 'Bambini fino a 10 anni: 15 euro a testa, con menù dedicato (pasta al pomodoro o al ragù, patatine fritte, succo di frutta).', 'Il menù è uguale per tutti gli ospiti.'], pg: 'Pagina' },
    en: { t: 'Quotation', sub: 'Corporate Christmas lunches and dinners 2026', no: 'Quote no.', cl: 'Client', co: 'Company', dt: 'Preferred date', ev: 'Event', lunch: 'Lunch', dinner: 'Dinner', pk: 'Package', gu: 'Guests', ad: 'adults', kd: 'children',
      menu: 'Selected menu', sup: 'Supplements', kids: 'Children', tot: 'Total', dep: 'Deposit on confirmation (50%)', wine: 'Collio wine by consumption: {n} bottles recommended (about {e}), not included in the total.', som: 'Wines are chosen with our sommelier and charged on consumption.',
      notes: 'Client notes', how: 'How to confirm', howt: 'To confirm, call us on ' + PHONE + ' or write to ' + MAIL + ' attaching this quote or giving the quote number. The quote is subject to availability on the requested date.', al: 'Allergens (EU Reg. 1169/2011)', alt: 'Vegetarian dishes: (V). Please tell us about allergies and intolerances: we cannot guarantee the total absence of allergens.',
      terms: 'Terms', tl: ['A 50% deposit is due on acceptance, by bank transfer to IBAN ' + IBAN + ' (HORECA FVG SRL); the balance is paid on the day of the event.', 'Bread is included; coffee, water and all drinks not listed are extra.', 'Wine is charged on consumption: the quantity shown is the recommended one.', 'Children up to 10: 15 euro each, with a dedicated menu (pasta with tomato or ragu, fries, fruit juice).', 'The menu is the same for all guests.'], pg: 'Page' } };
  function pdfSafe(s) { return String(s).replace(/[’‘]/g, "'").replace(/[“”]/g, '"'); }

  function makePdf(JsPDF, f, c, no) {
    var L = lang() === 'it' ? PL.it : PL.en, ALN = lang() === 'it' ? AL_IT : AL_EN;
    var doc = new JsPDF({ unit: 'mm', format: 'a4' }), W = 210, M = 18, y = 20, CW = W - 2 * M;
    var gold = [160, 120, 60], ink = [30, 30, 30], mut = [110, 110, 110];
    function page() { doc.addPage(); y = 20; }
    function need(h) { if (y + h > 280) page(); }
    function txt(s, size, style, color, x, align) { doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size); doc.setTextColor.apply(doc, color || ink); doc.text(pdfSafe(s), x === undefined ? M : x, y, align ? { align: align } : undefined); }
    function para(s, size, color, style) { doc.setFont('helvetica', style || 'normal'); doc.setFontSize(size); doc.setTextColor.apply(doc, color || ink); var ls = doc.splitTextToSize(pdfSafe(s), CW); ls.forEach(function (l) { need(size * 0.45); doc.text(l, M, y); y += size * 0.45; }); y += 1.5; }
    function h2(s) { need(14); y += 3; txt(s.toUpperCase(), 9, 'bold', gold); y += 1.5; doc.setDrawColor(gold[0], gold[1], gold[2]); doc.line(M, y, W - M, y); y += 6; }
    function row(a, b, bold) { need(7); txt(a, 10, bold ? 'bold' : 'normal'); txt(b, 10, bold ? 'bold' : 'normal', ink, W - M, 'right'); y += 6; }

    txt('OSTERIA ENOTECA DVOR', 9, 'bold', gold); y += 9;
    txt(L.t, 26, 'normal'); y += 8; txt(L.sub, 11, 'normal', mut); y += 6;
    txt(L.no + ' ' + no, 10, 'bold', ink); txt(new Date().toLocaleDateString(lang() === 'it' ? 'it-IT' : 'en-GB'), 10, 'normal', mut, W - M, 'right'); y += 4;
    h2(L.cl);
    row(f.name + (f.company ? ' · ' + f.company : ''), f.email + (f.phone ? ' · ' + f.phone : ''));
    row(L.ev, (f.kind ? L.dinner : L.lunch) + (f.date ? ' · ' + f.date : ''));
    row(L.pk, (st.pkg === 'e' ? 'Essential' : 'Premium') + ' · ' + c.ad + ' ' + L.ad + (c.kd ? ' + ' + c.kd + ' ' + L.kd : ''));
    h2(L.menu);
    var cnl = { antipasti: lang() === 'it' ? 'Antipasto' : 'Starter', primi: lang() === 'it' ? 'Primo' : 'First course', secondi: lang() === 'it' ? 'Secondo' : 'Main course', dessert: lang() === 'it' ? 'Dolce' : 'Dessert' };
    c.sel.forEach(function (s) {
      need(14); txt(cnl[s.c].toUpperCase(), 8, 'bold', mut); y += 5;
      txt(s.d[0] + (s.d[2] ? '  (V)' : '') + (s.d[1] ? '   + ' + s.d[1] + ' EUR' : ''), 11, 'normal'); y += 5;
      if (s.d[3].length) { txt(L.al.split(' (')[0] + ': ' + s.d[3].map(function (a) { return ALN[a]; }).join(', '), 8, 'normal', mut); y += 5; }
      y += 1.5;
    });
    h2(L.tot);
    row((st.pkg === 'e' ? 'Essential' : 'Premium') + '  ' + c.ad + ' x ' + eur(c.base).replace('€', 'EUR'), eur(c.base * c.ad).replace('€', 'EUR'));
    if (c.sup) row(L.sup + '  ' + c.ad + ' x ' + eur(c.sup).replace('€', 'EUR'), eur(c.sup * c.ad).replace('€', 'EUR'));
    if (c.kd) row(L.kids + '  ' + c.kd + ' x ' + eur(KIDS).replace('€', 'EUR'), eur(c.kd * KIDS).replace('€', 'EUR'));
    doc.setDrawColor(200); doc.line(M, y - 3, W - M, y - 3);
    row(L.tot, eur(c.tot).replace('€', 'EUR'), true); row(L.dep, eur(c.dep).replace('€', 'EUR'));
    y += 1; para(st.pkg === 'e' ? L.wine.replace('{n}', c.btl).replace('{e}', eur(c.wine).replace('€', 'EUR')) : L.som, 9, mut);
    if (f.notes) { h2(L.notes); para(f.notes, 10); }
    h2(L.how); para(L.howt, 10);
    h2(L.terms); L.tl.forEach(function (t) { para('- ' + t, 9, mut); }); para(L.alt, 9, mut);
    var n = doc.getNumberOfPages();
    for (var i = 1; i <= n; i++) { doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140); doc.text('Osteria Enoteca Dvor · Via Castello, San Floriano del Collio (GO) · ' + PHONE + ' · ' + MAIL + ' · ' + L.pg + ' ' + i + '/' + n, W / 2, 289, { align: 'center' }); }
    return doc;
  }


  /* ---------- PDF con il modello del programma preventivi (pagine HTML -> immagini -> PDF) ---------- */
  var FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap';
  var DLEAF = '<svg class="leaf" viewBox="0 0 16 16" role="img"><path d="M14 2C7 2 2.5 5.5 2.5 10.5c0 1.2.3 2.3.8 3.2C5 9.8 7.8 7.4 11 6c-2.8 1.8-5.2 4.6-6.6 8 1 .5 2 .7 3.1.7C12.6 14.7 14 9 14 2z" fill="#3f8f3a"/></svg>';
  var HOLLY = '<svg class="holly" viewBox="0 0 64 22" aria-hidden="true"><path d="M31 12C26 4 17 3 9 7c3 1 4 3 3 5 3-1 5 0 6 2 2-2 5-2 7-1-1-3 1-4 6-1z" fill="#2f6b3a"/><path d="M33 12c5-8 14-9 22-5-3 1-4 3-3 5-3-1-5 0-6 2-2-2-5-2-7-1 1-3-1-4-6-1z" fill="#3f8f4a"/><circle cx="29.5" cy="14.5" r="3" fill="#c8432c"/><circle cx="34.5" cy="14.5" r="3" fill="#c8432c"/><circle cx="32" cy="10.2" r="3" fill="#b03424"/></svg>';
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  var DL = {
    it: { tel: 'Tel.', cliente: 'Cliente', numero: 'Numero preventivo', data: 'Data', oggetto: 'Oggetto Preventivo', dataEvento: 'Data Evento', inizio: 'Inizio evento: ore', adulti: 'Quantità adulti', bambini: 'Quantità bambini', opzione: 'Opzione:',
      opt: 'Antipasto, primo, secondo e dolce', cour: { antipasti: 'Antipasti', primi: 'Primi', secondi: 'Secondi', dessert: 'Dessert' }, leg: 'Piatto vegetariano', legS: 'maggiorazione a persona',
      bott: 'Bottiglie', cal: 'Calici', vino: 'Vino del Collio', litro: 'Bottiglia da 1 litro', sugg: 'Consigliati 4 calici a persona', cons: 'Quantità consigliata, conteggiata a consumo: nel conto finale solo il vino effettivamente bevuto.',
      wines: 'Vini', somm: 'Per la selezione dei vini ci sarà la nostra sommelier a guidarvi negli abbinamenti con il menu. Per farvi già un’idea potete consultare la nostra carta dei vini sul sito:',
      food: 'Prezzo food', vini: 'Prezzo vini', totale: 'Prezzo Totale', finale: 'Prezzo finale preventivo', acconto: 'Acconto', suppl: function (e) { return 'Supplemento piatti scelti (+' + e + ' € a persona)'; },
      termini: 'Termini & Condizioni', allergie: 'Allergie e Preferenze Alimentari', firma: 'Cliente', auguri: 'Con i migliori auguri di Buone Feste da tutta l\'Osteria Dvor', al: 'Allergeni', alSub: 'Reg. (UE) n. 1169/2011, Allegato II', piatto: 'Piatto',
      note: ['Il personale di sala è a disposizione per ogni informazione sugli ingredienti e sugli allergeni.', 'In cucina si utilizzano tutti gli allergeni elencati: non si può escludere la presenza di tracce per contaminazione crociata.', 'Ai sensi del Reg. (UE) n. 1169/2011 e del D.Lgs. n. 231/2017.'],
      ogg: ['Pranzo aziendale di Natale', 'Cena aziendale di Natale'] },
    en: { tel: 'Phone:', cliente: 'Customer', numero: 'Quotation Number', data: 'Date', oggetto: 'Subject of Quotation', dataEvento: 'Date Event', inizio: 'Start time:', adulti: 'Adults', bambini: 'Kids', opzione: 'Price Option (pp):',
      opt: 'Starter, first course, main course and dessert', cour: { antipasti: 'Starters', primi: 'First courses', secondi: 'Main courses', dessert: 'Dessert' }, leg: 'Vegetarian dish', legS: 'supplement per person',
      bott: 'Bottles', cal: 'Glasses', vino: 'Collio Wines', litro: '1-liter bottle', sugg: 'Recommended: 4 glasses per person', cons: 'Recommended quantity, charged on consumption: the final bill will only include the wine actually drunk.',
      wines: 'Wines', somm: 'Our sommelier will guide you in choosing the wines to pair with your menu. To get an idea already, you can browse our wine list on our website:',
      food: 'Food price', vini: 'Drinks price', totale: 'Total Price', finale: 'Final Price Quote', acconto: 'Deposit', suppl: function (e) { return 'Supplement for chosen dishes (+' + e + ' € per person)'; },
      termini: 'Terms & Conditions', allergie: 'Allergies and Dietary Preferences', firma: 'Client', auguri: 'Season\'s Greetings from all of us at Osteria Dvor', al: 'Allergens', alSub: 'Reg. (EU) No. 1169/2011, Annex II', piatto: 'Dish',
      note: ['Our staff are available for any information about ingredients and allergens.', 'All the allergens listed are used in our kitchen: traces due to cross-contamination cannot be ruled out.', 'Pursuant to Reg. (EU) No. 1169/2011 and Legislative Decree No. 231/2017.'],
      ogg: ['Corporate Christmas lunch', 'Corporate Christmas dinner'] } };
  function ep(n) { return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function dateLong(iso, l) {
    if (!iso) return ''; var a = iso.split('-').map(Number); if (a.length < 3 || !a[0]) return '';
    if (l === 'it') return a[2] + ' ' + MESI[a[1] - 1] + ' ' + a[0];
    return new Date(a[0], a[1] - 1, a[2]).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  function paras(t) { return String(t || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function docHtml(f, c, no, l) {
    var T = DL[l], AL = l === 'it' ? AL_IT : AL_EN, base = new URL('.', location.href).href;
    function item(d) { return '<div>' + esc(d[0]) + (d[2] ? DLEAF : '') + (d[1] ? '<span class="d-suppl">+' + d[1] + ' €</span>' : '') + '</div>'; }
    function sec(x) { return '<div class="d-sec"><div class="k">' + T.cour[x.c] + '</div><div class="d-items">' + item(x.d) + '</div></div>'; }
    var by = {}; c.sel.forEach(function (x) { by[x.c] = x; });
    var menu = sec(by.antipasti) + '<div class="d-pair">' + sec(by.primi) + sec(by.secondi) + '</div>' + sec(by.dessert);
    var hasV = c.sel.some(function (x) { return x.d[2]; }), hasS = c.sel.some(function (x) { return x.d[1]; });
    var legend = (hasV || hasS) ? '<div class="d-legend">' + (hasV ? '<span>' + DLEAF + ' ' + T.leg + '</span>' : '') + (hasS ? '<span><b class="d-suppl" style="margin:0 3px 0 0">+' + c.sel.filter(function (x) { return x.d[1]; }).map(function (x) { return x.d[1]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(' / ') + ' €</b> ' + T.legS + '</span>' : '') + '</div>' : '';
    var wine = '';
    if (st.pkg === 'e') {
      var tc = c.wines.reduce(function (a, w) { return a + w[1] * 10; }, 0);
      wine = '<div class="d-wine"><div class="k">' + T.vino + ':</div><div class="d-wnote">' + T.litro + ' · ' + T.sugg + '</div><table class="tbl"><tr class="h"><td></td><td class="c">' + T.bott + '</td><td class="c">' + T.cal + '</td></tr>' +
        c.wines.map(function (w) { return '<tr><td style="width:250px;white-space:nowrap">' + esc(w[0]) + '</td><td class="c" style="width:70px">' + w[1] + '</td><td class="c" style="width:90px">' + w[1] * 10 + '</td></tr>'; }).join('') +
        '<tr class="t"><td></td><td class="c">' + c.btl + '</td><td class="c">' + tc + '</td></tr><tr class="p"><td></td><td class="c">€</td><td class="c">' + ep(c.vini) + '</td></tr></table><div class="d-wnote" style="margin-top:4px">' + T.cons + '</div></div>';
    } else {
      wine = '<div class="d-wine"><div class="k">' + T.wines + '</div><div class="d-wnote" style="font-size:11px;max-width:470px">' + esc(T.somm) + ' <span style="font-style:normal;color:#c8432c">osteriadvor.com/vini.html</span></div></div>';
    }
    var rows = [];
    if (c.vini > 0) { rows.push([T.food, c.food, '']); if (c.sup) rows.push([T.suppl(String(c.supp)), c.sup, '']); rows.push([T.vini, c.vini, '']); rows.push([T.totale, c.tot, 'strong']); }
    else { if (c.sup) { rows.push([T.food, c.food, '']); rows.push([T.suppl(String(c.supp)), c.sup, '']); } rows.push([T.finale, c.tot, 'strong']); }
    rows.push([T.acconto, c.dep, 'acc']);
    var tot = rows.map(function (r) { return '<tr class="' + r[2] + '"><td class="l">' + esc(r[0]) + '</td><td class="r">' + ep(r[1]) + ' €</td></tr>'; }).join('');
    var tt = DOC_TERMS[l] || DOC_TERMS.it;
    var terms = paras(tt.terms).map(function (x, i) { return '<p class="' + (i ? '' : 'bold') + '">' + esc(x) + '</p>'; }).join('');
    var allergie = paras(tt.allergie).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('');
    var frame = '<div class="frame" aria-hidden="true"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><i class="b"></i></div>';
    var d = new Date(), today = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    var altbl = '<tr><th style="text-align:left">' + T.piatto + '</th>' + AL.map(function (n) { return '<th class="al"><span>' + n + '</span></th>'; }).join('') + '</tr>' +
      COURSES.map(function (k) { var x = by[k]; return '<tr class="g"><td colspan="15">' + T.cour[k] + '</td></tr><tr><td class="n">' + esc(x.d[0]) + '</td>' + AL.map(function (_, i) { return '<td>' + (x.d[3].indexOf(i) >= 0 ? '<i class="dot"></i>' : '') + '</td>'; }).join('') + '</tr>'; }).join('');
    var body = '<div class="page p1">' + frame +
      '<div class="d-logo-row"><div class="d-brand"><img class="d-logo" src="images/pdf-logo.png" alt="DVOR"><div class="d-venue"><span>Via Castello 5</span><span>San Floriano del Collio</span><span>37070 Gorizia (Italia)</span></div></div><div class="d-addr d-company"><b>Horeca FVG Srl</b><span>P.IVA 01280650316</span><span>info@osteriadvor.com</span></div></div>' +
      '<div class="d-holly">' + HOLLY + '</div>' +
      '<div class="d-head"><div class="d-client"><span class="k2">' + T.cliente + '</span><b>' + (esc(f.name) || '&nbsp;') + '</b>' + (f.company ? '<div>' + esc(f.company) + '</div>' : '') + '<div>' + esc(f.email) + '</div>' + (f.phone ? '<div>' + T.tel + ' ' + esc(f.phone) + '</div>' : '') + '</div>' +
      '<div class="d-meta"><span class="k">' + T.numero + '</span><span class="v">' + esc(no) + '</span><span class="k">' + T.data + '</span><span class="v">' + dateLong(today, l) + '</span></div></div>' +
      '<div class="d-obj"><div><span class="k2">' + T.oggetto + '</span><b>' + T.ogg[f.kind ? 1 : 0] + '</b></div><div class="ev"><span class="k2">' + T.dataEvento + '</span><span class="v">' + (dateLong(f.dateIso, l) || '&nbsp;') + (f.time ? '<br>' + T.inizio + ' ' + esc(f.time) : '') + '</span></div></div>' +
      '<div class="d-qty"><span>' + T.adulti + ': <b>' + c.ad + '</b></span>' + (c.kd ? '<span>' + T.bambini + ': <b>' + c.kd + '</b></span>' : '') + '</div>' +
      '<div class="d-opts"><div class="d-opt"><span>' + T.opzione + '</span><span class="p">' + ep(c.base) + ' €</span><span class="l">' + T.opt + '</span></div></div>' +
      '<div class="d-menu">' + menu + '</div>' + legend + '<div style="margin-top:26px">' + wine + '</div><table class="tbl d-tot">' + tot + '</table></div>' +
      '<div class="page p2 fixed">' + frame + '<h3>' + T.termini + '</h3><div class="terms">' + terms + '</div><div class="terms allergy"><h3 style="margin:0 0 7px">' + T.allergie + '</h3>' + allergie + '</div><div class="d-xmas">' + T.auguri + '</div>' +
      '<div class="sign"><div>Horeca FVG Srl<img src="images/pdf-firma.png" alt=""></div><div class="c">' + T.firma + '</div></div></div>' +
      '<div class="page p3 fixed">' + frame + '<h3>' + T.al + '</h3><div class="a-sub">' + T.alSub + '</div><table class="a-tbl"><colgroup><col>' + AL.map(function () { return '<col style="width:24px">'; }).join('') + '</colgroup>' + altbl + '</table>' +
      '<div class="d-holly" style="margin:18px auto 0">' + HOLLY + '</div><div class="a-note">' + T.note.map(function (x) { return '<p>' + x + '</p>'; }).join('') + '</div></div>';
    return '<!doctype html><html lang="' + l + '"><head><meta charset="utf-8"><base href="' + base + '"><link rel="stylesheet" href="' + FONTS + '"><link rel="stylesheet" href="natale-doc.css"></head><body>' + body + '</body></html>';
  }
  var DOC_TERMS = (function () {
    var t = D.terms || {}, o = {};
    ['it', 'en'].forEach(function (k) {
      if (!t[k]) return; var x = t[k].terms || '';
      if (!/conteggiato a consumo|charged on consumption/i.test(x)) x += '\n\n' + (k === 'it' ? '-Il vino è conteggiato a consumo: la quantità indicata nel preventivo è quella consigliata. Se ne verrà bevuto meno, il conto finale riporterà solo il vino effettivamente consumato.' : '-Wine is charged on consumption: the quantity shown in the quotation is the recommended one. If less is drunk, the final bill will only include the wine actually consumed.');
      o[k] = { terms: x, allergie: t[k].allergie };
    });
    return o;
  })();
  function loadScript(src) {
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  function makeDocPdf(JsPDF, f, c, no) {
    var l = lang() === 'it' ? 'it' : 'en', fr;
    return (window.html2canvas ? Promise.resolve() : loadScript('html2canvas.min.js')).then(function () {
      fr = document.createElement('iframe'); fr.setAttribute('aria-hidden', 'true'); fr.style.cssText = 'position:fixed;left:-12000px;top:0;width:794px;height:1200px;border:0;visibility:hidden';
      document.body.appendChild(fr);
      return new Promise(function (res, rej) { fr.onload = res; fr.onerror = rej; fr.srcdoc = docHtml(f, c, no, l); });
    }).then(function () {
      var w = fr.contentWindow, doc = fr.contentDocument;
      var fonts = ['700 17px "Cormorant Garamond"', '600 11px "Cormorant Garamond"', '400 12px "Source Serif 4"', 'italic 400 12px "Source Serif 4"', '600 9px "Source Sans 3"', '700 9px "Source Sans 3"'];
      var imgs = Array.prototype.map.call(doc.images, function (i) { return i.complete ? 1 : new Promise(function (r) { i.onload = i.onerror = r; }); });
      return Promise.all(fonts.map(function (x) { return doc.fonts.load(x).catch(function () {}); }).concat(imgs)).then(function () { return doc.fonts.ready; }).then(function () {
        var p1 = doc.querySelector('.p1');
        ['compact', 'compact2', 'compact3'].forEach(function (k) { if (p1.scrollHeight > 1124) p1.classList.add(k); });
        var pages = doc.querySelectorAll('.page'), pdf = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }), chain = Promise.resolve();
        Array.prototype.forEach.call(pages, function (pg, i) {
          chain = chain.then(function () { return w.html2canvas ? w.html2canvas(pg, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false }) : window.html2canvas(pg, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false }); }).then(function (cv) {
            var ratio = cv.height / cv.width, ww = 210, hh = 210 * ratio; if (hh > 297) { hh = 297; ww = 297 / ratio; }
            if (i) pdf.addPage(); pdf.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', (210 - ww) / 2, 0, ww, hh);
          });
        });
        return chain.then(function () { pdf.setProperties({ title: 'Preventivo ' + no + ' - ' + f.name, author: 'Horeca FVG Srl - Osteria Dvor' }); fr.remove(); return pdf; });
      });
    }).catch(function (e) { if (fr) fr.remove(); throw e; });
  }

  function submit(e) {
    e.preventDefault(); if (st.busy) return;
    var form = root.querySelector('#nt-form'), g = function (n) { return (form.elements[n].value || '').trim(); };
    var err = form.querySelector('.nt-err'), ok = form.querySelector('.nt-ok'), fail = form.querySelector('.nt-fail'), lib = form.querySelector('.nt-lib');
    var good = g('name') && /^\S+@\S+\.\S+$/.test(g('email')) && g('phone').length >= 6 && form.elements.consent.checked;
    err.hidden = !!good; ok.hidden = fail.hidden = true; if (!good) return;
    var di = g('date'), f = { name: g('name'), company: g('company'), email: g('email'), phone: g('phone'), dateIso: di, time: g('time'), date: di ? di.split('-').reverse().join('/') + (g('time') ? ' ' + g('time') : '') : '', notes: g('notes'), kind: +root.querySelector('input[name=nt-kind]:checked').value };
    var c = calc(), no = quoteNumber(), btn = form.querySelector('button[type=submit]');
    st.busy = true; btn.disabled = true; lib.hidden = false;
    loadPdf().then(function (JsPDF) {
      return makeDocPdf(JsPDF, f, c, no).catch(function () { return makePdf(JsPDF, f, c, no); }).then(function (doc) {
      var blob = doc.output('blob');
      doc.save('Preventivo-Dvor-' + no + '.pdf');
      var fd = new FormData();
      ['name', 'company', 'email', 'phone', 'date', 'notes'].forEach(function (k) { fd.append(k, f[k]); });
      fd.append('lang', lang()); fd.append('number', no); fd.append('kind', f.kind ? 'Cena' : 'Pranzo'); fd.append('package', st.pkg === 'e' ? 'Essential' : 'Premium');
      fd.append('adults', c.ad); fd.append('kids', c.kd); fd.append('total', eur(c.tot)); fd.append('deposit', eur(c.dep));
      fd.append('menu', c.sel.map(function (s) { return s.d[0] + (s.d[1] ? ' (+' + s.d[1] + ' €)' : ''); }).join(' | '));
      fd.append('website', form.elements.website.value); fd.append('t', String(t0));
      fd.append('pdf', blob, 'Preventivo-Dvor-' + no + '.pdf');
      return fetch('natale-mail.php', { method: 'POST', body: fd, credentials: 'same-origin' }).then(function (r) { return r.json().catch(function () { return { ok: false }; }); });
      });
    }).then(function (j) { if (j && j.ok) ok.hidden = false; else fail.hidden = false; })
      .catch(function () { fail.hidden = false; })
      .then(function () { st.busy = false; btn.disabled = false; lib.hidden = true; });
  }

  build(); dishes(); summary();
  root.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'nt-pkg') { st.pkg = t.value; dishes(); }
    else if (t.name && t.name.indexOf('nt-c-') === 0) st.pick[st.pkg + t.name.slice(5)] = +t.value;
    summary();
  });
  root.addEventListener('input', function (e) { if (e.target.type === 'number') summary(); });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('.nt-step button'); if (!b) return;
    var i = document.getElementById(b.parentNode.getAttribute('data-for')), v = num(i.value, 0) + parseInt(b.getAttribute('data-d'), 10);
    i.value = Math.max(parseInt(i.min, 10) || 0, Math.min(parseInt(i.max, 10) || 9999, v)); summary();
  });
  root.querySelector('#nt-form').addEventListener('submit', submit);
})();
