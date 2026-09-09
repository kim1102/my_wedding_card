/* =========================================================
   모바일 청첩장 — 렌더링 / 인터랙션
   내용은 js/config.js 에서 수정하세요.
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const BASE = window.CONFIG;
  let LANG = 'ko';
  let C = BASE, W = C.wedding;   // 현재 언어가 반영된 설정

  /* 화면에 박혀 있는 문구들. 설정 파일의 tw 블록과 함께 쓰인다. */
  const UI = {
    ko: {
      dow: ['일', '월', '화', '수', '목', '금', '토'],
      contact: '연락하기', contactTitle: '연락하기', close: '닫기',
      galleryTitle: '우리의 순간', locationTitle: '오시는 길',
      accountsTitle: '축의 마음 전하실 곳',
      accountsNote: '비대면으로 축하를 전하고자<br>하시는 분들을 위해<br>' +
                    '계좌번호를 기재하였습니다.<br>너그러운 마음으로 양해 부탁드립니다.',
      groomSide: '신랑측 계좌번호', brideSide: '신부측 계좌번호',
      copy: '복사', copyAddr: '주소 복사', kakao: '카카오맵', naver: '네이버지도',
      shareLink: '링크 복사', shareSystem: '공유하기',
      mapHint: '아래 버튼으로 지도 앱에서 열어보세요',
      role: { 신랑: '신랑', 신부: '신부', 아버지: '아버지', 어머니: '어머니' },
      nameSep: ', ',
      other: '繁體中文',   // 이 버튼을 누르면 갈 언어
      footerNote: '잘 살겠습니다!',
      who: { groom: '신랑', bride: '신부', gf: '신랑 아버지', gm: '신랑 어머니',
             bf: '신부 아버지', bm: '신부 어머니' },
      copied: '복사되었습니다', addrCopied: '주소가 복사되었습니다',
      acctCopied: '계좌번호가 복사되었습니다', linkCopied: '링크가 복사되었습니다',
      copyFail: '복사가 막혀 있습니다. 길게 눌러 복사해 주세요',
      dday: (n, who) => n > 0 ? who + '의 결혼식이 <b>' + n + '일</b> 남았습니다.'
          : n === 0 ? '오늘은 ' + who + '의 결혼식입니다.'
          : who + '의 결혼식이 <b>' + (-n) + '일</b> 지났습니다.',
    },
    tw: {
      dow: ['日', '一', '二', '三', '四', '五', '六'],
      contact: '聯絡我們', contactTitle: '聯絡我們', close: '關閉',
      galleryTitle: '我們的時刻', locationTitle: '交通指引',
      accountsTitle: '致贈心意',
      accountsNote: '為無法親臨現場<br>但想致上祝福的貴賓<br>' +
                    '謹附上匯款帳戶資訊。<br>若有失禮之處，敬請見諒。',
      groomSide: '新郎方帳戶', brideSide: '新娘方帳戶',
      copy: '複製', copyAddr: '複製地址', kakao: 'KakaoMap', naver: 'NAVER地圖',
      shareLink: '複製連結', shareSystem: '分享',
      mapHint: '請用下方按鈕在地圖App開啟',
      role: { 신랑: '新郎', 신부: '新娘', 아버지: '父親', 어머니: '母親' },
      nameSep: ' 與 ',
      other: '한국어',
      footerNote: '我們會幸福的！',
      who: { groom: '新郎', bride: '新娘', gf: '新郎父親', gm: '新郎母親',
             bf: '新娘父親', bm: '新娘母親' },
      copied: '已複製', addrCopied: '已複製地址',
      acctCopied: '已複製帳號', linkCopied: '已複製連結',
      copyFail: '無法自動複製，請長按複製',
      dday: (n, who) => n > 0 ? '距離 ' + who + ' 的婚禮還有 <b>' + n + ' 天</b>。'
          : n === 0 ? '今天是 ' + who + ' 的婚禮。'
          : who + ' 的婚禮已過 <b>' + (-n) + ' 天</b>。',
    },
  };
  const t = (k) => UI[LANG][k];

  /* 중국어로 볼 때 한자 이름으로 바꾼다. 표에 없으면 원래 이름 그대로. */
  const nm = (s) => (LANG === 'tw' && BASE.tw && BASE.tw.names &&
                     BASE.tw.names[s]) || s;

  /* 단일 파일로 묶을 때 사진이 data: URI 로 들어온다.
     그 경우 window.__ASSET 에 경로→데이터 표가 실린다. 없으면 경로 그대로 쓴다. */
  const src = (p) => (window.__ASSET && window.__ASSET[p]) || p;

  /* ---------- 토스트 ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1900);
  }

  /* ---------- 클립보드 ----------
     http 로 열었을 때, iframe 안일 때, 권한이 막혔을 때까지 대비해
     최신 API → 구식 execCommand 순으로 두 번 시도한다. */
  function copyLegacy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  async function copy(text, msg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast(msg || t('copied'));
        return;
      }
    } catch (e) { /* 아래 구식 방식으로 넘어간다 */ }

    if (copyLegacy(text)) toast(msg || t('copied'));
    else toast(t('copyFail'));
  }

  /* ---------- 날짜 파싱 ---------- */
  let DOW = UI.ko.dow;
  const weddingDate = new Date(BASE.wedding.date.replace(' ', 'T'));

  function formatDate(d) {
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h < 12 ? '오전' : '오후';
    let h12 = h % 12; if (h12 === 0) h12 = 12;
    const time = ampm + ' ' + h12 + '시' + (m ? ' ' + m + '분' : '');
    return d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 ' +
           DOW[d.getDay()] + '요일 ' + time;
  }
  let dateText = W.dateText || formatDate(weddingDate);

  /* 현재 언어에 맞춰 설정을 다시 조합한다. tw 에 없는 항목은 한국어가 그대로 쓰인다. */
  function applyLangData() {
    const TW = BASE.tw || {};
    C = (LANG !== 'tw') ? BASE : Object.assign({}, BASE, {
      groom:      Object.assign({}, BASE.groom, TW.groom),
      bride:      Object.assign({}, BASE.bride, TW.bride),
      wedding:    Object.assign({}, BASE.wedding, TW.wedding),
      greeting:   Object.assign({}, BASE.greeting, TW.greeting),
      directions: TW.directions || BASE.directions,
    });
    W = C.wedding;
    DOW = t('dow');
    dateText = W.dateText || formatDate(weddingDate);
  }

  /* =========================================================
     HERO
     ========================================================= */
  function renderHero() {
    const img = $('#mainPhoto');
    img.src = src(BASE.mainPhoto);
    img.onerror = () => { img.remove(); };
    renderHeroText();
  }

  function renderHeroText() {
    $('#heroGroom').textContent = nm(C.groom.name);
    $('#heroBride').textContent = nm(C.bride.name);
    $('#heroDate').textContent  = dateText;
    $('#heroVenue').textContent = W.venue + (W.hall ? ' ' + W.hall : '');

    document.title = C.groom.name + ' ♥ ' + C.bride.name + ' 결혼합니다';
    const og = (p, v) => { const m = document.querySelector('meta[property="' + p + '"]'); if (m) m.content = v; };
    og('og:title', C.share.title || document.title);
    og('og:description', (C.share.description || dateText).replace(/\n/g, ' · '));
  }

  /* =========================================================
     배경음악
     ========================================================= */
  function initMusic() {
    const cfg = C.music || {};
    const btn = $('#bgmToggle');
    const audio = $('#bgm');
    if (!btn || !audio) return;

    // 음원이 지정되지 않았으면 버튼도 오디오도 없앤다
    if (!C.options.showMusic || !cfg.file) { btn.remove(); audio.remove(); return; }

    audio.src = src(cfg.file);
    audio.loop = true;
    audio.volume = typeof cfg.volume === 'number' ? cfg.volume : 0.45;
    if (cfg.autoplay) audio.preload = 'auto';
    if (cfg.title) btn.title = cfg.title;

    // 파일을 못 찾으면 조용히 사라진다 (하객에게 오류를 보이지 않는다)
    audio.addEventListener('error', () => { btn.remove(); });

    function paint() {
      const on = !audio.paused;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? '배경음악 끄기' : '배경음악 켜기');
    }
    audio.addEventListener('play', paint);
    audio.addEventListener('pause', paint);

    btn.hidden = false;
    paint();

    // 직접 끄셨던 분에게는 다음에도 켜지 않는다
    const KEY = 'bgm';
    const remember = (on) => { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {} };
    let wanted = true;
    try { wanted = localStorage.getItem(KEY) !== 'off'; } catch (e) {}

    const KICKS = ['pointerdown', 'touchstart', 'keydown'];
    function dropKick() { KICKS.forEach(ev => document.removeEventListener(ev, kick)); }
    function kick(e) {
      // 버튼을 직접 누른 경우는 아래 클릭 핸들러가 처리한다
      if (e && e.target && e.target.closest && e.target.closest('#bgmToggle')) return;
      dropKick();
      audio.play().catch(() => {});
    }

    btn.addEventListener('click', () => {
      dropKick();
      if (audio.paused) { audio.play().catch(() => {}); remember(true); }
      else { audio.pause(); remember(false); }
    });

    if (!cfg.autoplay || !wanted) return;

    // 자동재생을 시도하고, 브라우저가 막으면 첫 터치에 시작한다
    audio.play().catch(() => {
      KICKS.forEach(ev => document.addEventListener(ev, kick, { passive: true }));
    });
  }

  /* =========================================================
     대문 사진 위로 떨어지는 꽃잎
     ========================================================= */
  /* =========================================================
     사진 위에 얹는 애니메이션
       대문 사진 — 꽃잎이 내려온다
       맺음 사진 — 빛망울이 떠오른다 (처음과 끝이 대구를 이루도록)
     ========================================================= */
  function initPetals() {
    if (!C.options.showPetals) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    mountFx($('.hero__photo'), $('#mainPhoto'),      fallingPetals);
    mountFx($('#interlude'),   $('#interludePhoto'), risingGlow);
  }

  /* 캔버스를 얹고 루프를 관리하는 공통 부분.
     효과는 { count, make, step } 세 가지만 정의하면 된다.
     사진이 화면 밖으로 나가거나 탭이 가려지면 멈춘다 (배터리). */
  function mountFx(host, photo, spec) {
    if (!host) return;

    const cv = document.createElement('canvas');
    cv.className = 'petals';
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    const ctx = cv.getContext('2d');
    if (!ctx) { cv.remove(); return; }

    let W = 0, H = 0, items = [], raf = null, running = false, last = 0;
    const env = { W: 0, H: 0, rand: (a, b) => a + Math.random() * (b - a) };

    function resize() {
      const b = host.getBoundingClientRect();
      if (!b.width || !b.height) return;      // 사진이 아직 안 실렸으면 나중에 다시
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = env.W = b.width;
      H = env.H = b.height;
      cv.width  = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const want = spec.count(W, H);
      while (items.length < want) items.push(spec.make(env, true));
      items.length = want;
    }

    function frame(t) {
      if (!running) return;
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0.016;
      last = t;
      ctx.clearRect(0, 0, W, H);
      for (const it of items) spec.step(it, dt, env, ctx);
      raf = requestAnimationFrame(frame);
    }

    function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop()  { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    resize();

    // 사진이 실려야 높이가 정해진다. ResizeObserver 는 화면이 실제로 그려지는
    // 동안에만 콜백이 오므로, load 이벤트로 한 번 더 확실히 잡는다.
    if (photo) {
      if (photo.complete && photo.naturalWidth) resize();
      else photo.addEventListener('load', resize, { once: true });
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize', resize);

    start();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => { es[0].isIntersecting ? start() : stop(); },
                              { threshold: 0 }).observe(host);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (host.getBoundingClientRect().bottom > 0) start();
    });
  }

  /* ---------- 대문 사진: 내려오는 꽃잎 ---------- */
  const fallingPetals = {
    count: (W) => Math.max(14, Math.min(32, Math.round(W / 14))),

    // seeded=true 면 화면 곳곳에 흩어서 시작 (처음부터 자연스럽게 보이도록)
    make: (e, seeded) => ({
      x: e.rand(0, e.W),
      y: seeded ? e.rand(-e.H * 0.6, e.H) : e.rand(-40, -8),
      r: e.rand(6, 13.8),
      vy: e.rand(16, 38),            // 초당 낙하 픽셀
      sway: e.rand(12, 30),          // 좌우로 흔들리는 폭
      swaySpeed: e.rand(0.5, 1.2),
      phase: e.rand(0, Math.PI * 2),
      spin: e.rand(0, Math.PI * 2),
      spinSpeed: e.rand(-1.1, 1.1),
      alpha: e.rand(0.5, 0.9),
      warm: Math.random() < 0.35,    // 일부는 살짝 아이보리 톤
    }),

    step: (p, dt, e, ctx) => {
      p.y += p.vy * dt;
      p.phase += p.swaySpeed * dt;
      p.spin += p.spinSpeed * dt;
      if (p.y - p.r > e.H) Object.assign(p, fallingPetals.make(e, false));

      // 지면으로 풀리는 아래쪽 구간에서 서서히 사라진다
      const fade = p.y > e.H * 0.72 ? Math.max(0, 1 - (p.y - e.H * 0.72) / (e.H * 0.28)) : 1;
      const a = p.alpha * fade;
      if (a <= 0.01) return;

      ctx.save();
      ctx.translate(p.x + Math.sin(p.phase) * p.sway, p.y);
      ctx.rotate(p.spin);
      ctx.scale(Math.cos(p.spin * 0.7) * 0.45 + 0.55, 1);   // 뒤집히며 나부끼는 느낌
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.quadraticCurveTo(p.r * 0.92, -p.r * 0.2, 0, p.r);
      ctx.quadraticCurveTo(-p.r * 0.92, -p.r * 0.2, 0, -p.r);
      // 배경이 흰 꽃 + 흰 드레스라 흰 꽃잎이 묻힌다.
      // 그림자는 어색해서 쓰지 않고, 따뜻한 테두리로만 윤곽을 잡아준다.
      ctx.fillStyle = p.warm ? 'rgba(250,242,226,' + a + ')' : 'rgba(255,253,248,' + a + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,114,76,' + (a * 0.5) + ')';
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();
    },
  };

  /* ---------- 맺음 사진: 떠오르는 빛망울 ----------
     역광에 떠다니는 먼지처럼 아래에서 위로 천천히 올라간다.
     둥근 그라데이션을 매 프레임 만들면 무거우므로 한 번만 그려두고 재사용한다. */
  let glowSprite = null;
  function makeGlowSprite() {
    const s = document.createElement('canvas');
    s.width = s.height = 64;
    const g = s.getContext('2d');
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0.00, 'rgba(255,248,231,1)');
    rg.addColorStop(0.30, 'rgba(247,231,197,0.55)');
    rg.addColorStop(1.00, 'rgba(206,178,131,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    return s;
  }

  const risingGlow = {
    count: (W) => Math.max(10, Math.min(22, Math.round(W / 22))),

    make: (e, seeded) => ({
      x: e.rand(0, e.W),
      y: seeded ? e.rand(0, e.H) : e.rand(e.H + 10, e.H + 60),
      r: e.rand(10, 34),             // 빛망울 반지름
      vy: e.rand(6, 20),             // 초당 떠오르는 픽셀 (꽃잎보다 느리게)
      sway: e.rand(6, 20),
      swaySpeed: e.rand(0.2, 0.6),
      phase: e.rand(0, Math.PI * 2),
      base: e.rand(0.38, 0.9),       // 기본 밝기
      twinkle: e.rand(0.3, 0.9),     // 깜박이는 속도
      tphase: e.rand(0, Math.PI * 2),
    }),

    step: (p, dt, e, ctx) => {
      p.y -= p.vy * dt;
      p.phase += p.swaySpeed * dt;
      p.tphase += p.twinkle * dt;
      if (p.y + p.r < 0) Object.assign(p, risingGlow.make(e, false));

      // 위아래 끝에서 서서히 나타나고 사라진다
      const inFade  = Math.min(1, (e.H - p.y) / (e.H * 0.20));
      const outFade = Math.min(1, p.y / (e.H * 0.25));
      const a = p.base * (0.72 + 0.28 * Math.sin(p.tphase)) * inFade * outFade;
      if (a <= 0.01) return;

      if (!glowSprite) glowSprite = makeGlowSprite();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';   // 빛처럼 더해진다
      ctx.globalAlpha = a;
      const x = p.x + Math.sin(p.phase) * p.sway;
      ctx.drawImage(glowSprite, x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      ctx.restore();
    },
  };

  /* =========================================================
     중간 사진 (갤러리와 오시는 길 사이)
     ========================================================= */
  function renderInterlude() {
    const sec = $('#interlude');
    if (!sec) return;
    if (!C.interludePhoto) { sec.remove(); return; }   // 지정 안 했으면 구간째 없앤다
    const img = $('#interludePhoto');
    img.onerror = () => { sec.remove(); };             // 파일이 없어도 빈 칸을 남기지 않는다
    img.src = src(C.interludePhoto);
  }

  /* =========================================================
     인사말 + 혼주
     ========================================================= */
  function parentLine(side, child, childName) {
    const p = [];
    if (side.father && side.father.name) p.push(side.father);
    if (side.mother && side.mother.name) p.push(side.mother);

    const names = p.map(x =>
      (x.deceased ? '<span class="parents__rel">故</span> ' : '') + esc(nm(x.name))
    ).join('<span class="parents__dot"> · </span>');

    return '<div class="parents__row">' +
             '<span class="parents__p">' + names +
               '<span class="parents__rel">' +
                 (LANG === 'tw' ? ' ' + esc(child) : '의 ' + esc(child)) + '</span>' +
             '</span>' +
             '<span class="parents__child">' + esc(nm(childName)) + '</span>' +
           '</div>';
  }

  function renderGreeting() {
    $('#greetTitle').textContent = C.greeting.title;
    $('#greetBody').textContent  = C.greeting.body;
    $('#parents').innerHTML =
      parentLine(C.groom, C.groom.relation, C.groom.firstName || C.groom.name) +
      parentLine(C.bride, C.bride.relation, C.bride.firstName || C.bride.name);
  }

  /* =========================================================
     연락처 시트
     ========================================================= */
  const ICON_TEL =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
  const ICON_SMS =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

  function contactRow(who, name, phone) {
    if (!phone) return '';
    const tel = phone.replace(/[^0-9+]/g, '');
    return '<div class="contact-row">' +
             '<div>' +
               '<div class="contact-row__who">' + esc(who) + '</div>' +
               '<div class="contact-row__name">' + esc(nm(name)) + '</div>' +
             '</div>' +
             '<div class="contact-row__acts">' +
               '<a href="tel:' + tel + '" aria-label="전화">' + ICON_TEL + '</a>' +
               '<a href="sms:' + tel + '" aria-label="문자">' + ICON_SMS + '</a>' +
             '</div>' +
           '</div>';
  }

  function renderContacts() {
    const g = C.groom, b = C.bride;
    const w = t('who');
    const rows =
      contactRow(w.groom, g.name, g.phone) +
      contactRow(w.gf, g.father.name, g.father.phone) +
      contactRow(w.gm, g.mother.name, g.mother.phone) +
      contactRow(w.bride, b.name, b.phone) +
      contactRow(w.bf, b.father.name, b.father.phone) +
      contactRow(w.bm, b.mother.name, b.mother.phone);

    // 등록된 연락처가 하나도 없으면 빈 시트를 여는 대신 버튼을 감춘다
    if (!rows) {
      const btn = $('#openContact'), sh = $('#contactSheet');
      if (btn) btn.remove();
      if (sh) sh.remove();
      return;
    }
    $('#contactList').innerHTML = rows;
  }

  function bindContacts() {
    const sheet = $('#contactSheet'), open = $('#openContact');
    if (!sheet || !open) return;
    open.addEventListener('click', () => { sheet.hidden = false; });
    sheet.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-close')) sheet.hidden = true;
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !sheet.hidden) sheet.hidden = true;
    });
  }

  /* =========================================================
     달력 + D-day
     ========================================================= */
  function renderCalendar() {
    $('#dateHeadline').innerHTML = esc(dateText).replace(' ' + DOW[weddingDate.getDay()] + '요일 ', '<br>' + DOW[weddingDate.getDay()] + '요일 ');

    if (!C.options.showCalendar) { const cal = $('#calendar'); if (cal) cal.remove(); }
    else {
      const y = weddingDate.getFullYear();
      const m = weddingDate.getMonth();
      const day = weddingDate.getDate();
      const first = new Date(y, m, 1).getDay();
      const last  = new Date(y, m + 1, 0).getDate();
      const MONTHS = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

      let cells = '';
      DOW.forEach((d, i) => {
        cells += '<div class="cal__dow' + (i === 0 ? ' cal__dow--sun' : '') + '">' + d + '</div>';
      });
      for (let i = 0; i < first; i++) cells += '<div class="cal__cell"></div>';
      for (let d = 1; d <= last; d++) {
        const dow = (first + d - 1) % 7;
        const cls = 'cal__cell' + (dow === 0 ? ' cal__cell--sun' : '') + (d === day ? ' cal__cell--day' : '');
        cells += '<div class="' + cls + '"><span>' + d + '</span></div>';
      }

      $('#calendar').innerHTML =
        '<p class="cal__month">' + MONTHS[m] + ' ' + y + '</p>' +
        '<div class="cal__grid">' + cells + '</div>' +
        '<p class="cal__time">' + esc(dateText) + '</p>';
    }

    const ddayEl = $('#dday');
    if (!ddayEl) return;
    if (!C.options.showDday) { ddayEl.remove(); return; }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(weddingDate); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    const names = esc(nm(C.groom.firstName || C.groom.name)) + t('nameSep') +
                  esc(nm(C.bride.firstName || C.bride.name));

    ddayEl.innerHTML = t('dday')(diff, names);
  }

  /* =========================================================
     갤러리 + 라이트박스
     ========================================================= */
  let photos = [];
  let lbIndex = 0;

  function renderGallery() {
    photos = (C.gallery || [])
      .map(f => /^(https?:|images\/|\.)/.test(f) ? f : 'images/gallery/' + f)
      .map(src);
    if (!photos.length) { $('#gallery').remove(); return; }

    $('#galleryGrid').innerHTML = photos.map((src, i) =>
      '<button type="button" data-i="' + i + '" aria-label="' + (i + 1) + '번째 사진 크게 보기">' +
        '<img src="' + esc(src) + '" alt="" loading="lazy">' +
      '</button>'
    ).join('');

    // 로드 실패한 사진은 조용히 제거
    $$('#galleryGrid img').forEach(img => {
      img.onerror = () => { const b = img.closest('button'); if (b) b.remove(); };
    });

    $('#galleryGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-i]');
      if (btn) openLightbox(Number(btn.dataset.i));
    });
  }

  function openLightbox(i) {
    lbIndex = i;
    $('#lightbox').hidden = false;
    document.body.style.overflow = 'hidden';
    showPhoto();
  }
  function closeLightbox() {
    $('#lightbox').hidden = true;
    document.body.style.overflow = '';
  }
  function showPhoto() {
    $('#lbImg').src = photos[lbIndex];
    $('#lbCount').textContent = (lbIndex + 1) + ' / ' + photos.length;
  }
  function step(n) {
    lbIndex = (lbIndex + n + photos.length) % photos.length;
    showPhoto();
  }

  function bindLightbox() {
    $('#lbClose').addEventListener('click', closeLightbox);
    $('#lbPrev').addEventListener('click', () => step(-1));
    $('#lbNext').addEventListener('click', () => step(1));
    $('#lbStage').addEventListener('click', (e) => { if (e.target.id === 'lbStage') closeLightbox(); });

    document.addEventListener('keydown', (e) => {
      if ($('#lightbox').hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    // 스와이프
    let x0 = null, y0 = null;
    const stage = $('#lbStage');
    stage.addEventListener('touchstart', (e) => {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
      x0 = y0 = null;
    }, { passive: true });
  }

  /* =========================================================
     오시는 길
     ========================================================= */
  const DIR_ICONS = {
    subway: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="4"/><path d="M4 11h16"/><circle cx="8.5" cy="14" r=".6" fill="currentColor"/><circle cx="15.5" cy="14" r=".6" fill="currentColor"/><path d="M8 21l2-3M16 21l-2-3"/></svg>',
    bus:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16M4 7h16"/><circle cx="8" cy="14" r=".6" fill="currentColor"/><circle cx="16" cy="14" r=".6" fill="currentColor"/><path d="M7 21v-2M17 21v-2"/></svg>',
    car:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14v-4l-1.8-4.4A2 2 0 0 0 15.35 7h-6.7a2 2 0 0 0-1.85 1.6L5 13z"/><path d="M3 13h18"/><circle cx="7.5" cy="17" r="1.6"/><circle cx="16.5" cy="17" r="1.6"/></svg>',
    walk:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="1.6"/><path d="M11 21l1.5-6-2.5-2 1-5 3 2 2.5 1M10 13l-2 8"/></svg>',
  };

  // 지도 앱·택시에서는 한국어 주소가 필요하다. 언어와 상관없이 이 값을 쓴다.
  const koAddr = () => BASE.wedding.address +
    (BASE.wedding.addressDetail ? ' ' + BASE.wedding.addressDetail : '');

  function renderLocation() {
    $('#locVenue').textContent = W.venue;
    $('#locHall').textContent  = [W.hall, W.tel].filter(Boolean).join(' · ');

    // 중국어로 볼 때는 한국어 원문을 함께 보여준다 (기사에게 보여주기 위해)
    const addr = W.address + (W.addressDetail ? ' ' + W.addressDetail : '');
    $('#locAddr').innerHTML = esc(addr) +
      (LANG === 'tw' ? '<span class="loc__addr-ko">' + esc(koAddr()) + '</span>' : '');

    renderMapLinks();
    renderDirections();
  }

  /* 약도는 index.html 에 SVG 로 그려져 있다.
     config 의 mapImage 에 파일을 지정하면 그 이미지로 대체된다. */
  function renderMap() {
    const map = $('#map');
    if (!map || !BASE.mapImage) return;
    const img = new Image();
    img.alt = '약도';
    img.onload = () => { map.innerHTML = ''; map.appendChild(img); };
    img.src = src(BASE.mapImage);
  }

  function renderMapLinks() {
    // 검색어도 한국어여야 카카오·네이버에서 제대로 찾는다
    const q = encodeURIComponent(BASE.wedding.venue + ' ' + BASE.wedding.address);
    $('#mapLinks').innerHTML =
      '<a href="https://map.kakao.com/link/search/' + q + '" target="_blank" rel="noopener">' + esc(t('kakao')) + '</a>' +
      '<a href="https://map.naver.com/p/search/' + q + '" target="_blank" rel="noopener">' + esc(t('naver')) + '</a>' +
      '<button type="button" data-copy-addr>' + esc(t('copyAddr')) + '</button>';
    const hint = $('.map__hint');
    if (hint) hint.textContent = t('mapHint');
  }

  function bindLocation() {
    $('#mapLinks').addEventListener('click', (e) => {
      if (e.target.closest('[data-copy-addr]')) copy(koAddr(), t('addrCopied'));
    });
  }

  function renderDirections() {
    $('#directions').innerHTML = (C.directions || []).map(d =>
      '<div class="dir">' +
        '<div class="dir__icon">' + (DIR_ICONS[d.icon] || DIR_ICONS.walk) + '</div>' +
        '<div>' +
          '<h3 class="dir__title">' + esc(d.title) + '</h3>' +
          '<p class="dir__body">' + esc(d.body) + '</p>' +
        '</div>' +
      '</div>'
    ).join('');
  }

  /* =========================================================
     마음 전하실 곳
     ========================================================= */
  function accBlock(label, list) {
    // 계좌번호가 아직 없는 사람은 빈 줄로 내보내지 않고 건너뛴다.
    // 한 쪽이 통째로 비면 그 블록 자체가 나타나지 않는다.
    list = (list || []).filter(a => a && a.bank && a.number);
    if (!list.length) return '';
    const items = list.map(a =>
      '<div class="acc__item">' +
        '<div>' +
          '<p class="acc__who">' + esc(t('role')[a.role] || a.role) + ' ' + esc(nm(a.name)) + '</p>' +
          '<p class="acc__num">' + esc(a.bank) + ' ' + esc(a.number) + '</p>' +
        '</div>' +
        '<button type="button" class="acc__copy" data-copy="' + esc(a.bank + ' ' + a.number) + '">' + esc(t('copy')) + '</button>' +
      '</div>'
    ).join('');

    return '<div class="acc">' +
             '<button type="button" class="acc__head">' + esc(label) + '<span class="chev"></span></button>' +
             '<div class="acc__body">' + items + '</div>' +
           '</div>';
  }

  function renderAccounts() {
    const sec = $('#accounts');
    if (!sec) return;
    if (!C.options.showAccounts) { sec.remove(); return; }
    // 대만 하객에게는 계좌 안내를 보이지 않는다 (한국어로 바꾸면 다시 나온다)
    sec.hidden = (LANG === 'tw');
    $('#accountList').innerHTML =
      accBlock(t('groomSide'), C.accounts.groom) +
      accBlock(t('brideSide'), C.accounts.bride);

  }

  function bindAccounts() {
    const list = $('#accountList');
    if (!list) return;
    list.addEventListener('click', (e) => {
      const head = e.target.closest('.acc__head');
      if (head) { head.parentElement.classList.toggle('is-open'); return; }
      const btn = e.target.closest('[data-copy]');
      if (btn) copy(btn.dataset.copy, t('acctCopied'));
    });
  }

  /* =========================================================
     공유
     ========================================================= */
  function renderFooter() {
    renderFooterNames();

    const url = C.share.url || location.href;
    $('#shareLink').addEventListener('click', () => copy(url, t('linkCopied')));

    const sysBtn = $('#shareSystem');
    sysBtn.addEventListener('click', () => {
      // 공유 시트를 못 쓰는 환경(iframe, 데스크톱 등)에서는 링크 복사로 대체
      if (!navigator.share) { copy(url, t('linkCopied')); return; }
      navigator.share({ title: C.share.title, text: C.share.description, url: url })
        .catch((e) => {
          if (e && e.name === 'AbortError') return;   // 사용자가 직접 닫은 경우
          copy(url, t('linkCopied'));
        });
    });
  }

  /* =========================================================
     스크롤 등장
     ========================================================= */
  function renderFooterNames() {
    const el = $('#footerNames');
    if (!el) return;
    el.textContent = nm(C.groom.firstName || C.groom.name) + '  &  ' +
                     nm(C.bride.firstName || C.bride.name);
  }

  function bindReveal() {
    const items = $$('.reveal');
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 관찰이 불가능하거나 모션을 줄이는 설정이면 그냥 보이는 채로 둔다.
    if (reduced || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.remove('pre'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    items.forEach(el => {
      // 이미 화면에 있는 섹션은 숨기지 않는다 (첫 화면은 항상 보이게)
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      el.classList.add('pre');
      io.observe(el);
    });
  }

  /* =========================================================
     언어 전환 (KR / 中文)
     ========================================================= */
  function applyLang(lang) {
    LANG = (lang === 'tw') ? 'tw' : 'ko';
    try { localStorage.setItem('lang', LANG); } catch (e) {}
    document.documentElement.lang = (LANG === 'tw') ? 'zh-Hant' : 'ko';

    applyLangData();

    const lb = $('#langToggle');
    if (lb) {
      lb.textContent = t('other');                       // 누르면 갈 언어를 보여준다
      lb.dataset.next = (LANG === 'tw') ? 'ko' : 'tw';
      lb.setAttribute('aria-label',
        LANG === 'tw' ? '切換為韓文 / 한국어로 보기' : '繁體中文으로 보기');
    }

    // 화면에 박혀 있는 문구
    $$('[data-t]').forEach((el) => { el.textContent = t(el.getAttribute('data-t')); });
    $$('[data-t-html]').forEach((el) => { el.innerHTML = t(el.getAttribute('data-t-html')); });

    // 설정에서 나오는 문구 (리스너는 다시 붙이지 않는다)
    renderHeroText();
    renderGreeting();
    renderContacts();
    renderCalendar();
    renderLocation();
    renderAccounts();
    renderFooterNames();

    document.title = C.groom.name + ' ♥ ' + C.bride.name +
                     (LANG === 'tw' ? ' 婚禮邀請' : ' 결혼합니다');
  }

  function bindLang() {
    const box = $('#langToggle');
    if (!box) return;
    box.addEventListener('click', () => applyLang(box.dataset.next));
    let saved = null;
    try { saved = localStorage.getItem('lang'); } catch (e) {}
    // 저장된 선택이 없으면 기기 언어가 중국어일 때 중국어로 연다
    if (!saved && /^zh/i.test(navigator.language || '')) saved = 'tw';
    applyLang(saved || 'ko');
  }

  /* ---------- init ---------- */
  renderHero();
  initMusic();
  initPetals();
  renderInterlude();
  renderGreeting();
  renderContacts();
  renderCalendar();
  renderGallery();
  bindLightbox();
  renderMap();
  renderLocation();
  bindLocation();
  renderAccounts();
  bindAccounts();
  bindContacts();
  renderFooter();
  bindReveal();
  bindLang();          // 저장된 언어를 적용하며 화면 문구를 다시 그린다
})();
