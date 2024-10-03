import { SequenceWaaS } from "@0xsequence/waas";

const sequence = new SequenceWaaS({
  projectAccessKey: import.meta.env.VITE_BUILDER_PROJECT_ACCESS_KEY!,
  waasConfigKey: import.meta.env.VITE_WAAS_CONFIG_KEY!,
  network: "arbitrum-sepolia",
});

export default sequence;
