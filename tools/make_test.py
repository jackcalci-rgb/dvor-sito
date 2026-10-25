#!/usr/bin/env python3
"""Crea la versione di PROVA del sito: non indicizzabile e con indirizzi del dominio di test.
Uso:  python3 tools/make_test.py site build   [http://profumidistria.com/]"""
import sys, shutil, glob, os
src, dst = sys.argv[1], sys.argv[2]
base = sys.argv[3] if len(sys.argv) > 3 else 'http://profumidistria.com/'
shutil.rmtree(dst, ignore_errors=True)
shutil.copytree(src, dst)
for f in glob.glob(os.path.join(dst, '*.html')):
    s = open(f, encoding='utf-8').read()
    s = s.replace('https://www.osteriadvor.com/', base)
    s = s.replace('content="index,follow,max-image-preview:large"', 'content="noindex,nofollow"')
    open(f, 'w', encoding='utf-8').write(s)
ga = os.path.join(dst, 'analytics.js')
if os.path.exists(ga):
    t = open(ga, encoding='utf-8').read()
    import re
    open(ga, 'w', encoding='utf-8').write(re.sub(r"GA_ID = '[^']*'", "GA_ID = ''", t))
open(os.path.join(dst, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
sm = os.path.join(dst, 'sitemap.xml')
if os.path.exists(sm): os.remove(sm)
print('Versione di prova creata in', dst, 'con base', base)
