"""Спільні помічники для скриптів наповнення бази (scripts/content/*.py)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WC = "https://www.wegcode.be/nl/regelgeving/1975120109~hra8v386pu"
L = ("uk", "nl", "fr", "en")
F = ["federal"]
YES = ("Так", "Ja", "Oui", "Yes")
NO = ("Ні", "Nee", "Non", "No")


def T(t):
    assert len(t) == 4, t
    return dict(zip(L, t))


def km(n):
    return (f"{n} км/год", f"{n} km/u", f"{n} km/h", f"{n} km/h")


def m(n):
    return (f"{n} м", f"{n} m", f"{n} m", f"{n} m")


def Q(id, topic, deg, speed, region, q, opts, ans, expl, art, image=None, typ=None,
      valid_until=None, tags=(), src_title=None, src_url=None, difficulty=2):
    """opts: список кортежів з 4 мов або (кортеж, "assets/…svg") для варіанта-картинки."""
    options = []
    for i, o in enumerate(opts):
        oimg = None
        if isinstance(o, tuple) and len(o) == 2 and isinstance(o[1], str) and o[1].startswith("assets/"):
            o, oimg = o
        d = {"id": "abcd"[i], "text": T(o)}
        if oimg:
            d["image"] = oimg
        options.append(d)
    q = {
        "id": id, "topic_id": topic,
        "type": typ or ("sign" if image and "/signs/" in image else "image_scenario" if image else "text"),
        "difficulty": difficulty, "region": region, "degree": deg, "is_speed": speed,
        "question": T(q), "options": options, "correct_option_id": ans, "explanation": T(expl),
        "source": {"title": src_title or f"Wegcode art. {art}", "url": src_url or WC,
                   "checked_at": "2026-10-16", "review_status": "verified"},
        "tags": list(tags), "status": "published",
    }
    if image:
        q["image"] = image
    if valid_until:
        q["valid_until"] = valid_until
    return q


WHAT_SIGN = ("Що означає цей знак?", "Wat betekent dit bord?", "Que signifie ce panneau ?", "What does this sign mean?")


def SQ(id, code, right, wrong, expl, art, deg=1, speed=False, topic="road_signs", region=F):
    """Питання «Що означає цей знак?» з картинкою знака."""
    return Q(id, topic, deg, speed, region, WHAT_SIGN, [right] + list(wrong), "a", expl, art,
             image=f"assets/signs/{code}.svg", tags=[code])


def S(code):
    return f"assets/signs/{code}.svg"


def load(name):
    return json.loads((ROOT / "data" / name).read_text())


def save(name, data):
    (ROOT / "data" / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def add_questions(new):
    qs = load("questions.json")
    ids = {q["id"] for q in qs}
    for n in new:
        assert n["id"] not in ids, f"дубль id {n['id']}"
        ids.add(n["id"])
    qs += new
    save("questions.json", qs)
    return len(qs)
