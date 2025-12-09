"use client";

import { useState, useEffect, useRef } from 'react';
import { initializeSynthesizer, playMidi, getSongTitle } from '../lib/synthesizer-service';

export default function Home() {
  const [isSynthesizerReady, setIsSynthesizerReady] = useState(false);
  const [songTitle, setSongTitle] = useState<string>('No song loaded');
  const [fileName, setFileName] = useState<string>('Upload your MIDI file');
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Create AudioContext on user interaction
        audioContextRef.current = new AudioContext();
        await initializeSynthesizer(audioContextRef.current);
        setIsSynthesizerReady(true);
        console.log("Synthesizer is ready.");
      } catch (error) {
        console.error("Failed to initialize synthesizer:", error);
      }
    };
    // Initialize on the first user interaction, which in this case we tie to the component mounting
    // A better approach would be to tie this to a specific user action like a button click.
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => {
        if (!audioContextRef.current) {
          init();
        }
      }, { once: true });
    }

  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSynthesizerReady) {
      console.warn("Synthesizer is not ready yet.");
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      try {
        const midiData = await file.arrayBuffer();
        playMidi(midiData, file.name);
        setFileName(file.name);

        // Update the song title periodically
        setInterval(() => {
            const title = getSongTitle();
            if(title)
            {
                setSongTitle(title);
            }
        }, 1000);

      } catch (error) {
        console.error("Failed to play MIDI file:", error);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">SpessaSynth Next.js</h1>
        <p className="text-lg text-gray-600 mb-8">
          The powerful MIDI Synthesizer, now on Next.js
        </p>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-2">Now Playing</h2>
          <p id="song_title" className="text-gray-700 mb-6 truncate">{songTitle}</p>
          
          <label
            htmlFor="midi_file_input"
            className={`cursor-pointer bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 inline-block ${
              !isSynthesizerReady ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {fileName}
          </label>
          <input
            id="midi_file_input"
            type="file"
            accept=".mid, .smf, .rmi, audio/midi, .kar, .xmf, .mxmf"
            className="hidden"
            onChange={handleFileChange}
            disabled={!isSynthesizerReady}
          />
          {!isSynthesizerReady && <p className='text-sm mt-2'>Click anywhere to initialize the synthesizer</p>}
        </div>
      </div>
    </main>
  );
}
