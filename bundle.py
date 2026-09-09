# =========================================================
#  단일 HTML 파일로 묶기 (Claude Artifact 게시용)
#
#    C:\Anaconda3\python.exe bundle.py [출력경로]
#
#  css/js 를 인라인으로 넣고, images/ 안의 사진을 data: URI 로 심어서
#  파일 하나만으로 완전히 동작하는 청첩장을 만듭니다.
#  (원래의 여러 파일 구조는 그대로 두고 사본만 만듭니다)
# =========================================================
import base64
import json
import mimetypes
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
TITLE = '우리 결혼합니다'


def read(*parts):
    with open(os.path.join(HERE, *parts), encoding='utf-8') as f:
        return f.read()


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    with open(path, 'rb') as f:
        return 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode('ascii'))


def collect_assets():
    """청첩장이 참조하는 사진·음원만 골라 data: URI 로 바꾼다."""
    table, missing = {}, []
    cfg = read('js', 'config.js')

    optional, wanted = set(), []

    # 약도 이미지 (비어 있으면 index.html 의 SVG 약도를 쓴다)
    m = re.search(r'mapImage: "([^"]*)"', cfg)
    if m and m.group(1):
        wanted.append(m.group(1))
        optional.add(m.group(1))

    # 대문 사진 / 중간 사진 (config 에 적힌 경로 그대로)
    for key in ('mainPhoto', 'interludePhoto'):
        m = re.search(key + r': "([^"]*)"', cfg)
        if m and m.group(1):
            wanted.append(m.group(1))

    # 갤러리
    m = re.search(r'gallery: \[(.*?)\]', cfg, re.S)
    if m:
        wanted += ['images/gallery/' + n for n in re.findall(r'"([^"]+)"', m.group(1))]

    # 배경음악 (music: { file: "..." })
    m = re.search(r'music: \{.*?file: "([^"]*)"', cfg, re.S)
    if m and m.group(1):
        wanted.append(m.group(1))
        optional.add(m.group(1))           # 없으면 버튼이 알아서 사라진다

    wanted = list(dict.fromkeys(wanted))   # 같은 사진을 두 번 넣지 않는다

    for rel in wanted:
        full = os.path.join(HERE, rel.replace('/', os.sep))
        if os.path.exists(full):
            table[rel] = data_uri(full)
        elif rel not in optional:
            missing.append(rel)
    return table, missing


def body_of(html):
    m = re.search(r'<body[^>]*>(.*)</body>', html, re.S)
    if not m:
        raise SystemExit('index.html 에서 <body> 를 찾지 못했습니다.')
    body = m.group(1)
    # 외부 파일 참조는 인라인으로 대체되므로 제거
    body = re.sub(r'\s*<script src="[^"]+"></script>', '', body)
    # 단일 파일에는 매니페스트 파일이 없으므로 링크를 뺀다
    body = re.sub(r'\s*<link rel="manifest"[^>]*>', '', body)
    return body.strip()


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'dist', 'invitation.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)

    assets, missing = collect_assets()
    if missing:
        print('  [주의] 없는 사진 (건너뜀):')
        for p in missing:
            print('    - ' + p)

    parts = [
        '<title>%s</title>' % TITLE,
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        'family=Gowun+Batang:wght@400;700&'
        'family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap">',
        '<style>\n%s\n</style>' % read('css', 'style.css'),
        body_of(read('index.html')),
        '<script>window.__ASSET = %s;</script>' % json.dumps(assets, ensure_ascii=False),
        '<script>\n%s\n</script>' % read('js', 'config.js'),
        '<script>\n%s\n</script>' % read('js', 'main.js'),
    ]

    html = '\n\n'.join(parts) + '\n'
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html)

    embedded = sum(len(v) for v in assets.values())
    print('  자산 %d개 내장 (%.1f MB)' % (len(assets), embedded / 1048576))
    print('  -> %s  (%.1f MB)' % (out, os.path.getsize(out) / 1048576))
    if os.path.getsize(out) > 15 * 1048576:
        print('  [경고] 16MB 한도에 가깝습니다. 사진 해상도를 줄이세요.')


if __name__ == '__main__':
    main()
