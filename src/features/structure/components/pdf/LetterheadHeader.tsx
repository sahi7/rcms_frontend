import { View, StyleSheet } from '@react-pdf/renderer'
import Html from 'react-pdf-html'
import { Letterhead } from '@/types/letterhead'
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
    flex: 1,
    paddingHorizontal: 4,
  },
})
// react-pdf-html inherits a stylesheet for HTML elements
const htmlStyles = {
  p: {
    margin: 0,
    fontSize: 9,
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
    fontSize: 9,
    color: '#1f2937',
  },
  h1: {
    fontSize: 12,
    margin: 0,
    fontWeight: 700,
  },
  h2: {
    fontSize: 11,
    margin: 0,
    fontWeight: 700,
  },
  h3: {
    fontSize: 10,
    margin: 0,
    fontWeight: 700,
  },
}
function Block({
  html,
  align,
}: {
  html: string
  align: 'left' | 'center' | 'right'
}) {
  const content = html && html.trim() ? html : '<p></p>'
  return (
    <View
      style={[
        styles.col,
        {
          textAlign: align,
        } as any,
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
export function LetterheadHeader({ letterhead }: { letterhead: Letterhead }) {
  return (
    <View style={styles.header} fixed>
      <Block html={letterhead.left_html} align="left" />
      <Block html={letterhead.center_html} align="center" />
      <Block html={letterhead.right_html} align="right" />
    </View>
  )
}
