#!/usr/bin/env python3
"""Нові картки теорії після партії 5: кільце з 2 смугами, вузький проїзд, знаки переїздів, ожеледиця, засліплення, шини."""
import sys
sys.path.insert(0, __import__("os").path.dirname(__file__))
from qlib import T, load, save

def C(id, title, body, art, serious=False, terms=(), image=None, sign=None):
    c = {"id": id, "title": T(title), "body": T(body), "article": art, "serious": serious,
         "terms": [{"nl": n, "fr": f} for n, f in terms]}
    if sign: c["sign"] = sign
    if image: c["image"] = image
    return c

ADD = {
 "roundabouts": [C("two_lanes", ("Кільце з двома смугами", "Rotonde met twee rijstroken", "Rond-point à deux bandes", "Two-lane roundabout"),
   ("Смугу обирай за напрямком виїзду й розміткою: правило «тримайся правого краю» на кільці не діє. Перехід із внутрішньої смуги в зовнішню — маневр: пропусти тих, хто вже в зовнішній смузі, і завчасно ввімкни правий покажчик. Трамвай і швидка мають пріоритет і тут.",
    "Kies je strook volgens je uitrit en de markeringen; rechts houden geldt niet op een rotonde. Van binnen naar buiten wisselen is een manoeuvre: laat wie buiten rijdt voorgaan en geef tijdig rechts aan. Trams en prioritaire voertuigen hebben ook hier voorrang.",
    "Choisissez la bande selon votre sortie et le marquage ; serrer à droite ne s'applique pas. Passer de l'intérieur à l'extérieur est une manœuvre : cédez à ceux sur la bande extérieure, clignotant droit à temps. Trams et véhicules prioritaires gardent la priorité.",
    "Pick the lane for your exit and follow the markings; keep-right does not apply. Moving from inner to outer lane is a manoeuvre: give way to those in the outer lane and signal right in time. Trams and emergency vehicles keep priority."),
   "9.3.1, 12.4, 19.2", terms=[("van rijstrook wisselen", "changer de bande"), ("manoeuvre", "manœuvre")], image="assets/scenes/roundabout-two-lanes.svg")],
 "priority_intersections": [C("narrow", ("Вузький проїзд: B19 і B21", "Smalle doorgang: B19 en B21", "Passage étroit : B19 et B21", "Narrow passage: B19 and B21"),
   ("Правило запам'ятовування: червона стрілка завжди поступається. B19 (кругле, червона облямівка) — ти пропускаєш зустрічних. B21 (синій квадрат) — зустрічні пропускають тебе, але якщо хтось уже заїхав у звуження, зачекай.",
    "Ezelsbruggetje: de rode pijl geeft altijd voorrang. B19 (rond, rode rand): jij laat tegenliggers voorgaan. B21 (blauw vierkant): tegenliggers laten jou voorgaan, maar wacht als iemand al in de versmalling rijdt.",
    "Astuce : la flèche rouge cède toujours. B19 (rond, bord rouge) : vous cédez à ceux d'en face. B21 (carré bleu) : ils vous cèdent, mais attendez si quelqu'un est déjà engagé.",
    "Memory hook: the red arrow always gives way. B19 (round, red border): you give way to oncoming traffic. B21 (blue square): they give way to you, but wait if someone is already in the narrowing."),
   "67", terms=[("smalle doorgang", "passage étroit"), ("tegenligger", "conducteur venant en sens inverse")], sign="B19")],
 "motorways_tunnels": [C("lc_signs", ("Знаки переїздів", "Borden bij overwegen", "Panneaux des passages à niveau", "Level-crossing signs"),
   ("A41 (огорожа) — переїзд зі шлагбаумом. A43 (паровоз) — без шлагбаума: переконайся сам, що потяга немає. A45 — Андріївський хрест біля переїзду з однією колією, A47 (подвійний) — колій дві й більше, після одного потяга може йти другий.",
    "A41 (hekje): overweg met slagbomen. A43 (locomotief): zonder slagbomen, kijk zelf of er geen trein komt. A45: andreaskruis bij één spoor; A47 (dubbel): twee of meer sporen, er kan een tweede trein komen.",
    "A41 (barrière) : passage avec barrières. A43 (locomotive) : sans barrières, vérifiez vous-même. A45 : croix de Saint-André, une voie ; A47 (double) : deux voies ou plus, un second train peut suivre.",
    "A41 (fence): crossing with barriers. A43 (locomotive): no barriers, check yourself. A45: St Andrew's cross, single track; A47 (double): two or more tracks, a second train may follow."),
   "66, 20", serious=True, terms=[("andreaskruis", "croix de Saint-André"), ("spoor", "voie")], sign="A43")],
 "weather_hazards": [
  C("ice", ("Ожеледиця", "IJzel", "Verglas", "Black ice"),
   ("Знак A15 — слизька дорога. Біля нуля й нижче лід найчастіше буває на мостах, у тіні й на узбіччях. Гальмівний шлях зростає в рази, тож знижуй швидкість і збільшуй дистанцію заздалегідь, без різких рухів кермом і гальмом.",
    "Bord A15: glibberige rijbaan. Rond het vriespunt ligt ijs vooral op bruggen, in de schaduw en aan de rand. De remweg wordt vele malen langer: vertraag en vergroot je afstand vooraf, zonder bruuske bewegingen.",
    "Panneau A15 : chaussée glissante. Autour de zéro, le verglas se forme surtout sur les ponts, à l'ombre et en bordure. La distance de freinage est multipliée : ralentissez et augmentez la distance à l'avance, sans gestes brusques.",
    "Sign A15: slippery road. Around freezing, ice forms mostly on bridges, in shade and at the edges. Braking distance multiplies: slow down and increase the gap in advance, without sudden inputs."),
   "10.1", terms=[("ijzel", "verglas"), ("glibberig", "glissant")], image="assets/scenes/black-ice.svg"),
  C("dazzle", ("Засліплення вночі", "Verblinding 's nachts", "Éblouissement la nuit", "Dazzle at night"),
   ("Побачивши зустрічне авто, перемкнися на ближнє (2-й ступінь, якщо засліпиш). Якщо засліпило тебе — знизь швидкість, дивись на правий край дороги, за потреби зупинись. Відповідати дальнім не можна.",
    "Schakel over op dimlicht bij een tegenligger (2de graad als je verblindt). Word je verblind: vertraag, kijk naar de rechterrand, stop zo nodig. Niet terugverblinden.",
    "Passez en feux de croisement face à un véhicule (2e degré si vous éblouissez). Ébloui : ralentissez, regardez le bord droit, arrêtez-vous si besoin. N'éblouissez pas en retour.",
    "Dip your beams for oncoming traffic (2nd degree if you dazzle). If dazzled: slow down, look at the right edge, stop if needed. Never dazzle back."),
   "30.1.1°, 10.1", terms=[("grootlicht", "feux de route"), ("dimlicht", "feux de croisement")], image="assets/scenes/night-dazzle.svg"),
  C("winter", ("Шини й аварійна сигналізація", "Banden en noodverlichting", "Pneus et feux de détresse", "Tyres and hazard lights"),
   ("Зимові шини в Бельгії не обов'язкові. Ланцюги — лише на снігу чи льоду; шиповані шини заборонені (крім винятків міністра). Аварійну сигналізацію вмикають при поломці чи аварії, для попередження про раптову небезпеку і в шкільному автобусі; права зупинитися де завгодно вона не дає.",
    "Winterbanden zijn niet verplicht. Sneeuwkettingen alleen op sneeuw of ijs; spijkerbanden verboden (behalve uitzondering van de minister). Noodverlichting: bij pech of ongeval, om voor plots gevaar te waarschuwen en bij een schoolbus; ze geeft geen recht om overal te stoppen.",
    "Pneus hiver non obligatoires. Chaînes seulement sur neige ou glace ; pneus à clous interdits (sauf dérogation). Feux de détresse : panne ou accident, danger soudain, bus scolaire ; ils ne permettent pas de s'arrêter n'importe où.",
    "Winter tyres are not mandatory. Chains only on snow or ice; studded tyres banned (except ministerial exception). Hazard lights: breakdown or crash, sudden danger, school bus; they give no right to stop anywhere."),
   "32bis, 81", terms=[("noodverlichting", "feux de détresse"), ("sneeuwkettingen", "chaînes à neige")], sign="A15"),
 ],
 "vulnerable_users": [C("warn_signs", ("Знаки про пішоходів і дітей", "Borden voor voetgangers en kinderen", "Panneaux piétons et enfants", "Pedestrian and children signs"),
   ("A21 (трикутник) — попереду пішохідний перехід. F49 (синій квадрат) — саме місце переходу. A23 — діти поруч: школа чи майданчик. Будь готовий зупинитися: не пропустити пішохода на переході — 3-й ступінь (−5).",
    "A21 (driehoek): oversteekplaats verderop. F49 (blauw vierkant): de oversteekplaats zelf. A23: kinderen (school, speelplein). Wees klaar om te stoppen: geen voorrang aan een voetganger op het zebrapad is 3de graad (−5).",
    "A21 (triangle) : passage plus loin. F49 (carré bleu) : le passage lui-même. A23 : enfants (école, plaine de jeux). Soyez prêt à vous arrêter : ne pas céder à un piéton sur le passage, 3e degré (−5).",
    "A21 (triangle): crossing ahead. F49 (blue square): the crossing itself. A23: children (school, playground). Be ready to stop: not giving way to a pedestrian on the crossing is 3rd degree (−5)."),
   "66, 71, 40.4", serious=True, terms=[("oversteekplaats", "passage pour piétons"), ("kinderen", "enfants")], sign="A23")],
}
ls = load("lessons.json")
for t in ls:
    have = {c["id"] for c in t["cards"]}
    t["cards"] += [c for c in ADD.get(t["topic_id"], []) if c["id"] not in have]
save("lessons.json", ls)
print("карток:", sum(len(t["cards"]) for t in ls))
