importScripts('./connect-four-engine.js');
self.onmessage = event => {
  const { board, level, id } = event.data;
  try { self.postMessage({ id, ...ConnectFourEngine.chooseMove(board, { level }) }); }
  catch (error) { self.postMessage({ id, error: String(error.message || error) }); }
};
