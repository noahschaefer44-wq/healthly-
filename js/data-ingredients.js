/* Healthly – Zutatendatenbank. Nährwerte pro 100 g (BLS/USDA, gerundet).
   Reihenfolge n: kcal, protein, carbs, fat, fiber, sugar, sat_fat, salt,
   vit_c, vit_d, vit_b12, folate, vit_a, vit_e, iron, calcium, magnesium, zinc, potassium */
(function () {
  const KEYS = ['kcal','protein','carbs','fat','fiber','sugar','sat_fat','salt','vit_c','vit_d','vit_b12','folate','vit_a','vit_e','iron','calcium','magnesium','zinc','potassium'];
  const CATS = {
    produce:['Obst & Gemüse','🥦'], bakery:['Brot & Backwaren','🥖'], dairy_eggs:['Milch & Eier','🥛'],
    meat_fish:['Fleisch & Fisch','🥩'], plant_protein:['Tofu & Co.','🌱'], frozen:['Tiefkühl','🧊'],
    staples:['Nudeln, Reis & Getreide','🌾'], canned:['Konserven & Gläser','🥫'], spices:['Gewürze, Öle & Saucen','🧂'],
    nuts_seeds:['Nüsse & Samen','🥜'], sweets:['Süßes & Backen','🍫'], drinks:['Getränke','🧃'], other:['Sonstiges','🛒']
  };
  // id, Name, Kategorie, tierisch, Allergene, Flags, Einheiten(g), Packung g, Haltbarkeit Tage, Nährwerte
  const RAW = [
    // Getreide & Beilagen
    ['oats','Haferflocken','staples','none','gluten','',{EL:10,Tasse:90},500,180,[370,13.5,58.7,7,10,1.2,1.3,.01,0,0,0,33,0,.8,4.4,50,130,3.6,360]],
    ['rice','Reis','staples','none','','',{Tasse:180},1000,365,[350,7,78,.6,1.4,.1,.2,.01,0,0,0,20,0,.1,.8,10,35,1.2,115]],
    ['pasta','Nudeln','staples','none','gluten','',{},500,365,[355,12.5,71,1.5,3.2,3,.3,.01,0,0,0,18,0,.3,1.3,25,53,1.4,223]],
    ['rice_noodles','Reisnudeln','staples','none','','',{},250,365,[360,6,80,.6,1,0,.1,.01,0,0,0,10,0,.1,.5,10,20,1,80]],
    ['quinoa','Quinoa','staples','none','','',{Tasse:170},500,365,[368,14,64,6,7,2.5,.7,.02,0,0,0,184,1,2.4,4.6,47,197,3.1,563]],
    ['couscous','Couscous','staples','none','gluten','',{},500,365,[360,12.7,72,1.6,5,2,.2,.02,0,0,0,25,0,.1,1,25,44,.8,166]],
    ['potato','Kartoffeln','produce','none','','',{Stück:90},2000,30,[77,2,17,.1,2.1,.8,.03,.01,20,0,0,15,0,.1,.8,12,23,.3,425]],
    ['sweet_potato','Süßkartoffel','produce','none','','',{Stück:300},1000,21,[86,1.6,20,.1,3,4.2,.03,.1,2.4,0,0,11,710,.3,.6,30,25,.3,337]],
    ['bread','Vollkornbrot','bakery','none','gluten','',{Scheibe:45},750,5,[220,8,38,1.5,8,3,.3,1.1,0,0,0,55,0,.7,2.4,40,80,1.6,220]],
    ['wrap','Wrap-Fladen','bakery','none','gluten','',{Stück:60},320,14,[305,8,50,8,3,3,3,1.5,0,0,0,30,0,.5,2.2,80,30,.8,110]],
    ['muesli','Müsli (ungesüßt)','staples','none','gluten','',{EL:12},750,180,[360,10,62,6,8,15,1,.05,0,0,0,50,0,1,4,60,110,2.5,400]],
    ['rice_cakes','Reiswaffeln','staples','none','','',{Stück:10},130,180,[385,8,81,2.8,3.5,.5,.6,.05,0,0,0,10,0,.2,1.2,10,60,1.5,220]],
    ['flour','Weizenmehl','staples','none','gluten','staple',{EL:10},1000,365,[340,10,72,1,3,.5,.2,.01,0,0,0,26,0,.3,1.2,15,20,.7,130]],
    // Hülsenfrüchte
    ['lentils','Linsen (trocken)','staples','none','','',{},500,365,[336,24,50,1.5,11,2,.2,.02,4,0,0,479,2,.5,7.5,60,80,4.8,810]],
    ['chickpeas','Kichererbsen (Dose)','canned','none','','',{Dose:240},240,540,[130,7,17,2.5,5,3,.3,.4,1,0,0,54,1,.3,2,40,35,1.2,220]],
    ['kidney_beans','Kidneybohnen (Dose)','canned','none','','',{Dose:250},250,540,[105,7,13,.5,6,1,.1,.5,1,0,0,80,0,.2,2,40,40,.9,300]],
    ['corn','Mais (Dose)','canned','none','','',{Dose:150},150,540,[85,3,15,1.3,3,3,.2,.5,5,0,0,40,10,.1,.6,5,25,.6,200]],
    ['peas_frozen','Erbsen (TK)','frozen','none','','',{},450,365,[70,5.5,10,.4,5,4,.1,.01,20,0,0,60,50,.1,1.5,25,30,.7,200]],
    ['mixed_veg_frozen','TK-Gemüsemix','frozen','none','','',{},600,365,[35,2.2,5,.3,2.6,3,.05,.05,20,0,0,40,300,.3,.6,25,15,.3,200]],
    // Pflanzliches Eiweiß
    ['tofu','Tofu (fest)','plant_protein','none','soy','',{Packung:200},200,21,[140,15,2,8,1,.5,1,.01,0,0,0,30,0,.5,2.7,350,60,1.4,150]],
    ['tempeh','Tempeh','plant_protein','none','soy','',{Packung:200},200,21,[190,19,9,11,4,0,2,.01,0,0,0,50,0,.3,2.7,110,80,1.1,410]],
    ['vegan_protein','Erbsenprotein-Pulver','staples','none','','',{EL:10},500,365,[380,80,5,6,3,1,1,1.5,0,0,0,0,0,0,8,100,80,4,300]],
    // Milchprodukte & Eier
    ['milk','Milch 1,5 %','dairy_eggs','dairy','milk','lactose,liquid',{},1000,7,[47,3.4,4.8,1.5,0,4.8,1,.1,1,.1,.4,5,15,.05,0,120,12,.4,150]],
    ['yogurt','Naturjoghurt','dairy_eggs','dairy','milk','lactose',{Becher:150},500,14,[66,3.8,4.7,3.5,0,4.7,2.3,.1,1,.1,.4,7,30,.1,0,120,12,.5,155]],
    ['skyr','Skyr','dairy_eggs','dairy','milk','lactose',{Becher:450},450,14,[63,11,4,.2,0,4,.1,.1,0,0,.5,7,1,0,0,120,12,.4,150]],
    ['quark','Magerquark','dairy_eggs','dairy','milk','lactose',{Becher:250},250,14,[67,12,4,.3,0,4,.2,.1,0,0,.5,20,1,0,0,110,10,.5,150]],
    ['cheese','Gouda','dairy_eggs','dairy','milk','',{Scheibe:25},200,28,[356,25,0,28,0,0,18,1.8,0,.5,1.7,20,250,.5,.2,800,30,3.9,90]],
    ['parmesan','Parmesan','dairy_eggs','dairy','milk','',{EL:8},100,60,[400,36,0,28,0,0,18,3.6,0,.5,1.5,7,250,.5,.8,1180,44,3,100]],
    ['mozzarella','Mozzarella','dairy_eggs','dairy','milk','lactose',{Packung:125},125,14,[250,18,1,19,0,1,12,.6,0,.3,2,10,180,.3,.4,500,20,2.5,75]],
    ['feta','Feta','dairy_eggs','dairy','milk','lactose',{Packung:200},200,21,[264,14,4,21,0,4,15,2.7,0,.4,1.4,23,125,.4,.7,400,20,2.9,95]],
    ['cream_cheese','Frischkäse','dairy_eggs','dairy','milk','lactose',{Packung:200},200,21,[250,6,3,24,0,3,16,.9,0,.3,.5,10,250,.5,.1,90,8,.5,110]],
    ['cream','Sahne','dairy_eggs','dairy','milk','lactose,liquid',{Becher:200},200,14,[292,2.4,3.4,30,0,3.4,20,.1,1,.5,.2,4,300,.9,0,80,8,.4,100]],
    ['butter','Butter','dairy_eggs','dairy','milk','staple',{EL:12},250,60,[740,.7,.6,82,0,.6,52,.02,0,1,.15,3,650,2.3,.02,13,2,.1,24]],
    ['egg','Ei','dairy_eggs','egg','eggs','',{Stück:60},600,28,[137,12.5,.7,9.5,0,.4,2.8,.35,0,2.5,1.5,47,160,1.1,1.8,56,12,1.3,138]],
    ['whey','Whey-Proteinpulver','staples','dairy','milk','lactose',{EL:10},750,365,[385,78,7,6,0,6,3,.5,0,0,1,0,0,0,1,400,50,2,600]],
    ['oat_milk','Haferdrink','drinks','none','gluten','liquid',{},1000,180,[45,.8,7,1.5,.8,4,.2,.1,0,.75,.38,2,0,0,.3,120,10,.2,80]],
    ['soy_milk','Sojadrink','drinks','none','soy','liquid',{},1000,180,[39,3.3,2.5,1.8,.5,2.5,.3,.03,0,.75,.38,20,0,0,.4,120,25,.3,120]],
    ['soy_yogurt','Sojajoghurt','dairy_eggs','none','soy','',{Becher:150},500,14,[50,4,2,2.5,.5,2,.4,.1,0,.75,.38,15,0,0,.5,120,20,.3,100]],
    ['coconut_milk','Kokosmilch (Dose)','canned','none','','liquid',{Dose:400},400,540,[180,2,3,18,0,2,16,.05,1,0,0,10,0,.2,1.6,15,20,.7,200]],
    // Fleisch & Fisch
    ['chicken','Hähnchenbrust','meat_fish','poultry','','',{Stück:150},500,3,[106,23,0,1.5,0,0,.4,.15,0,.2,.3,10,10,.3,.4,5,28,.7,300]],
    ['turkey','Putenbrust','meat_fish','poultry','','',{Stück:150},500,3,[105,24,0,1,0,0,.3,.15,0,.2,.4,10,10,.3,.5,5,28,.9,300]],
    ['beef_mince','Rinderhack','meat_fish','meat','','',{},500,2,[250,18,0,20,0,0,8,.15,0,.1,2.5,10,10,.5,2.2,10,20,4.3,290]],
    ['ham','Kochschinken','meat_fish','pork','','',{Scheibe:20},150,7,[110,20,1,3,0,1,1,2.5,0,.3,.6,3,0,.2,.8,10,20,1.7,300]],
    ['salmon','Lachsfilet','meat_fish','fish','fish','',{Stück:125},250,2,[208,20,0,13,0,0,3,.1,0,11,3.2,26,50,3.5,.3,12,27,.4,360]],
    ['cod','Kabeljau','meat_fish','fish','fish','',{Stück:150},300,2,[80,18,0,.7,0,0,.1,.2,0,1,1,10,10,.5,.3,20,30,.5,390]],
    ['tuna','Thunfisch (Dose, im Wasser)','canned','fish','fish','',{Dose:120},120,720,[110,25,0,1,0,0,.3,1,0,4,3,5,15,.5,1,10,30,.8,250]],
    ['shrimp','Garnelen','meat_fish','seafood','crustaceans','',{},250,2,[90,19,.5,1,0,0,.2,.6,0,0,1.2,20,10,1.3,.5,60,40,1.4,180]],
    // Gemüse
    ['tomato','Tomate','produce','none','','',{Stück:100},500,7,[18,.9,3.9,.2,1.2,2.6,.05,.01,20,0,0,15,42,.5,.3,10,11,.2,237]],
    ['cherry_tomato','Cherrytomaten','produce','none','','',{Handvoll:50},250,7,[18,.9,3.9,.2,1.2,2.6,.05,.01,20,0,0,15,42,.5,.3,10,11,.2,237]],
    ['onion','Zwiebel','produce','none','','',{Stück:80},1000,30,[40,1.1,9,.1,1.7,4.2,.03,.01,7,0,0,19,2,.1,.2,23,10,.2,146]],
    ['red_onion','Rote Zwiebel','produce','none','','',{Stück:80},500,30,[40,1.1,9,.1,1.7,4.2,.03,.01,7,0,0,19,2,.1,.2,23,10,.2,146]],
    ['garlic','Knoblauch','produce','none','','',{Zehe:4},50,30,[145,6.4,30,.5,2,1,.1,.02,31,0,0,3,0,.1,1.7,181,25,1.2,401]],
    ['bell_pepper','Paprika','produce','none','','',{Stück:150},300,10,[31,1,6,.3,2,4.2,.05,.01,120,0,0,46,157,1.6,.4,10,12,.3,211]],
    ['broccoli','Brokkoli','produce','none','','',{Stück:350},500,7,[34,2.8,4,.4,2.6,1.7,.1,.03,89,0,0,63,31,.8,.7,47,21,.4,316]],
    ['spinach','Spinat','produce','none','','',{Handvoll:30},250,5,[23,2.9,1,.4,2.2,.4,.06,.2,28,0,0,194,469,2,2.7,99,79,.5,558]],
    ['cucumber','Gurke','produce','none','','',{Stück:350},350,10,[15,.7,2.2,.1,.5,1.7,.03,.01,3,0,0,7,5,.1,.3,16,13,.2,147]],
    ['carrot','Karotte','produce','none','','',{Stück:80},1000,21,[41,.9,7,.2,2.8,4.7,.04,.1,6,0,0,19,835,.7,.3,33,12,.2,320]],
    ['zucchini','Zucchini','produce','none','','',{Stück:250},500,10,[17,1.2,2,.3,1,1.7,.06,.01,18,0,0,24,10,.1,.4,16,17,.3,261]],
    ['mushroom','Champignons','produce','none','','',{},250,5,[22,3.1,.5,.3,1,.5,.05,.01,2,.2,.04,16,0,0,.5,3,9,.5,318]],
    ['eggplant','Aubergine','produce','none','','',{Stück:300},300,7,[25,1,3,.2,3,3,.04,.01,2,0,0,22,1,.3,.2,9,14,.2,230]],
    ['cauliflower','Blumenkohl','produce','none','','',{Stück:600},600,7,[25,1.9,2,.3,2,1.9,.1,.03,48,0,0,57,0,.1,.4,22,15,.3,299]],
    ['red_cabbage','Rotkohl','produce','none','','',{},1000,21,[31,1.4,4,.2,2.5,3,.03,.02,57,0,0,18,2,.1,.5,45,15,.2,243]],
    ['lettuce','Blattsalat','produce','none','','',{Stück:200},200,5,[14,1.4,1.4,.2,1.3,.9,.03,.02,13,0,0,60,370,.3,1,35,13,.2,240]],
    ['rucola','Rucola','produce','none','','',{Handvoll:20},100,5,[25,2.6,2,.7,1.6,2,.2,.02,15,0,0,97,120,.4,1.5,160,47,.5,370]],
    ['leek','Lauch','produce','none','','',{Stück:200},300,14,[31,2,4,.3,2.6,3,.04,.02,20,0,0,64,83,.9,2,59,28,.1,180]],
    ['celery','Staudensellerie','produce','none','celery','',{Stück:60},400,14,[16,.7,1.5,.2,1.6,1.3,.04,.15,8,0,0,36,22,.3,.2,40,11,.1,260]],
    ['pumpkin','Kürbis','produce','none','','',{},1000,21,[26,1,5,.1,2,3,.05,.01,9,0,0,16,426,.4,.8,21,12,.3,340]],
    ['avocado','Avocado','produce','none','','',{Stück:150},150,5,[160,2,.8,15,6.7,.7,2.1,.01,10,0,0,81,7,2.1,.6,12,29,.6,485]],
    ['beetroot','Rote Bete','produce','none','','fructose',{Stück:120},500,21,[43,1.6,7,.2,2.8,7,.03,.1,5,0,0,109,2,.04,.8,16,23,.4,325]],
    ['ginger','Ingwer','produce','none','','',{TL:3},100,21,[80,1.8,15,.8,2,1.7,.2,.01,5,0,0,11,0,.3,.6,16,43,.3,415]],
    ['lemon','Zitrone','produce','none','','',{Stück:60},200,21,[29,1.1,3,.3,2.8,2.5,.04,.01,53,0,0,11,2,.2,.6,26,8,.1,138]],
    ['olives','Oliven','canned','none','','histamine',{},200,540,[145,1,4,15,3,0,2,3,1,0,0,3,20,3.8,3.3,52,11,.2,42]],
    // Obst
    ['banana','Banane','produce','none','','fructose',{Stück:120},1000,5,[89,1.1,20,.3,2.6,12,.1,.01,9,0,0,20,3,.1,.3,5,27,.15,358]],
    ['apple','Apfel','produce','none','','fructose',{Stück:180},1000,21,[52,.3,11.4,.2,2.4,10,.03,.01,5,0,0,3,3,.2,.1,6,5,.04,107]],
    ['berries_frozen','Beerenmix (TK)','frozen','none','','',{Handvoll:50},500,365,[45,.8,6,.4,4,5,.03,.01,20,0,0,15,3,.8,.6,20,12,.2,120]],
    ['blueberries','Blaubeeren','produce','none','','',{Handvoll:50},125,7,[57,.7,12,.3,2.4,10,.03,.01,10,0,0,6,3,.6,.3,6,6,.2,77]],
    ['strawberries','Erdbeeren','produce','none','','',{Handvoll:60},500,5,[32,.7,5.5,.3,2,4.9,.02,.01,59,0,0,24,1,.3,.4,16,13,.1,153]],
    ['mango','Mango','produce','none','','fructose',{Stück:300},300,7,[60,.8,13.5,.4,1.6,14,.1,.01,36,0,0,43,54,.9,.2,11,10,.1,168]],
    ['orange','Orange','produce','none','','',{Stück:180},1000,14,[47,.9,9,.2,2.4,9,.03,.01,50,0,0,30,11,.2,.1,40,10,.1,181]],
    ['kiwi','Kiwi','produce','none','','',{Stück:75},500,10,[61,1.1,9,.5,3,9,.03,.01,93,0,0,25,4,1.5,.3,34,17,.1,312]],
    ['dates','Datteln','sweets','none','','fructose',{Stück:8},250,365,[280,2.5,65,.4,7,63,.1,.01,0,0,0,15,7,.05,1,64,54,.4,696]],
    // Nüsse & Samen
    ['almonds','Mandeln','nuts_seeds','none','nuts','',{EL:10},200,180,[579,21,5,50,12,4,4,.01,0,0,0,44,0,26,3.7,264,268,3.1,733]],
    ['walnuts','Walnüsse','nuts_seeds','none','nuts','',{EL:8},200,180,[654,15,7,65,7,2.6,6,.01,1,0,0,98,1,.7,2.9,98,158,3.1,441]],
    ['cashews','Cashewkerne','nuts_seeds','none','nuts','',{EL:10},200,180,[553,18,30,44,3.3,6,8,.01,0,0,0,25,0,.9,6,37,292,5.8,660]],
    ['peanut_butter','Erdnussmus','nuts_seeds','none','peanuts','',{EL:16},250,180,[600,25,10,50,7,6,10,.5,0,0,0,87,0,9,1.9,49,168,3,650]],
    ['chia','Chiasamen','nuts_seeds','none','','',{EL:12},250,365,[486,17,8,31,34,0,3.3,.02,2,0,0,49,0,.5,7.7,631,335,4.6,407]],
    ['flax','Leinsamen','nuts_seeds','none','','',{EL:10},250,365,[534,18,2,42,27,1.5,3.7,.06,1,0,0,87,0,.3,5.7,255,392,4.3,813]],
    ['sunflower_seeds','Sonnenblumenkerne','nuts_seeds','none','','',{EL:10},250,180,[584,21,11,51,9,2.6,5,.02,1.4,0,0,227,3,35,5.3,78,325,5,645]],
    ['pumpkin_seeds','Kürbiskerne','nuts_seeds','none','','',{EL:10},250,180,[560,30,5,46,6,1.4,8,.02,2,0,0,58,1,2.2,8.8,46,592,7.8,809]],
    ['sesame_seeds','Sesam','nuts_seeds','none','sesame','',{TL:4},100,365,[573,18,12,50,12,0,7,.02,0,0,0,97,0,.25,14.6,975,351,7.8,468]],
    ['tahini','Tahini','nuts_seeds','none','sesame','',{EL:15},250,365,[595,17,1,54,9,.5,7.5,.1,0,0,0,98,0,.3,8.9,426,95,4.6,414]],
    // Süßes & Backen
    ['cocoa','Kakaopulver','sweets','none','','',{EL:8},125,365,[230,20,10,14,33,1,8,.03,0,0,0,32,0,.1,10,128,499,6.8,1500]],
    ['honey','Honig','sweets','honey','','fructose',{TL:7,EL:20},500,730,[304,.3,82,0,.2,82,0,.01,.5,0,0,2,0,0,.4,6,2,.2,52]],
    ['maple_syrup','Ahornsirup','sweets','none','','',{TL:7,EL:20},250,730,[260,0,67,0,0,60,0,.01,0,0,0,0,0,0,.1,67,14,1.5,212]],
    ['sugar','Zucker','sweets','none','','staple',{TL:4,EL:12},1000,1000,[400,0,100,0,0,100,0,0,0,0,0,0,0,0,0,1,0,0,2]],
    // Öle, Gewürze, Saucen
    ['olive_oil','Olivenöl','spices','none','','staple,liquid',{TL:4.5,EL:9},500,365,[884,0,0,100,0,0,14,0,0,0,0,0,0,14,.4,1,0,0,1]],
    ['rapeseed_oil','Rapsöl','spices','none','','staple,liquid',{TL:4.5,EL:9},500,365,[884,0,0,100,0,0,7,0,0,0,0,0,0,22,.1,1,0,0,1]],
    ['salt','Salz','spices','none','','staple',{TL:6,Prise:1},500,1000,[0,0,0,0,0,0,0,98,0,0,0,0,0,0,.2,24,1,0,8]],
    ['pepper','Pfeffer','spices','none','','staple',{TL:2.5,Prise:.5},50,1000,[250,10,38,3.3,25,0,1.4,.05,0,0,0,10,27,4.1,9.7,443,171,1.2,1329]],
    ['vegetable_stock','Gemüsebrühe (Pulver)','spices','none','celery','staple',{TL:5},200,365,[240,10,35,6,2,7,3,40,0,0,0,10,0,0,1,60,20,.5,300]],
    ['balsamic','Balsamico','spices','none','','staple,liquid',{TL:5,EL:15},250,730,[88,.5,17,0,0,15,0,.03,0,0,0,0,0,0,.7,27,12,.1,112]],
    ['soy_sauce','Sojasauce','spices','none','soy,gluten','liquid',{TL:5,EL:15},250,365,[60,6,5,.1,.8,1.7,0,15,0,0,0,14,0,0,1.5,20,40,.5,180]],
    ['tomato_paste','Tomatenmark','canned','none','','',{EL:15},200,365,[82,4.3,13,.5,4,12,.1,.3,22,0,0,30,55,4,3,36,42,1,1014]],
    ['canned_tomatoes','Dosentomaten','canned','none','','',{Dose:400},400,540,[22,1.2,3.5,.2,1.2,3.3,.03,.03,10,0,0,15,25,.9,.6,15,11,.2,250]],
    ['mustard','Senf','spices','none','mustard','',{TL:5},200,365,[70,5,4,4,3,3,.3,5,0,0,0,10,0,0,1.5,60,60,.5,150]],
    ['curry_paste','Currypaste','spices','none','','spicy',{TL:8,EL:20},200,365,[110,3,12,6,4,6,1,5,10,0,0,20,50,3,3,40,50,1,300]],
    ['curry_powder','Currypulver','spices','none','','staple,spicy',{TL:2.5},50,730,[325,14,55,14,53,3,2,.2,1,0,0,10,4,25,19,478,255,4,1170]],
    ['paprika_powder','Paprikapulver','spices','none','','staple',{TL:2.5},50,730,[282,14,54,13,35,10,2,.1,2,0,0,49,2463,29,21,229,188,4,2280]],
    ['cumin','Kreuzkümmel','spices','none','','staple',{TL:2},50,730,[375,18,44,22,11,2,1.5,.2,8,0,0,10,64,3.3,66,931,366,4.8,1788]],
    ['cinnamon','Zimt','spices','none','','staple',{TL:2.6},50,730,[247,4,55,1.2,53,2,.3,.02,4,0,0,6,15,2.3,8,1002,60,1.8,431]],
    ['chili_flakes','Chiliflocken','spices','none','','staple,spicy',{TL:1.5,Prise:.3},50,730,[320,12,57,14,28,10,2,.1,76,0,0,106,1000,30,7,148,152,2,1900]],
    ['oregano','Oregano (getrocknet)','spices','none','','staple',{TL:1},30,730,[265,9,69,4,42,4,1.6,.1,2,0,0,237,85,18,37,1597,270,4.4,1260]],
    ['basil','Basilikum (frisch)','produce','none','','',{Handvoll:10},30,7,[23,3.2,2.7,.6,1.6,.3,.04,.01,18,0,0,68,264,.8,3.2,177,64,.8,295]],
    ['parsley','Petersilie (frisch)','produce','none','','',{Handvoll:10},30,7,[36,3,6,.8,3.3,.9,.13,.06,133,0,0,152,421,.75,6,138,50,1.1,554]],
    ['cilantro','Koriander (frisch)','produce','none','','',{Handvoll:10},30,7,[23,2.1,3.7,.5,2.8,.9,.03,.05,27,0,0,62,337,2.5,1.8,67,26,.5,521]],
    ['pesto','Pesto','canned','none','milk,nuts','',{EL:15},190,60,[460,5,4,47,2,2,7,2,2,0,0,20,30,10,1,150,50,1,200]],
    ['hummus','Hummus','canned','none','sesame','',{EL:20},200,10,[166,8,14,10,6,.3,1.4,.7,1,0,0,59,1,2,2.4,38,71,1.8,228]],
    // Getränke
    ['coffee','Kaffee (gebrüht)','drinks','none','','liquid',{},500,5,[2,.2,0,0,0,0,0,.01,0,0,0,2,0,.02,.1,2,7,0,49]],
    ['water','Wasser','drinks','none','','staple,liquid',{},1000,1000,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]
  ];

  const INGREDIENTS = RAW.map(r => {
    const n = {};
    KEYS.forEach((k, i) => { n[k] = r[9][i]; });
    return { id: r[0], name: r[1], cat: r[2], animal: r[3],
      allergens: r[4] ? r[4].split(',') : [], flags: r[5] ? r[5].split(',') : [],
      units: r[6], pack_g: r[7], shelf_days: r[8], n };
  });
  const MAP = new Map(INGREDIENTS.map(i => [i.id, i]));

  window.HD = window.HD || {};
  Object.assign(window.HD, { NUTRIENT_KEYS: KEYS, CATS, INGREDIENTS, ING: MAP });
})();
