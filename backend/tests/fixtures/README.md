# Fixtures

`sample_audio.wav` — a real (synthesized) Spanish clinical phrase used by the opt-in E2E test
(`tests/e2e/test_process_voice_e2e.py`), which is skipped unless `OPENAI_API_KEY` is set, since it
makes a real call to the Whisper API. Silence would produce an empty/garbage transcript and defeat
the point of the test, so this fixture contains actual speech.

Regenerated on macOS with:

```bash
say -v Jorge "Hoy me duele mucho la cabeza y tengo fiebre desde ayer por la noche" -o sample_audio.aiff
afconvert sample_audio.aiff -f WAVE -d LEI16 sample_audio.wav
rm sample_audio.aiff
```
