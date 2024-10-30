import { SequenceIndexer } from "@0xsequence/indexer";

export const indexer = new SequenceIndexer(
  `https://${import.meta.env.VITE_CHAIN_HANDLE}-indexer.sequence.app`,
  import.meta.env.VITE_BUILDER_PROJECT_ACCESS_KEY!,
);
