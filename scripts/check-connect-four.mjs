import assert from 'node:assert/strict';
import '../dist/connect-four-engine.js';
const E = globalThis.ConnectFourEngine;
const empty = () => Array(42).fill(0);
const put = (b, c, p) => { for (let r = 0; r < 6; r++) if (!b[r*7+c]) { b[r*7+c]=p; return; } throw Error('Column full'); };

const easyWin=empty(); [0,1,2].forEach(c=>put(easyWin,c,2));
assert.equal(E.chooseMove(easyWin,{level:'easy',random:()=>0}).column,3,'Easy takes an immediate win');
const easyThreat=empty(); [0,1,2].forEach(c=>put(easyThreat,c,1));
assert.equal(E.chooseMove(easyThreat,{level:'easy',random:()=>0}).column,3,'Easy sometimes blocks an immediate loss');
assert.notEqual(E.chooseMove(easyThreat,{level:'easy',random:()=>.99}).column,3,'Easy can miss an immediate block');

for (const level of ['medium', 'hard']) {
  const win=empty(); [0,1,2].forEach(c=>put(win,c,2));
  assert.equal(E.chooseMove(win,{level,timeMs:100}).column,3,'Take horizontal win');
  const vertical=empty(); for(let i=0;i<3;i++)put(vertical,6,1);
  assert.equal(E.chooseMove(vertical,{level,timeMs:100}).column,6,'Block vertical loss');
  const both=empty(); for(let i=0;i<3;i++){put(both,0,1);put(both,6,2);}
  assert.equal(E.chooseMove(both,{level,timeMs:100}).column,6,'Win before blocking');
  const diagonal=empty();
  [[2],[1,2],[1,1,2],[2,1,1]].forEach((pieces,c)=>pieces.forEach(p=>put(diagonal,c,p)));
  assert.equal(E.chooseMove(diagonal,{level,timeMs:100}).column,3,'Complete diagonal');
  put(diagonal,3,2);
  assert.deepEqual(E.winningCells(diagonal,2),[0,8,16,24]);
  assert.equal(E.chooseMove(diagonal,{level}).column,null,'No move after victory');
  const full=empty();[1,2,1,2,1,2].forEach(p=>put(full,3,p));
  const before=[...full];
  assert.notEqual(E.chooseMove(full,{level,timeMs:100}).column,3,'Never select a full column');
  assert.deepEqual(full,before,'Search does not mutate its input');
}
// Draw fixture generated with alternating legal moves, rejecting any winning move.
let draw=null, seed=5483;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let trial=0;trial<1000&&!draw;trial++){
  const b=empty();
  for(let ply=0;ply<42;ply++){
    const p=ply%2+1;
    const safe=E.legalMoves(b).filter(c=>{const next=[...b];put(next,c,p);return !E.winningCells(next,p).length;});
    if(!safe.length)break;
    put(b,safe[Math.floor(random()*safe.length)],p);
    if(ply===41)draw=b;
  }
}
assert.ok(draw,'Find legal draw');
assert.equal(E.chooseMove(draw,{level:'hard'}).column,null,'Handle full-board draw');
assert.equal(E.winningCells(draw,1).length+E.winningCells(draw,2).length,0);
const b=empty();put(b,3,1);
const start=performance.now();
const medium=E.chooseMove(b,{level:'medium'});
const hard=E.chooseMove(b,{level:'hard',timeMs:500});
assert.ok(hard.depth>medium.depth,'Hard searches deeper than medium');
assert.ok(performance.now()-start<1500,'Search respects bounded time');
let ticks=0;
const timer=setInterval(()=>ticks++,1);
const asyncResult=await E.chooseMoveAsync(b,{level:'hard',timeMs:200});
clearInterval(timer);
assert.ok(ticks>0,'Fallback yields to the event loop');
assert.ok(E.legalMoves(b).includes(asyncResult.column));
assert.equal(await E.chooseMoveAsync(b,{level:'hard'},()=>true),null,'Cancelled search does not play');
console.log(`PASS: wins, blocks, diagonals, full columns, draw, input integrity, cancellation, responsive fallback. Medium depth ${medium.depth}; hard depth ${hard.depth}.`);
