#!/usr/bin/env python3
"""Генерує SVG бельгійських дорожніх знаків у assets/signs/.

Знаки намальовано вручну за офіційною геометрією та кольорами
(Wegcode, бijlage 1 / Code de la route, annexe 1). Запуск:
    python3 scripts/build-signs.py
"""
import math
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "signs"
RED, BLUE, YELLOW, BLACK, WHITE = "#D52B1E", "#0055A5", "#FFD200", "#1A1A1A", "#FFFFFF"


def svg(body, w=100, h=100):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w * 2}" height="{h * 2}">{body}</svg>\n')


def pts(points):
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in points)


def triangle(up=True):
    """Трикутник з червоною облямівкою і білим полем (серія A, B1, B17)."""
    s = 92
    h = s * math.sqrt(3) / 2
    if up:
        outer = [(50, 4), (50 + s / 2, 4 + h), (50 - s / 2, 4 + h)]
    else:
        outer = [(50 - s / 2, 6), (50 + s / 2, 6), (50, 6 + h)]
    cx = sum(p[0] for p in outer) / 3
    cy = sum(p[1] for p in outer) / 3
    k = 0.64
    inner = [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in outer]
    body = (f'<polygon points="{pts(outer)}" fill="{RED}" stroke="{RED}" stroke-width="6" stroke-linejoin="round"/>'
            f'<polygon points="{pts(inner)}" fill="{WHITE}" stroke="{WHITE}" stroke-width="2" stroke-linejoin="round"/>')
    return body, (cx, cy)


def disc(fill, border=None, border_w=10):
    if border:
        return (f'<circle cx="50" cy="50" r="48" fill="{border}"/>'
                f'<circle cx="50" cy="50" r="{48 - border_w}" fill="{fill}"/>')
    return f'<circle cx="50" cy="50" r="48" fill="{fill}" stroke="{WHITE}" stroke-width="1.5"/>'


def front_car(x, y, w, color):
    """Легковик спереду — піктограма для C35."""
    h = w * 0.62
    return (f'<g fill="{color}">'
            f'<path d="M{x + w * .18},{y + h * .38} L{x + w * .28},{y + h * .05} Q{x + w * .5},{y - h * .02} {x + w * .72},{y + h * .05} '
            f'L{x + w * .82},{y + h * .38} L{x + w},{y + h * .45} L{x + w},{y + h * .85} L{x},{y + h * .85} L{x},{y + h * .45} Z"/>'
            f'<rect x="{x + w * .04}" y="{y + h * .8}" width="{w * .2}" height="{h * .3}" rx="2"/>'
            f'<rect x="{x + w * .76}" y="{y + h * .8}" width="{w * .2}" height="{h * .3}" rx="2"/></g>'
            f'<path d="M{x + w * .3},{y + h * .36} L{x + w * .36},{y + h * .14} L{x + w * .64},{y + h * .14} L{x + w * .7},{y + h * .36} Z" fill="{WHITE}"/>'
            f'<circle cx="{x + w * .14}" cy="{y + h * .6}" r="{w * .06}" fill="{WHITE}"/>'
            f'<circle cx="{x + w * .86}" cy="{y + h * .6}" r="{w * .06}" fill="{WHITE}"/>')


SIGNS = {}

# --- A: попереджувальні ---
body, (cx, cy) = triangle(up=True)
SIGNS["A51"] = svg(body + f'<rect x="46" y="{cy - 22}" width="8" height="26" rx="3" fill="{BLACK}"/>'
                          f'<circle cx="50" cy="{cy + 13}" r="4.6" fill="{BLACK}"/>', 100, 92)

# --- B: пріоритет ---
body, _ = triangle(up=False)
SIGNS["B1"] = svg(body, 100, 92)

oct_pts = [(50 + 47 * math.cos(math.radians(22.5 + 45 * i)), 50 + 47 * math.sin(math.radians(22.5 + 45 * i))) for i in range(8)]
oct_in = [(50 + 43 * math.cos(math.radians(22.5 + 45 * i)), 50 + 43 * math.sin(math.radians(22.5 + 45 * i))) for i in range(8)]
SIGNS["B5"] = svg(
    f'<polygon points="{pts(oct_pts)}" fill="{RED}"/>'
    f'<polygon points="{pts(oct_in)}" fill="none" stroke="{WHITE}" stroke-width="2.4"/>'
    f'<text x="50" y="59.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" '
    f'font-size="25" fill="{WHITE}" letter-spacing=".5">STOP</text>')

diamond = (f'<rect x="17" y="17" width="66" height="66" rx="3" transform="rotate(45 50 50)" fill="{WHITE}" stroke="{BLACK}" stroke-width="1.2"/>'
           f'<rect x="27" y="27" width="46" height="46" rx="1" transform="rotate(45 50 50)" fill="{YELLOW}"/>')
SIGNS["B9"] = svg(diamond)
# смуги обрізано по жовтому полю
SIGNS["B11"] = svg(
    '<defs><clipPath id="c"><rect x="27" y="27" width="46" height="46" transform="rotate(45 50 50)"/></clipPath></defs>'
    + diamond
    + '<g clip-path="url(#c)">'
    + "".join(f'<line x1="{14 + d}" y1="{86 + d}" x2="{86 + d}" y2="{14 + d}" stroke="{BLACK}" stroke-width="3.4"/>' for d in (-8, 0, 8))
    + "</g>")

