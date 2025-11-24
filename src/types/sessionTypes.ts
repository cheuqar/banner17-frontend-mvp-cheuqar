export enum SessionScope {
  EXPLORATION = "exploration",
  PROPERTY_DRILL = "property_drill",
  COMPARISON = "comparison"
}

export interface SessionMetadata {
  scope: SessionScope;
}