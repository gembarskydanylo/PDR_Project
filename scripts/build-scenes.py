#!/usr/bin/env python3
"""Генерує схеми дорожніх ситуацій (вигляд згори) у assets/scenes/.

Стиль — як схеми в навчальних матеріалах: асфальт, розмітка, тротуари,
машини згори, стрілка запланованого руху «твоєї» машини.
Знаки вбудовуються з assets/signs (SVG усередині <img> не може тягнути зовнішні файли).
Запуск: python3 scripts/build-scenes.py
"""
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIGNS = ROOT / "assets" / "signs"
OUT = ROOT / "assets" / "scenes"

W, H = 400, 260
GRASS = "#B9C7A5"
PAVE = "#D9D8D2"
CURB = "#BDBCB5"
ROAD = "#5B5F64"
LINE = "#F4F4F0"
EGO = "#1F5FAE"


def car(x, y, angle, color, ego=False, length=46, width=22):
    """Легковик згори. angle: 0 = їде вгору (на північ), 90 = на схід."""
    l, w = length, width
    hl = "#FFF6C8"
    body = (
        f'<g transform="translate({x},{y}) rotate({angle})">'
        f'<rect x="{-w / 2 - 1.5}" y="{-l / 2 + 12}" width="{w + 3}" height="5" rx="1.5" fill="#2A2D31"/>'  # дзеркала
        f'<rect x="{-w / 2}" y="{-l / 2}" width="{w}" height="{l}" rx="6" fill="{color}" stroke="rgba(0,0,0,.35)" stroke-width="1"/>'
        f'<path d="M{-w / 2 + 3},{-l / 2 + 15} Q0,{-l / 2 + 9} {w / 2 - 3},{-l / 2 + 15} L{w / 2 - 4},{-l / 2 + 21} L{-w / 2 + 4},{-l / 2 + 21} Z" fill="#2B3440"/>'  # лобове
        f'<rect x="{-w / 2 + 3.5}" y="{-l / 2 + 21}" width="{w - 7}" height="{l - 33}" rx="2.5" fill="rgba(0,0,0,.12)"/>'  # дах
        f'<path d="M{-w / 2 + 4},{l / 2 - 12} L{w / 2 - 4},{l / 2 - 12} L{w / 2 - 3},{l / 2 - 6} Q0,{l / 2 - 3} {-w / 2 + 3},{l / 2 - 6} Z" fill="#2B3440"/>'  # заднє
        f'<rect x="{-w / 2 + 2}" y="{-l / 2 + 1}" width="5" height="3" rx="1" fill="{hl}"/>'
        f'<rect x="{w / 2 - 7}" y="{-l / 2 + 1}" width="5" height="3" rx="1" fill="{hl}"/>'
        f'<rect x="{-w / 2 + 2}" y="{l / 2 - 3.5}" width="5" height="2.5" rx="1" fill="#C0262D"/>'
        f'<rect x="{w / 2 - 7}" y="{l / 2 - 3.5}" width="5" height="2.5" rx="1" fill="#C0262D"/>'
    )
    return body + "</g>"


def label(x, y, text, color="#1E2227"):
    return (f'<g transform="translate({x},{y})"><circle r="9" fill="#fff" stroke="{color}" stroke-width="1.8"/>'
            f'<text y="3.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="{color}">{text}</text></g>')


def path_arrow(d, color=EGO):
    return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="4" stroke-dasharray="7 5" stroke-linecap="round" '
            f'marker-end="url(#ah)" opacity=".9"/>')


def defs():
    return (f'<defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">'
            f'<path d="M0,0 L10,5 L0,10 Z" fill="{EGO}"/></marker></defs>')


def sign(code, x, y, size=30):
    """Знак на стовпчику (вигляд збоку-згори, як на схемах)."""
    raw = (SIGNS / f"{code}.svg").read_text()
    vb = re.search(r'viewBox="([^"]+)"', raw).group(1)
    inner = re.sub(r"^<svg[^>]*>|</svg>\s*$", "", raw.strip())
    return (f'<rect x="{x - 1.5}" y="{y}" width="3" height="{size * .55}" fill="#8A8D91"/>'
            f'<svg x="{x - size / 2}" y="{y - size}" width="{size}" height="{size}" viewBox="{vb}">{inner}</svg>')


