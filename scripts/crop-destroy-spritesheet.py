#!/usr/bin/env python3
"""Crop DESTROY sheet-source.png into named transparent PNGs.

Usage:
  python3 scripts/crop-destroy-spritesheet.py \
    [--src public/destroy/sprites/sheet-source.png] \
    [--out public/destroy/sprites]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


def equal_cells(x0: int, x1: int, n: int) -> list[tuple[int, int]]:
    span = x1 - x0 + 1
    w = span / n
    return [
        (int(round(x0 + i * w)), int(round(x0 + (i + 1) * w)) - 1)
        for i in range(n)
    ]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--src",
        type=Path,
        default=Path("public/destroy/sprites/sheet-source.png"),
    )
    ap.add_argument("--out", type=Path, default=Path("public/destroy/sprites"))
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    img = Image.open(args.src).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.float32)
    a = arr[:, :, 3].astype(np.float32)
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    sat = mx - mn
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    is_bg = (a < 18) | ((lum < 20) & (sat < 12))
    soft = (~is_bg) & (lum < 32) & (sat < 16)
    alpha = np.where(
        is_bg, 0, np.where(soft, np.clip(a * (lum / 32.0), 0, 255), a)
    ).astype(np.uint8)
    keyed = arr.copy()
    keyed[:, :, 3] = alpha

    def crop_box(x0, y0, x1, y1, dark_mode=False):
        x0, y0 = max(0, x0), max(0, y0)
        x1, y1 = min(w - 1, x1), min(h - 1, y1)
        tile = keyed[y0 : y1 + 1, x0 : x1 + 1].copy()
        if not dark_mode:
            lum2 = (
                0.299 * tile[:, :, 0]
                + 0.587 * tile[:, :, 1]
                + 0.114 * tile[:, :, 2]
            )
            sat2 = tile[:, :, :3].max(axis=2) - tile[:, :, :3].min(axis=2)
            tile[(lum2 < 16) & (sat2 < 10), 3] = 0
        m = tile[:, :, 3] > (15 if dark_mode else 25)
        if not m.any():
            return None
        ys, xs = np.where(m)
        return Image.fromarray(
            tile[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1], "RGBA"
        )

    def resize_max(im, max_h=None, max_w=None):
        iw, ih = im.size
        scale = 1.0
        if max_h and ih > max_h:
            scale = min(scale, max_h / ih)
        if max_w and iw > max_w:
            scale = min(scale, max_w / iw)
        if scale < 1:
            im = im.resize(
                (max(1, int(round(iw * scale))), max(1, int(round(ih * scale)))),
                Image.NEAREST,
            )
        return im

    def export_cells(name, y0, y1, cells, max_h=None, max_w=None, dark_mode=False):
        frames = []
        for cx0, cx1 in cells:
            im = crop_box(cx0, y0, cx1, y1, dark_mode=dark_mode)
            if im is None:
                continue
            im = resize_max(im, max_h, max_w)
            frames.append(im)
        for i, im in enumerate(frames):
            im.save(args.out / f"{name}-{i + 1}.png")
        if frames:
            frames[0].save(args.out / f"{name}.png")
        print(f"{name}: {len(frames)}")
        return len(frames)

    manifest: dict[str, int] = {}
    manifest["character-idle"] = export_cells(
        "character-idle",
        45,
        168,
        [
            (34, 139),
            (149, 250),
            (261, 365),
            (379, 482),
            (494, 595),
            (605, 708),
            (720, 821),
        ],
        max_h=56,
    )
    walk_n = export_cells(
        "character-walk",
        220,
        360,
        [
            (25, 146),
            (168, 283),
            (300, 415),
            (433, 548),
            (568, 683),
            (702, 822),
        ],
        max_h=56,
    )
    manifest["character-walk"] = walk_n
    # Compat aliases used by older atlas keys
    p1 = args.out / "character-walk-1.png"
    p3 = args.out / "character-walk-3.png"
    if p1.exists():
        Image.open(p1).save(args.out / "character-walk-a.png")
    if p3.exists():
        Image.open(p3).save(args.out / "character-walk-b.png")

    manifest["gun"] = export_cells(
        "gun",
        44,
        90,
        [
            (865, 945),
            (980, 1055),
            (1088, 1170),
            (1195, 1281),
            (1307, 1390),
            (1414, 1500),
        ],
        max_h=18,
        max_w=42,
    )
    manifest["blaster-bolt"] = export_cells(
        "blaster-bolt",
        125,
        170,
        [
            (856, 942),
            (970, 1053),
            (1080, 1159),
            (1187, 1273),
            (1301, 1387),
            (1419, 1493),
        ],
        max_h=12,
        max_w=36,
    )
    manifest["rocket"] = export_cells(
        "rocket", 198, 262, equal_cells(860, 1515, 6), max_h=26, max_w=48
    )
    manifest["vortex"] = export_cells(
        "vortex", 305, 375, equal_cells(850, 1510, 6), max_h=36, max_w=36
    )
    manifest["explosion"] = export_cells(
        "explosion", 420, 500, equal_cells(850, 1500, 6), max_h=40, max_w=48
    )
    manifest["enemy-roach"] = export_cells(
        "enemy-roach", 544, 608, equal_cells(20, 530, 6), max_h=22, max_w=30
    )
    manifest["enemy-drone"] = export_cells(
        "enemy-drone",
        544,
        608,
        equal_cells(680, 1000, 6),
        max_h=22,
        max_w=30,
        dark_mode=True,
    )
    manifest["enemy-slime"] = export_cells(
        "enemy-slime", 544, 608, equal_cells(1040, 1520, 6), max_h=22, max_w=30
    )
    manifest["pickup-health"] = export_cells(
        "pickup-health", 660, 738, equal_cells(20, 505, 7), max_h=26, max_w=26
    )
    manifest["pickup-shield"] = export_cells(
        "pickup-shield", 660, 738, equal_cells(540, 980, 6), max_h=26, max_w=26
    )
    manifest["pickup-rapid"] = export_cells(
        "pickup-rapid", 660, 738, equal_cells(1020, 1520, 6), max_h=26, max_w=26
    )
    manifest["env-crate"] = export_cells(
        "env-crate", 800, 857, equal_cells(15, 450, 6), max_h=28, max_w=32
    )
    manifest["env-barrel"] = export_cells(
        "env-barrel", 800, 857, equal_cells(470, 800, 5), max_h=28, max_w=32
    )
    manifest["env-bush"] = export_cells(
        "env-bush", 800, 857, equal_cells(810, 1180, 6), max_h=28, max_w=32
    )
    manifest["env-rock"] = export_cells(
        "env-rock", 800, 857, equal_cells(1190, 1510, 6), max_h=28, max_w=32
    )
    manifest["hole-a"] = export_cells(
        "hole-a", 930, 997, equal_cells(20, 390, 6), max_h=22, max_w=26
    )
    manifest["hole-b"] = export_cells(
        "hole-b", 930, 997, equal_cells(410, 740, 6), max_h=22, max_w=26
    )
    manifest["hole-c"] = export_cells(
        "hole-c", 930, 997, equal_cells(760, 1120, 6), max_h=22, max_w=26
    )
    manifest["crack"] = export_cells(
        "crack",
        930,
        997,
        equal_cells(1140, 1510, 6),
        max_h=22,
        max_w=26,
        dark_mode=True,
    )

    for src, dst in [
        ("gun", "icon-blaster"),
        ("rocket", "icon-rocket"),
        ("vortex", "icon-vortex"),
        ("blaster-bolt", "icon-zap"),
    ]:
        p = args.out / f"{src}.png"
        if p.exists():
            Image.open(p).save(args.out / f"{dst}.png")

    (args.out / "sheet-crop-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n"
    )
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
