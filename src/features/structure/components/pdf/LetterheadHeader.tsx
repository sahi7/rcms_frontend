// src/features/structure/components/pdf/LetterheadHeader.tsx
import { View, StyleSheet } from '@react-pdf/renderer'
import Html from 'react-pdf-html'
import { Font } from '@react-pdf/renderer'
import { Letterhead } from '@/types/letterhead'

// Disable hyphenation globally (whole words move to next line)
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 8,
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#111827',
  },
  col: {
    paddingHorizontal: 4,
  },
})

// react-pdf-html stylesheet
const htmlStyles = {
  p: {
    margin: 0,
    lineHeight: 1.3,
    color: '#1f2937',
  },
  strong: {
    fontWeight: 700,
  },
  em: {
    fontStyle: 'italic',
  },
  ul: {
    marginLeft: 10,
    marginTop: 2,
    marginBottom: 2,
  },
  ol: {
    marginLeft: 10,
    marginTop: 2,
    marginBottom: 2,
  },
  li: {
    color: '#1f2937',
  },
  h1: {
    margin: 0,
    fontWeight: 700,
  },
  h2: {
    margin: 0,
    fontWeight: 700,
  },
  h3: {
    margin: 0,
    fontWeight: 700,
  },
}

function Block({
  html,
  align,
  width,
}: {
  html: string
  align: 'left' | 'center' | 'right'
  width?: number
}) {
  const content = html && html.trim() ? html : '<p></p>'
  const colWidth = width ? `${width}%` : '33.33%'

  return (
    <View
      style={[
        styles.col,
        {
          width: colWidth,
        },
      ]}
    >
      <Html
        stylesheet={htmlStyles}
        style={{
          fontSize: 9,
        }}
      >
        {`<div style="text-align:${align}">${content}</div>`}
      </Html>
    </View>
  )
}

interface Props {
  letterhead: Letterhead
  /** 
   * Whether the letterhead should repeat on EVERY page (true)
   * or appear ONLY on the first page (false).
   * Default = true (keeps current behavior in ClasslistPDF, etc.)
   * Usage; <LetterheadHeader letterhead={letterhead} fixed={false} />
   */
  fixed?: boolean
}

export function LetterheadHeader({ letterhead, fixed = true }: Props) {
  return (
    <View style={styles.header} fixed={fixed}>
      <Block
        html={letterhead.left_html}
        align="left"
        width={letterhead.left_width}
      />
      <Block
        html={letterhead.center_html}
        align="center"
        width={letterhead.center_width}
      />
      <Block
        html={letterhead.right_html}
        align="right"
        width={letterhead.right_width}
      />
    </View>
  )
}