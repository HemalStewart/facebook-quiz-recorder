import { defineConfig } from 'vite'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const SINHALA_VOICES = new Set(['si-LK-ThiliniNeural', 'si-LK-SameeraNeural'])

function addSinhalaTtsRoute(server) {
  server.middlewares.use('/api/sinhala-tts', async (request, response) => {
    if (request.method !== 'GET') {
      response.statusCode = 405
      response.end('Method not allowed')
      return
    }

    const requestUrl = new URL(request.url || '/', 'http://localhost')
    const text = requestUrl.searchParams.get('text')?.trim()
    const voice = requestUrl.searchParams.get('voice')
    const selectedVoice = SINHALA_VOICES.has(voice) ? voice : 'si-LK-ThiliniNeural'
    if (!text) {
      response.statusCode = 400
      response.end('Missing text')
      return
    }

    try {
      const tts = new MsEdgeTTS()
      await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
      const { audioStream } = tts.toStream(text, { rate: '-5%' })
      response.statusCode = 200
      response.setHeader('Content-Type', 'audio/mpeg')
      response.setHeader('Cache-Control', 'no-store')
      audioStream.on('data', (chunk) => response.write(chunk))
      audioStream.on('end', () => response.end())
      audioStream.on('error', () => {
        if (!response.headersSent) response.statusCode = 502
        response.end('Sinhala voice failed')
      })
    } catch {
      response.statusCode = 502
      response.end('Sinhala voice failed')
    }
  })
}

const sinhalaTtsPlugin = {
  name: 'local-sinhala-tts',
  configureServer(server) {
    addSinhalaTtsRoute(server)
  },
  configurePreviewServer(server) {
    addSinhalaTtsRoute(server)
  },
}

export default defineConfig({
  plugins: [sinhalaTtsPlugin],
})
