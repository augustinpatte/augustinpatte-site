export function connectFour(l) {
  const fr = l === 'fr';
  const text = (en, french) => fr ? french : en;
  return `<section class="play-section" id="connect-four"><div class="container play-layout"><div class="play-copy">
    <p class="eyebrow">${text('One more thing', 'Un dernier détail')}</p>
    <h2>${text('Four in a row.<br>One more game?', 'Quatre à la suite.<br>Une petite partie ?')}</h2>
    <p>${text('Fun fact: I’m pretty good at Connect Four. I like the mix of simple rules, anticipation and a little competitiveness.', 'Fun fact : je suis plutôt bon au Puissance 4. J’aime ses règles simples, les coups à anticiper et le petit esprit de compétition qui va avec.')}</p>
    <p class="play-invite">${text('Your turn. Take on the computer below.', 'À toi de jouer. Affronte l’ordinateur juste ici.')}</p>
    <div class="play-rules"><span class="rule-disc" aria-hidden="true"></span><p>${text('You play green. Line up four discs horizontally, vertically or diagonally.', 'Tu joues les pions verts. Aligne quatre pions à l’horizontale, à la verticale ou en diagonale.')}</p></div>
  </div><div class="c4" data-c4>
    <div class="c4-heading"><h3>${text('Connect Four', 'Puissance 4')}</h3><span aria-hidden="true">7 × 6</span></div>
    <div class="c4-levels" role="group" aria-label="${text('Difficulty', 'Difficulté')}"><button type="button" data-level="easy" aria-pressed="true">${text('Easy', 'Facile')}</button><button type="button" data-level="medium" aria-pressed="false">${text('Medium', 'Moyen')}</button><button type="button" data-level="hard" aria-pressed="false">${text('Very hard', 'Très difficile')}</button></div>
    <div class="c4-info"><p class="c4-status" role="status" aria-live="polite" aria-atomic="true">${text('Your turn. Choose a column.', 'À toi. Choisis une colonne.')}</p><span class="c4-turn" aria-hidden="true"></span></div>
    <div class="c4-board" role="group" aria-label="${text('Connect Four board. Seven columns and six rows.', 'Grille de Puissance 4. Sept colonnes et six lignes.')}">${Array.from({length:7},(_,c)=>`<button type="button" class="c4-column" data-column="${c}" aria-label="${text('Play column', 'Jouer dans la colonne')} ${c+1}"><span class="c4-drop" aria-hidden="true">↓</span>${Array.from({length:6},()=>'<span class="c4-cell" aria-hidden="true"></span>').join('')}</button>`).join('')}</div>
    <div class="c4-bottom"><label>${text('First move', 'Premier coup')}<select data-starter aria-label="${text('First player; changing starts a new game', 'Premier joueur ; changer relance la partie')}"><option value="1">${text('You', 'Toi')}</option><option value="2">${text('Computer', 'Ordinateur')}</option></select></label><button type="button" class="c4-reset" data-reset>${text('New game', 'Nouvelle partie')}<span aria-hidden="true">↗</span></button></div>
    <p class="c4-help">${text('Click a column, or use keys 1–7 while the board is focused. Changing difficulty starts a new game.', 'Clique sur une colonne, ou utilise les touches 1 à 7 quand la grille est sélectionnée. Changer de niveau relance la partie.')}</p>
    <noscript><p>${text('Enable JavaScript to play.', 'Active JavaScript pour jouer.')}</p></noscript>
  </div></div></section>`;
}
