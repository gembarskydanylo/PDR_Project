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

# ===== Розширення: додаткові знаки =====
def bar_prohibit():
    """Червона діагональ заборони (зліва-згори вниз-праворуч), обрізана по колу."""
    return (f'<defs><clipPath id="in"><circle cx="50" cy="50" r="37"/></clipPath></defs>'
            f'<line x1="22" y1="22" x2="78" y2="78" stroke="{RED}" stroke-width="10" clip-path="url(#in)"/>')


def turn_arrow(direction):
    """Чорна стрілка «поворот» для C31: їде вгору й повертає ліворуч/праворуч."""
    k = -1 if direction == "left" else 1
    x = lambda v: 50 + k * (v - 50)
    return (f'<path d="M{x(54)},80 L{x(54)},52 Q{x(54)},40 {x(64)},40 L{x(66)},40" fill="none" stroke="{BLACK}" stroke-width="9"/>'
            f'<polygon points="{x(64)},28 {x(80)},40 {x(64)},52" fill="{BLACK}"/>')


def number_disc(n):
    size = 40 if n < 100 else 32
    return svg(disc(WHITE, RED, 11) +
               f'<text x="50" y="{50 + size * .35:.1f}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" '
               f'font-size="{size}" fill="{BLACK}" letter-spacing="-1">{n}</text>')


# A1a / A1b — небезпечний поворот ліворуч / праворуч
for code, k in (("A1a", -1), ("A1b", 1)):
    body, (cx, cy) = triangle(up=True)
    d = f"M{cx - 4 * k},{cy + 20} L{cx - 4 * k},{cy + 2} Q{cx - 4 * k},{cy - 12} {cx + 10 * k},{cy - 16}"
    SIGNS[code] = svg(body + f'<path d="{d}" fill="none" stroke="{BLACK}" stroke-width="7" stroke-linecap="butt"/>', 100, 92)

# A41 — залізничний переїзд зі шлагбаумом (піктограма огорожі)
body, (cx, cy) = triangle(up=True)
SIGNS["A41"] = svg(body + f'<g fill="{BLACK}">'
                          f'<rect x="{cx - 20}" y="{cy - 8}" width="40" height="5"/>'
                          f'<rect x="{cx - 20}" y="{cy + 6}" width="40" height="5"/>'
                          + "".join(f'<rect x="{cx - 19 + i * 9.2:.1f}" y="{cy - 12}" width="3.4" height="30"/>' for i in range(5))
                          + '</g>', 100, 92)

# B15 — пріоритет на найближчому перехресті
body, (cx, cy) = triangle(up=True)
SIGNS["B15"] = svg(body + f'<rect x="{cx - 4.5}" y="{cy - 17}" width="9" height="35" fill="{BLACK}"/>'
                          f'<rect x="{cx - 14}" y="{cy - 4}" width="28" height="3.5" fill="{BLACK}"/>', 100, 92)

# C31a / C31b — поворот ліворуч / праворуч заборонено
SIGNS["C31a"] = svg(disc(WHITE, RED, 11) + turn_arrow("left") + bar_prohibit())
SIGNS["C31b"] = svg(disc(WHITE, RED, 11) + turn_arrow("right") + bar_prohibit())

# C33 — розворот заборонено
SIGNS["C33"] = svg(disc(WHITE, RED, 11) +
                   f'<path d="M58,80 L58,44 Q58,28 46,28 Q34,28 34,44 L34,56" fill="none" stroke="{BLACK}" stroke-width="8"/>'
                   f'<polygon points="23,54 45,54 34,70" fill="{BLACK}"/>' + bar_prohibit())

# C43 з іншими значеннями
for n in (30, 70, 90, 120):
    SIGNS[f"C43-{n}"] = number_disc(n)

# C45 — кінець обмеження швидкості
SIGNS["C45"] = svg(f'<circle cx="50" cy="50" r="48" fill="{WHITE}" stroke="{BLACK}" stroke-width="1.5"/>'
                   f'<text x="50" y="64" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" '
                   f'font-size="40" fill="#8C8C8C" letter-spacing="-1">50</text>'
                   '<defs><clipPath id="c45"><circle cx="50" cy="50" r="46"/></clipPath></defs><g clip-path="url(#c45)">'
                   + "".join(f'<line x1="{8 + d}" y1="{92 + d}" x2="{92 + d}" y2="{8 + d}" stroke="{BLACK}" stroke-width="2.2"/>' for d in (-10, -5, 0, 5, 10))
                   + "</g>")

# E9a — стоянка дозволена
SIGNS["E9a"] = svg(f'<rect x="2" y="2" width="96" height="96" rx="8" fill="{BLUE}" stroke="{WHITE}" stroke-width="2"/>'
                   f'<text x="50" y="76" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="70" fill="{WHITE}">P</text>')


