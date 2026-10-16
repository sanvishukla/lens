# M8: Caption ASR (optional)

Draft captions for media without them.

- Base: Whisper small or distil-whisper (MIT).
- Data: `librispeech`, `common_voice` (record Mozilla Data Collective terms acceptance).
- Deploy: server, or browser via WebGPU.
- Ship gate: lower WER than stock Whisper on our clips; otherwise ship stock Whisper.
