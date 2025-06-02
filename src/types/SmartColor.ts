// types/SmartColor.ts
export type SmartColor =
  | { type: "fixed"; value: string }
  | { type: "branding"; key: string };
