const formatTime = seconds => {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

document.querySelectorAll('[data-voice-note]').forEach(note => {
  const audio = note.querySelector('[data-audio]');
  const play = note.querySelector('[data-audio-play]');
  const time = note.querySelector('[data-audio-time]');
  const action = note.querySelector('[data-audio-action]');
  if (!audio || !play || !time || !action) return;
  const language = document.documentElement.lang;
  const copy = playing => language === 'fr' ? (playing ? 'Pause' : 'Écouter') : (playing ? 'Pause' : 'Play');
  const render = () => { time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`; };
  const setPlaying = playing => {
    note.dataset.playing = String(playing);
    play.setAttribute('aria-pressed', String(playing));
    play.setAttribute('aria-label', copy(playing));
    action.textContent = copy(playing);
  };
  play.addEventListener('click', async () => {
    if (audio.paused) await audio.play();
    else audio.pause();
  });
  audio.addEventListener('loadedmetadata', render);
  audio.addEventListener('timeupdate', render);
  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => { audio.currentTime = 0; render(); });
  setPlaying(false);
  render();
  document.documentElement.classList.add('voice-ready');
});
