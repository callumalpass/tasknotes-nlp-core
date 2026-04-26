import type { NLPTriggersConfig } from "./types.js";

export const DEFAULT_NLP_TRIGGERS: NLPTriggersConfig = {
  triggers: [
    { propertyId: "tags", trigger: "#", enabled: true },
    { propertyId: "contexts", trigger: "@", enabled: true },
    { propertyId: "projects", trigger: "+", enabled: true },
    { propertyId: "status", trigger: "*", enabled: true },
    { propertyId: "priority", trigger: "!", enabled: false },
  ],
};
