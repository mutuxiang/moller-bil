const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html','utf8');
const source = html.slice(html.indexOf('  let _v2RecsSnapshot = null;'), html.indexOf('  // ── Loading shimmer lifecycle'));
function harness() {
  let loading;
  const children=[];
  const panel={
    value:'recommendations',
    get innerHTML(){return this.value},
    set innerHTML(value){this.value=value; children.length=0; loading=value.includes('v2-inv-loading')?{remove(){loading=null},setAttribute(){}}:null},
    querySelector(selector){return selector === '.v2-inv-loading' ? loading : panel},appendChild(el){children.push(el)},
  };
  const context=vm.createContext({window:{},document:{querySelector:()=>panel,createElement:()=>({children:[],appendChild(el){this.children.push(el)},replaceChildren(){this.children=[]},setAttribute(){}})},
    inventoryLoaded:true, inventoryLoadPromise:null, matchInventory:()=>Array.from({length:7},(_,id)=>({id})),
    apiCarToItem:car=>car,generateEdge:()=>'',v2BuildInvCard:it=>({it}),
    t:(key,args)=>key === 'inventory.page' ? args.page+' / '+args.pages : key,escapeHtml:x=>x,v2RenderLiveRecsAsInv(){panel.innerHTML='recommendations'},
    // Unresolved timeout: races are settled explicitly by the test's deferred promise.
    setTimeout(){},
  });
  vm.runInContext(source,context);
  return {context,panel,children,get loading(){return loading}};
}
(async()=>{
  const h=harness();
  await h.context.window.v2OpenInventoryInDock('VW ID.4');
  assert.equal(h.children[1].children.length,3);
  const [prev,status,next]=h.children[0].children;
  assert.equal(prev.disabled,true);
  assert.equal(status.textContent,'1 / 3');
  next.onclick(); assert.equal(h.children[1].children[0].it.id,3);
  next.onclick(); assert.equal(h.children[1].children.length,1);
  assert.equal(next.disabled,true);
  assert.equal(status.textContent,'3 / 3');
  prev.onclick(); assert.equal(h.children[1].children.length,3);
  assert.equal(h.loading,null);
  h.context.window.v2CloseInventoryInDock();
  assert.equal(h.panel.innerHTML,'recommendations');
  await h.context.window.v2OpenInventoryInDock('Audi Q4 e-tron');
  assert.equal(h.children[1].children.length,3,'reopening builds fresh cards');
  const bad=harness();
  bad.context.v2BuildInvCard=()=>{throw new Error('render failure')};
  await bad.context.window.v2OpenInventoryInDock('VW ID.4');
  assert.equal(bad.loading.textContent,'v2.loadFail','render error stays visible instead of a blank panel');
  const slow=harness();
  let release;
  slow.context.inventoryLoaded=false;
  slow.context.inventoryLoadPromise=new Promise(resolve=>{release=resolve});
  const first=slow.context.window.v2OpenInventoryInDock('VW ID.4');
  slow.context.window.v2CloseInventoryInDock();
  release();await first;
  assert.equal(slow.panel.innerHTML,'recommendations','late inventory must not replace recommendations');
  assert.equal(slow.children.length,0);
  const switched=harness();
  let finish;
  switched.context.inventoryLoaded=false;
  switched.context.inventoryLoadPromise=new Promise(resolve=>{finish=resolve});
  const old=switched.context.window.v2OpenInventoryInDock('VW ID.4');
  const latest=switched.context.window.v2OpenInventoryInDock('Audi Q4 e-tron');
  finish();await Promise.all([old,latest]);
  assert.equal(switched.children.length,2,'only the newest request renders navigation and grid');
  assert.match(switched.panel.innerHTML,/Audi Q4 e-tron/);
  switched.context.window.v2CloseInventoryInDock();
  assert.equal(switched.panel.innerHTML,'recommendations','snapshot is never overwritten by loading UI');
  console.log('PASS: inventory open/reopen, visible render errors, cancelled requests, and rapid model switching.');
})().catch(e=>{console.error(e);process.exitCode=1});
