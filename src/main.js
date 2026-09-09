// 长安十二时辰 · 剧情引擎
import { scenes, START_SCENE } from './data/scenes.js';
import { characters, hours } from './data/characters.js';
import {
  TRAITS, TRAIT_MAP, CHOICE_TRAITS,
  makeTitle, normalize, matchCharacter, nodeMax,
} from './data/traits.js';
import {
  MBTI_DIMS, MBTI_TYPES, MBTI_CHOICE,
  computeMBTI, mbtiNodeMax, matchMBTICharacter,
} from './data/mbti.js';

// ===== 游戏状态 =====
const state = {
  sceneId: START_SCENE,
  flags: new Set(),
  clues: [],
  choicesMade: 0,
  trust: {},   // { charId: 数值 }
  hoursPassed: [],
  traitRaw: {},   // 人格原始累计分
  traitMax: {},   // 人格可获得上限（用于算达成率）
  mbtiRaw: {},    // MBTI 累计分
  mbtiMax: {},    // MBTI 可获得上限
  ended: false,
};

// 初始化信任 + 人格分
function initTrust() {
  for (const id in characters) {
    state.trust[id] = characters[id].trust ?? 0;
  }
  state.traitRaw = {};
  state.traitMax = {};
  TRAITS.forEach(t => { state.traitRaw[t.key] = 0; state.traitMax[t.key] = 0; });
  state.mbtiRaw = {};
  state.mbtiMax = {};
  MBTI_DIMS.forEach(d => { state.mbtiRaw[d.key] = 0; state.mbtiMax[d.key] = 0; });
}

// ===== DOM 引用 =====
const $ = (s) => document.querySelector(s);
const elScene = $('#scene');
const elClock = $('#clockStrip');
const elView = $('#view');
const elMoment = $('#momentLabel');
const elHourCount = $('#hourCount');
const elChoiceCount = $('#choiceCount');
const elClueList = $('#clueList');
const elPartyList = $('#partyList');
const elChronicle = $('#chronicleList');
const elOverlay = $('#overlay');
const elOverlayTitle = $('#overlayTitle');
const elOverlayBody = $('#overlayBody');
const elOverlayAction = $('#overlayAction');

const HOUR_ORDER = hours.map(h => h.key);

// ===== 渲染：顶栏时辰 =====
function renderClock() {
  const cur = scenes[state.sceneId]?.hour;
  elClock.innerHTML = '';
  hours.forEach(h => {
    const cell = document.createElement('div');
    cell.className = 'clock-cell';
    const idx = HOUR_ORDER.indexOf(h.key);
    const curIdx = HOUR_ORDER.indexOf(cur);
    if (idx < curIdx) cell.classList.add('done');
    if (h.key === cur) cell.classList.add('now');
    cell.textContent = h.name;
    elClock.appendChild(cell);
  });
}

// ===== 渲染：侧栏 =====
function renderSide() {
  const sc = scenes[state.sceneId];
  const hour = hours.find(h => h.key === sc.hour);
  elMoment.textContent = hour ? `${hour.name} · ${hour.label}` : '—';
  elHourCount.textContent = `${state.hoursPassed.length} / 12`;
  elChoiceCount.textContent = state.choicesMade;

  // 当前视角
  const pov = characters[sc.pov];
  if (pov) {
    elView.innerHTML = `
      <div class="view-who">${pov.name}</div>
      <div class="view-desc">${pov.alias}<br>${pov.bio}</div>
    `;
  }

  // 线索
  if (state.clues.length === 0) {
    elClueList.innerHTML = '<div class="empty-hint">尚无线索。</div>';
  } else {
    elClueList.innerHTML = state.clues
      .map(c => `<div class="list-item">${escapeHtml(c)}</div>`).join('');
  }

  // 同路人（按信任度排序，取前 6）
  const party = Object.keys(state.trust)
    .filter(id => characters[id] && !characters[id].isPOV)
    .sort((a, b) => state.trust[b] - state.trust[a])
    .slice(0, 6);
  elPartyList.innerHTML = party.map(id => {
    const c = characters[id];
    const t = state.trust[id];
    return `<div class="list-item relation">
      <strong>${c.name}</strong> <span style="color:var(--muted)">${c.alias}</span><br>
      <span style="font-size:11px;color:var(--muted)">信任 ${t}</span>
    </div>`;
  }).join('');

  // 大事记（已过时辰）
  if (state.hoursPassed.length === 0) {
    elChronicle.innerHTML = '<div class="empty-hint">尚未开始。</div>';
  } else {
    elChronicle.innerHTML = state.hoursPassed
      .map(h => {
        const hour = hours.find(x => x.key === h);
        return `<div class="list-item">${hour ? hour.name : h}</div>`;
      }).join('');
  }
}

