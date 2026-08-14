# Reel Quiz Studio

A five-question quiz builder plus a recorder view that renders a true **1080×1920**
frame — six colour templates, canvas motion backgrounds, and synthesised countdown
sound. Built for Facebook / Instagram Reels and TikTok.

## Run it

On macOS, double-click `start.command`. Or in Terminal:

```bash
npm install && npm run dev
```

Open the local address shown, write your five questions, pick a template, then hit
**Open recorder** for the clean 9:16 view.

## Templates

Eleven templates in two families. The admin UI is deliberately plain — flat white
surfaces, one accent colour — so the only thing with visual personality is the reel.

### Motion (6)

| Template    | Look                          | Motion layer   |
| ----------- | ----------------------------- | -------------- |
| Neon Arcade | Cyan + magenta on violet      | Light streaks  |
| Sunset Pop  | Coral, tangerine, hot pink    | Bokeh drift    |
| Cyber Grid  | Acid lime on midnight navy    | Light streaks  |
| Bubblegum   | Candy pastels                 | Petal fall     |
| Gold Luxe   | Matte black + gold            | Gold particles |
| Aurora Flow | Mint and indigo ribbons       | Starfield      |

Motion layers are canvas particle systems drawn at native reel resolution, over a
faint colour wash and an animated film-grain overlay. Nothing is a static image.

### Sri Lankan heritage video (5)

| Template       | Footage                         |
| -------------- | ------------------------------- |
| Sigiriya       | The rock fortress under sky     |
| Anuradhapura   | White stupa in green landscape  |
| Kandy          | Buddha statue at Kandy          |
| Ancient Ceylon | Statue against landscape        |
| Hill Country   | Aerial over lake and hills      |

These play real 1080x1920 footage shipped in `public/bg/`. Legibility is handled by
a flat scrim plus solid answer cards and text shadow — no colour gradients — so the
question stays readable over any frame of the video. Swap in your own clips or add
more templates: see `public/bg/README.md`.

## Controls

- **Timer** — every question uses a fixed 5-second answer timer after the question is read.
- **Sinhala narration** — the local Vite server generates Sinhala MP3 audio with the free server-side Microsoft Edge Read Aloud voice, then the recorder starts the 5-second timer. It needs an internet connection but no API key or installed voice pack; the browser/device voice is only a fallback.
- **Text size** — S / M / L. Question and answer type also **auto-fits**: longer copy
  steps down a size automatically so nothing ever overflows the frame.
- **Sound** — a blip each second, a tighter urgent blip in the last three, a bass beat
  the moment the clock hits zero, a chime on the reveal, and a fanfare at the end.
  All synthesised with the Web Audio API — no audio files, nothing to license.
- **Clean frame** — the recorder leaves the top and bottom corners empty so Facebook/Instagram Reel controls do not cover quiz content.

## Recording

1. Open the recorder and make the window tall enough to show the whole frame.
2. Capture only the quiz frame, not the toolbar above it.
3. Click **Start quiz**. A 10s-per-question run is roughly 73 seconds.
4. Export at 1080×1920, H.264/MP4.

The frame is authored at exactly 1080×1920 and scaled to fit the window, so whatever
zoom the toolbar reports, the proportions are exact — record at any window size and
scale up in your editor without reflowing the layout.

Quiz text and settings are stored in this browser's local storage. No account or
server required.
