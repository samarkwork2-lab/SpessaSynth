import { Sequencer, WorkletSynthesizer } from "spessasynth_lib";
import { MIDIFile } from "spessasynth_core";

let synthesizer: WorkletSynthesizer;
let sequencer: Sequencer;

export async function initializeSynthesizer(audioContext: AudioContext) {
    if (synthesizer) {
        return;
    }
    // a workaround for a bug in spessasynth_lib
    // @ts-ignore
    window.location = {};
    await WorkletSynthesizer.registerSynthesizer(new URL("../../node_modules/spessasynth_lib/dist/spessasynth_processor.js", import.meta.url));
    synthesizer = new WorkletSynthesizer(audioContext);
    sequencer = new Sequencer(synthesizer);

    // Load a default soundfont (replace with your actual soundfont path)
    const soundfontUrl = 'https://cdn.jsdelivr.net/gh/spessasus/spessasynth-soundfonts@main/spec/soundfonts/GeneralUserGS.sf3';
    const response = await fetch(soundfontUrl);
    const soundfontData = await response.arrayBuffer();
    await synthesizer.loadSoundFont(soundfontData);
    console.log("Synthesizer initialized and soundfont loaded.");
}

export function playMidi(midiData: ArrayBuffer, fileName: string) {
    if (!synthesizer || !sequencer) {
        throw new Error("Synthesizer not initialized!");
    }
    const midiFile: MIDIFile = {
        binary: midiData,
        fileName: fileName
    };
    sequencer.loadNewSong(midiFile);
    sequencer.play();
}

export function getSongTitle(): string | undefined {
    return sequencer?.midiData?.fileName;
}
