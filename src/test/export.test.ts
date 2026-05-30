import { describe, it, expect } from 'vitest'
import { exportCSV, downloadCSV } from '@/lib/export'

describe('exportCSV', () => {
  it('generates CSV string with headers and rows', () => {
    const headers = ['Nama', 'Stok', 'Harga']
    const rows = [
      ['Tepung', '5', '12000'],
      ['Gula', '2', '15000'],
    ]
    const csv = exportCSV(headers, rows)
    expect(csv).toContain('Nama,Stok,Harga')
    expect(csv).toContain('Tepung,5,12000')
    expect(csv).toContain('Gula,2,15000')
  })

  it('includes UTF-8 BOM for Excel compatibility', () => {
    const csv = exportCSV(['A'], [['1']])
    expect(csv.charCodeAt(0)).toBe(0xFEFF)
  })

  it('handles empty rows', () => {
    const csv = exportCSV(['A', 'B'], [])
    expect(csv).toContain('A,B')
  })

  it('escapes commas in values', () => {
    const csv = exportCSV(['Name'], [['Tepung, Terigu']])
    expect(csv).toContain('"Tepung, Terigu"')
  })

  it('escapes quotes in values', () => {
    const csv = exportCSV(['Name'], [['Tepung "Segitiga"']])
    expect(csv).toContain('"Tepung ""Segitiga""')
  })

  it('handles special characters (Indonesian)', () => {
    const csv = exportCSV(['Nama'], [['Témpé']])
    expect(csv).toContain('Témpé')
  })
})

describe('downloadCSV', () => {
  it('triggers download with filename', () => {
    const createObjectURL = vi.fn(() => 'blob:url')
    const revokeObjectURL = vi.fn()
    const click = vi.fn()

    global.URL.createObjectURL = createObjectURL
    global.URL.revokeObjectURL = revokeObjectURL

    const link = { click, href: '', download: '', style: {} as CSSStyleDeclaration }
    document.createElement = vi.fn((tag: string) => {
      if (tag === 'a') return link
      return document.createElement(tag)
    })
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()

    downloadCSV('a,b\n1,2', 'test.csv')

    expect(link.download).toBe('test.csv')
    expect(click).toHaveBeenCalled()
  })
})
