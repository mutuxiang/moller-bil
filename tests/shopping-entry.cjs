const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const ctx = vm.createContext({ showLearningLocked(){ ctx.locked = (ctx.locked || 0) + 1; }, applyConversationMode(){}, document:{querySelector(){throw new Error('Blocked learning entry must not start onboarding');}} });
vm.runInContext("let conversationMode='shopping';", ctx);
vm.runInContext(html.slice(html.indexOf('function detectMode('), html.indexOf('function applyConversationMode(')), ctx);
vm.runInContext(html.slice(html.indexOf('function onboardingChoose('), html.indexOf('function makeOnboardingSteps(')), ctx);
// The entry guard prevents any transition or DOM access.
vm.runInContext("onboardingChoose('learning')", ctx);
assert.equal(ctx.locked, 1);
for (const text of ['just learning', 'teach me about cars', 'find me a car']) {
  vm.runInContext('detectMode('+JSON.stringify(text)+')', ctx);
  assert.equal(vm.runInContext('conversationMode',ctx),'shopping');
}
console.log('PASS: learning entry is blocked and car questions remain in shopping mode.');
