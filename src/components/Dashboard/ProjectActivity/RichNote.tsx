import Autolinker from 'autolinker'
import RichImgPreview from 'components/shared/RichImgPreview'
import { ThemeContext } from 'contexts/themeContext'
import { useContentType } from 'hooks/ContentType'
import { useContext, useMemo } from 'react'

export default function RichNote({ note }: { note: string | undefined }) {
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const mediaLink = useMemo(() => {
    if (!note) return ''

    const https = 'https://'
    const http = 'http://'

    if (note.includes(https)) {
      return https + note.split(https)[1].split(' ')[0]
    } else if (note.includes(http)) {
      return http + note.split(http)[1].split(' ')[0]
    }
    return ''
  }, [note])

  const contentType = useContentType(mediaLink)

  if (!note) return null

  const _note =
    mediaLink &&
    (contentType === 'image/jpeg' ||
      contentType === 'image/jpg' ||
      contentType === 'image/gif' ||
      contentType === 'image/png' ||
      contentType === 'image/svg')
      ? note.replace(mediaLink, '')
      : note

  return (
    <div style={{ marginTop: 5 }}>
      <div
        style={{ color: colors.text.secondary, overflowWrap: 'break-word' }}
        dangerouslySetInnerHTML={{
          __html: Autolinker.link(_note, {
            sanitizeHtml: true,
            truncate: {
              length: 30,
              location: 'smart',
            },
          }),
        }}
      ></div>
      <RichImgPreview
        src={mediaLink}
        style={{ marginTop: 10 }}
        width="100%"
        height={140}
      />
    </div>
  )
}
