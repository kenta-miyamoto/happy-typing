const PRESET_INDEX = "presets/index.json";
const QUESTION_COUNT = 10;

const kanaMap = {
  "あ": ["a"], "い": ["i"], "う": ["u"], "え": ["e"], "お": ["o"],
  "か": ["ka"], "き": ["ki"], "く": ["ku"], "け": ["ke"], "こ": ["ko"],
  "さ": ["sa"], "し": ["si", "shi"], "す": ["su"], "せ": ["se"], "そ": ["so"],
  "た": ["ta"], "ち": ["ti", "chi"], "つ": ["tu", "tsu"], "て": ["te"], "と": ["to"],
  "な": ["na"], "に": ["ni"], "ぬ": ["nu"], "ね": ["ne"], "の": ["no"],
  "は": ["ha"], "ひ": ["hi"], "ふ": ["hu", "fu"], "へ": ["he"], "ほ": ["ho"],
  "ま": ["ma"], "み": ["mi"], "む": ["mu"], "め": ["me"], "も": ["mo"],
  "や": ["ya"], "ゆ": ["yu"], "よ": ["yo"],
  "ら": ["ra"], "り": ["ri"], "る": ["ru"], "れ": ["re"], "ろ": ["ro"],
  "わ": ["wa"], "を": ["wo", "o"], "ん": ["n", "nn", "n'"],
  "が": ["ga"], "ぎ": ["gi"], "ぐ": ["gu"], "げ": ["ge"], "ご": ["go"],
  "ざ": ["za"], "じ": ["zi", "ji"], "ず": ["zu", "du"], "ぜ": ["ze"], "ぞ": ["zo"],
  "だ": ["da"], "ぢ": ["di", "ji"], "づ": ["du", "zu"], "で": ["de"], "ど": ["do"],
  "ば": ["ba"], "び": ["bi"], "ぶ": ["bu"], "べ": ["be"], "ぼ": ["bo"],
  "ぱ": ["pa"], "ぴ": ["pi"], "ぷ": ["pu"], "ぺ": ["pe"], "ぽ": ["po"],
  "ぁ": ["xa", "la"], "ぃ": ["xi", "li"], "ぅ": ["xu", "lu"], "ぇ": ["xe", "le"], "ぉ": ["xo", "lo"],
  "ゃ": ["xya", "lya"], "ゅ": ["xyu", "lyu"], "ょ": ["xyo", "lyo"], "っ": ["xtu", "ltu"],
  "ー": ["-"], " ": [" "], "　": [" "],
  "、": [","], "。": ["."], "！": ["!"], "？": ["?"], "・": ["/"]
};

const digraphMap = {
  "きゃ": ["kya"], "きゅ": ["kyu"], "きょ": ["kyo"],
  "しゃ": ["sya", "sha"], "しゅ": ["syu", "shu"], "しょ": ["syo", "sho"],
  "ちゃ": ["tya", "cha"], "ちゅ": ["tyu", "chu"], "ちょ": ["tyo", "cho"],
  "にゃ": ["nya"], "にゅ": ["nyu"], "にょ": ["nyo"],
  "ひゃ": ["hya"], "ひゅ": ["hyu"], "ひょ": ["hyo"],
  "みゃ": ["mya"], "みゅ": ["myu"], "みょ": ["myo"],
  "りゃ": ["rya"], "りゅ": ["ryu"], "りょ": ["ryo"],
  "ぎゃ": ["gya"], "ぎゅ": ["gyu"], "ぎょ": ["gyo"],
  "じゃ": ["zya", "jya", "ja"], "じゅ": ["zyu", "jyu", "ju"], "じょ": ["zyo", "jyo", "jo"],
  "ぢゃ": ["dya", "jya", "ja"], "ぢゅ": ["dyu", "jyu", "ju"], "ぢょ": ["dyo", "jyo", "jo"],
  "びゃ": ["bya"], "びゅ": ["byu"], "びょ": ["byo"],
  "ぴゃ": ["pya"], "ぴゅ": ["pyu"], "ぴょ": ["pyo"],
  "ふぁ": ["fa"], "ふぃ": ["fi"], "ふぇ": ["fe"], "ふぉ": ["fo"],
  "てぃ": ["ti", "thi"], "でぃ": ["di", "dhi"],
  "うぁ": ["wha"], "うぃ": ["wi", "whi"], "うぇ": ["we", "whe"], "うぉ": ["who"]
};

