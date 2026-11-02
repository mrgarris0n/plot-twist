/// <reference types="vite/client" />

declare const __BUILD__: string

interface ImportMetaEnv {
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
