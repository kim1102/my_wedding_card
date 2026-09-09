/* ============================================================
   청첩장 내용 설정 파일
   여기 있는 값만 고치면 청첩장 전체가 바뀝니다.

   ★ 아직 안 채워진 곳은 "☞" 로 표시해 두었습니다.
   ============================================================ */

const CONFIG = {

  /* ---------- 기본 정보 ---------- */
  groom: {
    name: "김민수",
    firstName: "민수",
    phone: "",                                  // ☞ 연락처 (다 비어 있으면 연락하기 버튼이 숨겨집니다)
    father: { name: "김태동", phone: "", deceased: false },   // ☞ 연락처
    mother: { name: "이해형", phone: "", deceased: false },   // ☞ 연락처
    relation: "아들",                            // "아들" / "장남" / "차남"
  },

  bride: {
    name: "설유민",
    firstName: "유민",
    phone: "",                                  // ☞ 연락처
    father: { name: "설광휘", phone: "", deceased: false },   // ☞ 연락처
    mother: { name: "양숙원", phone: "", deceased: false },    // ☞ 연락처
    relation: "딸",                              // "딸" / "장녀" / "차녀"
  },

  /* ---------- 예식 일시 ---------- */
  wedding: {
    date: "2026-10-03T13:30",
    dateText: "2026년 10월 3일 토요일 오후 1시 30분",
    venue: "포스코센터 아트홀",
    hall: "동관 4층",
    address: "서울특별시 강남구 테헤란로 440",
    addressDetail: "포스코센터 동관 4층",
    tel: "",                                    // ☞ 예식장 대표번호 (알면 채우세요)
  },

  /* ---------- 인사말 ---------- */
  greeting: {
    title: "저희 결혼합니다",
    body: `서로 다른 언어로 자라온 두 사람이
3년의 시간 동안 하나의 마음을 배웠습니다.

한국과 대만, 서로 다른 두 나라에서 시작된 인연이
이제 하나의 가정으로 이어지려 합니다.

귀한 걸음 하시어 축복해 주시면
더없는 기쁨으로 간직하겠습니다.`,
  },

  /* ---------- 사진 ----------
     원본 파일 이름을 그대로 씁니다. add_photos.py 를 돌리면
     아래 gallery 목록이 자동으로 갱신됩니다. */

  // 맨 위 대문 사진 (아래 격자에는 중복해서 넣지 않습니다)
  mainPhoto: "images/gallery/gal0.jpg",

  // 청첩장 중간에 한 장 크게 넣을 사진 (비우면 그 구간이 사라집니다)
  interludePhoto: "images/gallery/gal3.jpg",

  // 약도. 비워두면 index.html 에 직접 그려둔 SVG 약도가 쓰입니다.
  // 예식장에서 받은 이미지를 쓰려면 "images/map.jpg" 처럼 적으세요.
  mapImage: "",

  /* 격자 썸네일은 정사각이라 세로 사진의 위아래가 잘립니다.
     기본은 위에서 30% 지점을 기준으로 자릅니다.
     인물이 유난히 위/아래에 있는 사진만 여기에 적어주세요. (0% = 맨 위) */
  focus: {
    "gal10.jpg": "0%",     // 신랑 얼굴이 사진 맨 위에 있음
  },

  // 흑백으로 바꿔서 저장할 사진 (add_photos.py 실행 시 적용)
  monochrome: ["gal6.jpg"],

  gallery: [
    "gal0.jpg",
    "gal1.jpg",
    "gal3.jpg",
    "gal4.jpg",
    "gal5.jpg",
    "gal6.jpg",
    "gal7.jpg",
    "gal10.jpg",
    "gal9.jpg",
    "gal8.jpg",
  ],


  /* ---------- 오시는 길 ---------- */
  directions: [
    { icon: "subway", title: "지하철",
      body: "2호선 선릉역 1번 출구에서 150m\n2호선 삼성역 4번 출구에서 150m" },
    { icon: "bus", title: "버스",
      body: "간선 146, 333, 341, 360, 740\n광역 1100, 2000, 7007, 9303\n공항 6703\n포스코센터 정류장 하차" },
    { icon: "car", title: "자가용",
      body: "내비게이션에 '포스코센터' 검색\n건물 지하주차장 이용" },
  ],

  /* ---------- 마음 전하실 곳 ----------
     bank / number 가 비어 있는 사람은 목록에서 자동으로 빠집니다.
     한 쪽이 통째로 비면 그 블록(신랑측/신부측) 자체가 안 나옵니다. */
  accounts: {
    groom: [
      { role: "신랑",   name: "김민수", bank: "우리은행", number: "1002-458-857568" },
      { role: "아버지", name: "김태동", bank: "iM뱅크",   number: "075-13-246486" },
      { role: "어머니", name: "이해형", bank: "국민은행", number: "820401-01-230766" },
    ],
    bride: [
      { role: "신부",   name: "설유민", bank: "", number: "" },   // ☞ 아직
      { role: "아버지", name: "설광휘", bank: "", number: "" },   // ☞ 아직
      { role: "어머니", name: "양숙원", bank: "", number: "" },   // ☞ 아직
    ],
  },

  /* ---------- 공유하기 ---------- */
  share: {
    title: "김민수 ♥ 설유민 결혼합니다",
    description: "2026년 10월 3일 토요일 오후 1시 30분\n포스코센터 아트홀 동관 4층",
    url: "https://kim1102.github.io/my_wedding_card/",
  },

  /* ---------- 배경음악 ----------
     ☞ 음원 파일을 audio/ 폴더에 넣고 파일명을 적으세요. (mp3 / m4a / ogg)
        file 이 비어 있거나 파일을 못 찾으면 버튼 자체가 나타나지 않습니다.

     autoplay: 자동재생을 시도하고, 브라우저가 막으면 첫 터치에 시작합니다.
               (모바일 브라우저는 소리 있는 자동재생을 대부분 막습니다) */
  music: {
    file: "audio/bgm.mp3",                              // 100초 발췌, 96kbps 모노 (bundle 용량 때문)
    title: "Sarah Kang — Summer Is for Falling in Love",
    autoplay: true,
    volume: 0.45,
  },

  /* ---------- 中文(繁體) 번역 ----------
     여기 적은 항목만 중국어로 바뀝니다. 없는 항목은 한국어 그대로 나옵니다.
     ☞ 두 분의 중국어 이름이 따로 있으면 name 을 바꿔주세요. */
  tw: {
    groom: { relation: "之子" },
    bride: { relation: "之女" },

    /* 한자 이름. 이름이 나오는 모든 곳(대문·혼주·계좌·D-day·하단)에 함께 적용됩니다. */
    names: {
      "김민수": "金玟秀", "민수": "玟秀",
      "김태동": "金泰東", "이해형": "李海炯",
      "설유민": "薛維敏", "유민": "維敏",
      "설광휘": "薛光揮", "양숙원": "楊淑媛",
    },

    wedding: {
      dateText: "2026年10月3日（星期六）下午1點30分",
      venue: "POSCO Center 藝術廳",
      hall: "東館 4樓",
      // 주소는 한국어를 함께 보여줍니다 (택시·내비게이션에서 필요)
      address: "首爾特別市 江南區 德黑蘭路 440",
      addressDetail: "POSCO Center 東館 4樓",
    },

    greeting: {
      title: "我們要結婚了",
      body: `在不同語言中長大的兩個人，
用三年的時光學會了同心。

始於韓國與台灣，兩個不同國度的緣分，
如今即將牽成一個家庭。

若能撥冗蒞臨、給予祝福，
我們將銘記在心，倍感珍惜。`,
    },

    directions: [
      { icon: "subway", title: "地鐵",
        body: "2號線 宣陵站(선릉역) 1號出口 步行150公尺\n2號線 三成站(삼성역) 4號出口 步行150公尺" },
      { icon: "bus", title: "公車",
        body: "幹線 146, 333, 341, 360, 740\n廣域 1100, 2000, 7007, 9303\n機場巴士 6703\n於 POSCO Center 站下車" },
      { icon: "car", title: "自行開車",
        body: "導航搜尋「포스코센터」\n可使用大樓地下停車場" },
    ],
  },

  /* ---------- 옵션 ---------- */
  options: {
    showDday: true,
    showCalendar: true,
    showPetals: true,    // 대문 사진 위 꽃잎 (끄려면 false)
    showAccounts: true,
    showMusic: true,     // 배경음악 (music.file 이 있어야 실제로 나타납니다)
  },
};

/* 전역 노출 (main.js 에서 사용) */
window.CONFIG = CONFIG;
