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
            f'{defs()}<rect width="{W}" height="{H}" fill="{GRASS}"/>{body}</svg>\n')


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

OUT.mkdir(parents=True, exist_ok=True)
for name, content in SCENES.items():
    (OUT / f"{name}.svg").write_text(content, encoding="utf-8")
print(f"{len(SCENES)} схем → {OUT}")
