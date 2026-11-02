import { useStore } from './state/store'
import { useLang } from './strings/useLang'
import EditorPage from './ui/EditorPage'
import GardensList from './ui/GardensList'

export default function App() {
  const open = useStore((s) => s.project !== null)
  const lang = useLang()
  // Keyed by language: a switch remounts the tree, so every string and worker result is rebuilt.
  return open ? <EditorPage key={lang} /> : <GardensList key={lang} />
}
