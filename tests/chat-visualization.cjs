const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');

function element() {
  const classes = new Set();
  return {
    nodeType: 1, children: [], dataset: {}, style: {}, value: '',
    classList: {
      add: (...xs) => xs.forEach(x => classes.add(x)),
      remove: (...xs) => xs.forEach(x => classes.delete(x)),
      contains: x => classes.has(x),
    },
    set innerHTML(value) { this.markup = value; this.children = []; },
    get innerHTML() { return this.markup || ''; },
    appendChild(child) {
      if (child.parentNode) child.parentNode.children = child.parentNode.children.filter(x => x !== child);
      child.parentNode = this;
      this.children.push(child);
    },
    querySelector(selector) {
      for (const child of this.children) {
        if (selector.split(',').some(s => s.trim() === '.' + child.className)) return child;
        const nested = child.querySelector(selector);
        if (nested) return nested;
      }
      return null;
    },
    querySelectorAll() { return []; },
  };
}
const els = Object.fromEntries(['inputField', 'btnSend', 'stream', 'suggestionsBar', 'suggestionsWrap', 'v2VizBody'].map(id => [id, element()]));
const label = element();
els.suggestionsWrap.querySelector = () => label;
const callbacks = [];
const errors = [];
let reply = '';
const ctx = vm.createContext({
  console: { error: (...args) => errors.push(args) },
  document: { getElementById: id => els[id] || null, createElement: element },
  t: key => key, escapeHtml: value => String(value),
  appendUserMessage() {}, detectMode() {}, syncFiltersFromText() {}, setDirty() {},
  autoGrow() {}, renderTokens() {}, buildSidebar() {}, updateSend() {}, maybeShowFilterTour() {},
  appendTypingIndicator() {}, removeTypingIndicator() {}, getAvailableModelsHint: () => '',
  langDirective: () => '', toApiMessages: x => x, callAssistant: async () => ({ en: reply }),
  pickAIVersion: x => x.en, parseToolSteps: () => [], stripToolsBlock: x => x,
  runToolStrip: async () => {}, parseRecs: () => null, parseEVSurprises: () => null,
  parseSuggestions: text => ({ cleanText: text, suggestions: ['Choice A', 'Choice B'] }),
  cleanAssistantText: x => x, applyTopicCondense: x => x,
  condenseForCardTopic: x => x, stripTrailingList: x => x,
  appendAIMessage(text, done) {
    const content = element();
    content.className = 'msg-content';
    const msg = element();
    msg.id = 'reply';
    msg.appendChild(content);
    callbacks.push(() => done(msg));
    return msg;
  },
  renderFuelCards(msg) { msg.fuelRendered = true; },
  v2UpdateVizTitle: kind => { ctx.vizTitle = kind; },
  v2KindToLocal: x => x,
});
const run = source => vm.runInContext(source, ctx);
const load = (start, end) => run(html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start))));
run(`let selectedVehicles=[], activeTokens=[], activeTokenPayloads={};
  let pendingManualChange=false, isStreaming=false, conversationMode='shopping', messages=[];
  const SYSTEM_PROMPT='test';`);
load('function detectMessageTopic(', '// Per-topic tooltip');
load('let lastSuggestions =', 'function getQuickReplyPayload(');
load('function showChipsLoading()', '// ── tool steps');
load('const BUDGET_TIERS =', '// ── Size visualization');
load('function carSideSvgPath(', '// Shared scene geometry');
load('async function sendMessage()', '// Build a dual {en, zh}');
load('  function relocateLatest(', '  // Translate the internal viz kind');
// Exercise the same relocation used by the browser wrapper with real budget markup.
run(`const renderBudgetInline = renderBudgetCards;
  renderBudgetCards = function(msg) {
    renderBudgetInline(msg);
    relocateLatest('.budget-panel, .budget-cards', msg, 'Budget tiers');
  };`);

assert.equal(ctx.detectMessageTopic('纯电适合通勤。\n\n你的预算是多少？'), 'budget');
assert.equal(run(`detectMessageTopic('What is your budget for an electric car?')`), 'budget');
assert.equal(run(`detectVisualizationTopic('How much should I budget?', 'Which fuel do you prefer?')`), 'budget');
assert.equal(run(`detectVisualizationTopic('我想了解预算', '你偏好哪种动力？')`), 'budget');
assert.equal(run(`detectVisualizationTopic('My budget is 400000', 'Which fuel do you prefer?')`), 'fuel');

async function turn(user, ai) {
  els.inputField.value = user;
  reply = ai;
  await run('sendMessage()');
  assert.ok(label.classList.contains('is-loading'));
  // Typewriter completion occurs after sendMessage's try/finally has returned.
  assert.equal(callbacks.length, 1);
  callbacks.shift()();
  assert.equal(label.classList.contains('is-loading'), false);
  assert.deepEqual(els.suggestionsBar.children.map(x => x.textContent), ['Choice A', 'Choice B']);
}

(async () => {
  await turn('I need a car', 'Which fuel do you prefer?');
  await turn('Electric', 'What is your budget?');
  assert.equal(errors.length, 0, errors.map(args => args.join(' ')).join('\n'));
  assert.equal(ctx.vizTitle, 'Budget tiers');
  const panel = els.v2VizBody.children[0];
  assert.equal(panel.className, 'budget-panel');
  assert.equal((panel.innerHTML.match(/class="budget-card(?: accent)?"/g) || []).length, 3);
  assert.match(panel.innerHTML, /5–7 yr/);
  assert.match(panel.innerHTML, /attr.age/);
  assert.equal(errors.length, 0);
  await turn('How much should I budget?', 'Budget options vary. Which fuel do you prefer?');
  assert.equal(ctx.vizTitle, 'Budget tiers');
  await turn('我想了解预算', '可以看看不同价位。你偏好哪种动力？');
  assert.equal(ctx.vizTitle, 'Budget tiers');
  // A future visualization failure must still finish the quick reply lifecycle.
  run(`renderBudgetCards = () => { throw new Error('Simulated card failure'); };`);
  await turn('Tell me about budget', 'What is your budget?');
  assert.equal(errors.length, 1);
  console.log('PASS: consecutive replies, real budget cards and dock relocation, bilingual budget inquiries, topic progression and rendering failure recovery.');
})().catch(error => { console.error(error); process.exitCode = 1; });
