const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function setup(ready = async () => true) {
  const calls=[];
  const player={playerName:'Player',avatarIndex:3,gameMode:'old',points:42,answerHistory:[true],setUser(user){this.points=0;this.answerHistory=[];calls.push(['player',user]);}};
  const game={rounds:['old'],currentRoundIndex:9,gameState:'gameover',reset(){this.rounds=[];this.currentRoundIndex=0;this.gameState='starting';calls.push(['reset']);},prepareGame(time){this.rounds=['new'];calls.push(['prepare',time]);}};
  const config={revealTime:15,maxRounds:10,includeUgc:true,ensureUgcReady:ready};
  const dependencies={
    vue:require('vue'),
    'vue-router':{useRouter:()=>({push:async path=>{calls.push(['route',path]);}})},
    '@/stores/player':{usePlayerStore:()=>player},
    '@/stores/config':{useConfigStore:()=>config},
    '@/stores/game':{useGameStore:()=>game},
    '@/stores/survival':{useSurvivalStore:()=>({reset:()=>calls.push(['survival-reset'])})},
    '@/stores/challenge':{useChallengeStore:()=>({clearSession:()=>calls.push(['clear-challenge'])})},
    '@/utils/random':{getRandomUserName:()=> 'Random'}
  };
  const code=ts.transpileModule(fs.readFileSync('src/composables/useSingleplayerStart.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  const module={exports:{}};
  new Function('exports','require',code)(module.exports,id=>dependencies[id]);
  return {...module.exports.useSingleplayerStart(),calls,player,game,config};
}

test('each normal mode resets old state and navigates with its own preparation',async()=>{
 for(const mode of ['classic','gravity','inspect','survival']) {
  const h=setup(); assert.equal(await h.startSingleplayer(mode),true);
  assert.equal(h.player.gameMode,mode); assert.equal(h.player.points,0); assert.deepEqual(h.player.answerHistory,[]);
  assert.equal(h.game.currentRoundIndex,0); assert.equal(h.game.gameState,'starting');
  assert.deepEqual(h.calls.at(-1),['route','/'+mode]);
  assert.equal(h.calls.filter(x=>x[0]==='prepare').length,mode==='survival'?0:1);
  if(mode!=='survival') assert.deepEqual(h.game.rounds,['new']);
  assert.equal(h.config.revealTime,15); assert.equal(h.config.maxRounds,10); assert.equal(h.config.includeUgc,true);
  assert.equal(h.isStarting.value,false);
 }
});

test('failed user art load preserves the result and does not navigate',async()=>{
 const h=setup(async()=>false); assert.equal(await h.startSingleplayer('classic'),false);
 assert.equal(h.player.points,42); assert.deepEqual(h.game.rounds,['old']);assert.deepEqual(h.calls,[]);assert.equal(h.isStarting.value,false);
});

test('pending start rejects double clicks and waits for user art before resetting',async()=>{
 let resolve;const h=setup(()=>new Promise(done=>resolve=done));const first=h.startSingleplayer('gravity');
 assert.equal(h.isStarting.value,true); assert.equal(await h.startSingleplayer('inspect'),false);assert.deepEqual(h.calls,[]);
 resolve(true);await first;assert.deepEqual(h.calls.filter(x=>x[0]==='route'),[['route','/gravity']]);
});

test('daily and challenge modes cannot enter normal singleplayer preparation',async()=>{
 const h=setup();await h.startSingleplayer('daily');assert.deepEqual(h.calls,[['route','/singleplayer']]);assert.equal(h.player.points,42);
});


test('mode selection connects all four tile handlers to the shared starter',async()=>{
 const view=fs.readFileSync('src/views/SinglePlayerView.vue','utf8');
 const script=view.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm,'');
 const calls=[];
 const actions=new Function('computed','useConfigStore','useSurvivalStore','useSingleplayerStart',script+';return [startClassic,startGravity,startInspect,startSurvival];')(
  require('vue').computed,()=>({activePreset:'general'}),()=>({highscore:10}),()=>({startSingleplayer:async mode=>calls.push(mode)})
 );
 for(const action of actions) await action();
 assert.deepEqual(calls,['classic','gravity','inspect','survival']);
});