const state = {
  presets: [],
  currentPreset: null,
  questions: [],
  questionIndex: 0,
  typed: "",
  activeCandidates: [],
  guide: "",
  missedItems: new Map(),
  hasMissForCurrent: false,
  typedCount: 0,
  retryMode: false,
  isWaiting: false,
  startedAt: 0,
  elapsedMs: 0,
  timerId: null,
  soundEnabled: true,
  audioContext: null
};

const elements = {
  soundToggle: document.querySelector("#soundToggle"),
  soundIcon: document.querySelector("#soundIcon"),
  presetView: document.querySelector("#presetView"),
  playView: document.querySelector("#playView"),
  resultView: document.querySelector("#resultView"),
  presetList: document.querySelector("#presetList"),
  backToPresets: document.querySelector("#backToPresets"),
  progressLabel: document.querySelector("#progressLabel"),
  progressFill: document.querySelector("#progressFill"),
  playStage: document.querySelector("#playStage"),
  modeLabel: document.querySelector("#modeLabel"),
  readyPanel: document.querySelector("#readyPanel"),
  typingPanel: document.querySelector("#typingPanel"),
  kanaText: document.querySelector("#kanaText"),
  playTitle: document.querySelector("#playTitle"),
  romajiLine: document.querySelector("#romajiLine"),
  feedbackText: document.querySelector("#feedbackText"),
  timeCount: document.querySelector("#timeCount"),
  missCount: document.querySelector("#missCount"),
  typedCount: document.querySelector("#typedCount"),
  resultPresetName: document.querySelector("#resultPresetName"),
  totalResult: document.querySelector("#totalResult"),
  clearResult: document.querySelector("#clearResult"),
  missResult: document.querySelector("#missResult"),
  timeResult: document.querySelector("#timeResult"),
  speedResult: document.querySelector("#speedResult"),
  missList: document.querySelector("#missList"),
  retryButton: document.querySelector("#retryButton"),
  resultToPresets: document.querySelector("#resultToPresets"),
  logoToPresets: document.querySelector("#logoToPresets")
};

async function init() {
  bindEvents();
  await loadPresets();
  renderPresetList();
  updateSoundButton();
}

function bindEvents() {
  elements.soundToggle.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    updateSoundButton();
  });

  elements.backToPresets.addEventListener("click", showPresetView);
  elements.resultToPresets.addEventListener("click", showPresetView);
  elements.logoToPresets.addEventListener("click", showPresetView);
  elements.retryButton.addEventListener("click", retryMissedItems);

  document.addEventListener("keydown", handleKeydown);
  elements.playStage.addEventListener("click", () => elements.playStage.focus());
}

async function loadPresets() {
  const indexResponse = await fetch(PRESET_INDEX);
  if (!indexResponse.ok) {
    throw new Error("プリセット一覧を読み込めませんでした。");
  }

  const presetIndex = await indexResponse.json();
  const presetFiles = await Promise.all(
    presetIndex.presets.map(async (presetPath) => {
      const response = await fetch(presetPath);
      if (!response.ok) {
        throw new Error(`${presetPath} を読み込めませんでした。`);
      }
      return response.json();
    })
  );

  state.presets = presetFiles;
}

function renderPresetList() {
  elements.presetList.innerHTML = "";

  state.presets.forEach((preset) => {
    const card = document.createElement("button");
    card.className = "preset-card";
    card.type = "button";
    card.innerHTML = `
      <span class="preset-count">${preset.items.length} words</span>
      <strong>${escapeHtml(preset.title)}</strong>
      <span>${escapeHtml(preset.description)}</span>
    `;
    card.addEventListener("click", () => startPreset(preset));
    elements.presetList.append(card);
  });
}

function startPreset(preset) {
  state.currentPreset = preset;
  state.questions = shuffle(preset.items).slice(0, QUESTION_COUNT);
  state.questionIndex = 0;
  state.missedItems = new Map();
  state.typedCount = 0;
  state.retryMode = false;
  resetTimer();
  showWaitingScreen();
  showView(elements.playView);
}

function retryMissedItems() {
  state.questions = Array.from(state.missedItems.values());
  state.questionIndex = 0;
  state.missedItems = new Map();
  state.typedCount = 0;
  state.retryMode = true;
  resetTimer();
  showWaitingScreen();
  showView(elements.playView);
}

