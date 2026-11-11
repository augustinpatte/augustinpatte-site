/* Local Connect Four engine. Board rows run from bottom to top. */
(function (scope) {
  'use strict';
  const ORDER = [3, 2, 4, 1, 5, 0, 6];
  const WIN = 100000;
  const LINES = [];
  const AT = Array.from({ length: 42 }, () => []);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      if (r + 3 * dr >= 6 || c + 3 * dc < 0 || c + 3 * dc >= 7) continue;
      const line = Array.from({ length: 4 }, (_, i) => (r + i * dr) * 7 + c + i * dc);
      line.forEach(i => AT[i].push(LINES.length));
      LINES.push(line);
    }
  }
  function winningCells(board, player) {
    const result = new Set();
    for (const line of LINES) if (line.every(i => board[i] === player)) line.forEach(i => result.add(i));
    return [...result];
  }
  function legalMoves(board) { return ORDER.filter(c => !board[35 + c]); }
  function* search(input, options = {}) {
    if (input.length !== 42 || input.some(x => ![0, 1, 2].includes(x))) throw new Error('Invalid board');
    const board = Uint8Array.from(input);
    const heights = new Uint8Array(7);
    for (let c = 0; c < 7; c++) {
      while (heights[c] < 6 && board[heights[c] * 7 + c]) heights[c]++;
      for (let r = heights[c]; r < 6; r++) if (board[r * 7 + c]) throw new Error('Invalid gravity');
    }
    if (winningCells(board, 1).length || winningCells(board, 2).length || !legalMoves(board).length) return { column: null, depth: 0, nodes: 0 };
    if (options.level === 'easy') {
      const player = options.player ?? 2;
      const random = options.random ?? Math.random;
      const moves = legalMoves(board);
      const immediate = p => moves.filter(c => {
        const i = heights[c] * 7 + c;
        board[i] = p;
        const win = winningCells(board, p).length > 0;
        board[i] = 0;
        return win;
      });
      const wins = immediate(player);
      if (wins.length) return { column: wins[0], depth: 1, nodes: moves.length };
      const blocks = immediate(3 - player);
      // Beginner opponent: notices some immediate threats, but never plans combinations.
      if (blocks.length && random() < 0.6) return { column: blocks[0], depth: 1, nodes: moves.length * 2 };
      return { column: moves[Math.min(moves.length - 1, Math.floor(random() * moves.length))], depth: 1, nodes: moves.length * 2 };
    }
    const hard = options.level === 'hard';
    const maxDepth = options.maxDepth ?? (hard ? 18 : 4);
    const budget = options.timeMs ?? (hard ? 2200 : 180);
    const deadline = performance.now() + budget;
    const player = options.player ?? 2;
    const counts = [null, new Int8Array(LINES.length), new Int8Array(LINES.length)];
    const weights = [0, 2, 14, 100, WIN];
    const bits = Array.from({ length: 42 }, (_, i) => 1n << BigInt(i * 2));
    const sideBit = 1n << 84n;
    let key = 0n, value = 0, occupied = 0, nodes = 0, completedDepth = 0;
    let best = legalMoves(board)[0], candidate = best, resultScore = 0;
    const table = new Map(), timeout = Symbol('timeout');
    function lineValue(k) {
      const a = counts[1][k], b = counts[2][k];
      return a && b ? 0 : weights[b] - weights[a];
    }
    for (let i = 0; i < 42; i++) if (board[i]) {
      occupied++; key += bits[i] * BigInt(board[i]);
      for (const k of AT[i]) counts[board[i]][k]++;
      if (i % 7 === 3) value += board[i] === 2 ? 5 : -5;
    }
    for (let k = 0; k < LINES.length; k++) value += lineValue(k);
    function drop(c, p) {
      const i = heights[c]++ * 7 + c;
      for (const k of AT[i]) { value -= lineValue(k); counts[p][k]++; value += lineValue(k); }
      if (c === 3) value += p === 2 ? 5 : -5;
      board[i] = p; key += bits[i] * BigInt(p); occupied++;
      return i;
    }
    function undo(c, p) {
      const i = --heights[c] * 7 + c;
      for (const k of AT[i]) { value -= lineValue(k); counts[p][k]--; value += lineValue(k); }
      if (c === 3) value -= p === 2 ? 5 : -5;
      board[i] = 0; key -= bits[i] * BigInt(p); occupied--;
    }
    function wins(c, p) {
      const i = heights[c] * 7 + c;
      return AT[i].some(k => counts[p][k] === 3 && counts[3 - p][k] === 0);
    }
    function* visit(depth, alpha, beta, p, ply) {
      nodes++;
      if ((nodes & 255) === 0) {
        yield;
        if (performance.now() >= deadline) throw timeout;
      }
      if (occupied === 42) return 0;
      let moves = ORDER.filter(c => heights[c] < 6);
      const winning = moves.find(c => wins(c, p));
      if (winning !== undefined) {
        if (ply === 0) candidate = winning;
        return WIN - ply - 1;
      }
      const threats = moves.filter(c => wins(c, 3 - p));
      if (threats.length > 1) return -WIN + ply + 2;
      if (threats.length === 1) moves = threats;
      else if (depth <= 0) return p === 2 ? value : -value;
      const originalAlpha = alpha, originalBeta = beta;
      const hash = key + (p === 2 ? sideBit : 0n);
      const cached = table.get(hash);
      if (cached && cached.depth >= depth && ply > 0) {
        if (cached.flag === 0) return cached.score;
        if (cached.flag === 1) alpha = Math.max(alpha, cached.score);
        else beta = Math.min(beta, cached.score);
        if (alpha >= beta) return cached.score;
      }
      if (moves.length > 1) {
        moves = moves.map(c => {
          drop(c, p); const score = (p === 2 ? value : -value) + (cached?.column === c ? 1000000 : 0); undo(c, p);
          return { c, score };
        }).sort((a, b) => b.score - a.score).map(x => x.c);
      }
      let score = -Infinity, column = moves[0];
      for (const c of moves) {
        drop(c, p);
        let next;
        try { next = -(yield* visit(Math.max(0, depth - 1), -beta, -alpha, 3 - p, ply + 1)); }
        finally { undo(c, p); }
        if (next > score) { score = next; column = c; }
        alpha = Math.max(alpha, score);
        if (alpha >= beta) break;
      }
      if (table.size < 120000) table.set(hash, { depth, score, column, flag: score <= originalAlpha ? 2 : score >= originalBeta ? 1 : 0 });
      if (ply === 0) candidate = column;
      return score;
    }
    for (let depth = 1; depth <= Math.min(maxDepth, 42 - occupied); depth++) {
      try {
        resultScore = yield* visit(depth, -WIN, WIN, player, 0);
        best = candidate; completedDepth = depth;
      } catch (error) { if (error === timeout) break; throw error; }
      if (Math.abs(resultScore) > WIN - 100 || performance.now() >= deadline) break;
      yield;
    }
    return { column: best, depth: completedDepth, nodes, score: resultScore };
  }
  function chooseMove(board, options) {
    const iterator = search(board, options); let step;
    do { step = iterator.next(); } while (!step.done);
    return step.value;
  }
  async function chooseMoveAsync(board, options, cancelled = () => false) {
    const iterator = search(board, options); let step, last = performance.now();
    do {
      if (cancelled()) { iterator.return(); return null; }
      step = iterator.next();
      if (!step.done && performance.now() - last >= 10) {
        await new Promise(resolve => setTimeout(resolve, 0)); last = performance.now();
      }
    } while (!step.done);
    return step.value;
  }
  scope.ConnectFourEngine = { chooseMove, chooseMoveAsync, winningCells, legalMoves };
})(globalThis);
