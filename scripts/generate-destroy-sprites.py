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
        return (
            int(c[0:2], 16),
            int(c[2:4], 16),
            int(c[4:6], 16),
            int(c[6:8], 16),
        )
    raise ValueError(c)


def paint(rows: list[str], palette: dict[str, str], scale: int = 1) -> tuple[int, int, bytes]:
    h = len(rows)
    w = max(len(r) for r in rows)
    out_w, out_h = w * scale, h * scale
    buf = bytearray(out_w * out_h * 4)
    for y, row in enumerate(rows):
        for x, ch in enumerate(row.ljust(w, ".")):
            rgba = hex_to_rgba(palette.get(ch, "."))
            for dy in range(scale):
                for dx in range(scale):
                    px = x * scale + dx
                    py = y * scale + dy
                    i = (py * out_w + px) * 4
                    buf[i : i + 4] = bytes(rgba)
    return out_w, out_h, bytes(buf)


def save(name: str, rows: list[str], palette: dict[str, str], scale: int = 4) -> None:
    w, h, rgba = paint(rows, palette, scale=scale)
    write_png(OUT / f"{name}.png", w, h, rgba)
    print(f"wrote {OUT / name}.png ({w}x{h})")


CHAR_PAL = {
    ".": ".",
    "o": "#f97316",  # bright orange body
    "d": "#c2410c",  # mid orange
    "D": "#7c2d12",  # deep shade
    "s": "#fed7aa",  # skin
    "S": "#fdba74",  # skin shade
    "b": "#292524",  # boots
    "B": "#1c1917",
    "g": "#38bdf8",  # gun
    "G": "#0ea5e9",
    "w": "#f0f9ff",  # muzzle / white
    "e": "#0c0a09",  # eye
    "h": "#fff7ed",
    "v": "#ea580c",  # visor stripe
    "n": "#44403c",  # belt
}

# More readable mercenary — 16 wide
CHAR_IDLE = [
    ".....oooooo.....",
    "....osssssso....",
    "....osSehSso....",
    "....osssssso....",
    "....DovvvvoD....",
    "...odooooooood..",
    "...odooooooood..",
    "...odo.nn.odod..",
    "...odo....odod..",
    "...Ddo....odD...",
    "...bb......bb...",
    "...BB......BB...",
]

CHAR_WALK_A = [
    ".....oooooo.....",
    "....osssssso....",
    "....osSehSso....",
    "....osssssso....",
    "....DovvvvoD....",
    "...odooooooood..",
    "...odooooooood..",
    "...odo.nn.odod..",
    "..Dodo....odod..",
    ".bbdo......dD...",
    "BB.........bb...",
    "...........BB...",
]

CHAR_WALK_B = [
    ".....oooooo.....",
    "....osssssso....",
    "....osSehSso....",
    "....osssssso....",
    "....DovvvvoD....",
    "...odooooooood..",
    "...odooooooood..",
    "...odo.nn.odod..",
    "...odo....odoD..",
    "...Dd......odbB.",
    "...bb.........BB",
    "...BB...........",
]

GUN = [
    "..GGGGGGGw",
    ".Ggggggggw",
    ".Ggggggggw",
    "..D.n.....",
    "...n......",
]

BLASTER_BOLT = [
    ".yyWW.",
    "yWWWWy",
    ".yWWy.",
]

ROCKET = [
    "...rr...",
    "..rrrr..",
    ".rssssr.",
    ".rswwsr.",
    ".rssssr.",
    "..sffs..",
    "..ffff..",
    ".f.yy.f.",
]

VORTEX = [
    "....pp....",
    "..ppCCpp..",
    ".pCccccCp.",
    ".pCcwwcCp.",
    ".pCccccCp.",
    "..ppCCpp..",
    "....pp....",
]

EXPLOSION = [
    "....yy....",
    "..yyrrryy.",
    ".yrrWWrry.",
    "yrrWWWWrry",
    "yrWWWWWWry",
    "yrrWWWWrry",
    ".yrrWWrry.",
    "..yyrrryy.",
    "....yy....",
]

