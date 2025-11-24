import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MP3 Transcript Sync Player',
  description: 'Sync MP3 audio with transcripts using OpenAI Whisper',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
