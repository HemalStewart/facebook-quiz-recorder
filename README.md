# Calm Quiz Studio

A responsive five-question quiz builder and 9:16 recording view for short-form social video.

## Run it

On macOS, double-click `start.command` in the project folder. Or use Terminal:

```bash
npm install
npm run dev
```

Open the local address shown in Terminal. Edit all five questions in the admin page, choose one correct answer for each, and click **Save quiz**. Use **Open recorder** to open the clean 9:16 quiz view in a new tab.

Each question displays for five seconds, reveals the correct answer for 2.8 seconds, and advances automatically. The final call-to-action remains on screen until restarted.

## Recording for Facebook

1. Open the recorder view and make the browser window tall enough to show the complete 9:16 frame.
2. Start your screen-recording software and capture only the quiz frame (not the small toolbar above it).
3. Click **Start quiz**. The full run is roughly 35 seconds.
4. Export at 1080×1920 in H.264/MP4 for Facebook Reels.

Your quiz text is stored in this browser using local storage. No account or server is required.
