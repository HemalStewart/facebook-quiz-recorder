# Optional video backdrops

Drop a looping video in this folder named after the template id and the recorder
will play it behind that template's frame automatically. No code change needed.

| Template     | File name     |
| ------------ | ------------- |
| Neon Arcade  | `neon.mp4`    |
| Sunset Pop   | `sunset.mp4`  |
| Cyber Grid   | `cyber.mp4`   |
| Bubblegum    | `bubble.mp4`  |
| Gold Luxe    | `luxe.mp4`    |
| Aurora Flow  | `aurora.mp4`  |

If a file isn't here, the template falls back to its canvas motion layer, so this
folder can stay empty.

**What works best:** a 1080x1920 (or larger 9:16) seamless loop, 5-15 seconds,
dark and low-contrast so the question text stays readable. The video is rendered
at 50% opacity underneath the particle layer — edit `.bd-video` in
`src/styles.css` to change that.

**Where to get them free for commercial use:** Pexels, Pixabay, Mixkit and
Videvo all allow commercial reuse without attribution. Prefer real footage
(bokeh lights, ink in water, smoke, city lights at night, fabric, dust motes)
over generated abstract loops — real footage is what stops the frame looking
machine-made. Always check the licence on the individual clip.
