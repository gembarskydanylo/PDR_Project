#!/usr/bin/env python3
"""Партія 6: «Обери правильний знак» — варіанти-картинки, щоб розрізняти схожі знаки (ст. 66–71 KB 1-12-1975)."""
import sys
sys.path.insert(0, __import__("os").path.dirname(__file__))
from qlib import *  # noqa

signs = {s["code"]: s for s in load("signs.json")}


def P(id, topic, q, codes, expl, art, deg=1, speed=False):
    """Перший код — правильний. Підпис варіанта — код знака."""
    opts = [((c, c, c, c), S(c)) for c in codes]
    return Q(id, topic, deg, speed, F, q, opts, "a", expl, art, tags=["pick-sign", codes[0]])


def name(c):
    n = signs[c]["name"]
    return n["uk"], n["nl"], n["fr"], n["en"]


def ex(*codes):
    """Пояснення: «код — назва» для кожного варіанта, 4 мовами."""
    parts = [[f"{c} — {name(c)[i]}" for c in codes] for i in range(4)]
    return tuple("; ".join(p) + "." for p in parts)


ASK = lambda uk, nl, fr, en: (uk, nl, fr, en)

NEW = [
    P("pick_c3_closed", "road_signs", ASK("Який знак забороняє рух усім транспортним засобам в обох напрямках?", "Welk bord verbiedt het verkeer voor alle voertuigen in beide richtingen?",
      "Quel panneau interdit la circulation à tout véhicule dans les deux sens ?", "Which sign bans all vehicles in both directions?"), ["C3", "C1", "E3"], ex("C3", "C1", "E3"), "68"),
    P("pick_c1_no_entry", "road_signs", ASK("Який знак забороняє в'їзд з цього боку (дорога одностороння назустріч тобі)?", "Welk bord verbiedt de toegang langs deze kant (eenrichting tegen jou in)?",
      "Quel panneau interdit l'accès de ce côté (sens unique contre vous) ?", "Which sign bans entry from this side (one-way against you)?"), ["C1", "C3", "F19"], ex("C1", "C3", "F19"), "68"),
    P("pick_c35_no_overtake", "overtaking", ASK("Який знак забороняє обгін?", "Welk bord verbiedt inhalen?", "Quel panneau interdit le dépassement ?", "Which sign bans overtaking?"),
      ["C35", "C33", "C31a"], ex("C35", "C33", "C31a"), "68", deg=2),
    P("pick_c33_uturn", "lanes_turning", ASK("Який знак забороняє розворот?", "Welk bord verbiedt keren?", "Quel panneau interdit le demi-tour ?", "Which sign bans U-turns?"),
      ["C33", "C31a", "C31b"], ex("C33", "C31a", "C31b"), "68"),
    P("pick_c31b_right", "lanes_turning", ASK("Який знак забороняє поворот праворуч?", "Welk bord verbiedt rechts afslaan?", "Quel panneau interdit de tourner à droite ?", "Which sign bans turning right?"),
      ["C31b", "C31a", "C33"], ex("C31b", "C31a", "C33"), "68"),
    P("pick_b9_priority_road", "priority_intersections", ASK("Який знак означає, що ти їдеш дорогою з пріоритетом?", "Welk bord betekent dat je op een voorrangsweg rijdt?",
      "Quel panneau indique que vous êtes sur une route prioritaire ?", "Which sign means you are on a priority road?"), ["B9", "B15", "B11"], ex("B9", "B15", "B11"), "67"),
    P("pick_b11_end_priority", "priority_intersections", ASK("Після якого знака пріоритет дороги закінчується?", "Na welk bord eindigt de voorrangsweg?",
      "Après quel panneau la route prioritaire prend-elle fin ?", "After which sign does the priority road end?"), ["B11", "B9", "B17"], ex("B11", "B9", "B17"), "67"),
    P("pick_b5_stop", "priority_intersections", ASK("Який знак вимагає повної зупинки перед перехрестям?", "Welk bord verplicht je volledig te stoppen voor het kruispunt?",
      "Quel panneau impose l'arrêt complet avant le carrefour ?", "Which sign requires a full stop before the junction?"), ["B5", "B1", "B17"], ex("B5", "B1", "B17"), "67", deg=2),
    P("pick_b17_right", "priority_intersections", ASK("Який знак попереджає про перехрестя, де діє пріоритет праворуч?", "Welk bord kondigt een kruispunt met voorrang van rechts aan?",
      "Quel panneau annonce un carrefour à priorité de droite ?", "Which sign warns of a junction with priority to the right?"), ["B17", "B15", "A51"], ex("B17", "B15", "A51"), "67"),
    P("pick_d5_roundabout", "roundabouts", ASK("Який знак позначає круговий рух?", "Welk bord duidt een rotonde aan?", "Quel panneau indique un rond-point ?", "Which sign marks a roundabout?"),
      ["D5", "D1", "B1"], ex("D5", "D1", "B1"), "69"),
    P("pick_d7_cycle", "vulnerable_users", ASK("Який знак позначає обов'язкову велодоріжку?", "Welk bord duidt een verplicht fietspad aan?",
      "Quel panneau indique une piste cyclable obligatoire ?", "Which sign marks a mandatory cycle path?"), ["D7", "D1", "F49"], ex("D7", "D1", "F49"), "70"),
    P("pick_e3_no_stopping", "stopping_parking", ASK("Який знак забороняє і зупинку, і стоянку?", "Welk bord verbiedt zowel stilstaan als parkeren?",
      "Quel panneau interdit à la fois l'arrêt et le stationnement ?", "Which sign bans both stopping and parking?"), ["E3", "E1", "E9a"], ex("E3", "E1", "E9a"), "70"),
    P("pick_e9a_parking", "stopping_parking", ASK("Який знак дозволяє стоянку?", "Welk bord laat parkeren toe?", "Quel panneau autorise le stationnement ?", "Which sign allows parking?"),
      ["E9a", "E1", "E3"], ex("E9a", "E1", "E3"), "70"),
    P("pick_f4b_end30", "speed_distance", ASK("Після якого знака закінчується зона 30?", "Na welk bord eindigt de zone 30?", "Après quel panneau la zone 30 se termine-t-elle ?", "After which sign does the zone 30 end?"),
      ["F4b", "F4a", "C45"], ex("F4b", "F4a", "C45"), "71", speed=True),
    P("pick_f5_motorway", "motorways_tunnels", ASK("Який знак позначає початок автомагістралі?", "Welk bord duidt het begin van een autosnelweg aan?",
      "Quel panneau indique le début d'une autoroute ?", "Which sign marks the start of a motorway?"), ["F5", "F7", "F19"], ex("F5", "F7", "F19"), "71"),
    P("pick_f7_end_motorway", "motorways_tunnels", ASK("Який знак позначає кінець автомагістралі?", "Welk bord duidt het einde van een autosnelweg aan?",
      "Quel panneau indique la fin d'une autoroute ?", "Which sign marks the end of a motorway?"), ["F7", "F5", "F3"], ex("F7", "F5", "F3"), "71"),
    P("pick_f19_oneway", "lanes_turning", ASK("Який знак означає, що ти в'їжджаєш на дорогу з одностороннім рухом?", "Welk bord betekent dat je een eenrichtingsweg inrijdt?",
      "Quel panneau indique que vous entrez dans un sens unique ?", "Which sign means you are entering a one-way road?"), ["F19", "C1", "D1"], ex("F19", "C1", "D1"), "71"),
    P("pick_a1b_bend_right", "road_signs", ASK("Який знак попереджає про небезпечний поворот праворуч?", "Welk bord waarschuwt voor een gevaarlijke bocht naar rechts?",
      "Quel panneau annonce un virage dangereux à droite ?", "Which sign warns of a dangerous bend to the right?"), ["A1b", "A1a", "A51"], ex("A1b", "A1a", "A51"), "66"),
    P("pick_a15_slippery", "weather_hazards", ASK("Який знак попереджає про слизьку дорогу?", "Welk bord waarschuwt voor een glibberige rijbaan?",
      "Quel panneau avertit d'une chaussée glissante ?", "Which sign warns of a slippery road?"), ["A15", "A51", "A1a"], ex("A15", "A51", "A1a"), "66"),
    P("pick_a41_barriers", "motorways_tunnels", ASK("Який знак попереджає про залізничний переїзд ЗІ шлагбаумом?", "Welk bord kondigt een overweg MET slagbomen aan?",
      "Quel panneau annonce un passage à niveau AVEC barrières ?", "Which sign warns of a level crossing WITH barriers?"), ["A41", "A43", "A47"], ex("A41", "A43", "A47"), "66"),
    P("pick_a47_two_tracks", "motorways_tunnels", ASK("Який знак означає переїзд з двома коліями й більше?", "Welk bord duidt een overweg met twee of meer sporen aan?",
      "Quel panneau indique un passage à deux voies ou plus ?", "Which sign marks a crossing with two or more tracks?"), ["A47", "A45", "B17"], ex("A47", "A45", "B17"), "66"),
    P("pick_c45_end_limit", "speed_distance", ASK("Який знак скасовує попереднє обмеження швидкості?", "Welk bord heft de vorige snelheidsbeperking op?",
      "Quel panneau met fin à la limitation de vitesse précédente ?", "Which sign ends the previous speed limit?"), ["C45", "C43", "F4b"], ex("C45", "C43", "F4b"), "68", speed=True),
]

print("питань тепер:", add_questions(NEW), "| нових:", len(NEW))
