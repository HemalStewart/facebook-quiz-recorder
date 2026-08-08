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

### Your own video backdrops

Drop a looping mp4 into `public/bg/` named after the template id (`neon.mp4`,
`luxe.mp4`, …) and it plays behind that template automatically. Missing files are
ignored, so the folder can stay empty. See `public/bg/README.md` for specs and
free, commercially usable sources.

## Controls

- **Timer** — 3, 5, 10, 15, 20 or 30 seconds per question. 5–10s holds retention best.
- **Text size** — S / M / L. Question and answer type also **auto-fits**: longer copy
  steps down a size automatically so nothing ever overflows the frame.
- **Sound** — a blip each second, a tighter urgent blip in the last three, a bass beat
  the moment the clock hits zero, a chime on the reveal, and a fanfare at the end.
  All synthesised with the Web Audio API — no audio files, nothing to license.
- **Channel name** — shown top-left on every frame so re-uploads still credit you.

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