def town(diag=False):
    body = (f'<rect x="2" y="12" width="96" height="46" rx="4" fill="{WHITE}" stroke="{BLACK}" stroke-width="3"/>'
            f'<text x="50" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="15" fill="{BLACK}" textLength="80" lengthAdjust="spacingAndGlyphs">GRIMBERGEN</text>')
    if diag:
        body += f'<line x1="8" y1="54" x2="92" y2="16" stroke="{RED}" stroke-width="5"/>'
    return svg(body, 100, 70)


SIGNS["F1"] = town()
SIGNS["F3"] = town(diag=True)


def zone30(end=False):
    grey = "#8C8C8C"
    ring, num, txt = (grey, grey, grey) if end else (RED, BLACK, BLACK)
    body = (f'<rect x="2" y="2" width="76" height="96" rx="4" fill="{WHITE}" stroke="{BLACK}" stroke-width="2"/>'
            f'<text x="40" y="22" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="15" fill="{txt}">ZONE</text>'
            f'<circle cx="40" cy="60" r="28" fill="{ring}"/><circle cx="40" cy="60" r="21.5" fill="{WHITE}"/>'
            f'<text x="40" y="69" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="25" fill="{num}">30</text>')
    if end:
        body += ('<defs><clipPath id="z"><rect x="4" y="4" width="72" height="92"/></clipPath></defs><g clip-path="url(#z)">'
                 + "".join(f'<line x1="{-6 + d}" y1="{98 + d}" x2="{86 + d}" y2="{2 + d}" stroke="{BLACK}" stroke-width="2.2"/>' for d in (-10, -5, 0, 5, 10))
                 + "</g>")
    return svg(body, 80, 100)


SIGNS["F4a"] = zone30()
SIGNS["F4b"] = zone30(end=True)

# F7 — кінець автомагістралі (F5 з червоною смугою)
SIGNS["F7"] = SIGNS["F5"].replace("</svg>", f'<line x1="10" y1="90" x2="90" y2="10" stroke="{RED}" stroke-width="7"/></svg>')

# F19 — дорога з одностороннім рухом
SIGNS["F19"] = svg(f'<rect x="2" y="2" width="76" height="96" rx="6" fill="{BLUE}" stroke="{WHITE}" stroke-width="2"/>'
                   f'<path d="M40,14 L62,40 L48,40 L48,86 L32,86 L32,40 L18,40 Z" fill="{WHITE}"/>', 80, 100)

# ===== Розширення 2: знаки, підтверджені дослідженням 16.10.2026 =====
def arrow_v(x, y_tip, length, width, head, color, up=True):
    """Вертикальна стрілка: вістря в (x, y_tip)."""
    d = 1 if up else -1
    yb = y_tip + d * head
    ye = y_tip + d * length
    return (f'<polygon points="{x},{y_tip} {x + width * 1.5},{yb} {x + width / 2},{yb} {x + width / 2},{ye} '
            f'{x - width / 2},{ye} {x - width / 2},{yb} {x - width * 1.5},{yb}" fill="{color}"/>')


# B19 — дати дорогу зустрічним: ліворуч товста чорна стрілка вниз, праворуч тонка червона вгору
SIGNS["B19"] = svg(disc(WHITE, RED, 11) + arrow_v(38, 78, 52, 9, 14, BLACK, up=False) + arrow_v(63, 24, 52, 5, 10, RED, up=True))
# B21 — пріоритет над зустрічними: ліворуч тонка червона вниз, праворуч товста біла вгору
SIGNS["B21"] = svg(f'<rect x="2" y="2" width="96" height="96" rx="8" fill="{BLUE}" stroke="{WHITE}" stroke-width="2"/>'
                   f'<rect x="7" y="7" width="86" height="86" rx="5" fill="none" stroke="{WHITE}" stroke-width="2.5"/>'
                   + arrow_v(37, 78, 52, 5, 10, RED, up=False) + arrow_v(62, 22, 54, 9, 14, WHITE, up=True))


def walker(x, y, s=1.0, color=BLACK):
    """Піктограма пішохода (вигляд збоку, крокує праворуч). (x, y) — центр голови."""
    k = s
    return (f'<g fill="none" stroke="{color}" stroke-width="{4.6 * k}" stroke-linecap="round" stroke-linejoin="round">'
            f'<path d="M{x},{y + 6 * k} L{x - 1 * k},{y + 19 * k}"/>'
            f'<path d="M{x - 1 * k},{y + 19 * k} L{x + 6 * k},{y + 27 * k} L{x + 7 * k},{y + 35 * k}"/>'
            f'<path d="M{x - 1 * k},{y + 19 * k} L{x - 6 * k},{y + 27 * k} L{x - 11 * k},{y + 33 * k}"/>'
            f'<path d="M{x},{y + 9 * k} L{x + 7 * k},{y + 15 * k} L{x + 9 * k},{y + 21 * k}"/>'
            f'<path d="M{x},{y + 9 * k} L{x - 6 * k},{y + 15 * k} L{x - 8 * k},{y + 20 * k}"/></g>'
            f'<circle cx="{x + 1 * k}" cy="{y}" r="{4.4 * k}" fill="{color}"/>')


