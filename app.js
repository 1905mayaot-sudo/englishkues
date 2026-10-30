(function () {
  "use strict";

  // ── Данные ────────────────────────────────────────────────────────
  const VERBS = window.VERBS || [];
  const MODALS = window.MODALS || [];
  const MODAL_QUESTIONS = window.MODAL_QUESTIONS || [];
  const TENSES = window.TENSES || [];
  const TENSE_QUESTIONS = window.TENSE_QUESTIONS || [];
  const PLANS = window.PLANS || [];

  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STORAGE_KEY = "english-lab-v2";
  const OLD_KEY = "iv131-progress-v1";
  const THEME_KEY = "english-lab-theme";
  const TAB_ORDER = ["verbs", "modals", "tenses", "plans"];
  const DAY_NAMES = {1:"стр. 250",2:"стр. 251",3:"стр. 252",4:"стр. 253",5:"стр. 254",6:"стр. 255"};

  // ── Тема ──────────────────────────────────────────────────────────
  const themeBtn = $("themeBtn");
  const themeColorMeta = $("themeColorMeta");

  function currentTheme(){
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }
  function syncThemeButton(){
    if(!themeBtn) return;
    const dark = currentTheme() === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.title = dark ? "Включить светлую тему" : "Включить тёмную тему";
    themeBtn.setAttribute("aria-label", themeBtn.title);
    if(themeColorMeta) themeColorMeta.setAttribute("content", dark ? "#000000" : "#f5f5f7");
  }
  function applyTheme(theme, persist){
    document.documentElement.dataset.theme = theme;
    if(persist !== false){
      try{ localStorage.setItem(THEME_KEY, theme); }catch(e){}
    }
    syncThemeButton();
  }
  function setTheme(theme, animate){
    if(theme === currentTheme()) return;
    if(!animate || reduceMotion || !document.startViewTransition){
      applyTheme(theme);
      return;
    }
    const root = document.documentElement;
    let transition;
    root.classList.add("theme-transition");
    try{
      transition = document.startViewTransition(() => applyTheme(theme));
    }catch(e){
      root.classList.remove("theme-transition");
      applyTheme(theme);
      return;
    }
    const finish = () => root.classList.remove("theme-transition");
    transition.ready.then(() => {
      const rect = themeBtn ? themeBtn.getBoundingClientRect() : {left:innerWidth-40,top:40,width:0,height:0};
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      try{
        root.animate(
          {clipPath:["circle(0px at " + x + "px " + y + "px", "circle(" + radius + "px at " + x + "px " + y + "px"]},
          {duration:620, easing:"cubic-bezier(.22,1,.36,1)", pseudoElement:"::view-transition-new(root)"}
        );
      }catch(e){}
    }).catch(() => {});
    transition.finished.then(finish, finish);
  }
  themeBtn?.addEventListener("click", () => setTheme(currentTheme() === "dark" ? "light" : "dark", true));
  syncThemeButton();

  if(window.matchMedia){
    const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemTheme = (e) => {
      let saved = null;
      try{ saved = localStorage.getItem(THEME_KEY); }catch(err){}
      if(!saved) applyTheme(e.matches ? "dark" : "light", false);
    };
    if(themeQuery.addEventListener) themeQuery.addEventListener("change", onSystemTheme);
    else if(themeQuery.addListener) themeQuery.addListener(onSystemTheme);
  }

  // ── Стеклянные подтверждения ─────────────────────────────────────
  let dialogResolve = null;
  let dialogReturnFocus = null;

  function dialogOpen(){
    const box = $("confirmDialog");
    return !!box && !box.hidden;
  }
  function askConfirm(options){
    const opts = options || {};
    const box = $("confirmDialog");
    if(!box) return Promise.resolve(false);
    if(dialogOpen()){
      return new Promise(resolve => {
        const previous = dialogResolve;
        dialogResolve = (value) => { if(previous) previous(false); resolve(value); };
      });
    }
    dialogReturnFocus = document.activeElement;
    $("dialogTitle").textContent = opts.title || "Подтвердить действие?";
    $("dialogText").textContent = opts.text || "Это действие нельзя отменить.";
    $("dialogIcon").textContent = opts.icon || "!";
    $("dialogCancel").textContent = opts.cancelText || "Отмена";
    $("dialogConfirm").textContent = opts.confirmText || "Подтвердить";
    $("dialogConfirm").className = "btn " + (opts.danger === false ? "btn-primary" : "btn-danger");
    box.hidden = false;
    document.body.classList.add("dialog-open");
    requestAnimationFrame(() => {
      box.classList.add("show");
      $("dialogConfirm").focus();
    });
    return new Promise(resolve => { dialogResolve = resolve; });
  }
  function closeDialog(result){
    const box = $("confirmDialog");
    if(!box || box.hidden) return;
    box.classList.remove("show");
    document.body.classList.remove("dialog-open");
    const resolve = dialogResolve;
    dialogResolve = null;
    setTimeout(() => {
      if(box.classList.contains("show")) return;
      box.hidden = true;
      if(dialogReturnFocus && typeof dialogReturnFocus.focus === "function") dialogReturnFocus.focus();
      dialogReturnFocus = null;
    }, 280);
    if(resolve) resolve(result);
  }
  $("dialogCancel")?.addEventListener("click", () => closeDialog(false));
  $("dialogConfirm")?.addEventListener("click", () => closeDialog(true));
  $("confirmDialog")?.addEventListener("click", (e) => {
    if(e.target === $("confirmDialog")) closeDialog(false);
  });
  document.addEventListener("keydown", (e) => {
    if(!dialogOpen()) return;
    if(e.key === "Escape"){
      e.preventDefault();
      closeDialog(false);
      return;
    }
    if(e.key !== "Tab") return;
    const focusable = [...document.querySelectorAll("#confirmDialog .btn")];
    if(!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault();
      last.focus();
    }else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      first.focus();
    }
  });

  // ── Утилиты ───────────────────────────────────────────────────────
  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function firstForm(s){
    if(!s || s === "—") return "";
    return s.split("/")[0].split(",")[0].trim();
  }
  function verbPattern(v){
    if(!v.pp || v.pp === "—") return "MODAL";
    const p = firstForm(v.p);
    const pp = firstForm(v.pp);
    if(p === v.i && pp === v.i) return "AAA";
    if(p === pp && p !== v.i) return "ABB";
    if(p !== pp && pp === v.i) return "ABA";
    return "ABC";
  }
  const PATTERN_LABEL = {AAA:"AAA · все одинаковые",ABB:"ABB · V2 = V3",ABA:"ABA · V3 = V1",ABC:"ABC · все разные",MODAL:"модальный · нет V3"};
  function normalize(s){
    return String(s).toLowerCase().replace(/[.,;!?]/g," ").replace(/\s+/g," ").trim();
  }
  function checkForm(answer, expected){
    if(!expected || expected === "—") return true;
    const a = normalize(answer);
    if(!a) return false;
    const parts = expected.split("/").map(normalize).filter(Boolean);
    if(parts.length > 1){
      if(parts.includes(a)) return true;
      const got = a.split(/[\/ ]+/).filter(Boolean);
      return got.length === parts.length && parts.every(x => got.includes(x));
    }
    if(expected.includes(",")){
      const need = expected.split(",").map(normalize).filter(Boolean);
      const got = a.split(" ").filter(Boolean);
      return got.length === need.length && need.every(x => got.includes(x));
    }
    return a === normalize(expected);
  }
  function displayVerbForms(v){
    return v.i + " – " + v.p + " – " + v.pp;
  }
  function todayKey(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  }
  function pct(a,b){ return b ? Math.round(a/b*100) : 0; }

  // ── Состояние ─────────────────────────────────────────────────────
  function emptyState(){
    return {
      verbs:{}, modals:{}, tenses:{}, plans:{},
      today:{ date:todayKey(), count:0 }
    };
  }
  let state = loadState();

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const s = JSON.parse(raw);
        if(!s || typeof s !== "object") return emptyState();
        s.verbs = s.verbs || {};
        s.modals = s.modals || {};
        s.tenses = s.tenses || {};
        s.plans = s.plans || {};
        if(!s.today || s.today.date !== todayKey()) s.today = {date:todayKey(), count:0};
        return s;
      }
      // Мягкая миграция прогресса из первой версии.
      const old = localStorage.getItem(OLD_KEY);
      if(old){
        const parsed = JSON.parse(old);
        const fresh = emptyState();
        if(parsed && parsed.progress) fresh.verbs = parsed.progress;
        if(parsed && parsed.today) fresh.today = parsed.today;
        return fresh;
      }
    }catch(e){}
    return emptyState();
  }
  function saveState(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
  }
  function getVerbP(v){
    if(!state.verbs[v.i]) state.verbs[v.i] = {level:0,seen:0,correct:0,wrong:0,last:0};
    return state.verbs[v.i];
  }
  function getModalP(m){
    if(!state.modals[m.id]) state.modals[m.id] = {level:0,seen:0,correct:0,wrong:0,last:0};
    return state.modals[m.id];
  }
  function todayCount(){
    if(!state.today || state.today.date !== todayKey()) state.today = {date:todayKey(), count:0};
    return state.today.count;
  }
  function touchToday(){
    if(!state.today || state.today.date !== todayKey()) state.today = {date:todayKey(), count:0};
    state.today.count++;
  }

  // ── Статистика ────────────────────────────────────────────────────
  function verbStats(){
    let learned=0, learning=0, correct=0, wrong=0;
    VERBS.forEach(v => {
      const p = state.verbs[v.i] || {level:0,correct:0,wrong:0};
      if(p.level >= 4) learned++;
      else if(p.level > 0) learning++;
      correct += p.correct || 0;
      wrong += p.wrong || 0;
    });
    return {learned, learning, accuracy: (correct+wrong) ? Math.round(correct/(correct+wrong)*100) : null};
  }
  function modalStats(){
    let learned=0;
    MODALS.forEach(m => { if((state.modals[m.id]?.level || 0) >= 4) learned++; });
    return {learned};
  }
  function tenseStats(){
    return {learned: TENSES.filter(t => state.tenses[t.id]).length};
  }
  function renderStats(){
    const v = verbStats();
    const m = modalStats();
    const t = tenseStats();
    if($("statLearned")) $("statLearned").textContent = v.learned;
    if($("statLearning")) $("statLearning").textContent = v.learning;
    if($("statAccuracy")) $("statAccuracy").textContent = v.accuracy === null ? "—" : v.accuracy + "%";
    if($("statToday")) $("statToday").textContent = todayCount();
    if($("statToday2")) $("statToday2").textContent = todayCount();
    if($("modalLearned")) $("modalLearned").textContent = m.learned;
    if($("tenseLearned")) $("tenseLearned").textContent = t.learned;
    const p = pct(v.learned, VERBS.length);
    if($("progressRing")) $("progressRing").style.setProperty("--p", p);
    if($("progressText")) $("progressText").textContent = p + "%";
  }

  // ── Переключение разделов ─────────────────────────────────────────
  let activeTab = "verbs";

  function go(tab){
    if(!TAB_ORDER.includes(tab)) return;
    if(tab === activeTab){
      window.scrollTo({top:0,behavior:"smooth"});
      return;
    }
    const dir = TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(activeTab) ? 1 : -1;
    document.documentElement.style.setProperty("--nav-from", dir > 0 ? "42px" : "-42px");
    document.documentElement.style.setProperty("--nav-out", dir > 0 ? "-42px" : "42px");

    const update = () => {
      document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
      document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.goto === tab));
      activeTab = tab;
      if(tab === "verbs"){ renderVerbTable(); }
      if(tab === "modals"){ renderModalTable(); renderModalCard(); }
      if(tab === "tenses"){ renderTenseMap(); renderTenseTable(); renderTenseDetail(selectedTense ? selectedTense.id : TENSES[0]?.id); }
      if(tab === "plans"){ renderPlan(activePlan); }
      window.scrollTo({top:0,behavior:"auto"});
    };

    if(document.startViewTransition && !reduceMotion){
      try{ document.startViewTransition(update); return; }catch(e){}
    }
    update();
    const panel = $("panel-" + tab);
    if(panel){
      panel.classList.remove("panel-enter");
      void panel.offsetWidth;
      panel.classList.add("panel-enter");
      setTimeout(() => panel.classList.remove("panel-enter"), 720);
    }
  }

  function animateSubpanel(current, next){
    if(!current || !next || current === next) return;
    if(reduceMotion || !current.animate){
      current.classList.remove("active");
      next.classList.add("active");
      return;
    }
    const out = current.animate(
      [
        {opacity:1, transform:"translateY(0) scale(1)", filter:"blur(0)"},
        {opacity:0, transform:"translateY(-8px) scale(.994)", filter:"blur(5px)"}
      ],
      {duration:160, easing:"ease-in", fill:"forwards"}
    );
    out.onfinish = () => {
      current.classList.remove("active");
      current.style.opacity = "";
      current.style.transform = "";
      current.style.filter = "";
      next.classList.add("active");
      next.animate(
        [
          {opacity:0, transform:"translateY(16px) scale(.996)", filter:"blur(6px)"},
          {opacity:1, transform:"translateY(0) scale(1)", filter:"blur(0)"}
        ],
        {duration:440, easing:"cubic-bezier(.22,1,.36,1)", fill:"both"}
      );
    };
  }

  function activateSeg(container, attr, value){
    container.querySelectorAll(".seg").forEach(b => b.classList.toggle("active", b.dataset[attr] === value));
  }

  // ── Озвучка ───────────────────────────────────────────────────────
  let voice = null;
  function pickVoice(){
    if(!("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    voice = voices.find(v => /en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
  }
  if("speechSynthesis" in window){
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }
  function speak(text){
    if(!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-GB";
    u.rate = .86;
    if(voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  }

  // =================================================================
  // ГЛАГОЛЫ
  // =================================================================
  let verbMode = "table";
  const verbModes = $("verbModes");
  const verbSubpanels = $("verbSubpanels");
  const verbCaption = $("verbModeCaption");

  function setVerbMode(mode){
    if(mode === verbMode) return;
    const current = verbSubpanels.querySelector(".subpanel.active");
    const next = $("verb-" + mode);
    if(!next) return;
    verbMode = mode;
    activateSeg(verbModes, "mode", mode);
    verbCaption.textContent = {
      table:"131 глагол · 3 формы",
      cards:"Активное припоминание",
      quiz:"4 варианта · 10–50 вопросов",
      exam:"Пиши формы по памяти"
    }[mode] || "";
    animateSubpanel(current, next);
    if(mode === "cards") buildVerbDeck();
    if(mode === "table") renderVerbTable();
  }

  // ── таблица ───────────────────────────────────────────────────────
  const searchInput = $("searchInput");
  const groupFilter = $("groupFilter");
  const dayFilter = $("dayFilter");
  const hideRu = $("hideRu");
  const tableBody = $("tableBody");

  function filteredVerbs(){
    const q = searchInput.value.trim().toLowerCase();
    const g = groupFilter.value;
    const d = dayFilter.value;
    return VERBS.filter(v => {
      if(g !== "all" && verbPattern(v) !== g) return false;
      if(d !== "all" && String(v.day) !== d) return false;
      if(q){
        const hay = (v.i + " " + v.p + " " + v.pp + " " + v.ru + " " + (v.note || "")).toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });
  }
  function renderVerbTable(){
    const list = filteredVerbs();
    tableBody.innerHTML = list.map((v, idx) => {
      const lvl = Math.min(5, state.verbs[v.i]?.level || 0);
      const done = lvl >= 4;
      const shown = done ? 5 : lvl;
      return `<tr>
        <td class="num">${idx+1}</td>
        <td class="inf"><button class="speak-btn" data-speak-verb="${esc(v.i)}" title="Произнести">◉</button>${esc(v.i)}</td>
        <td class="past">${esc(v.p)}</td>
        <td class="pp">${esc(v.pp)}</td>
        <td class="ru">${esc(v.ru)}</td>
        <td><button class="status l${shown}" data-mark-verb="${esc(v.i)}" title="${done?"Выучено — нажми, чтобы сбросить":"Отметить выученным"}">${done?"✓":"●"}</button></td>
      </tr>`;
    }).join("");
    if(!list.length){
      tableBody.innerHTML = `<tr><td colspan="6" style="padding:34px;text-align:center;color:var(--muted)">Ничего не найдено. Попробуй другой запрос или фильтр.</td></tr>`;
    }
    tableBody.querySelectorAll("[data-mark-verb]").forEach(btn => {
      btn.addEventListener("click", () => {
        const v = VERBS.find(x => x.i === btn.dataset.markVerb);
        if(v) toggleVerbLearned(v);
      });
    });
    tableBody.querySelectorAll("[data-speak-verb]").forEach(btn => {
      btn.addEventListener("click", () => speak(btn.dataset.speakVerb));
    });
  }
  function toggleVerbLearned(v){
    const p = getVerbP(v);
    if(p.level >= 4){ p.level = 0; }
    else { p.level = 5; p.seen++; }
    p.last = Date.now();
    touchToday();
    saveState();
    renderStats();
    renderVerbTable();
  }
  if(searchInput) searchInput.addEventListener("input", renderVerbTable);
  if(groupFilter) groupFilter.addEventListener("change", renderVerbTable);
  if(dayFilter) dayFilter.addEventListener("change", renderVerbTable);
  if(hideRu) hideRu.addEventListener("change", () => {
    document.querySelector("#verb-table .table-wrap")?.classList.toggle("hide-ru", hideRu.checked);
  });
  $("printBtn")?.addEventListener("click", () => window.print());

  function markVerb(v, grade){
    const p = getVerbP(v);
    p.seen++;
    p.last = Date.now();
    if(grade === 2){ p.level = Math.min(5, p.level + 2); p.correct++; }
    else if(grade === 0){ p.level = Math.max(0, p.level - 1); p.wrong++; }
    else if(p.level < 1){ p.level = 1; }
    touchToday();
    saveState();
    renderStats();
  }
  function recordVerb(v, ok){
    const p = getVerbP(v);
    p.seen++;
    p.last = Date.now();
    if(ok){ p.level = Math.min(5, p.level + 2); p.correct++; }
    else { p.level = Math.max(0, p.level - 1); p.wrong++; }
    touchToday();
    saveState();
    renderStats();
  }

  // ── карточки ──────────────────────────────────────────────────────
  const cardMode = $("cardMode");
  const cardDay = $("cardDay");
  const cardCounter = $("cardCounter");
  const flashcard = $("flashcard");
  const cardsDone = $("cardsDone");
  const gradeActions = $("gradeActions");
  const revealBtn = $("revealBtn");
  const cardWord = $("cardWord");
  const cardRu = $("cardRu");
  const cardPast = $("cardPast");
  const cardPp = $("cardPp");
  const cardDayPill = $("cardDayPill");
  const cardPattern = $("cardPattern");
  const cardHint = $("cardHint");

  let verbDeck = [];
  let verbDeckIndex = 0;
  let verbRevealed = false;
  let verbDeckEmpty = false;

  function verbCardPool(){
    let list = VERBS.slice();
    const mode = cardMode.value;
    const day = cardDay.value;
    if(day !== "all") list = list.filter(v => String(v.day) === day);
    if(mode === "unlearned") list = list.filter(v => (state.verbs[v.i]?.level || 0) < 4);
    if(mode === "hard") list = list.filter(v => {
      const p = state.verbs[v.i] || {level:0,seen:0,wrong:0};
      return p.wrong > 0 || (p.seen > 0 && p.level <= 1);
    });
    return list;
  }
  function buildVerbDeck(){
    verbDeck = shuffle(verbCardPool());
    verbDeckIndex = 0;
    verbRevealed = false;
    verbDeckEmpty = verbDeck.length === 0;
    cardsDone.hidden = !verbDeckEmpty;
    flashcard.hidden = verbDeckEmpty;
    gradeActions.hidden = true;
    if(verbDeckEmpty){
      cardCounter.textContent = "0 / 0";
      $("cardsDoneText").textContent =
        cardMode.value === "hard" ? "Пока нет трудных глаголов. Пройди тест или карточки — ошибки появятся здесь." :
        cardMode.value === "unlearned" ? "В этой выборке не осталось невыученных глаголов. Отличная работа!" :
        "В этой выборке нет карточек. Попробуй другой фильтр.";
    }else{
      renderVerbCard();
    }
  }
  function renderVerbCard(){
    if(verbDeckEmpty){
      cardsDone.hidden = false;
      flashcard.hidden = true;
      gradeActions.hidden = true;
      return;
    }
    const v = verbDeck[verbDeckIndex];
    if(!v) return;
    verbRevealed = false;
    flashcard.classList.remove("revealed");
    gradeActions.hidden = true;
    revealBtn.hidden = false;
    cardWord.textContent = v.i;
    cardRu.textContent = v.ru;
    cardPast.textContent = v.p;
    cardPp.textContent = v.pp;
    cardDayPill.textContent = "День " + v.day + " · " + DAY_NAMES[v.day];
    cardPattern.textContent = PATTERN_LABEL[verbPattern(v)];
    cardHint.textContent = "Вспомни две формы, затем открой ответ.";
    cardCounter.textContent = (verbDeckIndex + 1) + " / " + verbDeck.length;
    cardsDone.hidden = true;
    flashcard.hidden = false;
  }
  function revealVerbCard(){
    if(verbDeckEmpty) return;
    verbRevealed = true;
    flashcard.classList.add("revealed");
    revealBtn.hidden = true;
    gradeActions.hidden = false;
    const v = verbDeck[verbDeckIndex];
    cardHint.textContent = v.note || "Проговори тройку вслух: " + displayVerbForms(v);
  }
  function nextVerbCard(){
    if(verbDeckEmpty) return;
    verbDeckIndex++;
    if(verbDeckIndex >= verbDeck.length){
      flashcard.hidden = true;
      gradeActions.hidden = true;
      cardsDone.hidden = false;
      $("cardsDoneText").textContent = "Пройдено карточек: " + verbDeck.length + ". Ошибки сохранены — загляни в «Трудные».";
      cardCounter.textContent = verbDeck.length + " / " + verbDeck.length;
      return;
    }
    renderVerbCard();
  }
  function gradeVerb(grade){
    if(verbDeckEmpty || !verbRevealed) return;
    markVerb(verbDeck[verbDeckIndex], grade);
    nextVerbCard();
  }
  revealBtn?.addEventListener("click", revealVerbCard);
  document.querySelectorAll("#gradeActions .grade").forEach(btn => {
    btn.addEventListener("click", () => gradeVerb(Number(btn.dataset.grade)));
  });
  $("speakCard")?.addEventListener("click", () => {
    if(!verbDeckEmpty) speak(verbDeck[verbDeckIndex].i);
  });
  $("shuffleCards")?.addEventListener("click", buildVerbDeck);
  cardMode?.addEventListener("change", buildVerbDeck);
  cardDay?.addEventListener("change", buildVerbDeck);
  $("restartCards")?.addEventListener("click", buildVerbDeck);
  $("toHardCards")?.addEventListener("click", () => {
    cardMode.value = "hard";
    buildVerbDeck();
  });

  // ── быстрый тест по глаголам ──────────────────────────────────────
  let verbQuiz = null;
  let verbQuizAnswered = false;

  function makeVerbQuestion(v, type){
    let field = type;
    if(type === "mixed") field = Math.random() < .5 ? "p" : "pp";
    if(field === "pp" && v.pp === "—") field = "p";
    const correct = field === "p" ? v.p : v.pp;
    const pool = [];
    const seen = new Set([normalize(correct)]);
    VERBS.forEach(x => {
      if(x.i === v.i) return;
      const val = field === "p" ? x.p : x.pp;
      if(!val || val === "—") return;
      const n = normalize(val);
      if(seen.has(n)) return;
      seen.add(n);
      pool.push(val);
    });
    return {v, field, correct, options:shuffle([correct, ...shuffle(pool).slice(0,3)])};
  }
  function startVerbQuiz(count, type, forcedVerbs){
    const source = forcedVerbs && forcedVerbs.length ? forcedVerbs.slice() : shuffle(VERBS);
    const questions = [];
    for(const v of source){
      if(questions.length >= count) break;
      if(type === "pp" && v.pp === "—") continue;
      questions.push(makeVerbQuestion(v, type));
    }
    if(!questions.length) return;
    verbQuiz = {questions, idx:0, score:0, mistakes:[], type};
    verbQuizAnswered = false;
    $("verbQuizSetup").hidden = true;
    $("verbQuizResult").hidden = true;
    $("verbQuizPlay").hidden = false;
    renderVerbQuestion();
  }
  function renderVerbQuestion(){
    const q = verbQuiz.questions[verbQuiz.idx];
    verbQuizAnswered = false;
    $("verbQuizProgress").textContent = "Вопрос " + (verbQuiz.idx+1) + " / " + verbQuiz.questions.length;
    $("verbQuizScore").textContent = "Счёт: " + verbQuiz.score;
    $("verbQuizPrompt").textContent = q.field === "p" ? "Выбери Past (V2)" : "Выбери Participle II (V3)";
    $("verbQuizWord").textContent = q.v.i;
    $("verbQuizRu").textContent = q.v.ru;
    const box = $("verbQuizOptions");
    box.innerHTML = q.options.map((opt, i) => `<button class="option" data-opt="${esc(opt)}"><span class="key">${i+1}</span>${esc(opt)}</button>`).join("");
    box.querySelectorAll(".option").forEach(btn => btn.addEventListener("click", () => answerVerbQuiz(btn.dataset.opt, btn)));
    const fb = $("verbQuizFeedback");
    fb.className = "feedback";
    fb.innerHTML = "";
    $("verbQuizNext").hidden = true;
  }
  function answerVerbQuiz(choice, btn){
    if(verbQuizAnswered) return;
    verbQuizAnswered = true;
    const q = verbQuiz.questions[verbQuiz.idx];
    const ok = normalize(choice) === normalize(q.correct);
    const box = $("verbQuizOptions");
    box.querySelectorAll(".option").forEach(b => {
      b.disabled = true;
      if(normalize(b.dataset.opt) === normalize(q.correct)) b.classList.add("correct");
      if(b === btn && !ok) b.classList.add("wrong");
    });
    const fb = $("verbQuizFeedback");
    if(ok){
      verbQuiz.score++;
      recordVerb(q.v, true);
      fb.className = "feedback ok show";
      fb.innerHTML = "Верно! <b>" + esc(displayVerbForms(q.v)) + "</b>";
    }else{
      recordVerb(q.v, false);
      verbQuiz.mistakes.push({v:q.v, field:q.field, chosen:choice, correct:q.correct});
      fb.className = "feedback no show";
      fb.innerHTML = "Правильно: <b>" + esc(displayVerbForms(q.v)) + "</b>";
    }
    $("verbQuizScore").textContent = "Счёт: " + verbQuiz.score;
    $("verbQuizNext").hidden = false;
  }
  function nextVerbQuestion(){
    if(!verbQuizAnswered) return;
    verbQuiz.idx++;
    if(verbQuiz.idx >= verbQuiz.questions.length) renderVerbQuizResult();
    else renderVerbQuestion();
  }
  function renderVerbQuizResult(){
    $("verbQuizPlay").hidden = true;
    const box = $("verbQuizResult");
    box.hidden = false;
    const total = verbQuiz.questions.length;
    const percent = pct(verbQuiz.score, total);
    const msg = percent >= 90 ? "Отличный результат — формы уже в активной памяти." :
                percent >= 70 ? "Хорошо. Осталось добить ошибки — и будет уверенная пятёрка." :
                percent >= 50 ? "Неплохо, но формы ещё путаются. Повтори ошибки и пройди тест снова." :
                "Пока рано сдаваться: вернись к таблице, проговори тройки вслух и попробуй ещё раз.";
    const mistakes = verbQuiz.mistakes.length ? `
      <div class="mistakes"><h3>Разбор ошибок</h3>
        ${verbQuiz.mistakes.map(m => `<div class="mistake-row"><span class="w">${esc(m.v.i)}</span><span class="bad">твой ответ: ${esc(m.chosen)}</span><span class="good">правильно: ${esc(displayVerbForms(m.v))}</span></div>`).join("")}
      </div>` : "";
    box.innerHTML = `
      <div class="result">
        <div class="score-ring" style="--score:${percent}"><b>${verbQuiz.score}<small> / ${total}</small></b></div>
        <h2>${percent}%</h2><p>${msg}</p>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="verbQuizAgain">Ещё раз</button>
          ${verbQuiz.mistakes.length ? `<button class="btn btn-quiet" id="verbQuizRetry">Повторить ошибки (${verbQuiz.mistakes.length})</button>` : ""}
          <button class="btn btn-quiet" id="verbQuizBack">Настроить тест</button>
        </div>
        ${mistakes}
      </div>`;
    $("verbQuizAgain").addEventListener("click", () => startVerbQuiz(total, verbQuiz.type));
    $("verbQuizRetry")?.addEventListener("click", () => {
      const verbs = [...new Map(verbQuiz.mistakes.map(m => [m.v.i, m.v])).values()];
      startVerbQuiz(verbs.length, verbQuiz.type, verbs);
    });
    $("verbQuizBack").addEventListener("click", () => {
      box.hidden = true;
      $("verbQuizSetup").hidden = false;
    });
  }
  $("startVerbQuiz")?.addEventListener("click", () => {
    startVerbQuiz(Number($("verbQuizCount").value), $("verbQuizType").value);
  });
  $("verbQuizNext")?.addEventListener("click", nextVerbQuestion);

  // ── экзамен по глаголам ───────────────────────────────────────────
  let verbExam = null;
  let verbExamChecked = false;

  function startVerbExam(count, forcedVerbs){
    const verbs = forcedVerbs && forcedVerbs.length ? forcedVerbs.slice() : shuffle(VERBS).slice(0, count);
    verbExam = {verbs, idx:0, score:0, mistakes:[]};
    verbExamChecked = false;
    $("verbExamSetup").hidden = true;
    $("verbExamResult").hidden = true;
    $("verbExamPlay").hidden = false;
    renderVerbExam();
  }
  function renderVerbExam(){
    const v = verbExam.verbs[verbExam.idx];
    verbExamChecked = false;
    $("verbExamProgress").textContent = "Вопрос " + (verbExam.idx+1) + " / " + verbExam.verbs.length;
    $("verbExamScore").textContent = "Верно: " + verbExam.score;
    $("verbExamWord").textContent = v.i;
    $("verbExamRu").textContent = v.ru;
    $("verbExamPast").value = "";
    $("verbExamPp").value = "";
    $("verbExamPast").disabled = false;
    $("verbExamPp").disabled = v.pp === "—";
    $("verbExamPp").placeholder = v.pp === "—" ? "— (нет формы)" : "";
    $("verbExamPast").style.borderColor = "";
    $("verbExamPp").style.borderColor = "";
    $("verbExamFeedback").className = "exam-feedback";
    $("verbExamFeedback").innerHTML = "";
    $("verbExamCheck").hidden = false;
    $("verbExamNext").hidden = true;
    $("verbExamPast").focus();
  }
  function checkVerbExam(){
    if(verbExamChecked) return;
    verbExamChecked = true;
    const v = verbExam.verbs[verbExam.idx];
    const pOk = checkForm($("verbExamPast").value, v.p);
    const ppOk = v.pp === "—" ? true : checkForm($("verbExamPp").value, v.pp);
    const ok = pOk && ppOk;
    const fb = $("verbExamFeedback");
    if(ok){
      verbExam.score++;
      recordVerb(v, true);
      fb.className = "exam-feedback ok show";
      fb.innerHTML = "Верно! <div class='forms-line'>" + esc(displayVerbForms(v)) + "</div>";
    }else{
      recordVerb(v, false);
      verbExam.mistakes.push({v, past:$("verbExamPast").value.trim(), pp:$("verbExamPp").value.trim()});
      fb.className = "exam-feedback no show";
      fb.innerHTML = "Правильно: <div class='forms-line'>" + esc(displayVerbForms(v)) + "</div>";
      $("verbExamPast").style.borderColor = pOk ? "" : "var(--red)";
      $("verbExamPp").style.borderColor = ppOk ? "" : "var(--red)";
    }
    $("verbExamPast").disabled = true;
    $("verbExamPp").disabled = true;
    $("verbExamCheck").hidden = true;
    $("verbExamNext").hidden = false;
    $("verbExamScore").textContent = "Верно: " + verbExam.score;
    $("verbExamNext").focus();
  }
  function nextVerbExam(){
    if(!verbExamChecked) return;
    verbExam.idx++;
    if(verbExam.idx >= verbExam.verbs.length) renderVerbExamResult();
    else renderVerbExam();
  }
  function renderVerbExamResult(){
    $("verbExamPlay").hidden = true;
    const box = $("verbExamResult");
    box.hidden = false;
    const total = verbExam.verbs.length;
    const percent = pct(verbExam.score, total);
    const msg = percent >= 90 ? "Это уже экзаменационный уровень. Осталось поддерживать форму." :
                percent >= 75 ? "Хороший результат. Разбери ошибки — и можно сдавать." :
                percent >= 50 ? "База есть, но без повторения ошибок на экзамене будет рискованно." :
                "Стоп-сигнал: вернись к таблице и карточкам, затем пройди экзамен снова.";
    const mistakes = verbExam.mistakes.length ? `
      <div class="mistakes"><h3>Разбор ошибок</h3>
        ${verbExam.mistakes.map(m => `<div class="mistake-row"><span class="w">${esc(m.v.i)}</span><span class="bad">твой ответ: ${esc(m.past || "—")} / ${esc(m.pp || "—")}</span><span class="good">правильно: ${esc(displayVerbForms(m.v))}</span></div>`).join("")}
      </div>` : "";
    box.innerHTML = `
      <div class="result">
        <div class="score-ring" style="--score:${percent}"><b>${verbExam.score}<small> / ${total}</small></b></div>
        <h2>${percent}%</h2><p>${msg}</p>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="verbExamAgain">Ещё раз</button>
          ${verbExam.mistakes.length ? `<button class="btn btn-quiet" id="verbExamRetry">Повторить ошибки (${verbExam.mistakes.length})</button>` : ""}
          <button class="btn btn-quiet" id="verbExamBack">Настроить экзамен</button>
        </div>
        ${mistakes}
      </div>`;
    $("verbExamAgain").addEventListener("click", () => startVerbExam(total));
    $("verbExamRetry")?.addEventListener("click", () => {
      const verbs = [...new Map(verbExam.mistakes.map(m => [m.v.i, m.v])).values()];
      startVerbExam(verbs.length, verbs);
    });
    $("verbExamBack").addEventListener("click", () => {
      box.hidden = true;
      $("verbExamSetup").hidden = false;
    });
  }
  $("startVerbExam")?.addEventListener("click", () => startVerbExam(Number($("verbExamCount").value)));
  $("verbExamCheck")?.addEventListener("click", checkVerbExam);
  $("verbExamNext")?.addEventListener("click", nextVerbExam);
  ["verbExamPast","verbExamPp"].forEach(id => {
    $(id)?.addEventListener("keydown", e => {
      if(e.key !== "Enter") return;
      e.preventDefault();
      if(verbExamChecked) nextVerbExam(); else checkVerbExam();
    });
  });

  // =================================================================
  // МОДАЛЬНЫЕ
  // =================================================================
  let modalMode = "table";
  const modalModes = $("modalModes");
  const modalSubpanels = $("modalSubpanels");
  const modalCaption = $("modalModeCaption");

  function setModalMode(mode){
    if(mode === modalMode) return;
    const current = modalSubpanels.querySelector(".subpanel.active");
    const next = $("modal-" + mode);
    if(!next) return;
    modalMode = mode;
    activateSeg(modalModes, "mode", mode);
    modalCaption.textContent = {
      table:"18 модальных и заменителей",
      cards:"Функции · формула · пример",
      quiz:"15 вопросов с объяснениями"
    }[mode] || "";
    animateSubpanel(current, next);
    if(mode === "table") renderModalTable();
    if(mode === "cards") buildModalDeck();
  }

  function renderModalTable(){
    const body = $("modalTableBody");
    body.innerHTML = MODALS.map(m => `
      <tr>
        <td><span class="modal-name">${esc(m.name)}</span></td>
        <td><span class="modal-ru">${esc(m.ru)}</span></td>
        <td><ul class="function-list">${m.functions.map(f => `<li>${esc(f)}</li>`).join("")}</ul></td>
        <td><span class="tag tag-blue">${esc(m.form)}</span></td>
        <td><div class="example-en">${esc(m.past)}</div><div class="example-ru">${esc(m.future)}</div></td>
        <td><div class="example-en">${esc(m.example)}</div><div class="example-ru">${esc(m.translation)}</div></td>
        <td><span class="trap-text">${esc(m.trap)}</span></td>
      </tr>`).join("");
  }

  let modalDeck = [];
  let modalIndex = 0;
  let modalRevealed = false;
  let modalEmpty = false;
  const modalCard = $("modalCard");
  const modalGrade = $("modalGrade");
  const modalReveal = $("modalReveal");

  function modalPool(){
    let list = MODALS.slice();
    const mode = $("modalCardMode").value;
    if(mode === "core") list = list.filter(m => m.group === "core");
    if(mode === "equivalent") list = list.filter(m => m.group === "equivalent");
    if(mode === "unlearned") list = list.filter(m => (state.modals[m.id]?.level || 0) < 4);
    return list;
  }
  function buildModalDeck(){
    modalDeck = shuffle(modalPool());
    modalIndex = 0;
    modalRevealed = false;
    modalEmpty = modalDeck.length === 0;
    $("modalDone").hidden = !modalEmpty;
    modalCard.hidden = modalEmpty;
    modalGrade.hidden = true;
    if(modalEmpty){
      $("modalCounter").textContent = "0 / 0";
      $("modalDoneText").textContent = "В этой выборке нет карточек. Попробуй другой фильтр.";
    }else{
      renderModalCard();
    }
  }
  function renderModalCard(){
    if(modalEmpty){
      $("modalDone").hidden = false;
      modalCard.hidden = true;
      modalGrade.hidden = true;
      return;
    }
    const m = modalDeck[modalIndex];
    modalRevealed = false;
    modalCard.classList.remove("revealed");
    modalGrade.hidden = true;
    modalReveal.hidden = false;
    $("modalWord").textContent = m.name;
    $("modalRu").textContent = m.ru;
    $("modalFunctions").innerHTML = m.functions.map(f => `<span>${esc(f)}</span>`).join("");
    $("modalForm").textContent = m.form;
    $("modalPastFuture").textContent = m.past + " / " + m.future;
    $("modalExample").textContent = m.example;
    $("modalTranslation").textContent = m.translation;
    $("modalTrap").textContent = m.trap;
    $("modalGroupPill").textContent = m.group === "core" ? "Основной" : m.group === "equivalent" ? "Заменитель" : "Полумодальный";
    $("modalHint").textContent = "Вспомни функции и формулу, затем открой ответ.";
    $("modalCounter").textContent = (modalIndex+1) + " / " + modalDeck.length;
    $("modalDone").hidden = true;
    modalCard.hidden = false;
  }
  function revealModalCard(){
    if(modalEmpty) return;
    modalRevealed = true;
    modalCard.classList.add("revealed");
    modalReveal.hidden = true;
    modalGrade.hidden = false;
    $("modalHint").textContent = modalDeck[modalIndex].trap;
  }
  function nextModalCard(){
    if(modalEmpty) return;
    modalIndex++;
    if(modalIndex >= modalDeck.length){
      modalCard.hidden = true;
      modalGrade.hidden = true;
      $("modalDone").hidden = false;
      $("modalDoneText").textContent = "Пройдено карточек: " + modalDeck.length + ".";
      $("modalCounter").textContent = modalDeck.length + " / " + modalDeck.length;
      return;
    }
    renderModalCard();
  }
  function gradeModal(grade){
    if(modalEmpty || !modalRevealed) return;
    const m = modalDeck[modalIndex];
    const p = getModalP(m);
    p.seen++;
    p.last = Date.now();
    if(grade === 2){ p.level = Math.min(5, p.level + 2); p.correct++; }
    else { p.level = Math.max(0, p.level - 1); p.wrong++; }
    touchToday();
    saveState();
    renderStats();
    nextModalCard();
  }
  modalReveal?.addEventListener("click", revealModalCard);
  modalGrade?.querySelectorAll(".grade").forEach(btn => {
    btn.addEventListener("click", () => gradeModal(Number(btn.dataset.grade)));
  });
  $("modalShuffle")?.addEventListener("click", buildModalDeck);
  $("modalCardMode")?.addEventListener("change", buildModalDeck);
  $("modalRestart")?.addEventListener("click", buildModalDeck);
  $("modalSpeak")?.addEventListener("click", () => {
    if(!modalEmpty) speak(modalDeck[modalIndex].name);
  });

  let modalQuiz = null;
  let modalQuizAnswered = false;

  function startModalQuiz(count){
    const questions = shuffle(MODAL_QUESTIONS).slice(0, count).map(q => ({
      ...q,
      options: shuffle(q.options)
    }));
    modalQuiz = {questions, idx:0, score:0, mistakes:[]};
    modalQuizAnswered = false;
    $("modalQuizSetup").hidden = true;
    $("modalQuizResult").hidden = true;
    $("modalQuizPlay").hidden = false;
    renderModalQuestion();
  }
  function renderModalQuestion(){
    const q = modalQuiz.questions[modalQuiz.idx];
    modalQuizAnswered = false;
    $("modalQuizProgress").textContent = "Вопрос " + (modalQuiz.idx+1) + " / " + modalQuiz.questions.length;
    $("modalQuizScore").textContent = "Счёт: " + modalQuiz.score;
    $("modalQuizWord").textContent = q.q;
    const box = $("modalQuizOptions");
    box.innerHTML = q.options.map((opt, i) => `<button class="option" data-opt="${esc(opt)}"><span class="key">${i+1}</span>${esc(opt)}</button>`).join("");
    box.querySelectorAll(".option").forEach(btn => btn.addEventListener("click", () => answerModalQuiz(btn.dataset.opt, btn)));
    $("modalQuizFeedback").className = "feedback";
    $("modalQuizFeedback").innerHTML = "";
    $("modalQuizNext").hidden = true;
  }
  function answerModalQuiz(choice, btn){
    if(modalQuizAnswered) return;
    modalQuizAnswered = true;
    const q = modalQuiz.questions[modalQuiz.idx];
    const ok = choice === q.answer;
    const box = $("modalQuizOptions");
    box.querySelectorAll(".option").forEach(b => {
      b.disabled = true;
      if(b.dataset.opt === q.answer) b.classList.add("correct");
      if(b === btn && !ok) b.classList.add("wrong");
    });
    const fb = $("modalQuizFeedback");
    if(ok){
      modalQuiz.score++;
      touchToday();
      saveState();
      renderStats();
      fb.className = "feedback ok show";
      fb.innerHTML = "Верно. " + esc(q.explain);
    }else{
      modalQuiz.mistakes.push({q, chosen:choice});
      touchToday();
      saveState();
      renderStats();
      fb.className = "feedback no show";
      fb.innerHTML = "Правильно: <b>" + esc(q.answer) + "</b>. " + esc(q.explain);
    }
    $("modalQuizScore").textContent = "Счёт: " + modalQuiz.score;
    $("modalQuizNext").hidden = false;
  }
  function nextModalQuestion(){
    if(!modalQuizAnswered) return;
    modalQuiz.idx++;
    if(modalQuiz.idx >= modalQuiz.questions.length) renderModalQuizResult();
    else renderModalQuestion();
  }
  function renderModalQuizResult(){
    $("modalQuizPlay").hidden = true;
    const box = $("modalQuizResult");
    box.hidden = false;
    const total = modalQuiz.questions.length;
    const percent = pct(modalQuiz.score, total);
    const mistakes = modalQuiz.mistakes.length ? `
      <div class="mistakes"><h3>Разбор ошибок</h3>
        ${modalQuiz.mistakes.map(m => `<div class="mistake-row"><span class="w">${esc(m.q.answer)}</span><span class="bad">твой ответ: ${esc(m.chosen)}</span><span class="good">${esc(m.q.explain)}</span></div>`).join("")}
      </div>` : "";
    box.innerHTML = `
      <div class="result">
        <div class="score-ring" style="--score:${percent}"><b>${modalQuiz.score}<small> / ${total}</small></b></div>
        <h2>${percent}%</h2><p>${percent >= 80 ? "Модальные под контролем." : "Повтори функции и пройди тест ещё раз."}</p>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="modalQuizAgain">Ещё раз</button>
          ${modalQuiz.mistakes.length ? `<button class="btn btn-quiet" id="modalQuizRetry">Повторить ошибки</button>` : ""}
          <button class="btn btn-quiet" id="modalQuizBack">Настроить</button>
        </div>
        ${mistakes}
      </div>`;
    $("modalQuizAgain").addEventListener("click", () => startModalQuiz(total));
    $("modalQuizRetry")?.addEventListener("click", () => {
      const questions = modalQuiz.mistakes.map(m => m.q);
      modalQuiz = {questions: shuffle(questions).map(q => ({...q, options: shuffle(q.options)})), idx:0, score:0, mistakes:[]};
      modalQuizAnswered = false;
      box.hidden = true;
      $("modalQuizPlay").hidden = false;
      renderModalQuestion();
    });
    $("modalQuizBack").addEventListener("click", () => {
      box.hidden = true;
      $("modalQuizSetup").hidden = false;
    });
  }
  $("modalStartQuiz")?.addEventListener("click", () => startModalQuiz(Number($("modalQuizCount").value)));
  $("modalQuizNext")?.addEventListener("click", nextModalQuestion);

  // =================================================================
  // 12 ВРЕМЁН
  // =================================================================
  let tenseMode = "map";
  let selectedTense = TENSES[0] || null;
  const tenseModes = $("tenseModes");
  const tenseSubpanels = $("tenseSubpanels");
  const tenseCaption = $("tenseModeCaption");

  function setTenseMode(mode){
    if(mode === tenseMode) return;
    const current = tenseSubpanels.querySelector(".subpanel.active");
    const next = $("tense-" + mode);
    if(!next) return;
    tenseMode = mode;
    activateSeg(tenseModes, "mode", mode);
    tenseCaption.textContent = {
      map:"Нажми на время — откроется разбор",
      table:"Все 12 в одной таблице",
      quiz:"12 вопросов с разбором"
    }[mode] || "";
    animateSubpanel(current, next);
    if(mode === "map"){ renderTenseMap(); renderTenseDetail(selectedTense?.id); }
    if(mode === "table") renderTenseTable();
  }

  function renderTenseMap(){
    const grid = $("tenseGrid");
    if(!grid) return;
    const groups = ["Past","Present","Future"];
    grid.innerHTML = groups.map(g => `
      <div class="tense-col">
        <h3>${g}</h3>
        ${TENSES.filter(t => t.group === g).map(t => `
          <button class="tense-card ${selectedTense?.id === t.id ? "active" : ""}" data-tense="${esc(t.id)}">
            <span class="t-name">${esc(t.name)}</span>
            <span class="t-formula">${esc(t.formula)}</span>
            ${state.tenses[t.id] ? `<span class="t-check">✓ изучено</span>` : ""}
          </button>`).join("")}
      </div>`).join("");
    grid.querySelectorAll("[data-tense]").forEach(btn => {
      btn.addEventListener("click", () => {
        const t = TENSES.find(x => x.id === btn.dataset.tense);
        if(!t) return;
        selectedTense = t;
        renderTenseMap();
        renderTenseDetail(t.id);
      });
    });
  }
  function renderTenseDetail(id){
    const box = $("tenseDetail");
    if(!box) return;
    const t = TENSES.find(x => x.id === id) || TENSES[0];
    if(!t){ box.innerHTML = ""; return; }
    selectedTense = t;
    const done = !!state.tenses[t.id];
    box.innerHTML = `
      <div class="tense-detail-head">
        <div><h2>${esc(t.name)}</h2><div class="ru">${esc(t.ru)} · ${esc(t.group)} / ${esc(t.aspect)}</div></div>
        <span class="tag tag-blue">${esc(t.group)}</span>
      </div>
      <div class="tense-formula">${esc(t.formula)}</div>
      <div class="tense-detail-grid">
        <div class="detail-block"><h4>Отрицание и вопрос</h4><p>${esc(t.negative)}<br>${esc(t.question)}</p></div>
        <div class="detail-block"><h4>Маркеры</h4><div class="marker-chips">${t.markers.map(m => `<span>${esc(m)}</span>`).join("")}</div></div>
        <div class="detail-block"><h4>Когда используем</h4><ul>${t.use.map(u => `<li>${esc(u)}</li>`).join("")}</ul></div>
        <div class="detail-block"><h4>Пример</h4><p class="example-en">${esc(t.example)}</p><p class="example-ru">${esc(t.translation)}</p></div>
      </div>
      <div class="mistake-box"><b>Ловушка:</b> ${esc(t.mistake)}</div>
      <div class="tense-mark">
        <button class="btn ${done ? "btn-dark" : "btn-primary"} btn-small" data-tense-done="${esc(t.id)}">${done ? "Изучено ✓" : "Отметить изученным"}</button>
        ${done ? `<span class="done">Сохранено в прогрессе</span>` : ""}
      </div>`;
    box.querySelector("[data-tense-done]")?.addEventListener("click", () => {
      state.tenses[t.id] = !state.tenses[t.id];
      saveState();
      renderStats();
      renderTenseMap();
      renderTenseDetail(t.id);
    });
  }
  function renderTenseTable(){
    const body = $("tenseTableBody");
    if(!body) return;
    body.innerHTML = TENSES.map(t => `
      <tr>
        <td><b>${esc(t.name)}</b><div class="example-ru">${esc(t.ru)}</div></td>
        <td><span class="tag tag-blue">${esc(t.formula)}</span></td>
        <td><div class="marker-chips">${t.markers.slice(0,4).map(m => `<span>${esc(m)}</span>`).join("")}</div></td>
        <td><div class="example-ru">${t.use.slice(0,3).map(esc).join(" · ")}</div></td>
        <td><div class="example-en">${esc(t.example)}</div><div class="example-ru">${esc(t.translation)}</div></td>
      </tr>`).join("");
  }

  let tenseQuiz = null;
  let tenseQuizAnswered = false;

  function startTenseQuiz(){
    const questions = shuffle(TENSE_QUESTIONS).map(q => ({...q, options: shuffle(q.options)}));
    tenseQuiz = {questions, idx:0, score:0, mistakes:[]};
    tenseQuizAnswered = false;
    $("tenseQuizSetup").hidden = true;
    $("tenseQuizResult").hidden = true;
    $("tenseQuizPlay").hidden = false;
    renderTenseQuestion();
  }
  function renderTenseQuestion(){
    const q = tenseQuiz.questions[tenseQuiz.idx];
    tenseQuizAnswered = false;
    $("tenseQuizProgress").textContent = "Вопрос " + (tenseQuiz.idx+1) + " / " + tenseQuiz.questions.length;
    $("tenseQuizScore").textContent = "Счёт: " + tenseQuiz.score;
    $("tenseQuizWord").textContent = q.q;
    const box = $("tenseQuizOptions");
    box.innerHTML = q.options.map((opt, i) => `<button class="option" data-opt="${esc(opt)}"><span class="key">${i+1}</span>${esc(opt)}</button>`).join("");
    box.querySelectorAll(".option").forEach(btn => btn.addEventListener("click", () => answerTenseQuiz(btn.dataset.opt, btn)));
    $("tenseQuizFeedback").className = "feedback";
    $("tenseQuizFeedback").innerHTML = "";
    $("tenseQuizNext").hidden = true;
  }
  function answerTenseQuiz(choice, btn){
    if(tenseQuizAnswered) return;
    tenseQuizAnswered = true;
    const q = tenseQuiz.questions[tenseQuiz.idx];
    const ok = choice === q.answer;
    const box = $("tenseQuizOptions");
    box.querySelectorAll(".option").forEach(b => {
      b.disabled = true;
      if(b.dataset.opt === q.answer) b.classList.add("correct");
      if(b === btn && !ok) b.classList.add("wrong");
    });
    const fb = $("tenseQuizFeedback");
    if(ok){
      tenseQuiz.score++;
      touchToday();
      saveState();
      renderStats();
      fb.className = "feedback ok show";
      fb.innerHTML = "Верно. " + esc(q.explain);
    }else{
      tenseQuiz.mistakes.push({q, chosen:choice});
      touchToday();
      saveState();
      renderStats();
      fb.className = "feedback no show";
      fb.innerHTML = "Правильно: <b>" + esc(q.answer) + "</b>. " + esc(q.explain);
    }
    $("tenseQuizScore").textContent = "Счёт: " + tenseQuiz.score;
    $("tenseQuizNext").hidden = false;
  }
  function nextTenseQuestion(){
    if(!tenseQuizAnswered) return;
    tenseQuiz.idx++;
    if(tenseQuiz.idx >= tenseQuiz.questions.length) renderTenseQuizResult();
    else renderTenseQuestion();
  }
  function renderTenseQuizResult(){
    $("tenseQuizPlay").hidden = true;
    const box = $("tenseQuizResult");
    box.hidden = false;
    const total = tenseQuiz.questions.length;
    const percent = pct(tenseQuiz.score, total);
    const mistakes = tenseQuiz.mistakes.length ? `
      <div class="mistakes"><h3>Разбор ошибок</h3>
        ${tenseQuiz.mistakes.map(m => `<div class="mistake-row"><span class="w">${esc(m.q.answer)}</span><span class="bad">твой ответ: ${esc(m.chosen)}</span><span class="good">${esc(m.q.explain)}</span></div>`).join("")}
      </div>` : "";
    box.innerHTML = `
      <div class="result">
        <div class="score-ring" style="--score:${percent}"><b>${tenseQuiz.score}<small> / ${total}</small></b></div>
        <h2>${percent}%</h2><p>${percent >= 80 ? "Карта времён собрана. Осталось довести до автоматизма." : "Вернись к карте и маркерам, затем пройди тест снова."}</p>
        <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" id="tenseQuizAgain">Ещё раз</button>
          <button class="btn btn-quiet" id="tenseQuizBack">Настроить</button>
        </div>
        ${mistakes}
      </div>`;
    $("tenseQuizAgain").addEventListener("click", startTenseQuiz);
    $("tenseQuizBack").addEventListener("click", () => {
      box.hidden = true;
      $("tenseQuizSetup").hidden = false;
    });
  }
  $("startTenseQuiz")?.addEventListener("click", startTenseQuiz);
  $("tenseQuizNext")?.addEventListener("click", nextTenseQuestion);

  // =================================================================
  // ПЛАНЫ
  // =================================================================
  let activePlan = "12h";
  const planModes = $("planModes");
  const planContent = $("planContent");
  const planCaption = $("planModeCaption");

  function planDoneSet(planId){
    if(!Array.isArray(state.plans[planId])) state.plans[planId] = [];
    return new Set(state.plans[planId]);
  }
  function renderPlan(planId){
    const plan = PLANS.find(p => p.id === planId) || PLANS[0];
    if(!plan || !planContent) return;
    activePlan = plan.id;
    activateSeg(planModes, "plan", plan.id);
    planCaption.textContent = plan.total;
    const done = planDoneSet(plan.id);
    const doneCount = plan.blocks.filter((_, i) => done.has(i)).length;
    const percent = pct(doneCount, plan.blocks.length);
    planContent.innerHTML = `
      <div class="plan-head">
        <div class="plan-head-top">
          <div><span class="plan-badge">${esc(plan.tag)}</span><h2>${esc(plan.title)}</h2><p>${esc(plan.subtitle)}</p></div>
          <span class="tag tag-blue">${esc(plan.total)}</span>
        </div>
        <div class="plan-progress">
          <div class="bar"><div id="planBarFill" style="width:${percent}%"></div></div>
          <span id="planProgressText">${doneCount} / ${plan.blocks.length} блоков</span>
        </div>
      </div>
      <div class="plan-note">${esc(plan.note)}</div>
      <div class="plan-list">
        ${plan.blocks.map((b, i) => `
          <div class="plan-block ${done.has(i) ? "done" : ""}" style="--i:${i}">
            <button class="plan-check ${done.has(i) ? "checked" : ""}" data-plan-index="${i}" aria-label="${done.has(i) ? "Снять отметку" : "Отметить блок"}">✓</button>
            <div>
              <div class="plan-time">${esc(b.time)}</div>
              <div class="plan-title">${esc(b.title)}</div>
              <div class="plan-desc">${esc(b.desc)}</div>
              <div class="plan-tags">${b.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>
            </div>
          </div>`).join("")}
      </div>
      <div class="plan-actions">
        <button class="btn btn-primary btn-small" id="planStartCards">Начать с карточек</button>
        <button class="btn btn-quiet btn-small" id="planReset">Сбросить отметки</button>
      </div>`;
    planContent.querySelectorAll("[data-plan-index]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.planIndex);
        const set = planDoneSet(plan.id);
        if(set.has(idx)) set.delete(idx); else set.add(idx);
        state.plans[plan.id] = [...set];
        saveState();
        btn.classList.toggle("checked", set.has(idx));
        btn.closest(".plan-block").classList.toggle("done", set.has(idx));
        const newCount = plan.blocks.filter((_, i) => set.has(i)).length;
        $("planBarFill").style.width = pct(newCount, plan.blocks.length) + "%";
        $("planProgressText").textContent = newCount + " / " + plan.blocks.length + " блоков";
      });
    });
    $("planStartCards")?.addEventListener("click", () => { go("verbs"); setVerbMode("cards"); });
    $("planReset")?.addEventListener("click", async () => {
      const ok = await askConfirm({
        title:"Сбросить отметки плана?",
        text:"Все галочки этого плана будут сняты. Сам прогресс по глаголам, модальным и временам останется на месте.",
        confirmText:"Сбросить отметки",
        cancelText:"Отмена",
        icon:"↺",
        danger:true
      });
      if(!ok) return;
      state.plans[plan.id] = [];
      saveState();
      renderPlan(plan.id);
    });
  }

  // =================================================================
  // НАВИГАЦИЯ, КЛАВИАТУРА, СБРОС
  // =================================================================
  document.addEventListener("click", e => {
    const target = e.target.closest("[data-goto]");
    if(target) go(target.dataset.goto);
  });

  $("heroCards")?.addEventListener("click", () => { go("verbs"); setVerbMode("cards"); });

  verbModes?.querySelectorAll(".seg").forEach(btn => {
    btn.addEventListener("click", () => setVerbMode(btn.dataset.mode));
  });
  modalModes?.querySelectorAll(".seg").forEach(btn => {
    btn.addEventListener("click", () => setModalMode(btn.dataset.mode));
  });
  tenseModes?.querySelectorAll(".seg").forEach(btn => {
    btn.addEventListener("click", () => setTenseMode(btn.dataset.mode));
  });
  planModes?.querySelectorAll(".seg").forEach(btn => {
    btn.addEventListener("click", () => renderPlan(btn.dataset.plan));
  });

  document.addEventListener("keydown", e => {
    if(dialogOpen()) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if(tag === "input" || tag === "textarea" || tag === "select") return;

    if(activeTab === "verbs" && verbMode === "cards" && !verbDeckEmpty){
      if(e.code === "Space"){ e.preventDefault(); if(!verbRevealed) revealVerbCard(); return; }
      if(verbRevealed && ["1","2","3"].includes(e.key)){ e.preventDefault(); gradeVerb(Number(e.key)-1); return; }
      if(e.key.toLowerCase() === "s"){ speak(verbDeck[verbDeckIndex].i); return; }
    }
    if(activeTab === "verbs" && verbMode === "quiz" && verbQuiz && !$("verbQuizPlay").hidden){
      if(["1","2","3","4"].includes(e.key) && !verbQuizAnswered){
        const btn = document.querySelectorAll("#verbQuizOptions .option")[Number(e.key)-1];
        if(btn) btn.click();
        return;
      }
      if(e.key === "Enter" && verbQuizAnswered){ e.preventDefault(); nextVerbQuestion(); }
    }
    if(activeTab === "verbs" && verbMode === "exam" && verbExam && !$("verbExamPlay").hidden){
      if(e.key === "Enter" && verbExamChecked){ e.preventDefault(); nextVerbExam(); }
    }
    if(activeTab === "modals" && modalMode === "quiz" && modalQuiz && !$("modalQuizPlay").hidden){
      if(["1","2","3","4"].includes(e.key) && !modalQuizAnswered){
        const btn = document.querySelectorAll("#modalQuizOptions .option")[Number(e.key)-1];
        if(btn) btn.click();
        return;
      }
      if(e.key === "Enter" && modalQuizAnswered){ e.preventDefault(); nextModalQuestion(); }
    }
    if(activeTab === "tenses" && tenseMode === "quiz" && tenseQuiz && !$("tenseQuizPlay").hidden){
      if(["1","2","3","4"].includes(e.key) && !tenseQuizAnswered){
        const btn = document.querySelectorAll("#tenseQuizOptions .option")[Number(e.key)-1];
        if(btn) btn.click();
        return;
      }
      if(e.key === "Enter" && tenseQuizAnswered){ e.preventDefault(); nextTenseQuestion(); }
    }
  });

  $("resetBtn")?.addEventListener("click", async () => {
    const ok = await askConfirm({
      title:"Сбросить весь прогресс?",
      text:"Глаголы, модальные, времена и отметки планов вернутся к нулю. Это действие нельзя отменить.",
      confirmText:"Сбросить",
      cancelText:"Оставить",
      icon:"↺",
      danger:true
    });
    if(!ok) return;
    state = emptyState();
    try{ localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(OLD_KEY); }catch(e){}
    saveState();
    renderStats();
    renderVerbTable();
    buildVerbDeck();
    renderModalTable();
    buildModalDeck();
    renderTenseMap();
    renderTenseDetail(selectedTense?.id);
    renderTenseTable();
    renderPlan(activePlan);
  });

  // ── Старт ─────────────────────────────────────────────────────────
  if(!VERBS.length){
    document.body.innerHTML = '<div style="max-width:680px;margin:80px auto;padding:30px;font-family:Arial"><h1>Не загрузился data.js</h1><p>Проверь, что data.js, modals.js, tenses.js, plans.js и app.js лежат рядом с index.html.</p></div>';
    return;
  }

  renderStats();
  renderVerbTable();
  buildVerbDeck();
  renderModalTable();
  buildModalDeck();
  renderTenseMap();
  renderTenseDetail(selectedTense?.id);
  renderTenseTable();
  renderPlan(activePlan);
})();