// ===== 渲染：场景 =====
function renderScene() {
  const sc = scenes[state.sceneId];
  if (!sc) {
    elScene.innerHTML = `<div class="scene-inner"><p>剧情节点缺失：${state.sceneId}</p></div>`;
    return;
  }

  renderClock();

  const hour = hours.find(h => h.key === sc.hour);
  const pov = characters[sc.pov];

  let html = `<div class="scene-inner">`;
  html += `<div class="act-head">
    <div class="act-hour">${hour ? hour.name + ' · ' + hour.label : ''}</div>
    <div class="act-title">${escapeHtml(sc.place || '')}</div>
  </div>`;

  // 正文：按空行分段
  const paras = sc.text.split('\n\n').filter(p => p.trim());
  html += `<div class="narration">`;
  paras.forEach(p => {
    // 「」内容为对话，标金
    const marked = escapeHtml(p)
      .replace(/「([^」]*)」/g, '<span class="say">「$1」</span>');
    html += `<p>${marked.replace(/\n/g, '<br>')}</p>`;
  });
  html += `</div>`;

  if (sc.ending) {
    html += `<div class="end-tag">${escapeHtml(sc.endTag)}</div>`;
  }

  elScene.innerHTML = html;

  // 抉择/继续按钮
  if (sc.ending) {
    showEnding(sc);
  } else if (sc.choices && sc.choices.length) {
    const box = document.createElement('div');
    box.className = 'choices';
    sc.choices.forEach((ch, i) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      const tag = ch.tag || (ch.trust && Object.values(ch.trust)[0] < 0 ? 'risk' : '');
      btn.innerHTML = `<span class="num">${i + 1}.</span>
        <span>${escapeHtml(ch.t)}</span>
        ${tag ? `<span class="tag ${tag}">${tag === 'risk' ? '风险' : ''}</span>` : ''}`;
      btn.onclick = () => choose(ch, i);
      box.appendChild(btn);
    });
    elScene.querySelector('.scene-inner').appendChild(box);
  }

  elScene.scrollTop = 0;
  renderSide();
}

// ===== 选择 =====
function choose(choice, index) {
  // 记录时辰
  const sc = scenes[state.sceneId];
  if (sc.hour && !state.hoursPassed.includes(sc.hour)) {
    state.hoursPassed.push(sc.hour);
  }
  state.choicesMade++;

  // 累计人格分 + 该节点的可获得上限
  const nodeWeights = CHOICE_TRAITS[state.sceneId] || [];
  const cap = nodeMax(state.sceneId);
  TRAITS.forEach(t => { state.traitMax[t.key] += cap[t.key]; });
  const weights = nodeWeights[index];
  if (weights) {
    for (const k in weights) {
      state.traitRaw[k] = (state.traitRaw[k] ?? 0) + weights[k];
    }
  }

  // 累计 MBTI 分 + 上限
  const mCap = mbtiNodeMax(state.sceneId);
  MBTI_DIMS.forEach(d => { state.mbtiMax[d.key] += mCap[d.key]; });
  const mw = (MBTI_CHOICE[state.sceneId] || [])[index];
  if (mw) {
    for (const k in mw) {
      state.mbtiRaw[k] = (state.mbtiRaw[k] ?? 0) + mw[k];
    }
  }

  if (choice.flag) state.flags.add(choice.flag);
  if (choice.clue && !state.clues.includes(choice.clue)) state.clues.push(choice.clue);
  if (choice.trust) {
    for (const id in choice.trust) {
      state.trust[id] = (state.trust[id] ?? 0) + choice.trust[id];
    }
  }

  if (choice.to && scenes[choice.to]) {
    state.sceneId = choice.to;
    renderScene();
  } else {
    console.warn('无效跳转:', choice.to);
  }
}

// ===== 结局 =====
// ===== MBTI 结果 HTML =====
function buildMBTIHTML() {
  const { type, dims } = computeMBTI(state.mbtiRaw, state.mbtiMax);
  const info = MBTI_TYPES[type] || { name: '未知', title: '', desc: '', who: null };
  // 动态匹配：按四维强度找最相似的书中人物
  const m = matchMBTICharacter(dims, type);
  const who = characters[m.id];
  const who2 = characters[m.second];

  let html = `<div class="mbti-wrap">`;
  // 类型头
  html += `<div class="mbti-head">
    <div class="mbti-label">你的长安人格类型</div>
    <div class="mbti-type">${type}</div>
    <div class="mbti-name">${escapeHtml(info.name)} · <span>${escapeHtml(info.title)}</span></div>
  </div>`;

  // 四维条
  html += `<div class="mbti-dims">`;
  dims.forEach(d => {
    html += `<div class="mbti-dim">
      <div class="mbti-q">${escapeHtml(d.question)}</div>
      <div class="mbti-bar">
        <div class="mbti-side left">
          <span class="mbti-letter ${d.letter === d.left ? 'on' : 'off'}">${d.left}</span>
          <span class="mbti-lname">${d.leftName}</span>
          <span class="mbti-pct">${d.leftPct}%</span>
        </div>
        <div class="mbti-track">
          <div class="mbti-fill" style="width:${d.leftPct}%"></div>
        </div>
        <div class="mbti-side right">
          <span class="mbti-pct">${d.rightPct}%</span>
          <span class="mbti-lname">${d.rightName}</span>
          <span class="mbti-letter ${d.letter === d.right ? 'on' : 'off'}">${d.right}</span>
        </div>
      </div>
      <div class="mbti-desc">${escapeHtml(d.desc)}</div>
    </div>`;
  });
  html += `</div>`;

  // 类型解读
  html += `<div class="mbti-note">
    <strong>${type} · ${escapeHtml(info.name)}</strong><br>
    ${escapeHtml(info.desc)}
  </div>`;

  // 最相似的书中人物（动态匹配）
  if (who) {
    html += `<div class="mbti-match">
      <div class="mbti-match-label">与你最相似的书中人物</div>
      <div class="mbti-match-name">${escapeHtml(who.name)}</div>
      <div class="mbti-match-alias">${escapeHtml(who.alias)}</div>
      <div class="mbti-sim">
        <span class="mbti-sim-tag">契合度 ${m.similarity}%</span>
      </div>
      <div class="mbti-match-bio">${escapeHtml(who.bio)}</div>
      <div class="mbti-match-words">「${escapeHtml(who.words)}」</div>`;
    if (who2 && m.secondSimilarity > 0) {
      html += `<div class="mbti-second">
        次席：${escapeHtml(who2.name)}（${escapeHtml(who2.alias)}）· 契合度 ${m.secondSimilarity}%
      </div>`;
    }
    html += `</div>`;
  }

  html += `<div class="mbti-foot">MBTI 为倾向性描述，非能力判定。本测评基于你在本次剧情中的 ${state.choicesMade} 次抉择，仅供娱乐与自我觉察。</div>`;
  html += `</div>`;
  return html;
}

