/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SIGNALR_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_MAX_IMAGE_SIZE: string
  readonly VITE_ALLOWED_IMAGE_TYPES: string
  readonly VITE_DEFAULT_PAGE_SIZE: string
  readonly VITE_MAX_PAGE_SIZE: string
  readonly VITE_MIN_BID_INCREMENT: string
  readonly VITE_MAX_AUCTION_DURATION_DAYS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}