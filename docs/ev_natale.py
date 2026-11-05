import json,sys
f=sys.argv[1]
d=json.load(open(f,encoding='utf8'))
N={
 "time": "12:30",
 "desc_it": "Venerdì 25 dicembre, alle 12:30, dopo il successo dell'anno scorso, un altro Natale insieme da Dvor.\nUn pranzo di festa in famiglia, tra le sale in pietra e legno e le colline del Collio. Aperitivo di benvenuto: spuma di salmone in un cestino croccante con un calice di bollicine. Antipasti: vitello tonnato cotto a bassa temperatura, con maionese fatta in casa e il suo fondo; flan di topinambur con radicchio, fonduta e noci. Primi: žlikrofi con noci e pancetta D'Osvaldo; risotto alla barbabietola con formaggio Frant e nocciole. Sorbetto melagrana e limone. Secondo: faraona all'arancia della nostra azienda agricola Dvor, con salsa all'arancia e patate al forno. Dolce natalizio a sorpresa dalla creatività dello chef. Menù bimbi: gnocchi al ragù, salame di cioccolato, ljubljanska fritta con patate. Menù vegetariano su richiesta e su prenotazione, con varianti del menù base. Per gli allergeni chiedere al personale di sala. Posti limitati: prenota in anticipo.",
 "desc_en": "Friday 25 December, at 12:30: after last year's success, another Christmas together at Dvor.\nA festive family lunch among the stone-and-wood rooms and the hills of the Collio. Welcome aperitif: salmon mousse in a crispy basket with a glass of sparkling wine. Starters: veal in tuna sauce, slow-cooked, with homemade mayonnaise and its juices; Jerusalem artichoke flan with radicchio, fondue and walnuts. First courses: žlikrofi with walnuts and D'Osvaldo pancetta; beetroot risotto with Frant cheese and hazelnuts. Pomegranate and lemon sorbet. Main course: guinea fowl with orange from our own Dvor farm, with orange sauce and roast potatoes. Surprise Christmas dessert from the chef's creativity. Children's menu: gnocchi with ragù, chocolate salami, Ljubljana-style cutlet with potatoes. Vegetarian menu on request and with booking, with variations of the base menu. For allergens please ask the dining-room staff. Limited seats: book ahead.",
 "price": "65 € a persona · 20 € a bambino, bevande escluse",
 "flyer": "images/menu-natale-2026.jpg",
 "flyerPdf": "images/menu-natale-2026.pdf",
 "menu": "",
 "menuType": ""
}
for e in d:
    if e.get('id')=='natale-20261225':
        e.update(N)
json.dump(d,open(f,'w',encoding='utf8'),ensure_ascii=False,indent=2)
print('ok')
