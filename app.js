// Basit durum makinesi
const state = {
  data: null,
  currentConcept: null,
  currentStage: 1,
  currentTrial: null,
  audioEnabled: true,
  highContrast: false,
  isLocked: false // geri bildirim animasyonu sırasında tıklamayı engelle
};

const dom = {};

function $(id) {
  return document.getElementById(id);
}

function initDomRefs() {
  dom.screenConceptSelect = $('screen-concept-select');
  dom.screenPractice = $('screen-practice');
  dom.conceptList = $('conceptList');
  dom.practiceQuestion = $('practiceQuestion');
  dom.choiceLeft = $('choiceLeft');
  dom.choiceRight = $('choiceRight');
  dom.feedbackText = $('feedbackText');
  dom.practiceMeta = $('practiceMeta');
  dom.metaConceptLabel = $('metaConceptLabel');
  dom.metaStageLabel = $('metaStageLabel');
  dom.settingsButton = $('settingsButton');
  dom.settingsModal = $('settingsModal');
  dom.closeSettings = $('closeSettings');
  dom.toggleAudio = $('toggleAudio');
  dom.toggleHighContrast = $('toggleHighContrast');
  dom.backToConcepts = $('backToConcepts');
}

async function loadData() {
  const res = await fetch('./data/concepts.json');
  state.data = await res.json();
}

function showScreen(name) {
  const isPractice = name === 'practice';
  dom.screenConceptSelect.classList.toggle('active', !isPractice);
  dom.screenPractice.classList.toggle('active', isPractice);
}

