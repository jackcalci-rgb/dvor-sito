import json,sys
f=sys.argv[1]
d=json.load(open(f,encoding='utf8'))
N={
 "time": "12:30",
 "title_it": "Natale 2026 all’Osteria Dvor",
 "title_en": "Christmas 2026 at Osteria Dvor",
 "desc_it": "Venerdì 25 dicembre, ore 12:30, festeggiamo insieme il pranzo di Natale tra le colline del Collio.\nMenù delle feste. Aperitivo di benvenuto: spuma di salmone in un cestino croccante, con un calice di bollicine. Antipasti: vitello tonnato cotto a bassa temperatura, con maionese fatta in casa e il suo fondo; flan di topinambur con radicchio, fonduta e noci. Primi: žlikrofi con noci e pancetta D’Osvaldo; risotto alla barbabietola con formaggio Frant e nocciole. Sorbetto melagrana e limone, una dolce pausa tra i primi e il secondo. Secondo: faraona all’arancia, con salsa all’arancia e patate al forno. Dolce natalizio a sorpresa, dalla creatività dello chef. € 65 a persona, bevande escluse.\nMenù bimbi. Gnocchi al ragù, salame di cioccolato e Ljubljanska fritta con patate. € 20 a bambino, bevande escluse.\nMenù vegetariano disponibile su richiesta e su prenotazione, con varianti del menù base.\nI posti sono limitati: prenotate il vostro tavolo al telefono 0481 090740 o su WhatsApp 392 388 3900. Per allergie e intolleranze chiedete al personale di sala o indicatelo al momento della prenotazione.",
 "desc_en": "Friday 25 December, 12:30 pm: we celebrate Christmas lunch together among the hills of the Collio.\nFestive menu. Welcome aperitif: salmon mousse in a crispy basket, with a glass of sparkling wine. Starters: slow-cooked veal in tuna sauce, with homemade mayonnaise and its juices; Jerusalem artichoke flan with radicchio, fondue and walnuts. First courses: žlikrofi with walnuts and D’Osvaldo pancetta; beetroot risotto with Frant cheese and hazelnuts. Pomegranate and lemon sorbet, a sweet pause between the first courses and the main course. Main course: guinea fowl with orange, with orange sauce and roast potatoes. Surprise Christmas dessert from the chef’s creativity. € 65 per person, drinks not included.\nChildren’s menu. Gnocchi with ragù, chocolate salami and Ljubljana-style cutlet with potatoes. € 20 per child, drinks not included.\nVegetarian menu available on request and by reservation, with variations on the base menu.\nSeats are limited: book your table by phone on +39 0481 090740 or on WhatsApp +39 392 388 3900. For allergies and intolerances, ask our dining-room staff or tell us when you book.",
 "price": "65 € a persona · 20 € a bambino, bevande escluse",
 "flyer": "images/menu-natale-2026.jpg",
 "flyer2": "",
 "flyerPdf": "images/menu-natale-2026.pdf",
 "menu": "",
 "menuType": ""
}
for e in d:
    if e.get('id')=='natale-20261225':
        e.update(N)
json.dump(d,open(f,'w',encoding='utf8'),ensure_ascii=False,indent=2)
print('ok')
