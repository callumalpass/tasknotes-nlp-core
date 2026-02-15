export interface StatusConfig {
  id: string;
  value: string;
  label: string;
  color: string;
  icon?: string;
  isCompleted: boolean;
  order: number;
  autoArchive: boolean;
  autoArchiveDelay: number;
}

export interface PriorityConfig {
  id: string;
  value: string;
  label: string;
  color: string;
  weight: number;
}

export interface UserMappedField {
  id: string;
  displayName: string;
  key: string;
  type: "text" | "number" | "date" | "boolean" | "list";
  autosuggestFilter?: unknown;
  defaultValue?: string | number | boolean | string[];
}

export interface PropertyTriggerConfig {
  propertyId: string;
  trigger: string;
  enabled: boolean;
}

export interface NLPTriggersConfig {
  triggers: PropertyTriggerConfig[];
}
