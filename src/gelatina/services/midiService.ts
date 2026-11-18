// Solicita acesso às portas MIDI do navegador através da Web MIDI API
export const requestMidiAccess = async (): Promise<MIDIAccess> => {
    if (!navigator.requestMIDIAccess) {
        throw new Error('Web MIDI API is not supported in this browser.');
    }
    return navigator.requestMIDIAccess();
};

// Configura o escuta (listener) para capturar eventos de um dispositivo MIDI específico conectado
export const listenToMidiDevice = (
    deviceId: string,
    midiAccess: MIDIAccess,
    onNoteOn: (note: number, velocity: number) => void,
    onNoteOff: (note: number, velocity: number) => void,
    onControlChange: (controller: number, value: number) => void
): (() => void) => {
    const input = midiAccess.inputs.get(deviceId);

    // Retorna uma função vazia se o dispositivo informado não for encontrado
    if (!input) {
        console.warn(`MIDI device with id ${deviceId} not found.`);
        return () => {};
    }

    // Processa a mensagem crua recebida do hardware MIDI e direciona para a ação correta
    const onMidiMessage = (event: MIDIMessageEvent) => {
        const [status, note, velocity] = event.data;
        // Os 4 bits altos dizem o comando e os 4 baixos, o canal. Comparar o byte
        // inteiro com 144 só aceitava o canal 1: um MPK Mini em outro canal (ou
        // outro teclado) ficava mudo. O Genius já fazia assim.
        const command = status & 0xf0;

        // Nota acionada (pressionada)
        if (command === 144 && velocity > 0) {
            onNoteOn(note, velocity);
        } 
        // Nota finalizada (soltada ou comando de nota ligada com força zero)
        else if (command === 128 || (command === 144 && velocity === 0)) {
            onNoteOff(note, velocity);
        }
        // Mudança de controle (ex: giro de botões / knobs ou uso de pedais)
        else if (command === 176) {
            onControlChange(note, velocity);
        }
    };

    // Registra o ouvinte de eventos na entrada do dispositivo MIDI
    input.addEventListener('midimessage', onMidiMessage);

    // Retorna uma função de limpeza para remover o ouvinte quando o componente for desmontado ou o dispositivo trocado
    return () => {
        input.removeEventListener('midimessage', onMidiMessage);
    };
};
