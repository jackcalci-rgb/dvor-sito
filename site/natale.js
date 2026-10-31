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
      fld('date', 'text', T('Data desiderata', 'Preferred date', 'Wunschtermin', 'Želeni datum', 'Gewenste datum'), 'off') + '</div>' +
      '<label class="nt-f"><span>' + T('Note, allergie o intolleranze', 'Notes, allergies or intolerances', 'Anmerkungen, Allergien oder Unverträglichkeiten', 'Opombe, alergije ali intolerance', 'Opmerkingen, allergieën of intoleranties') + '</span><textarea name="notes" rows="3"></textarea></label>' +
      '<label class="nt-chk"><input type="checkbox" name="consent"><span>' + T('Acconsento al trattamento dei dati per rispondere alla richiesta (<a href="privacy.html">privacy</a>) e all’invio di una copia del preventivo a Osteria Enoteca Dvor.', 'I agree to my data being processed to answer this request (<a href="privacy.html">privacy</a>) and to a copy of the quote being sent to Osteria Enoteca Dvor.', 'Ich willige in die Verarbeitung meiner Daten zur Beantwortung der Anfrage (<a href="privacy.html">Datenschutz</a>) und in den Versand einer Kopie des Angebots an Osteria Enoteca Dvor ein.', 'Soglašam z obdelavo podatkov za odgovor na povpraševanje (<a href="privacy.html">zasebnost</a>) in s pošiljanjem kopije ponudbe Osteria Enoteca Dvor.', 'Ik ga akkoord met de verwerking van mijn gegevens om de aanvraag te beantwoorden (<a href="privacy.html">privacy</a>) en met het verzenden van een kopie van de offerte aan Osteria Enoteca Dvor.') + '</span></label>' +
      '<p class="nt-msg nt-err" hidden>' + T('Compila nome, email, telefono e consenso.', 'Please fill in name, email, phone and consent.', 'Bitte Name, E-Mail, Telefon und Einwilligung ausfüllen.', 'Izpolnite ime, e-pošto, telefon in soglasje.', 'Vul naam, e-mail, telefoon en toestemming in.') + '</p>' +
      '<p class="nt-msg nt-ok" hidden>' + T('Preventivo scaricato e copia inviata a Osteria Dvor. Per confermare, contattaci come indicato qui sotto.', 'Quote downloaded and a copy sent to Osteria Dvor. To confirm, contact us as shown below.', 'Angebot heruntergeladen und Kopie an Osteria Dvor gesendet. Zur Bestätigung kontaktieren Sie uns wie unten angegeben.', 'Ponudba je prenesena, kopija poslana Osteria Dvor. Za potrditev nas kontaktirajte, kot je navedeno spodaj.', 'Offerte gedownload en kopie naar Osteria Dvor gestuurd. Neem voor bevestiging contact op zoals hieronder.') + '</p>' +
      '<p class="nt-msg nt-fail" hidden>' + T('Il PDF è stato scaricato ma non siamo riusciti a inviarne copia: scrivici a', 'The PDF was downloaded but we could not send a copy: please write to', 'Das PDF wurde heruntergeladen, die Kopie konnte aber nicht gesendet werden: schreiben Sie an', 'PDF je prenesen, vendar kopije nismo mogli poslati: pišite na', 'De pdf is gedownload maar de kopie kon niet worden verzonden: mail naar') + ' <a href="mailto:' + MAIL + '">' + MAIL + '</a> ' + T('allegando il preventivo.', 'attaching the quote.', 'und fügen Sie das Angebot bei.', 'in priložite ponudbo.', 'met de offerte als bijlage.') + '</p>' +
      '<p class="nt-msg nt-lib" hidden>PDF…</p>' +
      '<div class="nt-btns"><button type="submit" class="nt-btn fill">' + T('Scarica il preventivo (PDF)', 'Download quote (PDF)', 'Angebot herunterladen (PDF)', 'Prenesi ponudbo (PDF)', 'Offerte downloaden (pdf)') + '</button></div>' +
      '</fieldset></form></div>' +
      '<aside class="nt-side"><div class="nt-box" id="nt-sum" aria-live="polite"></div>' +
      '<div class="nt-box nt-how"><h3>' + T('Come confermare', 'How to confirm', 'So bestätigen Sie', 'Kako potrditi', 'Zo bevestig je') + '</h3><p>' + T('Chiamaci al', 'Call us on', 'Rufen Sie uns an unter', 'Pokličite nas na', 'Bel ons op') + ' <a href="tel:+390481090740">' + PHONE + '</a> ' + T('oppure scrivi a', 'or write to', 'oder schreiben Sie an', 'ali pišite na', 'of mail naar') + ' <a href="mailto:' + MAIL + '">' + MAIL + '</a>, ' + T('allegando il preventivo o indicandoci il numero del preventivo.', 'attaching the quote or giving us the quote number.', 'mit dem Angebot im Anhang oder unter Angabe der Angebotsnummer.', 's priloženo ponudbo ali navedbo številke ponudbe.', 'met de offerte als bijlage of onder vermelding van het offertenummer.') + '</p></div></aside></div>';
  }
  function fld(n, type, label, ac, req) {
    return '<label class="nt-f"><span>' + label + (req ? ' *' : '') + '</span><input name="' + n + '" type="' + type + '" autocomplete="' + ac + '"' + (n === 'date' ? ' placeholder="gg/mm/aaaa"' : '') + '></label>';
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
    var m = D[st.pkg], base = PRICE[st.pkg], sup = 0, sel = [];
    COURSES.forEach(function (c) { var d = m[c][st.pick[st.pkg + c] || 0]; sel.push({ c: c, d: d }); sup += d[1]; });
    var per = base + sup, tot = per * ad + kd * KIDS, btl = Math.ceil(ad * GLASSES / 10);
    return { ad: ad, kd: kd, base: base, sup: sup, per: per, tot: tot, dep: Math.round(tot * DEPOSIT * 100) / 100, btl: btl, wine: st.pkg === 'e' ? btl * WINE_BTL : 0, sel: sel };
  }
  function summary() {
    var c = calc(), h = '<h3>' + T('Il tuo preventivo', 'Your quote', 'Ihr Angebot', 'Vaša ponudba', 'Je offerte') + '</h3><dl>' +
      '<div><dt>' + (st.pkg === 'e' ? 'Essential' : 'Premium') + ' · ' + c.ad + ' × ' + eur(c.base) + '</dt><dd>' + eur(c.base * c.ad) + '</dd></div>';
    if (c.sup) h += '<div><dt>' + T('Supplementi', 'Supplements', 'Zuschläge', 'Doplačila', 'Toeslagen') + ' · ' + c.ad + ' × ' + eur(c.sup) + '</dt><dd>' + eur(c.sup * c.ad) + '</dd></div>';
    if (c.kd) h += '<div><dt>' + T('Bambini', 'Children', 'Kinder', 'Otroci', 'Kinderen') + ' · ' + c.kd + ' × ' + eur(KIDS) + '</dt><dd>' + eur(c.kd * KIDS) + '</dd></div>';
    h += '<div class="nt-tot"><dt>' + T('Totale', 'Total', 'Gesamt', 'Skupaj', 'Totaal') + '</dt><dd>' + eur(c.tot) + '</dd></div>' +
      '<div><dt>' + T('Acconto alla conferma (50%)', 'Deposit on confirmation (50%)', 'Anzahlung bei Bestätigung (50%)', 'Akontacija ob potrditvi (50 %)', 'Aanbetaling bij bevestiging (50%)') + '</dt><dd>' + eur(c.dep) + '</dd></div></dl>';
    h += '<p class="nt-note">' + (st.pkg === 'e'
      ? T('Vino del Collio a consumo, consigliate ' + c.btl + ' bottiglie (circa ' + eur(c.wine) + ', non incluse nel totale).', 'Collio wine by consumption, ' + c.btl + ' bottles recommended (about ' + eur(c.wine) + ', not included in the total).', 'Collio-Wein nach Verbrauch, empfohlen ' + c.btl + ' Flaschen (ca. ' + eur(c.wine) + ', nicht im Gesamtbetrag).', 'Vino iz Collia po porabi, priporočenih ' + c.btl + ' steklenic (približno ' + eur(c.wine) + ', niso všteta v skupni znesek).', 'Collio-wijn naar verbruik, ' + c.btl + ' flessen aanbevolen (circa ' + eur(c.wine) + ', niet in het totaal).')
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

  function submit(e) {
    e.preventDefault(); if (st.busy) return;
    var form = root.querySelector('#nt-form'), g = function (n) { return (form.elements[n].value || '').trim(); };
    var err = form.querySelector('.nt-err'), ok = form.querySelector('.nt-ok'), fail = form.querySelector('.nt-fail'), lib = form.querySelector('.nt-lib');
    var good = g('name') && /^\S+@\S+\.\S+$/.test(g('email')) && g('phone').length >= 6 && form.elements.consent.checked;
    err.hidden = !!good; ok.hidden = fail.hidden = true; if (!good) return;
    var f = { name: g('name'), company: g('company'), email: g('email'), phone: g('phone'), date: g('date'), notes: g('notes'), kind: +root.querySelector('input[name=nt-kind]:checked').value };
    var c = calc(), no = quoteNumber(), btn = form.querySelector('button[type=submit]');
    st.busy = true; btn.disabled = true; lib.hidden = false;
    loadPdf().then(function (JsPDF) {
      var doc = makePdf(JsPDF, f, c, no), blob = doc.output('blob');
      doc.save('Preventivo-Dvor-' + no + '.pdf');
      var fd = new FormData();
      ['name', 'company', 'email', 'phone', 'date', 'notes'].forEach(function (k) { fd.append(k, f[k]); });
      fd.append('lang', lang()); fd.append('number', no); fd.append('kind', f.kind ? 'Cena' : 'Pranzo'); fd.append('package', st.pkg === 'e' ? 'Essential' : 'Premium');
      fd.append('adults', c.ad); fd.append('kids', c.kd); fd.append('total', eur(c.tot)); fd.append('deposit', eur(c.dep));
      fd.append('menu', c.sel.map(function (s) { return s.d[0] + (s.d[1] ? ' (+' + s.d[1] + ' €)' : ''); }).join(' | '));
      fd.append('website', form.elements.website.value); fd.append('t', String(t0));
      fd.append('pdf', blob, 'Preventivo-Dvor-' + no + '.pdf');
      return fetch('natale-mail.php', { method: 'POST', body: fd, credentials: 'same-origin' }).then(function (r) { return r.json().catch(function () { return { ok: false }; }); });
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
