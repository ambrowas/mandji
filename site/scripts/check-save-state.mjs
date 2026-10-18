import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const storage = seed => {
  const values = new Map(Object.entries(seed));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    key: index => [...values.keys()][index] ?? null,
    get length() { return values.size; },
    snapshot: () => Object.fromEntries(values),
  };
};
const thirdChapter = ['mandji-search3-v1', 'mandji-cultural-trail-v1', 'mandji-bata-map-v1', 'mandji-travel-bata-v1', 'mandji-scene3-v1'];
const campaign = ['mandji-scene4-v1','mandji-scene2-v1', 'mandji-plan-v1', 'mandji-leader-v1', 'mandji-map-puzzle-v1', 'mandji-email-v1', 'mandji-riddles-v1', 'mandji-photo-puzzle-v2', 'mandji-active-minutes-v2', 'mandji-fictional-hours-v3', 'mandji-mission-deadline-v1', 'mandji-exhibition-v1', 'mandji-pauses-scene-1', 'mandji-pauses-scene-2', ...thirdChapter];
const seed = Object.fromEntries(campaign.map(key => [key, '{"complete":true,"stage":3,"paid":true}']));
seed['mandji-scene4-v1']=JSON.stringify({complete:true,interview:{started:true,evidence:true,completed:true,privacy:'reservada',answers:{vio:'directa'}}});
seed['mandji-leader-v1'] = '{"id":"adrian","budget":19100}';
seed['mandji-collection-v1'] = JSON.stringify({clues: [{id:'one',mission:1},{id:'three',mission:3}],objects:[{id:'kit-linterna'}]});
const preferences = {'mandji-music':'{"enabled":false}', 'mandji-effects':'{"volume":0.2}', 'other-app':'keep'};

const game = fs.readFileSync(new URL('../jugar.js', import.meta.url), 'utf8');
const restart = game.slice(game.indexOf('function restartMission()'), game.indexOf("document.querySelector('[data-game-restart]')"));
for (const confirmed of [false, true]) {
  const real = storage({...seed,...preferences});
  const before = real.snapshot();
  const context = {window:{mandjiStorage:real,confirm:()=>confirmed,location:{}},pauseMissionTimer(){},resumeMissionTimer(){},missionTimerStarted:true,missionLastTick:100};
  vm.runInNewContext(restart+';restartMission();',context);
  if (!confirmed) assert.deepEqual(real.snapshot(),before,'Cancelar debe conservar toda la partida');
  else {
    assert.deepEqual(real.snapshot(),preferences,'Reiniciar debe borrar la campaña, conservar preferencias y datos ajenos');
    assert.equal(context.window.location.href,'./jugar.html');
  }
}

const replayScript = fs.readFileSync(new URL('../replay-state.js', import.meta.url), 'utf8');
for (const mission of [2,3,4]) {
  const real=storage({...seed,...preferences}), session=storage({});
  const before=real.snapshot();
  const context={window:{localStorage:real,addEventListener(){}},sessionStorage:session,location:{pathname:'/capitulos.html'},document:{addEventListener(){}}};
  vm.runInNewContext(replayScript,context);
  context.window.startMissionReplay(mission);
  const copy=JSON.parse(session.getItem('mandji-replay-session-v1')).values;
  assert.equal(copy['mandji-scene4-v1'],undefined,'La repetición debe limpiar IV');
  for (const key of mission===4?[]:thirdChapter) assert.equal(copy[key],undefined,`Repetir ${mission}: ${key} debe comenzar vacío`);
  assert.equal(copy['mandji-fictional-hours-v3'],'604800000');
  assert.equal(copy['mandji-leader-v1'],seed['mandji-leader-v1']);
  assert.deepEqual(real.snapshot(),before,'La repetición no puede alterar la partida original');
  context.location.pathname='/ordenador3.html';
  vm.runInNewContext(replayScript,context);
  context.window.mandjiStorage.setItem('mandji-bata-map-v1','{"stage":1}');
  assert.equal(real.getItem('mandji-bata-map-v1'),seed['mandji-bata-map-v1'],'El avance de repetición debe quedar aislado');
  context.location.pathname='/capitulos.html';
  vm.runInNewContext(replayScript,context);
  assert.equal(session.getItem('mandji-replay-session-v1'),null);
  assert.equal(context.window.mandjiStorage,real);
}
console.log('OK: reinicio, cancelación, preferencias, repetición II/III/IV, mapa, recursos y aislamiento del original.');
