# LibXOR API Documentation

## Subsystems

- Graphics
- Input
- Audio
- Memory
- State Machine
- 
## Main Entry Point

## Audio

- Synthesizer
- Audio Mixer

Question: Is it better to just allow playing of MIDI, WAV, and MP3/OGG files?
Answer: To some degree, yes because it keeps with the idea of 8-bit simplicity. However, we want to keep the analog synthesizer effects alive.

| Loc/Comp | Values | Description |
+--------+--------+-------------+
| 0000/X | 0      | Frequency   |
| 0000/Y | 0      | Pulse Width |
| 0000/Z | 0      | Pitch Wheel |
| 0000/W | 0      | VCA Level (-5V - 5V) |
| 0000/I |        | 00: Voice off/on |
|        |        | 01: Sync off/on  |
|        |        | 02: Ring mod off/on |
|        |        | 03: White Noise / Pink Noise  |
|        |        | 04: Triangle waveform off/on  |
|        |        | 05: Saw waveform off/on       |
|        |        | 06: Square waveform off/on    |
|        |        | 07: Noise off/on              |
|        |        | 08: VCA envelope off/on       |
|        |        | 09: Modulation off/on         |
|        |        | 10: Delay off/on              |
|        |        | 11: Reverb off/on             |
|        |        | 12: Key follow 1/3            |
|        |        | 13: Key follow 2/3            |
|        |        | 14: PWM LFO (off) / ENV (on)  |
|        |        | 15: PWM off/on                |
|        |        | 16: Pulse Width 12.5%         |
|        |        | 17: Pulse Width 25.0%         |
|        |        | 18: Pulse Width 50.0%         |
|        |        | 19: Glide off/on              |
|        |        | 20: Glide linear/exponent     |
|        |        | 21: Squ sub osc off/on        |
|        |        | 
| 0001/X |        | Attack (seconds)  |
| 0001/Y |        | Decay (seconds)   |
| 0001/Z |        | Sustain (volume)  |
| 0001/W |        | Release (seconds) |
| 0001/I |        | Control           |
|        |        | 0: Multiple trigger off/on   |
|        |        | 1: Release off/on            |
| 0002/X |        | Filter (frequency)   |
| 0002/Y |        | Resonance (-5 to 5V) |
| 0002/Z |        | VCF ENV Amount (-5 to 5V) |
| 0002/W |        | LFO Amount (-5 to 5V)      |
| 0002/I |        | Control |
|        |        | 0: Filter off/on |
|        |        | 1: Low pass filter off/on  |
|        |        | 2: Band pass filter off/on |
|        |        | 3: High pass filter off/on |
|        |        | 4: 12/24 dB low pass filter switch off/on |
|        |        | 5:  
| 0003/X |        | Attack (seconds) |
| 0003/Y |        | Decay (seconds)  |
| 0003/Z |        | Sustain (volume) |
| 0003/W |        | Release (volume) |
| 0003/I |        | |
| 0004/X |        | LFO Rate (frequency) |
| 0004/Y |        | LFO Delay (seconds)  |
| 0004/Z |        | LFO VCA (-5V to 5V)  |
| 0004/W |        | LFO VCF (-5V to 5V)  |
| 0004/I |        | VCO Type             |
|        |        | 0 - Sine             |
|        |        | 1 - Triangle         |
|        |        | 2 - Saw Down         |
|        |        | 3 - Saw Up           |
|        |        | 4 - Square 88.5%     |
|        |        | 5 - Square 75.0%     |
|        |        | 6 - Square 50.0%     |
|        |        | 7 - Square 25.0%     |
|        |        | 8 - Square 12.5%     |
|        |        | 9 - S&H              |
|        |        | A - S&H Smooth       |
|        |        | B - Step Sequencer   |
|        |        | C - Log              |
|        |        | D - Exp              |
| 0005/X |        | Delay time (ms)      |
| 0005/Y |        | Delay regen (%)      |
| 0006/Z |        | Delay mix (%)        |
| 0007/W |        | Delay LFO (-5V - 5V) |
| 0005/I |        | Control              |
|        |        | 00: off/on           |
| 0006/X |        | Mod