function startQuestion() {
  const item = getCurrentItem();
  state.typed = "";
  state.activeCandidates = buildRomajiCandidates(item.kana);
  state.guide = chooseGuide(state.activeCandidates, state.typed);
  state.hasMissForCurrent = false;
  renderPlay();
  requestAnimationFrame(() => elements.playStage.focus());
}

function handleKeydown(event) {
  if (!elements.playView.classList.contains("is-active")) {
    return;
  }

  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    restartCurrentRun();
    return;
  }

  if (state.isWaiting) {
    if (event.code === "Space") {
      event.preventDefault();
      unlockAudio();
      startTimer();
      startQuestion();
    }
    return;
  }

  if (event.key.length !== 1) {
    return;
  }

  event.preventDefault();
  unlockAudio();

  const nextTyped = state.typed + event.key.toLowerCase();
  const nextCandidates = state.activeCandidates.filter((candidate) => candidate.startsWith(nextTyped));

  if (nextCandidates.length === 0) {
    registerMiss();
    playTone("miss");
    renderPlay(true);
    return;
  }

  state.typed = nextTyped;
  state.activeCandidates = nextCandidates;
  state.guide = chooseGuide(nextCandidates, state.typed);
  state.typedCount += 1;
  playTone("type");

  const complete = nextCandidates.some((candidate) => candidate === state.typed);
  if (complete) {
    finishQuestion();
    return;
  }

  renderPlay();
}

function registerMiss() {
  const item = getCurrentItem();
  state.hasMissForCurrent = true;
  state.missedItems.set(item.text, item);
}

function finishQuestion() {
  state.questionIndex += 1;

  if (state.questionIndex >= state.questions.length) {
    showResult();
    return;
  }

  startQuestion();
}

function showWaitingScreen() {
  state.isWaiting = true;
  state.typed = "";
  state.activeCandidates = [];
  state.guide = "";
  state.hasMissForCurrent = false;
  renderWaiting();
  requestAnimationFrame(() => elements.playStage.focus());
}

function restartCurrentRun() {
  if (!state.currentPreset || state.questions.length === 0) {
    return;
  }

  state.questionIndex = 0;
  state.missedItems = new Map();
  state.typedCount = 0;
  resetTimer();
  showWaitingScreen();
}

function renderWaiting() {
  const total = state.questions.length;

  elements.modeLabel.textContent = state.retryMode ? "再挑戦" : state.currentPreset.title;
  elements.progressLabel.textContent = `0 / ${total}`;
  elements.progressFill.style.width = "0%";
  elements.missCount.textContent = "0";
  elements.typedCount.textContent = String(state.typedCount);
  renderTimer();
  elements.readyPanel.hidden = false;
  elements.typingPanel.hidden = true;
}

function renderPlay(error = false) {
  const item = getCurrentItem();
  const total = state.questions.length;
  const current = state.questionIndex + 1;

  state.isWaiting = false;
  elements.readyPanel.hidden = true;
  elements.typingPanel.hidden = false;
  elements.modeLabel.textContent = state.retryMode ? "再挑戦" : state.currentPreset.title;
  elements.kanaText.textContent = item.kana;
  elements.playTitle.textContent = item.text;
  elements.progressLabel.textContent = `${current} / ${total}`;
  elements.progressFill.style.width = `${((current - 1) / total) * 100}%`;
  elements.missCount.textContent = String(state.missedItems.size);
  elements.typedCount.textContent = String(state.typedCount);
  renderTimer();
  elements.feedbackText.textContent = error ? "ミスタイプ" : "";

  renderRomajiLine(error);
}

function renderRomajiLine(error = false) {
  elements.romajiLine.innerHTML = "";

  Array.from(state.guide).forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "␠" : char;

    if (index < state.typed.length) {
      span.className = "char is-done";
    } else if (index === state.typed.length) {
      span.className = error ? "char is-current is-error" : "char is-current";
    } else {
      span.className = "char";
    }

    elements.romajiLine.append(span);
  });
}

