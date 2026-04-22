// 使用 Web Audio API 生成简单音效

const audioContext = typeof window !== 'undefined'
  ? new (window.AudioContext || (window as any).webkitAudioContext)()
  : null;

export const playCompleteSound = () => {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // 悦耳的上升音调
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
  oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
  oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.4);
};

export const playSubtaskCompleteSound = () => {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // 轻快的点击音
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
};
