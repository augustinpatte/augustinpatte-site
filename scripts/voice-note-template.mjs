const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const text = (language, english, french) => language === 'fr' ? french : english;

const transcript = {
  fr: [
    'Hello, je suis Augustin Patte et bienvenue sur mon site !',
    'Je me doute que pas grand monde ne va écouter ce message, mais ça fait partie de moi d’aller au bout des choses. Je voulais un message vocal sur mon site, donc m’y voilà !',
    'Je suis student-athlete aux États-Unis, actuellement à Loyola University New Orleans. J’étudie la finance, le business analytics et computer science, mais ce que je préfère surtout, c’est développer des produits, et surtout de bons produits !',
    'J’ai créé un repo GitHub avec un agent IA qui investit pour toi, une application d’éducation — qu’il faut d’ailleurs que je sorte — et des livres. J’ai aussi déjà fermé deux projets depuis janvier 2026 : une newsletter et un privacy proxy destiné aux entreprises. J’ai hâte d’avoir un projet qui marche, ou simplement de continuer à en développer !',
    'Si ce que je raconte t’intéresse, n’hésite pas à me contacter par mail, mais surtout sur LinkedIn. Et essaie de battre le niveau le plus dur de Puissance 4 : même moi, je n’y arrive pas !'
  ],
  en: [
    'Hey, I’m Augustin Patte, and welcome to my website!',
    'I know not many people will listen to this message, but I like to finish what I start. I wanted a voice message on my site, so here I am!',
    'I’m a student-athlete in the United States, currently at Loyola University New Orleans. I study finance, business analytics and computer science, but what I love most is building products, and building good ones!',
    'So far, I’ve made a GitHub project that gives you an AI agent that invests for you, an education app and I wrote some books. I’ve also already closed two projects since January 2026: a newsletter, and a privacy proxy for businesses.',
    'Now I’m looking forward to building a project that really works, or to keep building more! If anything I said sounds interesting to you, feel free to reach out by email, or even better, on LinkedIn! And by the way, try to beat the hardest level of Connect Four. Even I can’t do it!'
  ]
};

const bars = [24,42,30,58,36,68,43,27,51,76,38,59,32,64,47,82,29,54,72,39,61,28,49,67,35,79,44,57,31,70,41,60,26,52,74,37,63,46,80,34,56,29,69,43,62,33,51,77,40,58,30,66];

export function voiceNote(language) {
  const isFrench = language === 'fr';
  const audio = isFrench ? '/assets/augustin-intro-fr.m4a' : '/assets/augustin-intro-en.m4a';
  const minutes = isFrench ? '0:46' : '0:48';
  const lines = transcript[language].map(line => `<p>${escape(line)}</p>`).join('');
  const waveform = bars.map((height, index) => `<i style="--voice-height:${height}%;--voice-delay:${index * 37}ms"></i>`).join('');
  return `<section class="voice-note-section" aria-labelledby="voice-note-title"><div class="container voice-note-layout"><div class="voice-note-copy reveal"><p class="eyebrow">${text(language, 'A personal introduction', 'Présentation personnelle')}</p><h2 id="voice-note-title">${text(language, 'A short voice note.', 'Un petit message vocal.')}</h2><p>${text(language, 'A more direct way to introduce myself, in my own voice.', 'Une manière un peu plus directe de me présenter, avec ma propre voix.')}</p></div><div class="voice-note reveal" data-voice-note><div class="voice-note-top"><div><span class="voice-note-label">${text(language, 'VOICE NOTE', 'MESSAGE VOCAL')}</span><span class="voice-note-time" data-audio-time>0:00 / ${minutes}</span></div><button class="voice-play" type="button" data-audio-play aria-pressed="false" aria-label="${text(language, 'Play voice note', 'Lire le message vocal')}"><span class="voice-play-symbol" aria-hidden="true"></span><span data-audio-action>${text(language, 'Play', 'Écouter')}</span></button></div><div class="voice-wave" aria-hidden="true">${waveform}</div><audio controls preload="metadata" data-audio src="${audio}">${text(language, 'Your browser does not support audio playback.', 'Votre navigateur ne permet pas la lecture audio.')}</audio><details class="voice-transcript"><summary>${text(language, 'Transcript', 'Voir la transcription')}</summary><div class="voice-transcript-copy">${lines}</div></details></div></div></section>`;
}
