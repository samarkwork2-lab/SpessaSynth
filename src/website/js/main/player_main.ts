import { Manager } from "../manager/manager.js";
import { BasicSoundBank } from "spessasynth_core";

const SAMPLE_RATE = 44100;

async function initialize() {
    const context = new AudioContext({ sampleRate: SAMPLE_RATE });
    const soundFontBuffer = await BasicSoundBank.getSampleSoundBankFile();
    const manager = new Manager(context, soundFontBuffer);
    await manager.ready;

    const fileInput = document.getElementById("midi_file_input") as HTMLInputElement;
    const sfInput = document.getElementById("sf_file_input") as HTMLInputElement;

    fileInput.onchange = async () => {
        if (fileInput.files.length > 0) {
            const files = Array.from(fileInput.files).map(async file => ({
                binary: await file.arrayBuffer(),
                fileName: file.name
            }));
            const parsed = await Promise.all(files);
            manager.play(parsed);
        }
    };

    sfInput.onchange = async () => {
        if (sfInput.files.length > 0) {
            const sfBuffer = await sfInput.files[0].arrayBuffer();
            await manager.reloadSf(sfBuffer);
        }
    };
}

void initialize();