def zebra(x, y, w, n=5, color=BLACK):
    step = w / (n * 2 - 1)
    return "".join(f'<rect x="{x + i * 2 * step:.1f}" y="{y}" width="{step:.1f}" height="3.2" fill="{color}"/>' for i in range(n))


# A21 — пішохідний перехід (попередження)
body, (cx, cy) = triangle(up=True)
SIGNS["A21"] = svg(body + walker(cx - 1, cy - 17, 0.82) + zebra(cx - 18, cy + 15.5, 36), 100, 92)

# A23 — діти
body, (cx, cy) = triangle(up=True)
SIGNS["A23"] = svg(body + walker(cx - 7, cy - 16, 0.78) + walker(cx + 9, cy - 8, 0.56), 100, 92)

# F49 — пішохідний перехід (інформаційний)
SIGNS["F49"] = svg(f'<rect x="2" y="2" width="96" height="96" rx="8" fill="{BLUE}" stroke="{WHITE}" stroke-width="2"/>'
                   f'<polygon points="50,12 90,84 10,84" fill="{WHITE}" stroke="{WHITE}" stroke-width="4" stroke-linejoin="round"/>'
                   + walker(48, 36, 0.86) + zebra(30, 74, 40))

# A43 — залізничний переїзд без шлагбаума (паровоз)
body, (cx, cy) = triangle(up=True)
loco = (f'<g fill="{BLACK}"><rect x="{cx - 20}" y="{cy - 2}" width="26" height="12" rx="2"/>'
        f'<rect x="{cx + 5}" y="{cy - 12}" width="12" height="22" rx="1"/>'
        f'<rect x="{cx + 3}" y="{cy - 14}" width="16" height="3"/>'
        f'<rect x="{cx - 16}" y="{cy - 10}" width="6" height="9"/>'
        f'<rect x="{cx - 22}" y="{cy + 8}" width="4" height="4"/>'
        f'<circle cx="{cx - 12}" cy="{cy + 14}" r="4"/><circle cx="{cx - 3}" cy="{cy + 14}" r="4"/><circle cx="{cx + 11}" cy="{cy + 13}" r="5"/></g>'
        f'<rect x="{cx + 8}" y="{cy - 9}" width="6" height="6" fill="{WHITE}"/>')
SIGNS["A43"] = svg(body + loco, 100, 92)


def st_andrew(double=False):
    def board(angle, y0=50, length=92, w=15):
        return (f'<rect x="{50 - length / 2}" y="{y0 - w / 2}" width="{length}" height="{w}" fill="{WHITE}" stroke="{RED}" stroke-width="3.2" '
                f'transform="rotate({angle} 50 {y0})"/>')
    body = board(35) + board(-35)
    if double:
        body += (f'<rect x="20" y="{86}" width="32" height="13" fill="{WHITE}" stroke="{RED}" stroke-width="3" transform="rotate(35 36 92)"/>'
                 f'<rect x="48" y="{86}" width="32" height="13" fill="{WHITE}" stroke="{RED}" stroke-width="3" transform="rotate(-35 64 92)"/>')
    return svg(f'<g transform="translate(0,{0 if double else 0})">{body}</g>', 100, 110 if double else 100)


SIGNS["A45"] = st_andrew()
SIGNS["A47"] = st_andrew(double=True)

# A15 — слизька дорога
body, (cx, cy) = triangle(up=True)
skid = (f'<g fill="{BLACK}"><path d="M{cx - 12},{cy + 2} Q{cx - 11},{cy - 10} {cx},{cy - 11} Q{cx + 11},{cy - 10} {cx + 12},{cy + 2} L{cx + 13},{cy + 7} L{cx - 13},{cy + 7} Z"/>'
        f'<rect x="{cx - 13}" y="{cy + 6}" width="5" height="5" rx="1"/><rect x="{cx + 8}" y="{cy + 6}" width="5" height="5" rx="1"/></g>'
        f'<path d="M{cx - 6},{cy - 8} L{cx + 6},{cy - 8} L{cx + 8},{cy - 2} L{cx - 8},{cy - 2} Z" fill="{WHITE}"/>'
        f'<g fill="none" stroke="{BLACK}" stroke-width="2.6" stroke-linecap="round">'
        f'<path d="M{cx - 9},{cy + 13} q-4,5 0,9 q4,4 -1,8"/><path d="M{cx + 9},{cy + 13} q4,5 0,9 q-4,4 1,8"/></g>')
SIGNS["A15"] = svg(body + skid, 100, 92)

OUT.mkdir(parents=True, exist_ok=True)
for code, content in SIGNS.items():
    (OUT / f"{code}.svg").write_text(content, encoding="utf-8")
print(f"{len(SIGNS)} знаків → {OUT}")
