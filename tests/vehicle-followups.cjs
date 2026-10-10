const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
for (const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
function element() {
  return { children: [], dataset: {}, style: {}, value: '', classList: { add(){}, remove(){}, toggle(){} },
    append(x){this.children.push(x)}, appendChild(x){this.children.push(x)},
    replaceChildren(){this.children=[]}, setAttribute(k,v){this[k]=v}, focus(){},
    querySelector(){return label} };
}
const label = element();
const els = Object.fromEntries(['vehicleContextRow','inputField','suggestionsWrap','suggestionsBar','btnSend'].map(k=>[k,element()]));
const ctx = vm.createContext({ console, document: {getElementById: id=>els[id],createElement:element,createTextNode:x=>x,querySelectorAll:()=>[]},
  t:(key,vars)=>vars ? key+JSON.stringify(vars) : key,
  renderTokens(){},updateSend(){},restoreQuickReplies(){},
  addToken(text){vm.runInContext('activeTokens.push('+JSON.stringify(text)+')',ctx)},
});
vm.runInContext('let activeTokens=[]; let activeTokenPayloads={};',ctx);
vm.runInContext(html.slice(html.indexOf('let selectedVehicles ='), html.indexOf('// ── tokens ─')),ctx);
const run = code=>vm.runInContext(code,ctx);
run(`const model = vehicleReference({}, 'VW ID.4', true); addVehicleToChat(model); addVehicleToChat(model);`);
assert.equal(run('selectedVehicles.length'),1,'duplicate model is ignored');
assert.equal(run('selectedVehicles[0].details.price'),undefined,'model does not inherit representative listing price');
run(`addVehicleToChat(vehicleReference({_raw:{id:'123'},year:'2024',price:'NOK 350,000'}, 'VW ID.4', false)); renderVehicleFollowups();`);
assert.equal(run('selectedVehicles.length'),2);
assert.equal(els.suggestionsBar.children.at(-1).textContent,'vehicle.compare');
els.suggestionsBar.children.at(-1).onclick();
assert.equal(run('activeTokens[0]'),'vehicle.compare');
els.vehicleContextRow.children[1].children[1].onclick();
assert.equal(run('selectedVehicles.length'),1);
assert.equal(run('activeTokens.length'),0,'removing vehicle clears stale comparison question');
run('renderVehicleFollowups()');
assert.equal(els.suggestionsBar.children.at(-1).textContent,'vehicle.details');
// Exercise the actual send function with a stubbed assistant, capturing API input.
Object.assign(ctx, {
  appendUserMessage:(text,tokens)=>{ctx.visible={text,tokens}},detectMode(){},syncFiltersFromText(){ctx.filterSync=true},
  setDirty(){},autoGrow(){},buildSidebar(){},maybeShowFilterTour(){},appendTypingIndicator(){},showChipsLoading(){},
  getAvailableModelsHint:()=>'',langDirective:()=>'',toApiMessages:x=>x,
  callAssistant:async input=>{ctx.apiInput=input;return {en:'SHOW_INVENTORY: VW ID.4'}},
  pickAIVersion:x=>x.en,parseToolSteps:()=>[],stripToolsBlock:x=>x,removeTypingIndicator(){},loadInventory:async()=>{},
});
vm.runInContext(`let isStreaming=false, conversationMode='shopping', messages=[]; const SYSTEM_PROMPT='test';`,ctx);
vm.runInContext(html.slice(html.indexOf('async function sendMessage()'),html.indexOf('// Build a dual {en, zh}')),ctx);
(async()=>{
  await run('sendMessage()');
  const sent=ctx.apiInput.at(-1).content;
  assert.match(sent,/VW ID.4/);
  assert.match(sent,/Selected vehicles/);
  assert.match(ctx.visible.text,/VW ID.4/);
  assert.equal(ctx.filterSync,undefined,'vehicle context never changes shopping filters');
  assert.equal(run('selectedVehicles.length'),1,'context retained for continued followups');
  run(`selectedVehicles=[]; activeTokens=[]; document.getElementById('inputField').value='My budget is 400000';`);
  await run('sendMessage()');
  assert.equal(ctx.apiInput.at(-1).content,'My budget is 400000');
  assert.equal(ctx.filterSync,true,'ordinary chat keeps filter sync');
  console.log('PASS: script syntax, selection/deduplication, listing identity, follow-up switching, removal, API context, filter isolation and ordinary chat.');
})().catch(e=>{console.error(e);process.exitCode=1});