# Distinct HUD gun silhouettes (read clearly at small size)
ICON_BLASTER = [
    "..............",
    "....kkkkkkk...",
    "...kgggggggw..",
    "..kGgggggggwW.",
    "..kGgggyykk...",
    "...knn.kk.....",
    "....nn........",
    "..............",
]

ICON_ROCKET = [
    "..............",
    ".....rrr......",
    "....rsssr.....",
    "...rsssssr....",
    "..kkssssssk...",
    "..kksswwssk...",
    "...ksssssk....",
    "....kfffk.....",
    "....f.y.f.....",
    "..............",
]

ICON_VORTEX = [
    "..............",
    "....pppppp....",
    "...pCCccCCp...",
    "..pCc....cCp..",
    "..pC..ww..Cp..",
    "..pCc....cCp..",
    "...pCCccCCp...",
    "....ppyypp....",
    "..............",
]

ICON_ZAP = [
    "..............",
    "....yyyy......",
    "...yWWWWy.....",
    "..kk.yy.kk....",
    ".kgggggggk....",
    ".kGggggggW....",
    "..knn..nn.....",
    "...yy.y.......",
    "....y.........",
    "..............",
]

# Jagged paper / glass bullet holes (black core + cracked rim)
HOLE_PAL = {
    ".": ".",
    "k": "#0a0a0a",
    "K": "#171717",
    "g": "#3f3f46",
    "w": "#a1a1aa80",
    "c": "#52525b",
}

HOLE_A = [
    "..cgkc..",
    ".cKkkKc.",
    "cgkkkkKc",
    "cKkkkkkK",
    ".kkkkkk.",
    "cKkkkkKc",
    ".cKkkKc.",
    "..cgkc..",
]

HOLE_B = [
    "...ck...",
    ".cgkkKc.",
    "cKkkkkk.",
    ".kkkkkkc",
    "cKkkkkkK",
    ".gkkkkc.",
    "..ckKc..",
    "....c...",
]

HOLE_C = [
    "..c..c..",
    ".cKkkKc.",
    "cKkkkkkK",
    ".kkkkkk.",
    "cKkwkkKc",
    ".cKkkKc.",
    "..c..c..",
]

CRACK = [
    "....c...",
    "...cK...",
    "..c.....",
    ".c......",
    "cKc.....",
    ".c......",
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    save("character-idle", CHAR_IDLE, CHAR_PAL, 3)
    save("character-walk-a", CHAR_WALK_A, CHAR_PAL, 3)
    save("character-walk-b", CHAR_WALK_B, CHAR_PAL, 3)
    save("gun", GUN, CHAR_PAL, 3)

    weapon_pal = {
        ".": ".",
        "y": "#facc15",
        "W": "#ffffff",
        "w": "#e0f2fe",
        "r": "#ef4444",
        "s": "#94a3b8",
        "f": "#f97316",
        "k": "#1e293b",
        "K": "#0f172a",
        "n": "#a3a3a3",
        "G": "#0ea5e9",
        "g": "#38bdf8",
        "D": "#7c2d12",
        "p": "#a855f7",
        "C": "#7c3aed",
        "c": "#c084fc",
    }
    save("blaster-bolt", BLASTER_BOLT, weapon_pal, 3)
    save("rocket", ROCKET, weapon_pal, 3)
    save("vortex", VORTEX, weapon_pal, 3)
    save("explosion", EXPLOSION, weapon_pal, 3)

    save("hole-a", HOLE_A, HOLE_PAL, 3)
    save("hole-b", HOLE_B, HOLE_PAL, 3)
    save("hole-c", HOLE_C, HOLE_PAL, 3)
    save("crack", CRACK, HOLE_PAL, 3)

    # HUD icons — larger gun silhouettes
    save("icon-blaster", ICON_BLASTER, weapon_pal, 3)
    save("icon-rocket", ICON_ROCKET, weapon_pal, 3)
    save("icon-vortex", ICON_VORTEX, weapon_pal, 3)
    save("icon-zap", ICON_ZAP, weapon_pal, 3)


if __name__ == "__main__":
    main()
