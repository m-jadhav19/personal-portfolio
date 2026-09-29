#!/usr/bin/env python3
"""Generate 8-bit PNG sprite assets for destroy mode (no Pillow required)."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "destroy" / "sprites"


def write_png(path: Path, width: int, height: int, rgba: bytes) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(rgba[y * stride : (y + 1) * stride])

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    data = b"\x89PNG\r\n\x1a\n"
    data += chunk(b"IHDR", ihdr)
    data += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    data += chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def hex_to_rgba(c: str) -> tuple[int, int, int, int]:
    if c in (".", " ", None):
        return (0, 0, 0, 0)
    c = c.lstrip("#")
    if len(c) == 6:
        r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
        return (r, g, b, 255)
    if len(c) == 8:
        r, g, b, a = (
            int(c[0:2], 16),
            int(c[2:4], 16),
            int(c[4:6], 16),
            int(c[6:8], 16),
        )
        return (r, g, b, a)
    raise ValueError(c)


def paint(rows: list[str], palette: dict[str, str], scale: int = 1) -> tuple[int, int, bytes]:
    h = len(rows)
    w = max(len(r) for r in rows)
    out_w, out_h = w * scale, h * scale
    buf = bytearray(out_w * out_h * 4)
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            rgba = hex_to_rgba(palette.get(ch, "."))
            for dy in range(scale):
                for dx in range(scale):
                    px = x * scale + dx
                    py = y * scale + dy
                    i = (py * out_w + px) * 4
                    buf[i : i + 4] = bytes(rgba)
    return out_w, out_h, bytes(buf)


CHAR_PAL = {
    ".": ".",
    "o": "#e85d04",  # orange body
    "d": "#9a3412",  # dark orange
    "s": "#fdba74",  # skin
    "b": "#431407",  # boots
    "g": "#38bdf8",  # gun
    "w": "#e0f2fe",  # gun tip
    "e": "#111111",  # eye
    "h": "#fff7ed",  # eye highlight
}

CHAR_IDLE = [
    "....oooo....",
    "...osssso...",
    "...osehso...",
    "...osssso...",
    "..odoooooo..",
    "..oooooooo..",
    "..ooo..ooo..",
    "..ooo..ooo..",
    "..dd....dd..",
    "..bb....bb..",
]

CHAR_WALK_A = [
    "....oooo....",
    "...osssso...",
    "...osehso...",
    "...osssso...",
    "..odoooooo..",
    "..oooooooo..",
    "..ooo..ooo..",
    ".ddo....odd.",
    "bb......bb..",
    "............",
]

CHAR_WALK_B = [
    "....oooo....",
    "...osssso...",
    "...osehso...",
    "...osssso...",
    "..odoooooo..",
    "..oooooooo..",
    "..ooo..ooo..",
    ".odd....ddo.",
    "..bb......bb",
    "............",
]

GUN = [
    "gggggggw",
    "gggggggw",
    "..d.....",
]

BLASTER = [
    "yyWW",
    "yWWW",
]

MISSILE = [
    "..rr..",
    ".rrrr.",
    ".ssss.",
    ".ssss.",
    ".ssss.",
    "ff..ff",
]

BOMB = [
    "..yy..",
    "...g..",
    ".kkkk.",
    "kkkkkk",
    "kkkkkk",
    ".kkkk.",
]

ROACH = [
    ".bbbb.",
    "bbhbbb",
    ".bbbb.",
    "l.l.l.",
]

EXPLOSION = [
    "...yy...",
    ".yyrryy.",
    "yrrWWrry",
    "yrWWWWry",
    "yrrWWrry",
    ".yyrryy.",
    "...yy...",
]


def save(name: str, rows: list[str], palette: dict[str, str], scale: int = 4) -> None:
    w, h, rgba = paint(rows, palette, scale=scale)
    write_png(OUT / f"{name}.png", w, h, rgba)
    print(f"wrote {OUT / name}.png ({w}x{h})")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    save("character-idle", CHAR_IDLE, CHAR_PAL, 4)
    save("character-walk-a", CHAR_WALK_A, CHAR_PAL, 4)
    save("character-walk-b", CHAR_WALK_B, CHAR_PAL, 4)
    save("gun", GUN, CHAR_PAL, 4)

    weapon_pal = {
        ".": ".",
        "y": "#fde047",
        "W": "#ffffff",
        "r": "#ef4444",
        "s": "#64748b",
        "f": "#f97316",
        "k": "#1e293b",
        "g": "#a3a3a3",
        "b": "#78350f",
        "h": "#451a03",
        "l": "#451a03",
    }
    save("blaster-bolt", BLASTER, weapon_pal, 4)
    save("missile", MISSILE, weapon_pal, 4)
    save("bomb", BOMB, weapon_pal, 4)
    save("roach", ROACH, weapon_pal, 4)
    save("explosion", EXPLOSION, weapon_pal, 4)

    # Weapon HUD icons (same art, larger scale)
    save("icon-blaster", BLASTER, weapon_pal, 6)
    save("icon-missile", MISSILE, weapon_pal, 5)
    save("icon-bomb", BOMB, weapon_pal, 5)
    save("icon-roach", ROACH, weapon_pal, 6)


if __name__ == "__main__":
    main()
