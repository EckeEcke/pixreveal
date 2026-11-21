const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { createPinia, setActivePinia } = require('pinia');

function setup() {
  setActivePinia(createPinia());
  const timers = new Map(); let next = 0;
  const sounds = [];
  const game = { gameState: 'feedback', setGameState(state) { this.gameState = state; } };
  const drawings = ['A','B','C','D'].map(name => ({ name, category: 'Gaming', data: [[1,0],[0,1]] }));
  const config = { includeUgc: false, selectedCategories: ['Gaming'] };
  const code = ts.transpileModule(fs.readFileSync('src/stores/survival.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  new Function('exports','require','localStorage',code)(module.exports, id => {
    if (id === 'pinia' || id === 'vue') return require(id);
    if (id.includes('drawings.json')) return { default: drawings };
    if (id === './config') return { useConfigStore: () => config };
    if (id === './sound') return { useSoundStore: () => ({playSound: sound => sounds.push(sound)}) };
    if (id === './game') return { useGameStore: () => game };
    if (id.includes('workerTimers')) return {
      workerSetInterval: fn => { const id = ++next; timers.set(id,fn); return id; },
      workerClearInterval: id => timers.delete(id)
    };
    throw Error(id);
  }, { getItem: () => '10', setItem() {} });
  return { store: module.exports.useSurvivalStore(), timers, game, sounds, drawings };
}

test('reset clears stale survival state and timers while preserving the highscore', () => {
  const h = setup(); h.store.startSurvival();
  h.store.hasAnswered = true; h.store.solvedCount = 4; h.store.timeLeft = 2; h.store.newHighscore = true;
  h.store.reset();
  assert.equal(h.timers.size,0); assert.equal(h.store.currentDrawing,undefined);
  assert.equal(h.store.timeLeft,30); assert.equal(h.store.solvedCount,0);
  assert.equal(h.store.hasAnswered,false); assert.equal(h.store.newHighscore,false);
  assert.equal(h.store.highscore,10); assert.equal(h.store.drawings.length,0);
});

test('restarting creates a drawing with options and exactly one timer without mutating source drawings', () => {
  const h = setup(); h.store.startSurvival(); h.store.hasAnswered = true; h.store.startSurvival();
  assert.equal(h.timers.size,1); assert.equal(h.game.gameState,'revealing');
  assert.equal(h.store.hasAnswered,false); assert.equal(h.store.currentDrawing.options.length,4);
  assert.ok(h.drawings.every(d => !d.options));
  h.store.stop(); assert.equal(h.timers.size,0); assert.equal(h.store.isActive,false);
  assert.ok(h.store.currentDrawing);
});

test('timeout and exhausted pool enter gameover without retaining an old drawing', () => {
  const h = setup(); h.store.startSurvival(); h.store.timeLeft = 1;
  [...h.timers.values()][0]();
  assert.equal(h.store.isGameOver,true); assert.equal(h.timers.size,0);
  h.store.startSurvival(); h.store.drawings=[]; h.store.setNextDrawing();
  assert.equal(h.store.isGameOver,true); assert.equal(h.store.currentDrawing,undefined);
});

test('answer buttons play one feedback sound for correct, incorrect and devil answers', () => {
  const source = fs.readFileSync('src/components/game-ui/AnswerButtons.vue','utf8');
  const handler = source.slice(source.indexOf('const checkAnswer ='), source.indexOf('const handleKeydown ='));
  for (const [isCorrect, devilMode] of [[true,false],[false,false],[true,true]]) {
    const sounds=[];
    const answers=[];
    const check = new Function('props','soundStore','selectedAnswer','devilResult','devilIndex','stopDevilRotation','vibrateError','vibrateSuccess','emit', handler + '; return checkAnswer;')(
      { hasAnswered:false, inputDisabled:false, devilMode },
      { playSound: s => sounds.push(s) }, {value:null},{value:false},{value:0},()=>{},()=>{},()=>{},
      (event, answer) => { if(event==='answered') answers.push(answer); }
    );
    check({isCorrect},null,0);
    assert.deepEqual(sounds,[isCorrect && !devilMode ? 'correct' : 'incorrect']);
    assert.equal(answers.length,1);
    assert.equal(answers[0].isCorrect,isCorrect && !devilMode);
  }
  const h=setup(); h.store.startSurvival(); h.store.handleWrongAnswer();
  assert.equal(h.sounds.length,0); assert.equal(h.store.timeLeft,25);
});
