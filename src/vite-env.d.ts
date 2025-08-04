/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_PRODUCTION_API_URL: string;
  readonly VITE_DEV_SERVER_URL: string;
  readonly VITE_DEV_CLIENT_URL: string;
  readonly VITE_PRODUCTION_CLIENT_URL: string;
  readonly VITE_MOON_CLIENT_URL: string;
  readonly VITE_RANDOM_USER_API: string;
  readonly VITE_UI_AVATARS_API: string;
  readonly VITE_PLACEHOLDER_API: string;
  readonly VITE_CLOUDINARY_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_FALLBACK_API_URL: string;
  readonly VITE_FALLBACK_SOCKET_URL: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
