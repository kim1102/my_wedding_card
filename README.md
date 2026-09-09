# 모바일 청첩장

정적 HTML/CSS/JS로만 만들어져 있습니다. 서버 프로그램이나 데이터베이스가 필요 없고,
파일 그대로 어떤 호스팅에든 올릴 수 있습니다.

```
wedding-invitation/
├─ index.html
├─ css/style.css
├─ js/config.js      ← 내용은 여기만 고치면 됩니다
├─ js/main.js
├─ images/
│  ├─ main.jpg       ← 맨 위 대표 사진
│  ├─ map.jpg        ← (선택) 약도 이미지. 없으면 지도 앱 버튼만 나옵니다
│  └─ gallery/       ← 갤러리 사진 01.jpg, 02.jpg ...
├─ serve.ps1         ← 로컬 서버 실행
└─ add_photos.py     ← 사진 일괄 리사이즈 + 등록
```

## 1. 사진 넣기

사진이 든 폴더를 통째로 넘기면 크기를 줄여서 자동으로 등록합니다.

```bash
C:\Anaconda3\python.exe C:\projects\wedding-invitation\add_photos.py "C:\Users\zizon\Pictures\웨딩"
```

- 이름순으로 `01.jpg, 02.jpg …` 로 정리되고 **첫 장이 대표 사진**이 됩니다.
- 긴 변 1600px로 줄입니다. 원본 그대로 쓰면 한 장에 5~10MB라 폰에서 느립니다.
- 순서를 바꾸고 싶으면 원본 파일 이름 앞에 `1_`, `2_` … 를 붙이고 다시 돌리세요.

## 2. 내용 고치기

`js/config.js` 하나만 열면 됩니다. 이름, 날짜, 예식장, 인사말, 오시는 길, 계좌번호가
전부 그 안에 있습니다. 저장하고 브라우저 새로고침하면 바로 반영됩니다.

`options` 에서 D-day, 달력, 계좌 섹션을 각각 끌 수 있습니다.

## 3. 로컬에서 확인하기

```bash
powershell -ExecutionPolicy Bypass -File C:\projects\wedding-invitation\serve.ps1
```

- 이 PC: <http://localhost:8080>
- 같은 Wi-Fi의 폰: `http://192.168.50.116:8080`

폰에서 안 열리면 방화벽에서 포트를 열어야 합니다 (관리자 PowerShell):

```bash
New-NetFirewallRule -DisplayName "Wedding 8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

## 4. 배포하기

정적 파일이라 아래 어디든 폴더째 올리면 끝입니다. 전부 무료이고 HTTPS가 자동으로 붙습니다.

| | 방법 | 비고 |
|---|---|---|
| Cloudflare Pages | 폴더를 드래그 앤 드롭 | 가장 간단, 계정만 필요 |
| Netlify Drop | <https://app.netlify.com/drop> 에 폴더 드롭 | 로그인 없이도 시험 가능 |
| GitHub Pages | 리포지토리에 push | 주소가 안 바뀜 |
| Vercel | 폴더 업로드 | |

배포 후 `js/config.js` 의 `share.url` 에 실제 주소를 적어주세요. 카카오톡으로 공유할 때
쓰입니다.

### 주의: 공유 미리보기 이미지

`index.html` 의 `og:image` 는 상대경로라 카카오톡 미리보기에서 안 뜰 수 있습니다.
배포 주소가 정해지면 절대경로로 바꾸세요.

```html
<meta property="og:image" content="https://내주소/images/main.jpg">
```

## 5. 약도 이미지 (선택)

예식장에서 받은 약도 이미지를 `images/map.jpg` 로 저장하면 지도 자리에 표시됩니다.
없으면 카카오맵 / 네이버지도 버튼만 나옵니다 (이것만으로도 충분히 동작합니다).