function showResult() {
  stopTimer();
  const total = state.questions.length;
  const missed = Array.from(state.missedItems.values());
  const cleared = total - missed.length;
  const elapsedSeconds = state.elapsedMs / 1000;
  const speed = elapsedSeconds > 0 ? state.typedCount / elapsedSeconds : 0;

  elements.resultPresetName.textContent = state.currentPreset.title;
  elements.totalResult.textContent = String(total);
  elements.clearResult.textContent = String(cleared);
  elements.missResult.textContent = String(missed.length);
  elements.timeResult.textContent = formatTime(state.elapsedMs);
  elements.speedResult.textContent = speed.toFixed(2);
  elements.retryButton.hidden = missed.length === 0;

  elements.missList.innerHTML = "";
  if (missed.length === 0) {
    const li = document.createElement("li");
    li.className = "miss-empty";
    li.textContent = "ミスタイプはありません。";
    elements.missList.append(li);
  } else {
    missed.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${escapeHtml(item.text)}</strong><span>${escapeHtml(chooseGuide(buildRomajiCandidates(item.kana), ""))}</span>`;
      elements.missList.append(li);
    });
  }

  showView(elements.resultView);
}

function showPresetView() {
  resetTimer();
  state.currentPreset = null;
  showView(elements.presetView);
}

function showView(activeView) {
  [elements.presetView, elements.playView, elements.resultView].forEach((view) => {
    view.classList.toggle("is-active", view === activeView);
  });
}

function getCurrentItem() {
  return state.questions[state.questionIndex];
}

function startTimer() {
  stopTimer();
  state.startedAt = performance.now();
  state.elapsedMs = 0;
  renderTimer();
  state.timerId = window.setInterval(() => {
    state.elapsedMs = performance.now() - state.startedAt;
    renderTimer();
  }, 100);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }

  if (state.startedAt) {
    state.elapsedMs = performance.now() - state.startedAt;
  }
}

function resetTimer() {
  stopTimer();
  state.startedAt = 0;
  state.elapsedMs = 0;
  renderTimer();
}

function renderTimer() {
  elements.timeCount.textContent = formatTime(state.elapsedMs);
}

function formatTime(milliseconds) {
  return (milliseconds / 1000).toFixed(1);
}

function buildRomajiCandidates(kana) {
  const segments = tokenizeKana(kana);
  const candidates = expandSegments(segments);
  return Array.from(new Set(candidates));
}

function tokenizeKana(kana) {
  const chars = Array.from(kana);
  const segments = [];

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    const next = chars[index + 1] || "";
    const pair = char + next;

    if (char === "っ") {
      const nextPair = next + (chars[index + 2] || "");
      const nextOptions = digraphMap[nextPair] || kanaMap[next] || [];
      const doubled = nextOptions
        .map((option) => option[0])
        .filter((letter) => /[bcdfghjklmnpqrstvwxyz]/.test(letter));
      segments.push(Array.from(new Set([...doubled, "xtu", "ltu"])));
      continue;
    }

    if (digraphMap[pair]) {
      segments.push(digraphMap[pair]);
      index += 1;
      continue;
    }

    if (char === "ん") {
      segments.push(getNOptions(next));
      continue;
    }

    if (kanaMap[char]) {
      segments.push(kanaMap[char]);
      continue;
    }

    segments.push([char.toLowerCase()]);
  }

  return segments;
}

function expandSegments(segments) {
  return segments.reduce((results, options) => {
    const nextResults = [];
    results.forEach((result) => {
      options.forEach((option) => {
        nextResults.push(result + option);
      });
    });
    return nextResults;
  }, [""]);
}

function chooseGuide(candidates, typed) {
  const exactPrefix = candidates.filter((candidate) => candidate.startsWith(typed));
  const source = exactPrefix.length > 0 ? exactPrefix : candidates;
  return source[0] || "";
}

function getNOptions(nextKana) {
  const nextOptions = digraphMap[nextKana] || kanaMap[nextKana] || [];
  const nextRomaji = nextOptions[0] || "";
  const needsDisambiguation = /^[aiueoyn]/.test(nextRomaji);
  return needsDisambiguation ? ["nn", "n'"] : ["n", "nn"];
}

function shuffle(items) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function unlockAudio() {
  if (!state.soundEnabled || state.audioContext) {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    state.audioContext = new AudioContext();
  }
}

function playTone(type) {
  if (!state.soundEnabled) {
    return;
  }

  unlockAudio();
  const context = state.audioContext;
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = type === "miss" ? "square" : "sine";
  oscillator.frequency.value = type === "miss" ? 140 : 520;
  gain.gain.setValueAtTime(type === "miss" ? 0.06 : 0.035, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.08);
}

function updateSoundButton() {
  elements.soundIcon.textContent = state.soundEnabled ? "♪" : "×";
  elements.soundToggle.classList.toggle("is-muted", !state.soundEnabled);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init().catch((error) => {
  elements.presetList.innerHTML = `<p class="error-message">${escapeHtml(error.message)}</p>`;
});