def wrap(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W * 2}" height="{H * 2}">'
            f'{defs()}<clipPath id="frame"><rect width="{W}" height="{H}"/></clipPath>'
            f'<g clip-path="url(#frame)"><rect width="{W}" height="{H}" fill="{GRASS}"/>{body}</g></svg>\n')


def crossroads(road=70):
    cx, cy = W / 2, H / 2
    r2 = road / 2
    sw = 14  # тротуар
    out = [f'<rect x="0" y="{cy - r2 - sw}" width="{W}" height="{road + 2 * sw}" fill="{PAVE}"/>',
           f'<rect x="{cx - r2 - sw}" y="0" width="{road + 2 * sw}" height="{H}" fill="{PAVE}"/>',
           f'<rect x="0" y="{cy - r2}" width="{W}" height="{road}" fill="{ROAD}"/>',
           f'<rect x="{cx - r2}" y="0" width="{road}" height="{H}" fill="{ROAD}"/>']
    dash = f'stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"'
    out += [f'<line x1="0" y1="{cy}" x2="{cx - r2 - 4}" y2="{cy}" {dash}/>',
            f'<line x1="{cx + r2 + 4}" y1="{cy}" x2="{W}" y2="{cy}" {dash}/>',
            f'<line x1="{cx}" y1="0" x2="{cx}" y2="{cy - r2 - 4}" {dash}/>',
            f'<line x1="{cx}" y1="{cy + r2 + 4}" x2="{cx}" y2="{H}" {dash}/>']
    return "".join(out)


SCENES = {}

# 1. Перехрестя рівнозначних доріг: A (ти) їде прямо, B наближається праворуч.
cx, cy = W / 2, H / 2
SCENES["priority-right"] = wrap(
    crossroads()
    + path_arrow(f"M{cx + 17},{cy + 58} L{cx + 17},{cy - 70}")
    + car(cx + 17, cy + 92, 0, EGO, ego=True)
    + label(cx + 46, cy + 92, "A", EGO)
    + car(cx + 92, cy - 17, -90, "#C9302C")
    + label(cx + 92, cy - 46, "B")
)

# 2. Кільце з D5 + B1 на в'їзді: A в'їжджає, B уже на колі.
R_OUT, R_IN = 78, 36
ring_mid = (R_OUT + R_IN) / 2
cyr = 100
ring = (f'<rect x="{cx - 50}" y="{cyr}" width="100" height="{H}" fill="{PAVE}"/>'
        f'<circle cx="{cx}" cy="{cyr}" r="{R_OUT + 12}" fill="{PAVE}"/>'
        f'<rect x="{cx - 36}" y="{cyr}" width="72" height="{H}" fill="{ROAD}"/>'
        f'<rect x="0" y="{cyr - 36}" width="{W}" height="72" fill="{ROAD}"/>'
        f'<circle cx="{cx}" cy="{cyr}" r="{R_OUT}" fill="{ROAD}"/>'
        f'<circle cx="{cx}" cy="{cyr}" r="{R_IN}" fill="#9DB384" stroke="{CURB}" stroke-width="4"/>'
        f'<line x1="{cx}" y1="{cyr + R_OUT + 2}" x2="{cx}" y2="{H}" stroke="{LINE}" stroke-width="2"/>'
        # лінія «дати дорогу» (акулячі зуби) на в'їзді праворуч
        + "".join(f'<path d="M{cx + 2 + i * 8},{cyr + R_OUT - 2} l4,7 l4,-7 Z" fill="{LINE}"/>' for i in range(4)))
ang = math.radians(150)  # позиція B на колі (ліворуч-знизу від в'їзду)
bx, by = cx + ring_mid * math.cos(ang), cyr + ring_mid * math.sin(ang)
SCENES["roundabout-yield"] = wrap(
    ring
    + sign("D5", cx + 58, 212, 26) + sign("B1", cx + 58, 240, 26)
    + path_arrow(f"M{cx + 17},{cyr + R_OUT + 6} Q{cx + 28},{cyr + R_OUT - 26} {cx + 52},{cyr + 40}")
    + car(cx + 17, H - 30, 0, EGO, ego=True)
    + label(cx - 12, H - 30, "A", EGO)
    + car(bx, by, 150, "#E8E8E4")
    + label(bx - 24, by - 16, "B")
)