function speak(text) {
  if (!state.audioEnabled || !window.speechSynthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'tr-TR';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

function renderConcepts() {
  dom.conceptList.innerHTML = '';
  state.data.concepts.forEach((concept) => {
    const emoji = getConceptEmoji(concept.id);
    const btn = document.createElement('button');
    btn.className = 'concept-card';
    btn.type = 'button';
    btn.innerHTML = `
      <div class="concept-label">
        <span class="concept-emoji">${emoji}</span>
        <span>${concept.label}</span>
      </div>
      <div class="concept-tagline">${concept.questionTemplate}</div>
      <div class="concept-meta">
        <span class="pill">
          <span class="pill-dot"></span>
          <span>${concept.targets.length} görsel</span>
        </span>
        <span>${Object.keys(concept.stages).length} aşama</span>
      </div>
    `;
    btn.addEventListener('click', () => {
      startConcept(concept.id);
    });
    dom.conceptList.appendChild(btn);
  });
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getConceptEmoji(conceptId) {
  switch (conceptId) {
    case 'car':
      return '🚗';
    case 'animal':
      return '🐶';
    case 'fruit':
      return '🍎';
    case 'object':
      return '🪑';
    case 'human':
      return '🧑';
    default:
      return '🔹';
  }
}

function buildTrial(concept, stageId) {
  // Aşama 1–2: hedef sabit, görseller çoklu temsil, çeldirici "easy"
  const targets = concept.targets;
  let distractorsPool = concept.distractors.easy || [];

  if (stageId === 2) {
    // Stage 2: sadece temsil çeşitlenir, çeldirici hâlâ alakasız (easy)
    distractorsPool = concept.distractors.easy || [];
  }

  const target = pickRandom(targets);
  const distractor = pickRandom(distractorsPool);

  // 2 kartın konumunu karıştır
  const leftIsTarget = Math.random() < 0.5;

  const left = leftIsTarget ? { ...target, isTarget: true } : { ...distractor, isTarget: false };
  const right = leftIsTarget ? { ...distractor, isTarget: false } : { ...target, isTarget: true };

  return {
    stage: stageId,
    conceptId: concept.id,
    targetId: target.id,
    left,
    right
  };
}

function getStageLabel(stageId) {
  const stagesMeta = state.data.stages || {};
  const meta = stagesMeta[String(stageId)];
  if (!meta) return `Aşama ${stageId}`;
  return `${meta.id} – ${meta.label.replace('Aşama ', '')}`;
}

function setCardContent(cardEl, item) {
  const emojiEl = cardEl.querySelector('.card-emoji');
  const img = cardEl.querySelector('.card-image');
  const conceptLabel = state.currentConcept ? state.currentConcept.label : '';

  // Hedef görselin kendi emojisi varsa onu kullan, yoksa kavram emojisine düş
  const baseEmoji = getConceptEmoji(state.currentConcept?.id);
  let emoji = item.emoji || baseEmoji;

  if (emojiEl) {
    emojiEl.textContent = emoji;
  }

  // Erişilebilirlik için alt açıklama dursun
  if (img) {
    img.alt = conceptLabel;
    img.src = '';
  }
}

function renderTrial() {
  const { currentConcept, currentTrial } = state;
  if (!currentConcept || !currentTrial) return;

  dom.practiceQuestion.textContent = currentConcept.questionTemplate;
  if (dom.metaConceptLabel) {
    dom.metaConceptLabel.textContent = currentConcept.label;
  }
  if (dom.metaStageLabel) {
    dom.metaStageLabel.textContent = getStageLabel(currentTrial.stage);
  }
  dom.feedbackText.textContent = '';
  dom.feedbackText.className = 'feedback-text';

  dom.choiceLeft.classList.remove('correct', 'incorrect', 'flash');
  dom.choiceRight.classList.remove('correct', 'incorrect', 'flash');

  setCardContent(dom.choiceLeft, currentTrial.left);
  setCardContent(dom.choiceRight, currentTrial.right);
}

function startConcept(conceptId) {
  const concept = state.data.concepts.find((c) => c.id === conceptId);
  state.currentConcept = concept;
  state.currentStage = 1; // v1: Aşama 1-2, 1’den başla
  state.currentTrial = buildTrial(concept, state.currentStage);

  showScreen('practice');
  renderTrial();
}

function scheduleNextTrial(delayMs = 700) {
  window.setTimeout(() => {
    if (!state.currentConcept) return;
    // Stage 1-2 arasında basit dönüşüm: her 3 denemede 1 kere Stage 2
    const random = Math.random();
    state.currentStage = random < 0.33 ? 2 : 1;
    state.currentTrial = buildTrial(state.currentConcept, state.currentStage);
    state.isLocked = false;
    renderTrial();
  }, delayMs);
}

function repeatSameTrial(delayMs = 600) {
  window.setTimeout(() => {
    state.isLocked = false;
    renderTrial();
  }, delayMs);
}

function handleChoice(side) {
  if (state.isLocked || !state.currentTrial) return;
  state.isLocked = true;

  const card =
    side === 'left'
      ? dom.choiceLeft
      : dom.choiceRight;
  const item = side === 'left' ? state.currentTrial.left : state.currentTrial.right;
  const isCorrect = !!item.isTarget;

  const otherCard = side === 'left' ? dom.choiceRight : dom.choiceLeft;

  if (isCorrect) {
    card.classList.add('correct', 'flash');
    otherCard.classList.remove('incorrect', 'flash');
    dom.feedbackText.textContent = `BU ${state.currentConcept.label}`;
    dom.feedbackText.className = 'feedback-text correct';
    speak(state.currentConcept.audio.correct);

    scheduleNextTrial(900);
  } else {
    card.classList.add('incorrect', 'flash');
    dom.feedbackText.textContent = `BU ${state.currentConcept.label} DEĞİL`;
    dom.feedbackText.className = 'feedback-text incorrect';
    speak(state.currentConcept.audio.incorrect);

    // Düzeltme: doğru kartı kısa vurgula, aynı denemeyi tekrar sun
    const correctCard = state.currentTrial.left.isTarget
      ? dom.choiceLeft
      : dom.choiceRight;
    window.setTimeout(() => {
      correctCard.classList.add('correct', 'flash');
      speak(state.currentConcept.audio.correct);
    }, 450);

    repeatSameTrial(1100);
  }
}

function bindEvents() {
  dom.choiceLeft.addEventListener('click', () => handleChoice('left'));
  dom.choiceRight.addEventListener('click', () => handleChoice('right'));

  dom.settingsButton.addEventListener('click', () => {
    dom.settingsModal.classList.add('open');
    dom.settingsModal.setAttribute('aria-hidden', 'false');
  });

  dom.closeSettings.addEventListener('click', () => {
    dom.settingsModal.classList.remove('open');
    dom.settingsModal.setAttribute('aria-hidden', 'true');
  });

  dom.modalBackdropClickHandler = (ev) => {
    if (ev.target === dom.settingsModal || ev.target.classList.contains('modal-backdrop')) {
      dom.settingsModal.classList.remove('open');
      dom.settingsModal.setAttribute('aria-hidden', 'true');
    }
  };
  dom.settingsModal.addEventListener('click', dom.modalBackdropClickHandler);

  dom.toggleAudio.addEventListener('change', (e) => {
    state.audioEnabled = e.target.checked;
  });

  dom.toggleHighContrast.addEventListener('change', (e) => {
    state.highContrast = e.target.checked;
    document.body.classList.toggle('high-contrast', state.highContrast);
  });

  dom.backToConcepts.addEventListener('click', () => {
    state.currentConcept = null;
    state.currentTrial = null;
    state.isLocked = false;
    showScreen('conceptSelect');
  });
}

async function bootstrap() {
  initDomRefs();
  await loadData();
  renderConcepts();
  bindEvents();
}

window.addEventListener('DOMContentLoaded', bootstrap);