body, (cx, cy) = triangle(up=True)
SIGNS["B17"] = svg(body + f'<g stroke="{BLACK}" stroke-width="9" stroke-linecap="butt">'
                          f'<line x1="{cx - 15}" y1="{cy - 13}" x2="{cx + 15}" y2="{cy + 17}"/>'
                          f'<line x1="{cx + 15}" y1="{cy - 13}" x2="{cx - 15}" y2="{cy + 17}"/></g>', 100, 92)

# --- C: заборонні ---
SIGNS["C1"] = svg(f'<circle cx="50" cy="50" r="48" fill="{RED}"/><rect x="16" y="41" width="68" height="18" fill="{WHITE}"/>')
SIGNS["C3"] = svg(disc(WHITE, RED, 11))
SIGNS["C43"] = svg(disc(WHITE, RED, 11) +
                   f'<text x="50" y="64" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" '
                   f'font-size="40" fill="{BLACK}" letter-spacing="-1">50</text>')
SIGNS["C35"] = svg(disc(WHITE, RED, 11) + front_car(19, 38, 30, RED) + front_car(51, 38, 30, BLACK))

# --- D: наказові ---
arrow_up = (f'<path d="M50,18 L68,40 L57,40 L57,82 L43,82 L43,40 L32,40 Z" fill="{WHITE}"/>')
SIGNS["D1"] = svg(disc(BLUE) + arrow_up)


def roundabout_arrows():
    parts = []
    for i in range(3):
        a0 = math.radians(-90 + 120 * i + 18)
        a1 = math.radians(-90 + 120 * i + 92)
        r = 24
        x0, y0 = 50 + r * math.cos(a0), 50 + r * math.sin(a0)
        x1, y1 = 50 + r * math.cos(a1), 50 + r * math.sin(a1)
        parts.append(f'<path d="M{x0:.2f},{y0:.2f} A{r},{r} 0 0 1 {x1:.2f},{y1:.2f}" fill="none" stroke="{WHITE}" stroke-width="7.5"/>')
        # наконечник у напрямку руху (проти годинникової стрілки на схемі = за годинниковою в SVG-координатах)
        tang = a1 + math.pi / 2
        tip = (x1 + 13 * math.cos(tang), y1 + 13 * math.sin(tang))
        nx, ny = math.cos(a1), math.sin(a1)
        b1 = (x1 + 11 * nx, y1 + 11 * ny)
        b2 = (x1 - 11 * nx, y1 - 11 * ny)
        parts.append(f'<polygon points="{pts([b1, tip, b2])}" fill="{WHITE}"/>')
    return "".join(parts)


# На знаку D5 стрілки йдуть проти годинникової стрілки (правосторонній рух).
SIGNS["D5"] = svg(disc(BLUE) + f'<g transform="translate(100,0) scale(-1,1)">{roundabout_arrows()}</g>')

bike = (f'<g fill="none" stroke="{WHITE}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'
        f'<circle cx="31" cy="60" r="12"/><circle cx="69" cy="60" r="12"/>'
        f'<path d="M31,60 L44,38 L62,38 L69,60 M44,38 L52,60 L62,38 M52,60 L31,60 M40,32 L48,32 M62,38 L60,30 L66,30"/></g>')
SIGNS["D7"] = svg(disc(BLUE) + bike)

# --- E: зупинка і стоянка ---
SIGNS["E1"] = svg(disc(BLUE, RED, 10) + f'<line x1="22" y1="22" x2="78" y2="78" stroke="{RED}" stroke-width="10"/>')
SIGNS["E3"] = svg(disc(BLUE, RED, 10) + f'<g stroke="{RED}" stroke-width="10"><line x1="22" y1="22" x2="78" y2="78"/>'
                                         f'<line x1="78" y1="22" x2="22" y2="78"/></g>')

# --- F: інформаційні ---
SIGNS["F5"] = svg(
    f'<rect x="2" y="2" width="96" height="96" rx="8" fill="{BLUE}" stroke="{WHITE}" stroke-width="2"/>'
    f'<rect x="7" y="7" width="86" height="86" rx="5" fill="none" stroke="{WHITE}" stroke-width="2.5"/>'
    f'<path d="M34,88 Q45,62 46,48 L54,48 Q55,62 66,88 Z" fill="{WHITE}"/>'
    f'<path d="M18,88 Q32,64 41,48 L44,48 Q37,64 26,88 Z M82,88 Q68,64 59,48 L56,48 Q63,64 74,88 Z" fill="{WHITE}"/>'
    f'<rect x="16" y="34" width="68" height="9" fill="{WHITE}"/>'
    f'<rect x="20" y="43" width="7" height="8" fill="{WHITE}"/><rect x="73" y="43" width="7" height="8" fill="{WHITE}"/>')

OUT.mkdir(parents=True, exist_ok=True)
for code, content in SIGNS.items():
    (OUT / f"{code}.svg").write_text(content, encoding="utf-8")
print(f"{len(SIGNS)} знаків → {OUT}")
