// src/features/structure/components/pdf/ClasslistPDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Letterhead } from '@/types/letterhead'
import { Student } from '@/types/academic'
import { LetterheadHeader } from './LetterheadHeader'

interface Props {
  letterhead: Letterhead
  title: string
  subtitle?: string
  students: Student[]
  generatedAt?: Date
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 2,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rowAlt: {
    backgroundColor: '#f9fafb',
  },
  headerRow: {
    backgroundColor: '#111827',
  },
  headerCell: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 700,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  cell: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 9.5,
  },
  colNum: {
    width: '8%',
  },
  colReg: {
    width: '22%',
  },
  colName: {
    width: '45%',
  },
  colGender: {
    width: '12%',
  },
  colStatus: {
    width: '13%',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
  },
})

export function ClassListPDF({
  letterhead,
  title,
  subtitle,
  students,
  generatedAt = new Date(),
}: Props) {
  const sorted = [...students].sort((a, b) => {
    const an = `${a.user__first_name || ''} ${a.user__last_name || ''}`.toLowerCase().trim()
    const bn = `${b.user__first_name || ''} ${b.user__last_name || ''}`.toLowerCase().trim()
    return an.localeCompare(bn)
  })

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <LetterheadHeader letterhead={letterhead} />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]} fixed>
            <Text style={[styles.headerCell, styles.colNum]}>#</Text>
            <Text style={[styles.headerCell, styles.colReg]}>Reg. No.</Text>
            <Text style={[styles.headerCell, styles.colName]}>Name</Text>
            <Text style={[styles.headerCell, styles.colGender]}></Text>
            <Text style={[styles.headerCell, styles.colStatus]}></Text>
          </View>
          {sorted.map((s, i) => (
            <View
              key={String(s.id)}
              style={[styles.row, i % 2 === 1 ? styles.rowAlt : {}]}
              wrap={false}
            >
              <Text style={[styles.cell, styles.colNum]}>{i + 1}</Text>
              <Text style={[styles.cell, styles.colReg]}>
                {s.registration_number || '-'}
              </Text>
              <Text style={[styles.cell, styles.colName]}>
                {`${s.user__first_name || ''} ${s.user__last_name || ''}`.trim() || '-'}
              </Text>
              <Text style={[styles.cell, styles.colGender]}></Text>
              <Text style={[styles.cell, styles.colStatus]}></Text>
            </View>
          ))}
          {sorted.length === 0 && (
            <View style={styles.row}>
              <Text
                style={[
                  styles.cell,
                  {
                    width: '100%',
                    textAlign: 'center',
                    color: '#9ca3af',
                  },
                ]}
              >
                No students found.
              </Text>
            </View>
          )}
        </View>
        <View style={styles.footer} fixed>
          <Text>Generated {generatedAt.toLocaleString()}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}