# 3. Пішохідний перехід: де можна зупинитися перед ним?
road_y, road_h = 96, 76
zebra = "".join(f'<rect x="{230 + i * 0}" y="{road_y + 4 + i * 10}" width="34" height="6" fill="{LINE}"/>' for i in range(7))
SCENES["crosswalk-parking"] = wrap(
    f'<rect x="0" y="{road_y - 22}" width="{W}" height="{road_h + 44}" fill="{PAVE}"/>'
    f'<rect x="0" y="{road_y}" width="{W}" height="{road_h}" fill="{ROAD}"/>'
    f'<line x1="0" y1="{road_y + road_h / 2}" x2="{W}" y2="{road_y + road_h / 2}" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>'
    + zebra
    + car(150, road_y + road_h - 15, 90, EGO, ego=True)
    + label(150, road_y + road_h + 22, "A", EGO)
    + car(330, road_y + 18, -90, "#6B6F75")
    # розмірна лінія від заднього краю ? до переходу
    + f'<g stroke="#1E2227" stroke-width="1.5"><line x1="176" y1="{road_y + road_h + 12}" x2="228" y2="{road_y + road_h + 12}"/>'
      f'<line x1="176" y1="{road_y + road_h + 6}" x2="176" y2="{road_y + road_h + 18}"/>'
      f'<line x1="228" y1="{road_y + road_h + 6}" x2="228" y2="{road_y + road_h + 18}"/></g>'
      f'<text x="202" y="{road_y + road_h + 30}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#1E2227">? м</text>'
)

# ===== Розширення: нові учасники руху =====
CYCLE = "#B9654F"   # червоне покриття велодоріжки
DIRT = "#A8916A"


def tram(x, y, angle, length=120, width=26):
    l, w = length, width
    seg = "".join(f'<line x1="{-w / 2}" y1="{-l / 2 + l * k / 3}" x2="{w / 2}" y2="{-l / 2 + l * k / 3}" stroke="#9A968C" stroke-width="1.2"/>' for k in (1, 2))
    return (f'<g transform="translate({x},{y}) rotate({angle})">'
            f'<rect x="{-w / 2}" y="{-l / 2}" width="{w}" height="{l}" rx="8" fill="#ECEAE3" stroke="rgba(0,0,0,.35)"/>'
            f'<rect x="{-w / 2 + 3}" y="{-l / 2 + 2}" width="{w - 6}" height="8" rx="3" fill="#2B3440"/>'
            f'<rect x="{-w / 2 + 3}" y="{l / 2 - 10}" width="{w - 6}" height="8" rx="3" fill="#2B3440"/>'
            f'{seg}<rect x="-4" y="-10" width="8" height="20" fill="none" stroke="#5B5F64" stroke-width="1.5"/>'
            f'<rect x="{-w / 2}" y="{-l / 2 + 12}" width="3" height="{l - 24}" fill="#C9302C"/>'
            f'<rect x="{w / 2 - 3}" y="{-l / 2 + 12}" width="3" height="{l - 24}" fill="#C9302C"/></g>')


def bike(x, y, angle, color="#2E7D4F"):
    return (f'<g transform="translate({x},{y}) rotate({angle})">'
            f'<rect x="-1.6" y="-13" width="3.2" height="26" rx="1.6" fill="#2A2D31"/>'
            f'<rect x="-7" y="-9" width="14" height="2.4" rx="1" fill="#2A2D31"/>'
            f'<ellipse cx="0" cy="0" rx="7.5" ry="4.5" fill="{color}"/><circle cx="0" cy="-2" r="3.6" fill="#E9C9A6" stroke="#5A4632" stroke-width=".8"/></g>')


def person(x, y, color="#7A4FA0", angle=0, scale=1.6):
    return (f'<g transform="translate({x},{y}) rotate({angle}) scale({scale})"><ellipse cx="0" cy="0" rx="7" ry="4" fill="{color}"/>'
            f'<circle cx="0" cy="0" r="3.6" fill="#E9C9A6" stroke="#5A4632" stroke-width=".8"/></g>')


def ambulance(x, y, angle):
    return (car(x, y, angle, "#F4F4F0", length=54, width=24)
            + f'<g transform="translate({x},{y}) rotate({angle})"><rect x="-8" y="-6" width="16" height="4" rx="1" fill="#1F5FAE"/>'
              f'<rect x="-11" y="4" width="22" height="3" fill="#D52B1E"/><rect x="-11" y="12" width="22" height="3" fill="#D52B1E"/></g>')


