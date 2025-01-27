/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// src/env.d.ts

interface ImportMetaEnv {
    readonly OPENROUTER_API_KEY: string;   // Secret variable only accessible on the server
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }