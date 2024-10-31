/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
interface ImportMetaEnv {
  readonly VITE_CHAIN_HANDLE: string;
  readonly VITE_BUILDER_PROJECT_ACCESS_KEY: string;
  readonly VITE_WAAS_CONFIG_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_APPLE_CLIENT_ID: string;
  readonly VITE_TOKEN_CONTRACT_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
