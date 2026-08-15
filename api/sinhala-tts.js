import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const SINHALA_VOICES = new Set(['si-LK-ThiliniNeural', 'si-LK-SameeraNeural'])

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.statusCode = 405
    response.setHeader('Allow', 'GET')
    response.end('Method not allowed')
    return
  }

  const requestUrl = new URL(request.url || '/', `https://${request.headers.host || 'localhost'}`)
  const text = requestUrl.searchParams.get('text')?.trim().slice(0, 500)
  const requestedVoice = requestUrl.searchParams.get('voice')
  const voice = SINHALA_VOICES.has(requestedVoice) ? requestedVoice : 'si-LK-ThiliniNeural'

  if (!text) {
    response.statusCode = 400
    response.end('Missing text')
    return
  }

  try {
    const tts = new MsEdgeTTS()
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
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
}
