# =========================================================
#  사진 넣기 도우미
#
#  사용법:
#    C:\Anaconda3\python.exe add_photos.py "C:\Users\zizon\OneDrive\문서\marry"
#
#  하는 일:
#   1) 폴더 안의 사진을 긴 변 1600px로 줄이고 (폰에서 빨리 뜨게)
#   2) **원래 파일 이름 그대로** images/gallery/ 에 저장
#      → 나중에 "gal6 을 흑백으로" 처럼 이름으로 지시할 수 있습니다
#   3) map.jpg 는 약도로 보고 images/map.jpg 에 따로 저장
#   4) js/config.js 의 monochrome 목록에 있는 사진은 흑백으로 변환
#   5) js/config.js 의 gallery 목록을 갱신
#      (대문 사진 mainPhoto 는 맨 위에 크게 나오므로 격자에서는 뺍니다)
# =========================================================
import os, re, sys, glob
from PIL import Image, ImageOps

MAXSIDE = 1600
MAP_NAME = 'map.jpg'
EXTS = ('.jpg', '.jpeg', '.png', '.webp', '.heic', '.bmp', '.tif', '.tiff')

here = os.path.dirname(os.path.abspath(__file__))
cfg_path = os.path.join(here, 'js', 'config.js')


def natural_key(p):
    return [int(t) if t.isdigit() else t.lower()
            for t in re.split(r'(\d+)', os.path.basename(p))]


def read_cfg():
    with open(cfg_path, encoding='utf-8') as f:
        return f.read()


def cfg_list(src, key):
    """config.js 의 `key: [ "a", "b" ]` 를 파이썬 리스트로."""
    m = re.search(key + r':\s*\[(.*?)\]', src, re.S)
    return re.findall(r'"([^"]+)"', m.group(1)) if m else []


def cfg_str(src, key):
    m = re.search(key + r':\s*"([^"]*)"', src)
    return m.group(1) if m else ''


def save(img, path, gray=False):
    img = ImageOps.exif_transpose(img)          # 폰 사진 회전 정보 반영
    if gray:
        img = ImageOps.grayscale(img).convert('RGB')
    elif img.mode not in ('RGB', 'L'):
        img = img.convert('RGB')
    w, h = img.size
    if max(w, h) > MAXSIDE:
        s = MAXSIDE / max(w, h)
        img = img.resize((round(w * s), round(h * s)), Image.LANCZOS)
    img.save(path, 'JPEG', quality=86, optimize=True, progressive=True)
    return os.path.getsize(path)


def update_gallery(names):
    src = read_cfg()
    block = 'gallery: [\n    ' + ',\n    '.join('"%s"' % n for n in names) + ',\n  ],'
    new, n = re.subn(r'gallery: \[.*?\],', block, src, count=1, flags=re.S)
    if not n:
        print('  [주의] config.js 에서 gallery 목록을 찾지 못했습니다. 직접 넣어주세요:')
        print(block)
        return
    with open(cfg_path, 'w', encoding='utf-8') as f:
        f.write(new)
    print('  js/config.js 의 gallery 목록을 갱신했습니다.')


def main():
    if len(sys.argv) < 2:
        print('사용법: python add_photos.py "<사진이 든 폴더>"')
        return 1

    src_dir = sys.argv[1]
    if not os.path.isdir(src_dir):
        print('폴더를 찾을 수 없습니다: ' + src_dir)
        return 1

    files = [p for p in glob.glob(os.path.join(src_dir, '*'))
             if p.lower().endswith(EXTS)]
    files.sort(key=natural_key)
    if not files:
        print('폴더에 사진이 없습니다: ' + src_dir)
        return 1

    cfg = read_cfg()
    mono = set(n.lower() for n in cfg_list(cfg, 'monochrome'))
    hero = os.path.basename(cfg_str(cfg, 'mainPhoto')).lower()

    out = os.path.join(here, 'images', 'gallery')
    os.makedirs(out, exist_ok=True)
    for old in glob.glob(os.path.join(out, '*')):
        os.remove(old)

    names, total = [], 0
    print('사진 %d장을 처리합니다.' % len(files))

    for p in files:
        base = os.path.basename(p)
        stem = os.path.splitext(base)[0]
        name = stem + '.jpg'
        is_map = base.lower() == MAP_NAME
        gray = name.lower() in mono

        dest = (os.path.join(here, 'images', MAP_NAME) if is_map
                else os.path.join(out, name))
        try:
            with Image.open(p) as im:
                size = save(im.copy(), dest, gray=gray)
        except Exception as e:
            print('  건너뜀 %s (%s)' % (base, e))
            continue

        total += size
        tag = ' [약도]' if is_map else (' [흑백]' if gray else '')
        print('  %-12s %6.0f KB%s' % (name, size / 1024, tag))
        if not is_map:
            names.append(name)

    # 대문 사진은 맨 위에 크게 나오므로 아래 격자에서는 뺀다
    grid = [n for n in names if n.lower() != hero]
    dropped = len(names) - len(grid)

    print('갤러리 %d장, 합계 %.1f MB' % (len(grid), total / 1048576))
    if dropped:
        print('  (대문 사진 %s 는 격자에서 제외)' % hero)
    update_gallery(grid)
    print('완료. 브라우저에서 새로고침하세요.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
