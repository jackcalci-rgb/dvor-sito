#!/usr/bin/env python3
"""Ritaglia foto di bottiglie su sfondo chiaro e uniforme -> PNG trasparente, altezza 420 px.
Uso: python3 tools/bottle_cutout.py cartella_foto cartella_output
Il nome del file in uscita e' vino-<nome-originale>.png (poi si collega al vino in tools/vini2.py).
Funziona con sfondo bianco/grigio chiaro uniforme; con sfondi complessi serve un ritaglio manuale.
Non inventa nulla: se il bordo e' confuso il risultato va controllato a occhio al 100%."""
import sys, os
from PIL import Image, ImageFilter
from collections import deque

H = 420
TOL = 28  # tolleranza colore rispetto all'angolo (sfondo)

def cutout(path):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    px = im.load()
    bg = px[2, 2][:3]
    def near(c): return sum(abs(c[i] - bg[i]) for i in range(3)) <= TOL * 3 // 2 + TOL
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]: continue
        if not near(px[x, y][:3]): continue
        seen[y * w + x] = 1
        px[x, y] = (0, 0, 0, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    a = im.getchannel('A').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    im.putalpha(a)
    bb = im.getbbox()
    im = im.crop(bb)
    return im.resize((max(1, round(im.width * H / im.height)), H), Image.LANCZOS)

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            out = os.path.join(dst, 'vino-' + os.path.splitext(f)[0] + '.png')
            cutout(os.path.join(src, f)).save(out, optimize=True)
            print('ok', out)
