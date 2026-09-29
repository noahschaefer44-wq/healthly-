/* Healthly – Rezepte. Mengen in Gramm/ml für die GANZE Basisportion (servings).
   Nährwerte, Allergene und Diät-Eignung werden aus den Zutaten berechnet (logic.js).
   Schritt-Format: 'Text' oder 'Text|Minuten' (Timer). Zutat: [id, gramm, 'o' = optional]. */
(function () {
  const GRAD = {
    breakfast: [['#FFE9C7','#FFD1A1'],['#E6F5D0','#BFE3A0'],['#FDE2E4','#F9C5CC'],['#DFF1FF','#BFE0FA']],
    lunch: [['#D7F5E3','#A9E4C4'],['#FFF0C9','#FFDC8F'],['#E4E9FF','#C7D2FF']],
    dinner: [['#FFDCCB','#FFB998'],['#DDEBFF','#B9D3F7'],['#EAD9FF','#D2B8F5'],['#D9F2E6','#B0E0C8']],
    snack: [['#E8F5C8','#CDEB93'],['#FFE2D6','#FFC7B0'],['#DDF3F4','#B7E4E6']],
    dessert: [['#FFDDE8','#FFBFD3'],['#EBDDFF','#D3BDF8']],
    drink: [['#D9F7EE','#A6E8D2'],['#FFF1C4','#FFE08A'],['#FFDCE0','#FFB9C2']]
  };
  let gi = 0;
  const out = [];
  function R(id, title, emoji, meals, cuisine, prep, cook, servings, utensils, tags, ings, steps, o) {
    o = o || {};
    const first = meals[0];
    const g = GRAD[first] || GRAD.lunch;
    out.push({
      id, title, subtitle: o.sub || '', emoji, gradient: g[gi++ % g.length], cuisine,
      meal_types: meals, prep_min: prep, cook_min: cook, rest_min: o.rest || 0,
      difficulty: o.diff || 'easy', servings, utensils, tags,
      spice: o.spice || 0, cost: o.cost || 'medium',
      ingredients: ings.map(x => ({ ing: x[0], g: x[1], optional: x[2] === 'o' })),
      steps: steps.map(s => { const p = s.split('|'); return { text: p[0], timer_min: p[1] ? +p[1] : null }; }),
      storage: o.storage || '', tip: o.tip || ''
    });
  }

  /* ---------- FRÜHSTÜCK ---------- */
  R('overnight-oats','Overnight Oats mit Beeren','🫐',['breakfast'],'american',5,0,1,['bowl'],['meal_prep','quick','no_cook','budget'],
    [['oats',50],['skyr',150],['milk',100],['berries_frozen',80],['chia',10],['honey',7,'o']],
    ['Haferflocken, Chiasamen, Skyr und Milch in einem Glas glatt verrühren.','Abgedeckt mindestens 4 Stunden, am besten über Nacht, in den Kühlschrank stellen.','Mit aufgetauten Beeren toppen und nach Wunsch mit Honig süßen.'],
    {sub:'Cremig, fruchtig, fertig über Nacht',rest:480,storage:'Im Kühlschrank 2 Tage haltbar.',tip:'Ein Löffel Proteinpulver macht daraus ein High-Protein-Frühstück.',cost:'low'});
  R('porridge-banane','Bananen-Nuss-Porridge','🍌',['breakfast'],'american',3,7,1,['pot','stove'],['quick','budget','comfort'],
    [['oats',60],['milk',250],['banana',100],['walnuts',15],['cinnamon',1],['honey',7,'o']],
    ['Haferflocken mit Milch in einem Topf aufkochen.','Bei kleiner Hitze unter Rühren 5 Minuten köcheln, bis der Brei cremig ist.|5','Halbe Banane zerdrücken und unterrühren. Mit Zimt, Walnüssen und Bananenscheiben servieren.'],
    {sub:'Warm, sättigend, in 10 Minuten fertig',cost:'low',tip:'Mit Pflanzendrink schmeckt es genauso gut.'});
  R('avocado-ei-toast','Avocado-Ei-Toast','🥑',['breakfast'],'american',5,5,1,['pan','stove','toaster'],['quick'],
    [['bread',90],['avocado',75],['egg',120],['lemon',5],['salt',1],['pepper',.5],['chili_flakes',.3,'o'],['butter',5]],
    ['Brot toasten. Avocado mit Gabel zerdrücken, mit Zitronensaft, Salz und Pfeffer würzen.','Butter in der Pfanne erhitzen und die Eier als Spiegeleier braten, ca. 4 Minuten.|4','Avocadocreme auf das Brot streichen, Eier darauflegen, mit Chili bestreuen.'],
    {sub:'Der Klassiker mit Eiweiß und guten Fetten'});
  R('skyr-bowl','Skyr-Bowl mit Blaubeeren','🥣',['breakfast'],'german',5,0,1,['bowl'],['quick','no_cook','high_protein'],
    [['skyr',200],['blueberries',80],['muesli',40],['almonds',10],['honey',7,'o']],
    ['Skyr in eine Schüssel geben.','Blaubeeren, Müsli und gehackte Mandeln darauf verteilen.','Nach Wunsch mit Honig beträufeln.'],
    {sub:'Über 30 g Protein in 5 Minuten',tip:'Mit gefrorenen Beeren wird es schön kühl und saftig.'});
  R('tofu-scramble','Tofu-Rührei mit Spinat','🍳',['breakfast'],'american',5,10,2,['pan','stove'],['quick','budget'],
    [['tofu',200],['onion',60],['bell_pepper',100],['spinach',60],['rapeseed_oil',10],['paprika_powder',2],['cumin',1],['salt',1.5],['pepper',.5],['bread',90]],
    ['Zwiebel und Paprika klein würfeln. Öl in der Pfanne erhitzen und beides 4 Minuten anbraten.|4','Tofu mit der Gabel zerbröseln, dazugeben, mit Paprikapulver, Kreuzkümmel, Salz und Pfeffer würzen und 4 Minuten braten.|4','Spinat unterheben, zusammenfallen lassen. Mit Brot servieren.'],
    {sub:'Vegan, herzhaft und proteinreich',cost:'low'});
  R('protein-pancakes','Protein-Pancakes','🥞',['breakfast'],'american',5,10,1,['pan','stove'],['high_protein','quick'],
    [['oats',50],['egg',120],['banana',100],['quark',100],['butter',5],['cinnamon',1]],
    ['Haferflocken, Eier, Banane, Quark und Zimt mit dem Pürierstab oder im Mixer zu einem Teig verrühren.','Butter in der Pfanne erhitzen. Portionsweise kleine Pancakes bei mittlerer Hitze je 2 bis 3 Minuten pro Seite backen.|6','Mit Beeren oder Nussmus servieren.'],
    {sub:'Fluffig, ohne Mehl und Zucker',tip:'Wenn Blasen aufsteigen, ist es Zeit zum Wenden.'});
  R('chia-pudding-mango','Chia-Pudding mit Mango','🥭',['breakfast','dessert'],'american',5,0,1,['bowl'],['meal_prep','no_cook'],
    [['chia',30],['milk',200],['mango',80],['maple_syrup',10]],
    ['Chiasamen mit Milch und Ahornsirup verrühren, nach 5 Minuten noch einmal umrühren.','Mindestens 3 Stunden im Kühlschrank quellen lassen.','Mit Mangowürfeln toppen.'],
    {sub:'Vorbereiten, morgens nur noch toppen',rest:180,storage:'Im Kühlschrank 3 Tage haltbar.'});
  R('shakshuka','Shakshuka','🍅',['breakfast','lunch','dinner'],'middle_eastern',10,20,2,['pan','stove'],['one_pot','comfort'],
    [['canned_tomatoes',400],['egg',240],['onion',80],['bell_pepper',150],['garlic',6],['cumin',2],['paprika_powder',3],['olive_oil',15],['feta',40,'o'],['parsley',10],['salt',1.5],['pepper',.5]],
    ['Zwiebel und Paprika würfeln, Knoblauch hacken. In Olivenöl 5 Minuten anbraten, Gewürze zugeben.|5','Dosentomaten dazugeben und 10 Minuten bei mittlerer Hitze eindicken lassen.|10','Mulden in die Sauce drücken, Eier hineingleiten lassen, mit Deckel 6 Minuten stocken lassen.|6','Mit Feta und Petersilie bestreuen. Mit Brot servieren.'],
    {sub:'Eier in würziger Tomatensauce',spice:1});
  R('fruehstuecks-wrap','Frühstücks-Wrap','🌯',['breakfast'],'american',5,5,1,['pan','stove'],['quick'],
    [['wrap',60],['egg',120],['spinach',30],['cheese',25],['tomato',50],['salt',.5],['pepper',.3],['rapeseed_oil',4]],
    ['Eier verquirlen, salzen und pfeffern. In Öl in der Pfanne 2 Minuten stocken lassen, Spinat unterrühren.|2','Wrap kurz erwärmen, mit Rührei, Tomatenscheiben und Käse füllen.','Fest einrollen und halbieren.'],
    {sub:'Zum Mitnehmen'});
  R('quark-muesli-bowl','Quark-Müsli-Bowl mit Apfel','🍎',['breakfast'],'german',5,0,1,['bowl'],['quick','no_cook','budget','high_protein'],
    [['quark',200],['apple',100],['muesli',40],['cinnamon',1],['walnuts',10]],
    ['Quark in eine Schüssel geben.','Apfel in kleine Würfel schneiden, mit Zimt mischen und daraufgeben.','Müsli und gehackte Walnüsse darüberstreuen.'],
    {cost:'low'});
  R('vegan-haferbrei','Veganer Haferbrei mit Erdnussmus','🥜',['breakfast'],'american',3,7,1,['pot','stove'],['quick','budget'],
    [['oats',60],['soy_milk',250],['berries_frozen',100],['peanut_butter',15],['maple_syrup',10]],
    ['Haferflocken mit Sojadrink aufkochen und 5 Minuten köcheln lassen.|5','Beeren unterrühren und kurz miterwärmen.','Mit Erdnussmus und Ahornsirup servieren.'],
    {sub:'Pflanzlich und sättigend',cost:'low'});
  R('omelett-spinat-feta','Omelett mit Spinat und Feta','🧀',['breakfast','lunch'],'mediterranean',5,7,1,['pan','stove'],['quick','high_protein'],
    [['egg',180],['spinach',100],['feta',50],['butter',10],['salt',.5],['pepper',.3]],
    ['Eier mit Salz und Pfeffer verquirlen.','Butter in der Pfanne schmelzen, Spinat 1 Minute zusammenfallen lassen.|1','Eier darübergießen, bei mittlerer Hitze 3 Minuten stocken lassen, Feta darüberbröseln und zusammenklappen.|3'],
    {sub:'Wenig Kohlenhydrate, viel Eiweiß'});

  /* ---------- SNACKS ---------- */
  R('hummus-gemuese','Hummus mit Gemüsesticks','🥕',['snack'],'middle_eastern',5,0,1,['bowl'],['quick','no_cook','budget'],
    [['hummus',60],['carrot',100],['cucumber',80],['bell_pepper',80]],
    ['Gemüse waschen und in Sticks schneiden.','Mit Hummus zum Dippen servieren.'],{cost:'low'});
  R('apfel-erdnussmus','Apfel mit Erdnussmus','🍏',['snack'],'american',2,0,1,['bowl'],['quick','no_cook','budget'],
    [['apple',150],['peanut_butter',20]],['Apfel in Spalten schneiden.','Erdnussmus zum Dippen dazugeben.'],{cost:'low'});
  R('reiswaffel-avocado','Reiswaffeln mit Avocado','🥑',['snack'],'american',3,0,1,['bowl'],['quick','no_cook'],
    [['rice_cakes',20],['avocado',60],['salt',.5],['chili_flakes',.2,'o']],
    ['Avocado zerdrücken und salzen.','Auf den Reiswaffeln verteilen, nach Wunsch mit Chili bestreuen.']);
  R('kakao-quark','Kakao-Quark','🍫',['snack','dessert'],'german',3,0,1,['bowl'],['quick','no_cook','high_protein'],
    [['quark',200],['cocoa',8],['maple_syrup',8]],['Quark mit Kakao und Ahornsirup glatt rühren.','Nach Wunsch mit Beeren servieren.'],
    {sub:'Wie Schokopudding, aber mit 25 g Protein',cost:'low'});
  R('energy-balls','Dattel-Energy-Balls','🟤',['snack'],'american',15,0,4,['food_processor','bowl'],['meal_prep','no_cook'],
    [['oats',60],['dates',80],['peanut_butter',40],['cocoa',10],['chia',10]],
    ['Datteln entsteinen und mit den anderen Zutaten im Mixer oder mit dem Pürierstab zu einer klebrigen Masse verarbeiten.','Mit nassen Händen zu 12 kleinen Kugeln rollen.','Mindestens 30 Minuten kalt stellen.'],
    {sub:'12 Stück, 3 pro Portion',storage:'Im Kühlschrank 1 Woche haltbar.'});
  R('gurke-feta-happen','Gurke-Feta-Happen','🥒',['snack'],'greek',5,0,1,['bowl'],['quick','no_cook','low_calorie'],
    [['cucumber',150],['feta',40],['olives',20],['oregano',.5],['olive_oil',5]],
    ['Gurke in dicke Scheiben schneiden.','Feta, Oliven und Oregano darauf verteilen und mit Öl beträufeln.']);
  R('geroestete-kichererbsen','Geröstete Kichererbsen','🫘',['snack'],'middle_eastern',5,25,2,['oven','baking_tray'],['meal_prep','budget','high_protein'],
    [['chickpeas',240],['olive_oil',8],['paprika_powder',2],['cumin',1],['salt',1]],
    ['Ofen auf 200 °C vorheizen. Kichererbsen abtropfen und sehr gut trocken tupfen.','Mit Öl und Gewürzen mischen und auf einem Blech verteilen.','25 Minuten backen, dabei einmal wenden, bis sie knusprig sind.|25'],
    {cost:'low',storage:'Luftdicht 3 Tage haltbar, am besten frisch.'});
  R('mini-caprese','Mini-Caprese-Spieße','🍅',['snack'],'italian',5,0,1,['bowl'],['quick','no_cook'],
    [['cherry_tomato',120],['mozzarella',60],['basil',5],['olive_oil',5],['balsamic',5]],
    ['Tomaten und Mozzarella abwechselnd mit Basilikum auf Spieße stecken.','Mit Olivenöl und Balsamico beträufeln.']);
  R('thunfisch-gurken-boote','Thunfisch-Gurken-Boote','🐟',['snack','lunch'],'mediterranean',8,0,1,['bowl'],['quick','no_cook','high_protein','low_calorie'],
    [['tuna',120],['cucumber',150],['yogurt',30],['mustard',5],['lemon',5],['pepper',.3]],
    ['Gurke der Länge nach halbieren und das Kerngehäuse auskratzen.','Thunfisch mit Joghurt, Senf, Zitronensaft und Pfeffer mischen.','In die Gurkenhälften füllen.']);
  R('nuss-dattel-mix','Nuss-Dattel-Mix','🌰',['snack'],'american',2,0,1,['bowl'],['quick','no_cook'],
    [['almonds',15],['cashews',15],['dates',30]],['Datteln entsteinen und in Stücke schneiden.','Mit Mandeln und Cashews mischen und aus der Hand snacken.'],{sub:'Schneller Energiekick für unterwegs'});

  /* ---------- DESSERTS ---------- */
  R('schoko-chia-mousse','Schoko-Chia-Mousse','🍮',['dessert'],'american',5,0,2,['bowl','hand_blender'],['meal_prep','no_cook'],
    [['chia',40],['milk',300],['cocoa',15],['maple_syrup',25]],
    ['Alle Zutaten mit dem Pürierstab glatt mixen.','Mindestens 4 Stunden kalt stellen, bis es dick wie Pudding ist.'],{rest:240});
  R('frozen-joghurt-beeren','Frozen Joghurt mit Beeren','🍨',['dessert'],'american',5,0,2,['blender'],['quick','no_cook'],
    [['yogurt',300],['berries_frozen',200],['honey',20]],
    ['Gefrorene Beeren mit Joghurt und Honig im Mixer cremig pürieren.','Sofort servieren oder 30 Minuten einfrieren.'],{cost:'low'});
  R('bratapfel','Bratapfel mit Walnüssen','🍎',['dessert'],'german',10,25,2,['oven','baking_tray'],['comfort'],
    [['apple',360],['walnuts',20],['cinnamon',2],['honey',15],['butter',10]],
    ['Ofen auf 180 °C vorheizen. Kerngehäuse der Äpfel ausstechen.','Gehackte Walnüsse mit Honig, Zimt und Butter mischen und in die Äpfel füllen.','25 Minuten backen, bis die Äpfel weich sind.|25'],{sub:'Winterlicher Klassiker'});
  R('banana-nicecream','Bananen-Nicecream','🍦',['dessert'],'american',5,0,2,['blender'],['quick','no_cook','budget'],
    [['banana',300],['cocoa',10],['peanut_butter',20,'o']],
    ['Bananen in Scheiben mindestens 4 Stunden einfrieren.','Gefrorene Bananen mit Kakao im Mixer cremig pürieren, bei Bedarf zwischendurch abkratzen.','Sofort essen.'],{sub:'Eis ohne Zucker und Milch',cost:'low',rest:240});
  R('beeren-crumble','Beeren-Crumble','🥧',['dessert'],'american',10,20,2,['oven','baking_tray'],['comfort'],
    [['berries_frozen',250],['oats',60],['butter',30],['maple_syrup',25],['almonds',20],['cinnamon',1]],
    ['Ofen auf 190 °C vorheizen. Beeren in eine kleine Form geben.','Haferflocken, gehackte Mandeln, weiche Butter, Ahornsirup und Zimt zu Streuseln verkneten und darauf verteilen.','20 Minuten backen, bis die Streusel goldbraun sind.|20']);

  /* ---------- DRINKS ---------- */
  R('gruener-smoothie','Grüner Energie-Smoothie','🥬',['drink'],'american',5,0,1,['blender'],['quick','no_cook','low_calorie'],
    [['spinach',40],['banana',100],['apple',80],['water',150],['ginger',5]],
    ['Alle Zutaten in den Mixer geben.','Eine Minute auf höchster Stufe cremig mixen.']);
  R('protein-beeren-shake','Protein-Beeren-Shake','🥤',['drink'],'american',3,0,1,['blender'],['quick','no_cook','high_protein'],
    [['milk',250],['berries_frozen',100],['whey',30],['oats',20]],['Alles im Mixer cremig mixen.','Sofort trinken.']);
  R('mango-lassi','Mango-Lassi','🥭',['drink','dessert'],'indian',5,0,1,['blender'],['quick','no_cook'],
    [['yogurt',200],['mango',120],['milk',50],['honey',8]],['Alle Zutaten im Mixer glatt pürieren.','Gut gekühlt servieren.']);
  R('kakao-gainer','Kakao-Gainer-Shake','🍫',['drink'],'american',5,0,1,['blender'],['quick','no_cook','high_calorie','high_protein'],
    [['milk',300],['banana',120],['oats',60],['peanut_butter',25],['cocoa',10],['whey',30]],
    ['Alle Zutaten im Mixer 60 Sekunden mixen.','Direkt trinken.'],{sub:'Über 700 kcal zum Zunehmen'});
  R('zitrus-refresher','Zitrus-Refresher','🍊',['drink'],'american',5,0,1,['bowl'],['quick','no_cook','low_calorie'],
    [['orange',150],['lemon',40],['water',250],['honey',10]],['Orange und Zitrone auspressen.','Mit kaltem Wasser und Honig verrühren, mit Eis servieren.']);
  R('protein-eiskaffee','Protein-Eiskaffee','☕',['drink'],'american',3,0,1,['bowl'],['quick','no_cook','high_protein'],
    [['coffee',200],['milk',200],['whey',25],['maple_syrup',5]],['Kaffee abkühlen lassen.','Mit Milch, Proteinpulver und Ahornsirup im Shaker oder Mixer verrühren, über Eis gießen.']);

  /* ---------- MITTAGESSEN ---------- */
  R('quinoa-bowl-mediterran','Mediterrane Quinoa-Bowl','🥗',['lunch','dinner'],'mediterranean',10,15,2,['pot','stove'],['meal_prep','leftover_friendly'],
    [['quinoa',120],['cucumber',150],['cherry_tomato',200],['feta',80],['olives',40],['chickpeas',240],['olive_oil',20],['lemon',20],['parsley',10],['salt',1]],
    ['Quinoa unter kaltem Wasser abspülen, mit der doppelten Menge Wasser aufkochen und 15 Minuten bei kleiner Hitze garen.|15','Gurke und Tomaten würfeln, Kichererbsen abtropfen, Feta zerbröseln.','Alles mit Öl, Zitronensaft, Salz und Petersilie mischen. Lauwarm oder kalt servieren.'],
    {sub:'Sättigend und frisch',storage:'Im Kühlschrank 2 Tage haltbar.'});
  R('chicken-reis-bowl','Hähnchen-Reis-Bowl mit Brokkoli','🍚',['lunch','dinner'],'chinese',10,20,2,['pot','pan','stove'],['high_protein','meal_prep','leftover_friendly'],
    [['chicken',300],['rice',140],['broccoli',250],['carrot',100],['soy_sauce',30],['ginger',8],['garlic',6],['rapeseed_oil',10]],
    ['Reis nach Packungsanweisung kochen, ca. 15 Minuten.|15','Hähnchen in Streifen schneiden und im Öl 6 bis 8 Minuten goldbraun braten.|8','Brokkoli und Karotte in Stücken, Ingwer und Knoblauch dazugeben und 4 Minuten mitbraten. Mit Sojasauce ablöschen.|4','Alles auf dem Reis anrichten.'],
    {sub:'Klassische Meal-Prep-Box',storage:'Im Kühlschrank 3 Tage haltbar.'});
  R('linsen-curry','Rotes Linsen-Curry','🍛',['lunch','dinner'],'indian',10,25,2,['pot','stove'],['one_pot','budget','meal_prep','freezer','leftover_friendly'],
    [['lentils',200],['onion',100],['garlic',8],['ginger',10],['coconut_milk',200],['canned_tomatoes',200],['curry_powder',6],['olive_oil',10],['spinach',60],['salt',2]],
    ['Zwiebel, Knoblauch und Ingwer fein hacken und im Öl 4 Minuten anbraten. Curry zugeben.|4','Linsen, Tomaten, Kokosmilch und 300 ml Wasser dazugeben und 20 Minuten köcheln lassen, bis die Linsen weich sind.|20','Spinat unterrühren, mit Salz abschmecken.'],
    {sub:'Vegan, günstig und richtig satt',spice:1,cost:'low',storage:'Im Kühlschrank 4 Tage haltbar, einfrierbar.',tip:'Mit Reis oder Fladenbrot servieren.'});
  R('thunfisch-nudelsalat','Thunfisch-Nudelsalat','🥫',['lunch'],'mediterranean',10,10,2,['pot','stove','bowl'],['meal_prep','high_protein','budget'],
    [['pasta',160],['tuna',120],['corn',100],['cucumber',120],['cherry_tomato',150],['yogurt',100],['mustard',10],['lemon',15],['salt',1],['pepper',.5],['parsley',10]],
    ['Nudeln in Salzwasser 10 Minuten kochen, abschrecken und abkühlen lassen.|10','Joghurt mit Senf, Zitronensaft, Salz und Pfeffer zum Dressing verrühren.','Gemüse würfeln, Thunfisch abtropfen und alles mit den Nudeln vermengen. 15 Minuten ziehen lassen.'],
    {storage:'Im Kühlschrank 2 Tage haltbar.'});
  R('tofu-teriyaki-bowl','Tofu-Teriyaki-Bowl','🍱',['lunch','dinner'],'japanese',10,20,2,['pot','pan','stove'],['leftover_friendly'],
    [['tofu',300],['rice',140],['broccoli',200],['carrot',100],['soy_sauce',40],['maple_syrup',20],['ginger',8],['garlic',6],['sesame_seeds',8],['rapeseed_oil',10]],
    ['Reis kochen, ca. 15 Minuten.|15','Tofu in Würfeln im Öl 8 Minuten knusprig braten.|8','Sojasauce, Ahornsirup, geriebenen Ingwer und Knoblauch verrühren, zum Tofu geben und 2 Minuten einkochen.|2','Brokkoli und Karotte 5 Minuten dämpfen. Alles mit Sesam auf Reis anrichten.|5'],
    {sub:'Vegan mit süß-salziger Glasur',spice:0});
  R('kichererbsen-wrap','Kichererbsen-Hummus-Wrap','🌯',['lunch'],'middle_eastern',15,0,2,['bowl'],['quick','no_cook','budget'],
    [['wrap',120],['chickpeas',240],['hummus',60],['lettuce',60],['cucumber',100],['tomato',100],['red_onion',30],['paprika_powder',1]],
    ['Kichererbsen abtropfen und grob zerdrücken, mit Paprikapulver mischen.','Wraps mit Hummus bestreichen, mit Salat, Gurke, Tomate, Zwiebel und Kichererbsen belegen.','Fest einrollen und halbieren.'],
    {cost:'low',sub:'Ohne Herd in 15 Minuten'});
  R('kartoffel-feta-ofen','Ofenkartoffeln mit Feta','🥔',['lunch','dinner'],'greek',10,35,2,['oven','baking_tray'],['one_pot','budget'],
    [['potato',500],['feta',100],['cherry_tomato',200],['red_onion',100],['olive_oil',20],['oregano',1],['garlic',8],['salt',1.5],['pepper',.5]],
    ['Ofen auf 200 °C vorheizen. Kartoffeln in Spalten, Zwiebel in Ringe schneiden.','Mit Öl, Oregano, Knoblauch, Salz und Pfeffer mischen und auf ein Blech geben. 20 Minuten backen.|20','Tomaten und zerbröselten Feta dazugeben und weitere 15 Minuten backen.|15'],
    {sub:'Blech rein, fertig',cost:'low'});
  R('mexican-bean-bowl','Mexican Bean Bowl','🌮',['lunch','dinner'],'mexican',15,15,2,['pot','stove'],['meal_prep','budget','leftover_friendly'],
    [['rice',140],['kidney_beans',250],['corn',100],['avocado',150],['tomato',150],['red_onion',40],['lemon',20],['cumin',2],['paprika_powder',2],['olive_oil',10],['cilantro',10],['salt',1]],
    ['Reis kochen, ca. 15 Minuten.|15','Bohnen und Mais mit Kreuzkümmel, Paprikapulver und Öl 5 Minuten erhitzen.|5','Tomate und Zwiebel würfeln, mit Zitronensaft und Salz mischen.','Alles mit Avocadoscheiben und Koriander in Schalen anrichten.'],
    {sub:'Vegan, bunt und ballaststoffreich',spice:1,cost:'low'});
  R('lachs-reis-bowl','Lachs-Reis-Bowl','🍣',['lunch','dinner'],'japanese',10,15,2,['pot','pan','stove'],['high_protein'],
    [['salmon',250],['rice',140],['cucumber',150],['avocado',100],['soy_sauce',30],['sesame_seeds',8],['ginger',5],['rapeseed_oil',8]],
    ['Reis kochen, ca. 15 Minuten.|15','Lachs im Öl je 3 bis 4 Minuten pro Seite braten und mit der Hälfte der Sojasauce beträufeln.|7','Gurke und Avocado in Scheiben schneiden. Alles auf dem Reis anrichten, mit Sesam und geriebenem Ingwer toppen.'],
    {sub:'Reich an Omega-3 und Vitamin D',cost:'high'});
  R('pesto-pasta-gemuese','Pesto-Pasta mit Gemüse','🍝',['lunch','dinner'],'italian',10,15,2,['pot','pan','stove'],['quick','budget','kid_friendly'],
    [['pasta',180],['pesto',60],['zucchini',250],['cherry_tomato',200],['parmesan',30],['olive_oil',10]],
    ['Nudeln in Salzwasser al dente kochen, ca. 10 Minuten.|10','Zucchini in Scheiben im Öl 5 Minuten anbraten, Tomaten halbieren und 2 Minuten mitbraten.|5','Nudeln mit Pesto und Gemüse mischen, mit Parmesan bestreuen.']);
  R('haehnchen-couscous','Hähnchen-Couscous-Pfanne','🥘',['lunch','dinner'],'middle_eastern',10,15,2,['pan','stove'],['high_protein','quick','meal_prep'],
    [['chicken',300],['couscous',140],['bell_pepper',200],['zucchini',150],['red_onion',60],['olive_oil',15],['cumin',2],['paprika_powder',2],['lemon',20],['parsley',10],['salt',1.5]],
    ['Couscous mit gleicher Menge heißem Wasser übergießen und 5 Minuten quellen lassen.|5','Hähnchen würfeln und im Öl mit Gewürzen 8 Minuten braten.|8','Gemüse würfeln, 5 Minuten mitbraten. Couscous, Zitronensaft und Petersilie unterheben.|5'],
    {spice:1});
  R('buddha-bowl-vegan','Vegane Buddha-Bowl','🥙',['lunch','dinner'],'mediterranean',15,25,2,['oven','baking_tray'],['meal_prep'],
    [['sweet_potato',350],['chickpeas',240],['quinoa',100],['spinach',80],['avocado',100],['tahini',30],['lemon',20],['olive_oil',15],['paprika_powder',2],['salt',1.5]],
    ['Ofen auf 200 °C vorheizen. Süßkartoffel würfeln, mit Kichererbsen, Öl, Paprikapulver und Salz mischen und 25 Minuten backen.|25','Quinoa waschen und in doppelter Wassermenge 15 Minuten garen.|15','Tahini mit Zitronensaft und 3 EL Wasser zum Dressing verrühren.','Alles mit Spinat und Avocado anrichten, Dressing darüberträufeln.'],
    {sub:'Reich an Eisen, Folat und Ballaststoffen'});
  R('turkey-avocado-wrap','Puten-Avocado-Wrap','🌯',['lunch'],'american',10,0,2,['bowl'],['quick','no_cook','high_protein'],
    [['wrap',120],['turkey',160],['avocado',100],['lettuce',60],['tomato',100],['yogurt',40],['mustard',10]],
    ['Joghurt mit Senf verrühren und auf die Wraps streichen.','Mit Putenbrust, Avocadoscheiben, Salat und Tomate belegen.','Fest einrollen und halbieren.'],
    {sub:'Gekochte Putenbrust aus dem Kühlregal'});
  R('gemuese-linsensuppe','Gemüse-Linsensuppe','🍲',['lunch','dinner'],'german',15,35,3,['pot','stove'],['one_pot','budget','meal_prep','freezer','leftover_friendly'],
    [['lentils',200],['carrot',200],['potato',250],['celery',100],['onion',100],['vegetable_stock',10],['water',1000],['tomato_paste',30],['olive_oil',15],['cumin',2],['salt',2],['parsley',10]],
    ['Zwiebel, Karotten, Sellerie und Kartoffeln würfeln und im Öl 5 Minuten anbraten. Tomatenmark kurz mitrösten.|5','Linsen, Brühe, Wasser und Kreuzkümmel zugeben und 30 Minuten köcheln lassen.|30','Mit Salz abschmecken und mit Petersilie servieren.'],
    {sub:'Deftig, vegan und günstig',cost:'low',storage:'Im Kühlschrank 4 Tage haltbar, einfrierbar.'});
  R('avocado-ei-salat','Avocado-Ei-Salat','🥗',['lunch'],'american',10,10,1,['pot','stove'],['quick','high_protein'],
    [['egg',240],['avocado',150],['lettuce',80],['rucola',40],['cherry_tomato',100],['olive_oil',15],['mustard',5],['lemon',10],['salt',1]],
    ['Eier 9 Minuten hart kochen, abschrecken und pellen.|9','Salat und Rucola mit Tomaten in eine Schüssel geben.','Öl, Senf, Zitronensaft und Salz zum Dressing verrühren. Avocado und Eierviertel dazugeben und alles mischen.'],
    {sub:'Wenig Kohlenhydrate, viele gute Fette'});

  /* ---------- ABENDESSEN ---------- */
  R('chili-sin-carne','Chili sin Carne','🌶️',['dinner','lunch'],'mexican',15,35,4,['pot','stove'],['one_pot','budget','meal_prep','freezer','leftover_friendly'],
    [['kidney_beans',500],['corn',150],['canned_tomatoes',400],['bell_pepper',250],['onion',150],['garlic',10],['tomato_paste',30],['cumin',3],['paprika_powder',4],['chili_flakes',1],['olive_oil',20],['rice',200],['salt',3]],
    ['Zwiebel, Knoblauch und Paprika würfeln und im Öl 6 Minuten anbraten. Tomatenmark und Gewürze kurz mitrösten.|6','Bohnen, Mais und Dosentomaten zugeben und 30 Minuten köcheln lassen.|30','Reis nach Packungsanweisung kochen und mit dem Chili servieren.|15'],
    {sub:'Vegan, würzig und perfekt für Meal Prep',spice:2,cost:'low',storage:'Im Kühlschrank 4 Tage haltbar, einfrierbar.'});
  R('lachs-ofengemuese','Lachs mit Ofengemüse','🐟',['dinner'],'mediterranean',10,25,2,['oven','baking_tray'],['high_protein','one_pot'],
    [['salmon',300],['broccoli',250],['carrot',200],['sweet_potato',250],['olive_oil',20],['lemon',30],['salt',1.5],['pepper',.5]],
    ['Ofen auf 200 °C vorheizen. Süßkartoffel und Karotte in Stücke schneiden, mit der Hälfte des Öls mischen und 10 Minuten vorbacken.|10','Brokkoli und Lachs dazugeben, mit Öl, Zitronensaft, Salz und Pfeffer würzen und 15 Minuten backen.|15'],
    {cost:'high'});
  R('chicken-curry','Hähnchen-Curry mit Reis','🍛',['dinner'],'thai',10,25,2,['pot','pan','stove'],['leftover_friendly'],
    [['chicken',350],['onion',100],['garlic',8],['ginger',10],['coconut_milk',300],['curry_paste',30],['bell_pepper',150],['rice',160],['rapeseed_oil',10],['salt',2]],
    ['Reis kochen, ca. 15 Minuten.|15','Zwiebel, Knoblauch und Ingwer im Öl anbraten, Currypaste kurz mitrösten. Hähnchenwürfel 5 Minuten anbraten.|5','Kokosmilch und Paprika zugeben, 12 Minuten köcheln lassen. Mit Salz abschmecken.|12'],
    {spice:2});
  R('tofu-gemuese-pfanne','Tofu-Gemüse-Pfanne','🥢',['dinner','lunch'],'chinese',10,15,2,['wok','pan','stove'],['quick'],
    [['tofu',300],['bell_pepper',150],['zucchini',200],['mushroom',150],['soy_sauce',30],['ginger',8],['garlic',6],['rapeseed_oil',15],['rice',140],['sesame_seeds',8]],
    ['Reis kochen, ca. 15 Minuten.|15','Tofu würfeln und im heißen Öl 6 Minuten rundum knusprig braten, herausnehmen.|6','Gemüse in Stücken 5 Minuten scharf anbraten, Ingwer und Knoblauch zugeben.|5','Tofu und Sojasauce dazugeben, kurz schwenken. Mit Sesam auf Reis servieren.'],
    {sub:'Vegan in 25 Minuten',cost:'low'});
  R('bolognese','Spaghetti Bolognese','🍝',['dinner'],'italian',15,35,3,['pot','pan','stove'],['meal_prep','kid_friendly','freezer','leftover_friendly','comfort'],
    [['pasta',300],['beef_mince',300],['canned_tomatoes',400],['onion',120],['carrot',100],['celery',60],['garlic',8],['tomato_paste',30],['olive_oil',15],['oregano',1],['salt',2],['parmesan',30]],
    ['Zwiebel, Karotte, Sellerie und Knoblauch fein würfeln. Im Öl 5 Minuten anbraten.|5','Hackfleisch zugeben und krümelig braten, Tomatenmark 2 Minuten mitrösten.|8','Dosentomaten und Oregano zugeben, 25 Minuten köcheln lassen, mit Salz abschmecken.|25','Nudeln in Salzwasser kochen und mit Parmesan servieren.|10'],
    {sub:'Der Klassiker mit viel Gemüse',storage:'Sauce im Kühlschrank 4 Tage haltbar, einfrierbar.'});
  R('kartoffel-brokkoli-auflauf','Kartoffel-Brokkoli-Auflauf','🥔',['dinner'],'german',20,40,3,['oven'],['comfort','kid_friendly','leftover_friendly'],
    [['potato',600],['broccoli',350],['cream',150],['cheese',120],['garlic',6],['salt',2],['pepper',.5]],
    ['Ofen auf 200 °C vorheizen. Kartoffeln in dünne Scheiben schneiden und 5 Minuten in Salzwasser vorkochen.|5','Brokkoli in Röschen teilen. Alles in eine Form schichten.','Sahne mit Knoblauch, Salz und Pfeffer verrühren, darübergießen, mit Käse bestreuen.','35 Minuten goldbraun backen.|35'],
    {cost:'low'});
  R('mexican-chicken-bowl','Mexican Chicken Bowl','🌮',['dinner','lunch'],'mexican',15,20,2,['pot','pan','stove'],['high_protein','meal_prep'],
    [['chicken',300],['rice',140],['kidney_beans',200],['corn',100],['avocado',100],['tomato',150],['cumin',2],['paprika_powder',3],['olive_oil',10],['cilantro',10],['yogurt',60],['lemon',20],['salt',1.5]],
    ['Reis kochen, ca. 15 Minuten.|15','Hähnchen würfeln, mit Kreuzkümmel, Paprikapulver und Salz mischen und im Öl 8 Minuten braten.|8','Bohnen und Mais erhitzen, Tomate würfeln. Alles mit Avocado, Joghurt, Zitronensaft und Koriander anrichten.'],
    {spice:1});
  R('kichererbsen-curry','Kichererbsen-Spinat-Curry','🍲',['dinner','lunch'],'indian',10,25,3,['pot','stove'],['one_pot','budget','meal_prep','freezer','leftover_friendly'],
    [['chickpeas',480],['coconut_milk',300],['canned_tomatoes',400],['spinach',100],['onion',120],['garlic',8],['ginger',10],['curry_powder',8],['olive_oil',15],['rice',210],['salt',2]],
    ['Reis kochen, ca. 15 Minuten.|15','Zwiebel, Knoblauch und Ingwer im Öl 5 Minuten anbraten, Curry kurz mitrösten.|5','Kichererbsen, Tomaten und Kokosmilch zugeben und 15 Minuten köcheln lassen.|15','Spinat unterrühren, salzen und mit Reis servieren.'],
    {sub:'Vegan, cremig und eisenreich',spice:1,cost:'low'});
  R('fischpfanne-mediterran','Mediterrane Fischpfanne','🐠',['dinner'],'mediterranean',10,25,2,['pan','pot','stove'],['high_protein'],
    [['cod',300],['cherry_tomato',250],['zucchini',200],['olives',40],['garlic',6],['onion',80],['olive_oil',20],['lemon',20],['basil',10],['potato',300],['salt',1.5]],
    ['Kartoffeln in Stücken in Salzwasser 15 Minuten kochen.|15','Zwiebel, Knoblauch und Zucchini im Öl 5 Minuten anbraten, Tomaten und Oliven zugeben.|5','Fisch in Stücken daraufsetzen, mit Deckel 8 Minuten garen. Mit Zitronensaft und Basilikum servieren.|8'],
    {cost:'high'});
  R('linsen-pasta','Linsen-Tomaten-Pasta','🍝',['dinner','lunch'],'italian',10,20,2,['pot','stove'],['budget','one_pot'],
    [['pasta',180],['lentils',120],['canned_tomatoes',400],['onion',100],['garlic',8],['carrot',100],['olive_oil',15],['oregano',1],['salt',2]],
    ['Zwiebel, Knoblauch und Karotte würfeln und im Öl 5 Minuten anbraten.|5','Linsen, Tomaten, Oregano und 250 ml Wasser zugeben und 20 Minuten köcheln lassen.|20','Nudeln kochen und mit der Sauce mischen.|10'],
    {sub:'Vegan, mit 25 g Protein pro Portion',cost:'low'});
  R('fajita-bowl','Hähnchen-Fajita-Bowl','🫑',['dinner'],'mexican',15,20,2,['pan','pot','stove'],['high_protein'],
    [['chicken',300],['bell_pepper',250],['red_onion',100],['rice',140],['avocado',100],['cumin',2],['paprika_powder',3],['chili_flakes',.5],['olive_oil',15],['yogurt',60],['lemon',20],['cilantro',10],['salt',1.5]],
    ['Reis kochen, ca. 15 Minuten.|15','Hähnchen, Paprika und Zwiebel in Streifen schneiden, mit Gewürzen mischen.','Im heißen Öl 10 Minuten scharf anbraten.|10','Mit Reis, Avocado, Joghurt, Zitronensaft und Koriander in Schalen anrichten.'],
    {spice:2});
  R('quinoa-gemuese-pfanne','Quinoa-Gemüse-Pfanne','🥘',['dinner','lunch'],'mediterranean',10,20,2,['pot','pan','stove'],['one_pot','quick'],
    [['quinoa',140],['zucchini',200],['bell_pepper',150],['mushroom',150],['spinach',80],['garlic',6],['onion',80],['olive_oil',15],['feta',60,'o'],['lemon',15],['salt',1.5]],
    ['Quinoa waschen und in doppelter Wassermenge 15 Minuten garen.|15','Zwiebel, Knoblauch und Gemüse im Öl 8 Minuten anbraten.|8','Quinoa und Spinat unterheben, mit Zitronensaft und Salz abschmecken. Feta darüberbröseln.'],
    {sub:'Vegan, wenn du den Feta weglässt'});
  R('turkey-chili','Puten-Chili','🌶️',['dinner'],'american',15,35,4,['pot','stove'],['high_protein','meal_prep','freezer','leftover_friendly'],
    [['turkey',400],['kidney_beans',400],['canned_tomatoes',400],['onion',150],['bell_pepper',200],['garlic',8],['tomato_paste',30],['cumin',3],['paprika_powder',3],['chili_flakes',1],['olive_oil',15],['corn',100],['salt',2.5]],
    ['Zwiebel, Knoblauch und Paprika würfeln und im Öl 5 Minuten anbraten.|5','Putenbrust in Würfeln 5 Minuten mitbraten, Tomatenmark und Gewürze zugeben.|5','Bohnen, Mais und Tomaten zugeben und 30 Minuten köcheln lassen.|30'],
    {spice:2,storage:'Im Kühlschrank 4 Tage haltbar, einfrierbar.'});
  R('ofen-feta-pasta','Ofen-Feta-Pasta','🧀',['dinner','lunch'],'greek',10,30,3,['oven','pot','stove'],['one_pot','kid_friendly','comfort'],
    [['pasta',300],['feta',200],['cherry_tomato',500],['olive_oil',40],['garlic',12],['basil',10],['oregano',1],['salt',1.5],['pepper',.5]],
    ['Ofen auf 200 °C vorheizen. Feta in die Mitte einer Auflaufform legen, Tomaten und Knoblauch rundherum verteilen, mit Öl, Oregano, Salz und Pfeffer würzen.','30 Minuten backen, bis die Tomaten platzen.|30','Nudeln währenddessen kochen. Alles zerdrücken, mit den Nudeln und Basilikum mischen.|10']);
  R('lachs-suesskartoffel','Lachs mit Süßkartoffel und Brokkoli','🍠',['dinner'],'american',10,30,2,['oven','baking_tray'],['high_protein','one_pot'],
    [['salmon',300],['sweet_potato',400],['broccoli',200],['olive_oil',20],['garlic',6],['lemon',30],['mustard',10],['salt',1.5]],
    ['Ofen auf 200 °C vorheizen. Süßkartoffeln in Spalten mit der Hälfte des Öls und Salz 15 Minuten backen.|15','Lachs mit Senf bestreichen, mit Brokkoli und Knoblauch auf das Blech geben.','Weitere 15 Minuten backen, mit Zitronensaft servieren.|15'],
    {cost:'high'});
  R('tofu-peanut-noodles','Erdnuss-Tofu-Nudeln','🍜',['dinner','lunch'],'thai',15,15,2,['pot','pan','stove'],['leftover_friendly'],
    [['rice_noodles',160],['tofu',300],['peanut_butter',40],['soy_sauce',40],['maple_syrup',15],['lemon',25],['ginger',8],['garlic',6],['carrot',120],['cucumber',100],['cilantro',10],['rapeseed_oil',10],['chili_flakes',1]],
    ['Nudeln nach Packungsanweisung 5 Minuten kochen und abschrecken.|5','Tofu würfeln und im Öl 8 Minuten knusprig braten.|8','Erdnussmus, Sojasauce, Ahornsirup, Zitronensaft, Ingwer, Knoblauch und Chili mit 4 EL Wasser zur Sauce verrühren.','Karotte und Gurke in Streifen schneiden. Alles mischen und mit Koriander servieren.'],
    {sub:'Vegan mit cremiger Erdnusssauce',spice:1});
  R('brokkoli-reispfanne','Brokkoli-Ei-Reispfanne','🍳',['dinner','lunch'],'chinese',10,20,2,['pot','pan','stove'],['budget','quick','leftover_friendly'],
    [['rice',150],['broccoli',300],['egg',120],['carrot',100],['garlic',6],['ginger',6],['soy_sauce',30],['sesame_seeds',8],['rapeseed_oil',15],['onion',60]],
    ['Reis kochen und abkühlen lassen, am besten vom Vortag.|15','Zwiebel, Karotte, Knoblauch und Ingwer im Öl 4 Minuten anbraten, Brokkoli 4 Minuten mitbraten.|8','Eier an den Rand schieben und rühren, Reis und Sojasauce zugeben und 3 Minuten braten. Mit Sesam bestreuen.|3'],
    {cost:'low'});
  R('zitronen-lachs-brokkoli','Zitronen-Butter-Lachs mit Brokkoli','🍋',['dinner'],'french',10,15,2,['pan','stove'],['high_protein','quick'],
    [['salmon',300],['broccoli',350],['butter',20],['garlic',6],['lemon',30],['olive_oil',10],['salt',1.5],['pepper',.5]],
    ['Brokkoli in Röschen 5 Minuten in Salzwasser bissfest kochen.|5','Lachs im Öl je 4 Minuten pro Seite braten.|8','Butter und Knoblauch zugeben, Lachs damit begießen, Zitronensaft darüberträufeln. Mit Brokkoli servieren.'],
    {sub:'Wenig Kohlenhydrate, viel Omega-3',cost:'high'});
  R('haehnchen-zucchini-pfanne','Hähnchen-Zucchini-Pfanne mit Parmesan','🍗',['dinner','lunch'],'italian',10,20,2,['pan','stove'],['high_protein','quick'],
    [['chicken',350],['zucchini',350],['mushroom',150],['cream',100],['garlic',8],['parmesan',30],['olive_oil',15],['salt',1.5],['pepper',.5]],
    ['Hähnchen in Streifen im Öl 7 Minuten braten, herausnehmen.|7','Zucchini und Pilze 6 Minuten anbraten, Knoblauch zugeben.|6','Sahne zugießen, Hähnchen zurückgeben und 3 Minuten köcheln. Mit Parmesan, Salz und Pfeffer abschmecken.|3'],
    {sub:'Wenig Kohlenhydrate, cremig'});


  /* ---------- WRAPS ---------- */
  R('haehnchen-caesar-wrap','Hähnchen-Caesar-Wrap','🌯',['lunch'],'american',10,8,2,['pan','stove'],['high_protein','quick'],
    [['wrap',120],['chicken',250],['lettuce',100],['parmesan',20],['yogurt',60],['mustard',5],['lemon',10],['garlic',3],['rapeseed_oil',8],['salt',1],['pepper',.3]],
    ['Hähnchen in Streifen schneiden, würzen und im Öl 8 Minuten goldbraun braten.|8','Joghurt, Senf, Zitronensaft, gepressten Knoblauch und geriebenen Parmesan zum Dressing verrühren.','Wraps mit Dressing bestreichen, mit Salat und Hähnchen füllen, fest einrollen.'],
    {sub:'Knackig, würzig und proteinreich'});
  R('ruehrei-speck-wrap','Rührei-Speck-Wrap','🥓',['breakfast'],'american',5,8,1,['pan','stove'],['quick','high_protein'],
    [['wrap',60],['egg',180],['bacon',30],['cheese',25],['tomato',50],['pepper',.3]],
    ['Bacon in der Pfanne knusprig braten, herausnehmen und zerbröseln.|4','Eier verquirlen und im Speckfett 2 bis 3 Minuten cremig stocken lassen.|3','Wrap mit Rührei, Bacon, Käse und Tomatenscheiben füllen und einrollen.'],
    {sub:'Herzhaftes Frühstück zum Mitnehmen'});
  R('beef-burrito','Beef-Burrito','🌯',['lunch','dinner'],'mexican',15,20,2,['pot','pan','stove'],['meal_prep','leftover_friendly'],
    [['wrap',120],['beef_mince',250],['rice',100],['kidney_beans',150],['cheese',50],['salsa',80],['cumin',2],['paprika_powder',2],['onion',60],['rapeseed_oil',10],['salt',1.5]],
    ['Reis nach Packungsanweisung kochen.|15','Zwiebel würfeln und im Öl anbraten, Hackfleisch zugeben und krümelig braten, mit Gewürzen und Salz würzen.|8','Bohnen und Salsa unterrühren und 3 Minuten köcheln.|3','Füllung mit Reis und Käse auf die Wraps geben, einschlagen und optional kurz in der Pfanne anbraten.'],
    {sub:'Satt, würzig und gut vorzubereiten',spice:1});
  R('thunfisch-wrap','Thunfisch-Mais-Wrap','🐟',['lunch'],'american',10,0,2,['bowl'],['quick','no_cook','high_protein','budget'],
    [['wrap',120],['tuna',120],['corn',60],['yogurt',50],['lettuce',60],['tomato',100],['mustard',5],['lemon',10]],
    ['Thunfisch abtropfen und mit Mais, Joghurt, Senf und Zitronensaft vermengen.','Wraps mit Salat und Tomatenscheiben belegen.','Thunfischcreme daraufgeben, einrollen und halbieren.'],
    {cost:'low'});
  R('gyros-wrap-pute','Puten-Gyros-Wrap','🥙',['lunch','dinner'],'greek',15,10,2,['pan','stove'],['high_protein','quick'],
    [['wrap',120],['turkey',300],['yogurt',100],['cucumber',120],['tomato',100],['red_onion',40],['paprika_powder',3],['oregano',1],['garlic',4],['rapeseed_oil',10],['lemon',10],['salt',1.5]],
    ['Putenbrust in dünne Streifen schneiden und mit Paprikapulver, Oregano und Salz mischen.','Im heißen Öl 6 bis 8 Minuten kräftig braten.|7','Joghurt mit gepresstem Knoblauch, Zitronensaft und Gurkenwürfeln zum Tzatziki verrühren.','Wraps mit Fleisch, Tomate, Zwiebel und Tzatziki füllen.'],
    {sub:'Wie vom Imbiss, nur leichter'});
  R('quesadilla-haehnchen','Hähnchen-Quesadilla','🧀',['lunch','dinner'],'mexican',10,12,2,['pan','stove'],['quick','kid_friendly'],
    [['wrap',120],['chicken',200],['cheese',80],['bell_pepper',100],['red_onion',40],['cumin',2],['rapeseed_oil',8],['salsa',60,'o'],['yogurt',60,'o']],
    ['Hähnchen und Paprika in Streifen mit Kreuzkümmel im Öl 6 Minuten anbraten.|6','Eine Wrap-Hälfte mit Käse und der Füllung belegen, zuklappen.','In der trockenen Pfanne je 2 Minuten pro Seite knusprig braten.|4','Mit Salsa und Joghurt servieren.'],
    {spice:1});
  R('ei-salat-wrap','Ei-Salat-Wrap','🥚',['lunch'],'german',10,10,2,['pot','stove'],['budget','meal_prep'],
    [['wrap',120],['egg',240],['yogurt',60],['mustard',5],['lettuce',60],['cucumber',100],['chives',5],['salt',1]],
    ['Eier 9 Minuten hart kochen, abschrecken und pellen.|9','Eier grob hacken und mit Joghurt, Senf, Schnittlauch und Salz mischen.','Wraps mit Salat und Gurkenscheiben belegen, Eiersalat daraufgeben und einrollen.'],
    {cost:'low'});
  R('schinken-kaese-wrap','Schinken-Käse-Wrap','🌯',['lunch','snack'],'german',5,0,1,['bowl'],['quick','no_cook'],
    [['wrap',60],['ham',60],['cheese',40],['lettuce',30],['tomato',60],['mustard',5]],
    ['Wrap mit Senf bestreichen.','Mit Schinken, Käse, Salat und Tomate belegen.','Fest einrollen und halbieren.'],
    {sub:'Der schnelle Klassiker'});

  /* ---------- EIER ---------- */
  R('ruehrei-tomaten','Rührei mit Tomaten und Schnittlauch','🍳',['breakfast'],'american',5,6,1,['pan','stove'],['quick'],
    [['egg',180],['cherry_tomato',100],['butter',8],['chives',5],['bread',45],['salt',.5],['pepper',.3]],
    ['Tomaten halbieren und in Butter 2 Minuten anbraten.|2','Verquirlte Eier dazugießen und bei mittlerer Hitze unter Rühren 2 bis 3 Minuten cremig garen.|3','Mit Schnittlauch bestreuen und mit Brot servieren.']);
  R('tortilla-espanola','Tortilla Española','🥘',['lunch','dinner'],'spanish',15,30,3,['pan','stove'],['budget','meal_prep','leftover_friendly'],
    [['egg',360],['potato',400],['onion',120],['olive_oil',40],['salt',2]],
    ['Kartoffeln in dünne Scheiben, Zwiebel in Streifen schneiden und in Olivenöl bei mittlerer Hitze 15 Minuten weich garen.|15','Kartoffeln abtropfen, mit den verquirlten Eiern und Salz vermengen.','In einer Pfanne die Masse zugedeckt 6 Minuten stocken lassen.|6','Mit einem Teller wenden und weitere 4 Minuten von der anderen Seite braten.|4'],
    {sub:'Spanisches Kartoffelomelett, warm oder kalt',cost:'low',storage:'Im Kühlschrank 3 Tage haltbar.'});
  R('pilz-kaese-omelett','Pilz-Käse-Omelett','🍄',['breakfast','lunch'],'french',5,8,1,['pan','stove'],['quick','high_protein'],
    [['egg',180],['mushroom',100],['cheese',30],['butter',10],['chives',5],['salt',.5]],
    ['Pilze in Scheiben in der Hälfte der Butter 4 Minuten anbraten, herausnehmen.|4','Eier mit Salz verquirlen, in restlicher Butter bei mittlerer Hitze 2 Minuten stocken lassen.|2','Pilze und Käse darauflegen, zusammenklappen und mit Schnittlauch servieren.']);
  R('egg-muffins','Ei-Muffins mit Spinat und Feta','🧁',['breakfast','snack'],'american',10,20,4,['oven','baking_tray'],['meal_prep','freezer','high_protein'],
    [['egg',360],['spinach',60],['bell_pepper',100],['feta',60],['milk',60],['salt',1],['pepper',.5]],
    ['Ofen auf 180 °C vorheizen. Paprika würfeln, Spinat grob hacken.','Eier mit Milch, Salz und Pfeffer verquirlen, Gemüse und zerbröselten Feta unterrühren.','In 8 gefettete Muffinförmchen füllen und 20 Minuten backen.|20'],
    {sub:'8 Stück, 2 pro Portion',storage:'Im Kühlschrank 4 Tage haltbar, einfrierbar.'});
  R('bauernfruehstueck','Bauernfrühstück','🍳',['breakfast','lunch','dinner'],'german',10,20,2,['pan','stove'],['comfort','budget'],
    [['potato',400],['egg',240],['ham',80],['onion',80],['rapeseed_oil',15],['chives',5],['salt',1.5],['pepper',.5]],
    ['Gekochte Kartoffeln in Scheiben schneiden und im Öl 10 Minuten knusprig braten.|10','Zwiebel und Schinkenwürfel zugeben und 4 Minuten mitbraten.|4','Eier verquirlen, darübergießen und bei kleiner Hitze 4 Minuten stocken lassen. Mit Schnittlauch servieren.|4'],
    {sub:'Ideal für übrige Pellkartoffeln',cost:'low'});
  R('frittata-zucchini','Zucchini-Feta-Frittata','🍳',['lunch','dinner'],'italian',10,20,2,['pan','oven','stove'],['high_protein','leftover_friendly'],
    [['egg',300],['zucchini',250],['feta',60],['parmesan',20],['olive_oil',10],['onion',60],['salt',1]],
    ['Ofen auf 200 °C vorheizen. Zucchini und Zwiebel in Öl in einer ofenfesten Pfanne 5 Minuten anbraten.|5','Eier mit Parmesan und Salz verquirlen, darübergießen, Feta zerbröseln.','Im Ofen 12 bis 15 Minuten backen, bis die Oberfläche goldgelb ist.|14'],
    {sub:'Wenig Kohlenhydrate, viel Eiweiß'});
  R('eiersalat-brot','Eiersalat-Brot','🥪',['lunch','snack'],'german',10,10,2,['pot','stove'],['budget','quick'],
    [['egg',240],['yogurt',80],['mustard',10],['chives',5],['bread',180],['lettuce',40],['salt',.5]],
    ['Eier 9 Minuten hart kochen, abschrecken und pellen.|9','Eier hacken und mit Joghurt, Senf, Schnittlauch und Salz vermengen.','Brot mit Salat belegen und den Eiersalat daraufgeben.'],
    {cost:'low'});

  /* ---------- FLEISCH ---------- */
  R('haehnchen-ofen-kartoffel','Ofenhähnchen mit Kartoffeln und Paprika','🍗',['dinner'],'german',15,40,2,['oven','baking_tray'],['one_pot','high_protein','comfort'],
    [['chicken',350],['potato',500],['bell_pepper',200],['red_onion',100],['olive_oil',25],['paprika_powder',4],['garlic',8],['oregano',1],['salt',2.5]],
    ['Ofen auf 200 °C vorheizen. Kartoffeln in Spalten, Paprika und Zwiebel in Stücke schneiden.','Alles mit Öl, Paprikapulver, Oregano, Knoblauch und Salz mischen und auf ein Blech geben. Kartoffeln 15 Minuten vorbacken.|15','Hähnchenbrust in Stücken würzen, dazugeben und weitere 25 Minuten backen.|25'],
    {sub:'Ein Blech, wenig Abwasch'});
  R('rind-reis-pfanne','Rindfleisch-Reis-Pfanne','🥩',['dinner','lunch'],'chinese',10,20,2,['pan','pot','stove'],['quick','leftover_friendly'],
    [['beef_mince',250],['rice',140],['zucchini',200],['bell_pepper',150],['soy_sauce',40],['garlic',6],['ginger',6],['rapeseed_oil',10]],
    ['Reis kochen, ca. 15 Minuten.|15','Hackfleisch im Öl 6 Minuten krümelig braten.|6','Gemüse in Stücken, Knoblauch und Ingwer zugeben und 6 Minuten mitbraten. Mit Sojasauce ablöschen.|6','Mit dem Reis servieren.']);
  R('hack-gemuese-lowcarb','Hackpfanne mit Zucchini und Tomaten','🥩',['dinner'],'american',10,20,2,['pan','stove'],['high_protein','quick'],
    [['beef_mince',300],['zucchini',300],['tomato',150],['cream_cheese',60],['garlic',6],['onion',80],['paprika_powder',3],['olive_oil',10],['salt',2],['parmesan',20]],
    ['Zwiebel und Knoblauch im Öl 3 Minuten anbraten, Hackfleisch zugeben und 6 Minuten krümelig braten.|9','Zucchini und Tomaten würfeln, mit Paprikapulver und Salz dazugeben und 6 Minuten garen.|6','Frischkäse unterrühren, mit Parmesan bestreuen.'],
    {sub:'Wenig Kohlenhydrate, sehr sättigend'});
  R('cheeseburger','Cheeseburger','🍔',['lunch','dinner'],'american',10,12,2,['pan','stove'],['comfort','kid_friendly'],
    [['beef_mince',300],['bun',110],['cheese',50],['lettuce',40],['tomato',100],['red_onion',40],['mustard',10],['rapeseed_oil',5],['salt',1.5],['pepper',.5]],
    ['Hackfleisch mit Salz und Pfeffer vermengen und zu 2 flachen Patties formen.','Patties im Öl je 4 Minuten pro Seite braten, in der letzten Minute Käse auflegen.|8','Brötchen halbieren, kurz anrösten, mit Senf, Salat, Tomate, Zwiebel und Patty belegen.'],
    {sub:'Selbstgemacht schmeckt er am besten'});
  R('burger-bowl','Burger-Bowl ohne Brötchen','🥗',['lunch','dinner'],'american',10,10,2,['pan','stove'],['high_protein','quick'],
    [['beef_mince',300],['lettuce',120],['tomato',150],['cheese',50],['avocado',100],['red_onion',40],['mustard',10],['yogurt',40],['salt',1.5]],
    ['Hackfleisch mit Salz würzen und im heißen Öl oder trocken 8 Minuten krümelig braten.|8','Salat, Tomate, Zwiebel und Avocado würfeln und in Schalen verteilen.','Hackfleisch und Käse darauf anrichten, mit Senf-Joghurt-Sauce beträufeln.'],
    {sub:'Wenig Kohlenhydrate, alles vom Burger'});
  R('puten-nudelpfanne','Puten-Tomaten-Nudelpfanne','🍝',['dinner'],'italian',10,25,3,['pot','pan','stove'],['meal_prep','high_protein','leftover_friendly'],
    [['pasta',240],['turkey_mince',300],['zucchini',200],['canned_tomatoes',400],['onion',100],['garlic',6],['olive_oil',10],['oregano',1],['salt',2],['parmesan',20]],
    ['Nudeln in Salzwasser kochen, ca. 10 Minuten.|10','Zwiebel und Knoblauch im Öl anbraten, Putenhack 6 Minuten krümelig braten.|8','Zucchiniwürfel, Tomaten und Oregano zugeben und 12 Minuten köcheln lassen.|12','Nudeln unterheben und mit Parmesan servieren.'],
    {sub:'Leichte Bolognese-Alternative'});
  R('schwein-champignonrahm','Schweinefilet in Champignonrahm','🍄',['dinner'],'german',10,25,2,['pan','pot','stove'],['comfort'],
    [['pork_loin',350],['mushroom',250],['cream',100],['onion',60],['rice',140],['rapeseed_oil',10],['salt',1.5],['pepper',.5],['parsley',5]],
    ['Reis kochen, ca. 15 Minuten.|15','Schweinefilet in Medaillons schneiden und im Öl je 3 Minuten pro Seite braten, herausnehmen.|6','Zwiebel und Pilze 5 Minuten anbraten, Sahne zugießen, 5 Minuten einkochen lassen.|10','Fleisch zurück in die Sauce geben, abschmecken, mit Petersilie und Reis servieren.'],
    {cost:'high'});
  R('honig-senf-haehnchen','Honig-Senf-Hähnchen mit Ofenkartoffeln','🍯',['dinner'],'german',10,35,2,['oven','baking_tray'],['high_protein','one_pot','kid_friendly'],
    [['chicken',350],['honey',20],['mustard',20],['potato',400],['broccoli',250],['olive_oil',15],['salt',2],['garlic',6]],
    ['Ofen auf 200 °C vorheizen. Kartoffeln in Spalten mit Öl und Salz 15 Minuten backen.|15','Hähnchen mit Honig, Senf und Knoblauch marinieren, mit Brokkoli auf das Blech geben.','Weitere 20 Minuten backen, bis das Hähnchen gar ist.|20']);
  R('chicken-nuggets-ofen','Ofen-Chicken-Nuggets mit Süßkartoffelspalten','🍗',['dinner','lunch'],'american',15,25,2,['oven','baking_tray'],['kid_friendly','high_protein'],
    [['chicken',350],['breadcrumbs',60],['egg',60],['flour',20],['sweet_potato',300],['olive_oil',20],['paprika_powder',2],['salt',1.5]],
    ['Ofen auf 200 °C vorheizen. Süßkartoffel in Spalten mit der Hälfte des Öls und Salz auf ein Blech geben.','Hähnchen würfeln, erst in Mehl, dann in verquirltem Ei und zuletzt in Paniermehl mit Paprikapulver wenden.','Nuggets mit restlichem Öl beträufeln, auf ein zweites Blech legen und mit den Süßkartoffeln 25 Minuten backen, dabei einmal wenden.|25'],
    {sub:'Knusprig ohne Fritteuse'});
  R('spaghetti-carbonara','Spaghetti Carbonara','🍝',['dinner'],'italian',10,15,2,['pot','pan','stove'],['quick','comfort'],
    [['pasta',200],['egg',120],['bacon',100],['parmesan',40],['pepper',1],['salt',1.5]],
    ['Nudeln in Salzwasser al dente kochen, etwas Nudelwasser aufheben.|10','Bacon würfeln und in der Pfanne ohne Fett knusprig braten.|5','Eier mit Parmesan und Pfeffer verrühren. Pfanne vom Herd nehmen, Nudeln mit Bacon mischen, Eiermasse und einen Schuss Nudelwasser unterrühren, bis eine cremige Sauce entsteht.'],
    {sub:'Ohne Sahne, so wie in Rom'});
  R('chicken-fried-rice','Chicken Fried Rice','🍚',['dinner','lunch'],'chinese',10,15,2,['wok','pan','stove'],['quick','leftover_friendly','budget'],
    [['chicken',250],['egg',120],['rice',150],['mixed_veg_frozen',200],['soy_sauce',35],['garlic',6],['ginger',5],['rapeseed_oil',15],['onion',60],['sesame_seeds',5]],
    ['Reis kochen und abkühlen lassen, am besten vom Vortag.|15','Hähnchen würfeln und im heißen Öl 6 Minuten braten. Zwiebel, Knoblauch und Ingwer zugeben.|6','TK-Gemüse 3 Minuten mitbraten, Eier an den Rand schieben und rühren.|3','Reis und Sojasauce dazugeben, 3 Minuten braten, mit Sesam bestreuen.|3'],
    {cost:'low'});
  R('haehnchen-suesskartoffel-bowl','Hähnchen-Süßkartoffel-Bowl','🍠',['lunch','dinner'],'american',15,30,2,['oven','baking_tray','pan','stove'],['high_protein','meal_prep'],
    [['chicken',300],['sweet_potato',400],['spinach',80],['avocado',100],['olive_oil',20],['paprika_powder',3],['lemon',20],['yogurt',60],['salt',2]],
    ['Ofen auf 200 °C vorheizen. Süßkartoffelwürfel mit der Hälfte des Öls, Paprikapulver und Salz 25 Minuten backen.|25','Hähnchen würzen und im restlichen Öl 8 Minuten braten.|8','Spinat kurz mit heißen Süßkartoffeln vermengen, mit Hähnchen, Avocado und Zitronen-Joghurt anrichten.']);

  window.HD = window.HD || {};
  window.HD.RECIPES = out;
})();