def rails(x1, y1, x2, y2, gauge=10):
    """Пара рейок зі шпалами між (x1,y1) і (x2,y2) — лише горизонтально або вертикально."""
    out = []
    if y1 == y2:
        out += [f'<rect x="{x1}" y="{y1 - gauge / 2 - 3}" width="{x2 - x1}" height="{gauge + 6}" fill="#6E6A60"/>']
        out += [f'<rect x="{xx}" y="{y1 - gauge / 2 - 3}" width="3" height="{gauge + 6}" fill="#4E4A42"/>' for xx in range(int(x1), int(x2), 9)]
        out += [f'<line x1="{x1}" y1="{y1 + d}" x2="{x2}" y2="{y1 + d}" stroke="#C9CCD0" stroke-width="1.6"/>' for d in (-gauge / 2, gauge / 2)]
    else:
        out += [f'<rect x="{x1 - gauge / 2 - 3}" y="{y1}" width="{gauge + 6}" height="{y2 - y1}" fill="#6E6A60"/>']
        out += [f'<rect x="{x1 - gauge / 2 - 3}" y="{yy}" width="{gauge + 6}" height="3" fill="#4E4A42"/>' for yy in range(int(y1), int(y2), 9)]
        out += [f'<line x1="{x1 + d}" y1="{y1}" x2="{x1 + d}" y2="{y2}" stroke="#C9CCD0" stroke-width="1.6"/>' for d in (-gauge / 2, gauge / 2)]
    return "".join(out)


def tram_tracks_in_road(y, x1=0, x2=W, gauge=10):
    return "".join(f'<line x1="{x1}" y1="{y + d}" x2="{x2}" y2="{y + d}" stroke="#9EA2A7" stroke-width="1.8"/>' for d in (-gauge / 2, gauge / 2))


def hroad(y, h, lanes_dash=True, sidewalks=True):
    out = []
    if sidewalks:
        out.append(f'<rect x="0" y="{y - 16}" width="{W}" height="{h + 32}" fill="{PAVE}"/>')
    out.append(f'<rect x="0" y="{y}" width="{W}" height="{h}" fill="{ROAD}"/>')
    if lanes_dash:
        out.append(f'<line x1="0" y1="{y + h / 2}" x2="{W}" y2="{y + h / 2}" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>')
    return "".join(out)


def note(x, y, text, color="#1E2227"):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="{color}">{text}</text>'


def dim(x1, y1, x2, y2, text):
    """Розмірна лінія з підписом."""
    if y1 == y2:
        ends = f'<line x1="{x1}" y1="{y1 - 5}" x2="{x1}" y2="{y1 + 5}"/><line x1="{x2}" y1="{y2 - 5}" x2="{x2}" y2="{y2 + 5}"/>'
        tx, ty = (x1 + x2) / 2, y1 - 6
    else:
        ends = f'<line x1="{x1 - 5}" y1="{y1}" x2="{x1 + 5}" y2="{y1}"/><line x1="{x2 - 5}" y1="{y2}" x2="{x2 + 5}" y2="{y2}"/>'
        tx, ty = x1 + 18, (y1 + y2) / 2 + 4
    return (f'<g stroke="#FFFFFF" stroke-width="1.6"><line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>{ends}</g>'
            + f'<text x="{tx}" y="{ty}" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">{text}</text>')


# 4. Трамвай зліва на перехресті без знаків
SCENES["tram-left"] = wrap(
    crossroads()
    + tram_tracks_in_road(cy + 17)
    + path_arrow(f"M{cx + 17},{cy + 58} L{cx + 17},{cy - 70}")
    + car(cx + 17, cy + 92, 0, EGO) + label(cx + 46, cy + 92, "A", EGO)
    + tram(cx - 120, cy + 17, 90) + label(cx - 120, cy + 44, "T")
)

# 5. Поворот ліворуч, зустрічне авто їде прямо
SCENES["turn-left-oncoming"] = wrap(
    crossroads()
    + path_arrow(f"M{cx + 17},{cy + 56} Q{cx + 17},{cy - 4} {cx - 70},{cy - 17}")
    + car(cx + 17, cy + 92, 0, EGO) + label(cx + 46, cy + 92, "A", EGO)
    + path_arrow(f"M{cx - 17},{cy - 56} L{cx - 17},{cy + 70}", "#C9302C")
    + car(cx - 17, cy - 92, 180, "#C9302C") + label(cx - 46, cy - 92, "B")
)

