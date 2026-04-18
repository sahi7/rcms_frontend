export interface Letterhead {
  left_html: string
  center_html: string
  right_html: string
  left_width?: number   // percent, 10–80
  center_width?: number
  right_width?: number
}

export const EMPTY_LETTERHEAD: Letterhead = {
  left_html: '',
  center_html: '',
  right_html: '',
}
