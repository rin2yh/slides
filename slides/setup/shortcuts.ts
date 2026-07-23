import { defineShortcutsSetup } from '@slidev/types'

export default defineShortcutsSetup((_nav, base) => {
  return base.filter(s => s.key !== 'g')
})