# 6. Поворот праворуч, велосипедист на велодоріжці
vx = 185  # центр вертикальної дороги
side_y = 70
SCENES["cyclist-right-turn"] = wrap(
    f'<rect x="{vx - 50}" y="0" width="128" height="{H}" fill="{PAVE}"/>'
    f'<rect x="{vx}" y="{side_y - 16}" width="{W}" height="{62 + 32}" fill="{PAVE}"/>'
    f'<rect x="{vx - 36}" y="0" width="72" height="{H}" fill="{ROAD}"/>'
    f'<rect x="{vx + 36}" y="{side_y}" width="{W}" height="62" fill="{ROAD}"/>'
    f'<rect x="{vx + 44}" y="0" width="18" height="{side_y - 2}" fill="{CYCLE}"/>'
    f'<rect x="{vx + 44}" y="{side_y + 64}" width="18" height="{H}" fill="{CYCLE}"/>'
    + "".join(f'<rect x="{vx + 44}" y="{side_y + 2 + i * 12}" width="18" height="6" fill="{CYCLE}" opacity=".85"/>' for i in range(5))
    + f'<line x1="{vx}" y1="0" x2="{vx}" y2="{H}" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>'
    + path_arrow(f"M{vx + 17},{H - 70} Q{vx + 17},{side_y + 30} {W - 40},{side_y + 46}")
    + car(vx + 17, H - 36, 0, EGO) + label(vx - 12, H - 36, "A", EGO)
    + bike(vx + 53, H - 66, 0) + label(vx + 76, H - 66, "B")
)

# 7. Виїзд із ґрунтової дороги
SCENES["dirt-road"] = wrap(
    hroad(70, 70)
    + f'<path d="M{cx - 24},{H} L{cx - 20},{156} L{cx + 20},{156} L{cx + 24},{H} Z" fill="{DIRT}"/>'
    + f'<rect x="{cx - 20}" y="140" width="40" height="18" fill="{ROAD}"/>'
    + "".join(f'<circle cx="{cx - 14 + (i * 13) % 28}" cy="{170 + i * 9}" r="1.6" fill="#7E6A48"/>' for i in range(10))
    + car(cx, 215, 0, EGO) + label(cx + 28, 215, "A", EGO)
    + car(70, 70 + 52, 90, "#C9302C") + label(70, 70 + 82 - 2, "B")
)


def motorway(lanes=3, y0=40, lane_h=30, shoulder=24):
    out = [f'<rect x="0" y="{y0 - 10}" width="{W}" height="{lanes * lane_h + shoulder + 20}" fill="#8F9A80"/>',
           f'<rect x="0" y="{y0}" width="{W}" height="{lanes * lane_h + shoulder}" fill="{ROAD}"/>']
    for k in range(1, lanes):
        out.append(f'<line x1="0" y1="{y0 + k * lane_h}" x2="{W}" y2="{y0 + k * lane_h}" stroke="{LINE}" stroke-width="2" stroke-dasharray="16 12"/>')
    out.append(f'<line x1="0" y1="{y0 + lanes * lane_h}" x2="{W}" y2="{y0 + lanes * lane_h}" stroke="{LINE}" stroke-width="3"/>')
    out.append(f'<line x1="0" y1="{y0 + 2}" x2="{W}" y2="{y0 + 2}" stroke="{LINE}" stroke-width="3"/>')
    return "".join(out)


# 8. Затор на автомагістралі, аварійна смуга праворуч
jam = "".join(car(40 + i * 62 + (k * 21) % 30, 40 + 15 + k * 30, 90, c)
              for k, row in enumerate([("#6B6F75", "#E8E8E4", "#C9302C", "#6B6F75", "#2F6E4F", "#E8E8E4"),
                                       ("#E8E8E4", "#6B6F75", "#8A5A2B", "#E8E8E4", "#6B6F75", "#C9302C"),
                                       ("#2F6E4F", "#E8E8E4", "#6B6F75", "#C9302C", "#E8E8E4", "#6B6F75")])
              for i, c in enumerate(row) if not (k == 2 and i == 1))
