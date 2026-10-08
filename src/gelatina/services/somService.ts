// =====================================================================
// SOM
// ---------------------------------------------------------------------
// Um tom simples por nota, para quando não houver instrumento sonoro na
// sala. Nada aqui interfere na projeção: se o som estiver desligado, as
// funções apenas não fazem nada.
// =====================================================================

let ac: AudioContext | null = null;
let master: GainNode | null = null;
const vozes = new Map<string, { osc: OscillatorNode; g: GainNode }>();

const garantirAudio = (): AudioContext | null => {
    if (ac) return ac;
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    ac = new Ctor();
    master = ac.createGain();
    master.gain.value = 0.22;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    master.connect(lp).connect(ac.destination);
    return ac;
};

export const ligarSom = () => {
    const c = garantirAudio();
    c?.resume();
};

export const tocar = (id: string, midi: number, velocidade: number) => {
    const c = ac;
    if (!c || !master) return;
    if (c.state === 'suspended') c.resume();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    const pico = 0.10 + (velocidade / 127) * 0.14;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pico, t + 0.012);
    g.gain.exponentialRampToValueAtTime(pico * 0.5, t + 0.55);
    osc.connect(g).connect(master);
    osc.start(t);
    vozes.set(id, { osc, g });
};

export const soltar = (id: string) => {
    const v = vozes.get(id);
    if (!v || !ac) return;
    vozes.delete(id);
    const t = ac.currentTime;
    v.g.gain.cancelScheduledValues(t);
    v.g.gain.setValueAtTime(Math.max(v.g.gain.value, 0.0001), t);
    v.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    v.osc.stop(t + 0.3);
};

export const soltarTudo = () => {
    Array.from(vozes.keys()).forEach(soltar);
};