// ===== 人格画像 HTML =====
function buildPersonalityHTML() {
  const scores = normalize(state.traitRaw, state.traitMax);
  const title = makeTitle(scores);
  const sorted = TRAITS.slice().sort((a, b) => (scores[b.key] || 0) - (scores[a.key] || 0));
  const top = sorted[0];
  const { id: matchId } = matchCharacter(scores);
  const who = characters[matchId];

  let html = `<div class="psy-wrap">`;
  html += `<div class="psy-head">
    <div class="psy-label">你的长安人格</div>
    <div class="psy-title">${escapeHtml(title)}</div>
    <div class="psy-sub">${escapeHtml(top.highDesc)}</div>
  </div>`;

  // 六维条
  html += `<div class="psy-bars">`;
  sorted.forEach(t => {
    const v = scores[t.key] || 0;
    html += `<div class="psy-row">
      <div class="psy-name"><iconify-icon icon="${t.icon}"></iconify-icon> ${t.name}</div>
      <div class="psy-track"><div class="psy-fill" style="width:${v}%"></div></div>
      <div class="psy-val">${v}</div>
    </div>`;
  });
  html += `</div>`;

  // 主导维度解读
  html += `<div class="psy-note">
    <strong>主导特质 · ${escapeHtml(top.name)}</strong>（${escapeHtml(top.desc)}）<br>
    ${escapeHtml(top.highDesc)}
  </div>`;

  // 最相似角色
  if (who) {
    html += `<div class="psy-match">
      <div class="psy-match-label">与你最相似的长安人物</div>
      <div class="psy-match-name">${escapeHtml(who.name)}</div>
      <div class="psy-match-alias">${escapeHtml(who.alias)}</div>
      <div class="psy-match-bio">${escapeHtml(who.bio)}</div>
      <div class="psy-match-words">「${escapeHtml(who.words)}」</div>
    </div>`;
  }

  html += `<div class="psy-foot">
    本测评基于你在本局的 ${state.choicesMade} 次抉择。<br>
    分数含义：在本可以表现该特质的路口中，你实际选择它的比例<br>
    （例：义气 80 = 有 10 次讲义气的机会，你走了 8 次）。<br>
    仅供娱乐与自我觉察，不构成心理诊断。
  </div>`;
  html += `</div>`;
  return html;
}

function showEnding(sc) {
  state.ended = true;
  elOverlay.classList.remove('hidden');
  elOverlayTitle.textContent = '长 安 十 二 时 辰';
  elOverlayBody.innerHTML =
    `<div style="text-align:center;margin-bottom:14px">
      <span class="end-tag">${escapeHtml(sc.endTag)}</span>
    </div>
    ${escapeHtml(sc.text)}
    <div style="margin-top:16px;text-align:center;color:var(--gold);font-style:italic">
      ${escapeHtml(sc.endingText || '')}
    </div>
    ${buildMBTIHTML()}
    <div class="psy-sec-title">长安六维 · 补充画像</div>
    ${buildPersonalityHTML()}`;
  elOverlayAction.textContent = '重新开局';
  elOverlayAction.onclick = restart;
}

// ===== 重开 =====
function restart() {
  state.sceneId = START_SCENE;
  state.flags.clear();
  state.clues = [];
  state.choicesMade = 0;
  state.hoursPassed = [];
  state.ended = false;
  initTrust();
  elOverlay.classList.add('hidden');
  renderScene();
}

// ===== 工具 =====
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== 启动 =====
initTrust();
renderScene();