SCENES["motorway-shoulder"] = wrap(
    motorway() + jam
    + car(40 + 62 + 2, 40 + 15 + 60, 90, EGO) + label(104, 160, "A", EGO)
    + path_arrow(f"M128,{115} Q150,{142} 200,{142}")
    + note(260, 147, "?", "#FFFFFF")
    + f'<text x="330" y="148" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="{LINE}" opacity=".8">PECHSTROOK</text>'
)

# 9. Пропущений виїзд з автомагістралі
SCENES["motorway-missed-exit"] = wrap(
    motorway(lanes=2, y0=50, lane_h=32)
    + f'<path d="M40,{50 + 64 + 24} L150,{50 + 64 + 24} Q190,{50 + 64 + 30} 230,{H} L180,{H} Q150,{50 + 64 + 46} 110,{50 + 64 + 40} Z" fill="{ROAD}"/>'
    + f'<path d="M0,{50 + 64 + 24}" />'
    + car(290, 50 + 64 + 12, 90, EGO) + label(290, 50 + 64 + 40 + 8, "A", EGO)
    + path_arrow(f"M262,{50 + 64 + 12} L200,{50 + 64 + 12} Q175,{50 + 64 + 18} 160,{50 + 64 + 34}", "#C9302C")
    + note(212, 104, "?", "#FFFFFF")
    + car(150, 50 + 16, 90, "#6B6F75") + car(60, 50 + 48, 90, "#E8E8E4")
)

# 10. Залізничний переїзд: шлагбаум піднімається, червоні вогні блимають
ry = 110
SCENES["level-crossing"] = wrap(
    f'<rect x="{cx - 50}" y="0" width="100" height="{H}" fill="{PAVE}"/>'
    + f'<rect x="{cx - 36}" y="0" width="72" height="{H}" fill="{ROAD}"/>'
    + rails(0, ry - 14, W, ry - 14) + rails(0, ry + 14, W, ry + 14)
    + f'<line x1="{cx}" y1="0" x2="{cx}" y2="{ry - 34}" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>'
    + f'<line x1="{cx}" y1="{ry + 34}" x2="{cx}" y2="{H}" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>'
    + f'<line x1="{cx - 36}" y1="{ry + 46}" x2="{cx}" y2="{ry + 46}" stroke="{LINE}" stroke-width="4"/>'
    # шлагбауми напівпідняті
    + f'<g stroke-linecap="round"><line x1="{cx + 46}" y1="{ry + 44}" x2="{cx + 14}" y2="{ry + 30}" stroke="#D52B1E" stroke-width="5"/>'
      f'<line x1="{cx + 46}" y1="{ry + 44}" x2="{cx + 14}" y2="{ry + 30}" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="6 6"/>'
      f'<line x1="{cx - 46}" y1="{ry - 44}" x2="{cx - 14}" y2="{ry - 30}" stroke="#D52B1E" stroke-width="5"/>'
      f'<line x1="{cx - 46}" y1="{ry - 44}" x2="{cx - 14}" y2="{ry - 30}" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="6 6"/></g>'
    + "".join(f'<circle cx="{x0}" cy="{y0}" r="9" fill="#D52B1E" opacity=".35"/><circle cx="{x0}" cy="{y0}" r="4.5" fill="#FF3B30"/>'
              for x0, y0 in ((cx + 56, ry + 54), (cx - 56, ry - 54)))
    + car(cx + 17, ry + 88, 0, EGO) + label(cx + 46, ry + 88, "A", EGO)
)

# 11. Обгін велосипедиста — бокова відстань
oy, oh = 80, 90
SCENES["overtake-cyclist"] = wrap(
    hroad(oy, oh)
    + bike(250, oy + oh - 14, 90) + label(250, oy + oh + 26, "B")
    + car(200, oy + oh / 2 - 2, 90, EGO) + label(160, oy + oh / 2 - 2, "A", EGO)
    + dim(250, oy + oh / 2 + 9, 250, oy + oh - 22, "? м")
)

