import json,sys
f=sys.argv[1]
d=json.load(open(f,encoding='utf8'))
N={
 "time": "12:30",
 "title_it": "Natale 2026 all’Osteria Dvor",
 "title_en": "Christmas 2026 at Osteria Dvor",
 "desc_it": "Venerdì 25 dicembre, ore 12:30, festeggiamo insieme il pranzo di Natale tra le colline del Collio.\nMenù delle feste. Aperitivo di benvenuto: spuma di salmone in un cestino croccante, con un calice di bollicine. Vitello tonnato cotto a bassa temperatura, con maionese fatta in casa e il suo fondo. Flan di topinambur con radicchio, fonduta e noci. Žlikrofi con noci e pancetta D’Osvaldo. Risotto alla barbabietola con formaggio Frant e nocciole. Sorbetto melagrana e limone. Faraona all’arancia della nostra azienda agricola, con patate al forno. Dolce natalizio a sorpresa, dalla creatività dello chef. € 65 a persona, bevande escluse.\nMenù vegetariano, su prenotazione. Aperitivo di benvenuto: spuma di basilico in un cestino croccante, con un calice di bollicine. Seitan tonnato. Flan di topinambur con radicchio, fonduta e noci. Žlikrofi ripieni di noci e cavolo nero. Risotto alla barbabietola con formaggio Frant e nocciole. Sorbetto melagrana e limone. Scaloppa di sedano rapa con erbette e vinaigrette di noci. Dolce natalizio a sorpresa, dalla creatività dello chef. € 65 a persona, bevande escluse.\nMenù bimbi. Gnocchi al ragù, Ljubljanska fritta con patate e salame di cioccolato. € 20 a bambino, bevande escluse.\nI posti sono limitati: prenotate il vostro tavolo al telefono 0481 090740 o su WhatsApp 392 388 3900. Se desiderate il menù vegetariano o avete allergie e intolleranze, indicatelo al momento della prenotazione.",
 "desc_en": "Friday 25 December, 12:30 pm: we celebrate Christmas lunch together among the hills of the Collio.\nFestive menu. Welcome aperitif: salmon mousse in a crispy basket, with a glass of sparkling wine. Slow-cooked veal in tuna sauce, with homemade mayonnaise and its juices. Jerusalem artichoke flan with radicchio, fondue and walnuts. Žlikrofi with walnuts and D’Osvaldo pancetta. Beetroot risotto with Frant cheese and hazelnuts. Pomegranate and lemon sorbet. Guinea fowl with orange from our own farm, with roast potatoes. Surprise Christmas dessert from the chef’s creativity. € 65 per person, drinks not included.\nVegetarian menu, on booking. Welcome aperitif: basil mousse in a crispy basket, with a glass of sparkling wine. Seitan in vegetable tuna sauce. Jerusalem artichoke flan with radicchio, fondue and walnuts. Žlikrofi filled with walnuts and black cabbage. Beetroot risotto with Frant cheese and hazelnuts. Pomegranate and lemon sorbet. Celeriac cutlet with greens and walnut vinaigrette. Surprise Christmas dessert from the chef’s creativity. € 65 per person, drinks not included.\nChildren’s menu. Gnocchi with ragù, Ljubljana-style cutlet with potatoes and chocolate salami. € 20 per child, drinks not included.\nSeats are limited: book your table by phone on +39 0481 090740 or on WhatsApp +39 392 388 3900. If you would like the vegetarian menu or have allergies or intolerances, please tell us when you book.",
 "price": "65 € a persona (anche vegetariano) · 20 € a bambino, bevande escluse",
 "flyer": "images/menu-natale-2026.jpg",
 "flyer2": "images/menu-natale-2026-vegetariano.jpg",
 "flyerPdf": "images/menu-natale-2026.pdf",
 "menu": "",
 "menuType": ""
}
for e in d:
    if e.get('id')=='natale-20261225':
        e.update(N)
json.dump(d,open(f,'w',encoding='utf8'),ensure_ascii=False,indent=2)
print('ok')
