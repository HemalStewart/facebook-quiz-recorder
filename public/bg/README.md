# Video backdrops

## What's already here

Five Sri Lankan heritage clips, all native **1080x1920**, each paired with a `.jpg`
poster frame generated from it:

| File           | Subject                          | Used by template |
| -------------- | -------------------------------- | ---------------- |
| `sigiriya.mp4` | Sigiriya rock fortress           | Sigiriya         |
| `stupa.mp4`    | White stupa in green landscape   | Anuradhapura     |
| `buddha.mp4`   | Buddha statue at Kandy           | Kandy            |
| `buddha2.mp4`  | Buddha statue against landscape  | Ancient Ceylon   |
| `hills.mp4`    | Aerial over lake and hills       | Hill Country     |

Source: [Pexels](https://www.pexels.com/videos/). The Pexels licence allows free
commercial use with no attribution required — but the licence sits with each
individual clip, so re-check any clip you swap in. None of these are AI-generated;
Pexels serves those from a separate `content.pexels.com/aigc-bundle/` path, which
was deliberately avoided.

The `.jpg` posters are what the admin template picker shows, and they are also the
`poster` attribute on the stage video so the frame is never blank while buffering.
Five 1080x1920 videos decoding at once will stall the picker, which is why it uses
stills.

## Adding your own

Name the file after the template id (`neon.mp4`, `luxe.mp4`, …) and it plays behind
that template automatically. Templates in the heritage family instead point at an
explicit filename via the `video` field in `src/templates.js`. A missing file is
ignored, so nothing breaks if you delete these.

Generate a matching poster with:

```bash
ffmpeg -y -ss 1 -i yourclip.mp4 -frames:v 1 -vf "scale=400:-2" -q:v 6 yourclip.jpg
```

**What works best:** a seamless 1080x1920 loop, 5-15 seconds, without a busy or
high-contrast centre — the question text sits over the middle third. Dark footage
needs less scrim. Adjust `.bd-scrim` in `src/styles.css` if a clip is too bright.

**Free for commercial use:** Pexels, Pixabay, Mixkit, Videvo, and Wikimedia Commons
(check the per-file licence there — many are CC BY-SA and need attribution). Prefer
real footage over generated abstract loops.

## Repo size

These five clips total about 99 MB. If you'd rather not commit that, add

```
public/bg/*.mp4
```

to `.gitignore` and keep only the small `.jpg` posters in version control.