# 12. «Блискавка»: ліва смуга закінчується
zy = 70
SCENES["zipper"] = wrap(
    f'<rect x="0" y="{zy - 16}" width="{W}" height="{100 + 32}" fill="{PAVE}"/>'
    + f'<path d="M0,{zy} L250,{zy} L320,{zy + 40} L{W},{zy + 40} L{W},{zy + 100} L0,{zy + 100} Z" fill="{ROAD}"/>'
    + f'<line x1="0" y1="{zy + 40}" x2="250" y2="{zy + 40}" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>'
    + "".join(f'<path d="M{150 + i * 24},{zy + 20} l10,-6 l0,12 Z" fill="{LINE}" opacity=".9" transform="rotate(25 {150 + i * 24} {zy + 20})"/>' for i in range(3))
    + "".join(car(x0, zy + 70, 90, c) for x0, c in ((40, "#6B6F75"), (100, "#E8E8E4"), (160, "#C9302C"), (220, "#2F6E4F"), (280, "#6B6F75"), (345, "#E8E8E4")))
    + car(150, zy + 20, 90, EGO) + label(110, zy + 20, "A", EGO)
    + path_arrow(f"M176,{zy + 20} L236,{zy + 20} Q262,{zy + 22} 280,{zy + 44}")
)

# 13. Трамвайна зупинка без острівця
ty0 = 60
SCENES["tram-stop"] = wrap(
    f'<rect x="0" y="{ty0 - 16}" width="{W}" height="{140 + 32}" fill="{PAVE}"/>'
    + f'<rect x="0" y="{ty0}" width="{W}" height="140" fill="{ROAD}"/>'
    + tram_tracks_in_road(ty0 + 70)
    + f'<line x1="0" y1="{ty0 + 46}" x2="{W}" y2="{ty0 + 46}" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>'
    + tram(285, ty0 + 70, 90, length=130) + label(285, ty0 + 44, "T")
    + person(262, ty0 + 104, "#7A4FA0") + person(286, ty0 + 118, "#2F6E9E") + person(310, ty0 + 128, "#B35C2E")
    + car(120, ty0 + 112, 90, EGO) + label(120, ty0 + 160, "A", EGO)
)

# 14. Пішохід чекає біля переходу
SCENES["pedestrian-waiting"] = wrap(
    f'<rect x="{cx - 50}" y="0" width="100" height="{H}" fill="{PAVE}"/>'
    + f'<rect x="{cx - 36}" y="0" width="72" height="{H}" fill="{ROAD}"/>'
    + "".join(f'<rect x="{cx - 34 + i * 10}" y="70" width="6" height="34" fill="{LINE}"/>' for i in range(7))
    + f'<line x1="{cx}" y1="0" x2="{cx}" y2="62" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>'
    + f'<line x1="{cx}" y1="112" x2="{cx}" y2="{H}" stroke="{LINE}" stroke-width="2" stroke-dasharray="12 10"/>'
    + person(cx + 44, 86, "#7A4FA0", -90)
    + car(cx + 17, 200, 0, EGO) + label(cx + 46, 210, "A", EGO)
)

# 15. «Коридор життя» на автомагістралі з двома смугами
SCENES["rescue-lane"] = wrap(
    motorway(lanes=2, y0=60, lane_h=40, shoulder=20)
    + "".join(car(x0, 60 + 12, 90, c) for x0, c in ((150, "#6B6F75"), (215, "#E8E8E4"), (280, "#C9302C"), (345, "#2F6E4F")))
    + "".join(car(x0, 60 + 70, 90, c) for x0, c in ((160, "#E8E8E4"), (225, "#2F6E4F"), (290, "#6B6F75"), (355, "#E8E8E4")))
    + ambulance(60, 60 + 40, 90)
    + path_arrow("M92,100 L380,100")
)

# ===== Розширення 2: кільце з двома смугами, ожеледиця, засліплення =====
# 16. Кругова розв'язка з двома смугами: A у внутрішній смузі хоче виїхати, B у зовнішній
R2_OUT, R2_MID, R2_IN = 96, 66, 40
cy2 = 118
ring2 = (f'<rect x="{cx - 46}" y="{cy2}" width="92" height="{H}" fill="{PAVE}"/>'
         f'<rect x="{cx - 46}" y="0" width="92" height="{cy2}" fill="{PAVE}"/>'
         f'<rect x="0" y="{cy2 - 46}" width="{W}" height="92" fill="{PAVE}"/>'
         f'<circle cx="{cx}" cy="{cy2}" r="{R2_OUT + 10}" fill="{PAVE}"/>'
         f'<rect x="{cx - 36}" y="0" width="72" height="{H}" fill="{ROAD}"/>'
         f'<rect x="0" y="{cy2 - 36}" width="{W}" height="72" fill="{ROAD}"/>'
         f'<circle cx="{cx}" cy="{cy2}" r="{R2_OUT}" fill="{ROAD}"/>'
         f'<circle cx="{cx}" cy="{cy2}" r="{R2_MID}" fill="none" stroke="{LINE}" stroke-width="2" stroke-dasharray="10 9"/>'
         f'<circle cx="{cx}" cy="{cy2}" r="{R2_IN}" fill="#9DB384" stroke="{CURB}" stroke-width="4"/>')
