import { SequenceIndexer } from "@0xsequence/indexer";

export const indexer = new SequenceIndexer(
  "https://arbitrum-sepolia-indexer.sequence.app",
  import.meta.env.VITE_BUILDER_PROJECT_ACCESS_KEY!,
);