ai = math.radians(60)   # A — у внутрішній смузі, праворуч знизу
ax, ay = cx + (R2_MID + R2_IN) / 2 * math.cos(ai), cy2 + (R2_MID + R2_IN) / 2 * math.sin(ai)
bo = math.radians(100)  # B — у зовнішній смузі трохи позаду
bx2, by2 = cx + (R2_OUT + R2_MID) / 2 * math.cos(bo), cy2 + (R2_OUT + R2_MID) / 2 * math.sin(bo)
# рух проти годинникової стрілки (на схемі y донизу): кут зменшується
SCENES["roundabout-two-lanes"] = wrap(
    ring2
    # кут повороту машини = кут позиції на колі (рух проти годинникової стрілки)
    + car(ax, ay, 60, EGO) + label(ax + 30, ay + 4, "A", EGO)
    + car(bx2, by2, 100, "#C9302C") + label(bx2 - 30, by2 + 6, "B")
    + path_arrow(f"M{ax + 14},{ay - 18} Q{cx + 86},{cy2 - 20} {W - 30},{cy2 - 17}")
)

# 17. Ожеледиця: дорога з крижаною кіркою, знак A15
ice = "".join(f'<ellipse cx="{x0}" cy="{y0}" rx="{rx}" ry="{ry}" fill="#DCEBF5" opacity=".75"/>'
              for x0, y0, rx, ry in ((70, 112, 40, 9), (170, 140, 55, 10), (260, 108, 46, 8), (340, 146, 38, 9), (120, 155, 30, 6)))
SCENES["black-ice"] = wrap(
    f'<rect width="{W}" height="{H}" fill="#E8EEF0"/>'
    + hroad(90, 80) + ice
    + "".join(f'<circle cx="{(i * 47) % W}" cy="{(i * 31) % 70 + 5}" r="1.6" fill="#FFFFFF"/>' for i in range(30))
    + car(220, 90 + 60, 90, EGO) + label(180, 90 + 60, "A", EGO)
    + sign("A15", 330, 222, 34)
    + f'<text x="40" y="232" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#1F5FAE">−2 °C</text>'
)

# 18. Вночі: засліплення зустрічним світлом
SCENES["night-dazzle"] = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W * 2}" height="{H * 2}">{defs()}'
    f'<defs><radialGradient id="glare" cx="0" cy=".5" r="1"><stop offset="0" stop-color="#FFF7C8" stop-opacity=".95"/>'
    f'<stop offset="1" stop-color="#FFF7C8" stop-opacity="0"/></radialGradient>'
    f'<linearGradient id="dip" x1="0" x2="1"><stop offset="0" stop-color="#FFF2B0" stop-opacity=".55"/><stop offset="1" stop-color="#FFF2B0" stop-opacity="0"/></linearGradient></defs>'
    f'<rect width="{W}" height="{H}" fill="#1B2129"/>'
    f'<rect x="0" y="88" width="{W}" height="84" fill="#34393F"/>'
    f'<line x1="0" y1="130" x2="{W}" y2="130" stroke="#C9CCD0" stroke-width="2" stroke-dasharray="12 10" opacity=".7"/>'
    # світло зустрічного (дальнє) — довгий яскравий конус ліворуч
    f'<polygon points="276,106 40,70 40,150" fill="url(#glare)"/>'
    + car(300, 109, -90, "#E8E8E4")
    # твоє ближнє світло — короткий конус праворуч
    + f'<polygon points="124,151 230,138 230,170" fill="url(#dip)"/>'
    + car(100, 151, 90, EGO) + label(100, 186, "A", EGO) + label(300, 78, "B")
    + "</svg>\n")

OUT.mkdir(parents=True, exist_ok=True)
for name, content in SCENES.items():
    (OUT / f"{name}.svg").write_text(content, encoding="utf-8")
print(f"{len(SCENES)} схем → {OUT}")
