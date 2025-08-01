export type ElementType =
  | "text"
  | "frame"
  | "image"
  | "circle"
  | "rectangle"
  | "ellipse"
  | "line"
  | "triangle"
  | "star"
  | "custom"
  | "regularPolygon"
  | "arc"
  | "wedge"
  | "ring"
  | "arrow"
  | "icon";

export type FitMode = "fill" | "fit" | "stretch";

export type BrandingType = "fixed" | "dynamic";

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  x_percent?: number;
  y_percent?: number;
  width_percent?: number;
  height_percent?: number;
  rotation?: number;
  selected?: boolean;
  fill: string;
  opacity?: number;
  stroke?: string;
  strokeWidth?: number;
  fillBrandingType?: string;
  strokeBrandingType?: string;
  // frame specific
  dash?: number[];
  frameId?: string | null;
  tags?: string[];
  // img
  src?: string;
  fitMode?: string;
  originalWidth?: number;
  originalHeight?: number;
  // icons
  icon?: string;
  iconName?: string;
  color?: string;
  text?: string;
  // for percentage
  newWidth?: number;
  newHeight?: number;
  fontSize?: number;
  isSelected?: string;
  scaleX?: number;
  scaleY?: number;
  radius?: number;
  fontSize_percent?: number;
  visible?: boolean;
  borderRadiusSpecial?: number;

  fontWeight?: string;
  fontStyle?: string;
  white_space?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}
export interface CanvasFrameElement extends CanvasElement {
  type: "frame";
  dash: number[];
  frameId: string | null;
  tags: string[];
  label: string;
  assetType: string;
  frame_position_in_template: string;
}

export interface CanvasTextElement extends CanvasElement {
  type: "text";
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontVariant?: string;
  background?: string;
  padding?: number;
  backgroundStroke?: string;
  backgroundStrokeWidth: number;
  fontBrandingType?: BrandingType;
  toi_labels?: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration?: "none" | "underline";
  align?: "left" | "center" | "right";
  borderRadius?: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  };
  white_space?: string;
}

export interface CanvasImageElement extends CanvasElement {
  type: "image";
  src?: string;
  fitMode?: FitMode;
  originalWidth?: number;
}

// ===== Shapes Elements =====
export interface CircleShape extends CanvasElement {
  type: "circle";
  radius: number;
}

export interface RectangleShape extends CanvasElement {
  type: "rectangle";
  width: number;
  height: number;
  cornerRadius?: number | number[];
  borderRadius?: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  };
}

export interface EllipseShape extends CanvasElement {
  type: "ellipse";
  radiusX: number;
  radiusY: number;
}

export interface LineShape extends CanvasElement {
  type: "line";
  points: number[];
}

export interface TriangleShape extends CanvasElement {
  type: "triangle";
  points: number[];
}

export interface StarShape extends CanvasElement {
  type: "star";
  innerRadius: number;
  outerRadius: number;
  numPoints: number;
}

export interface CustomShape extends CanvasElement {
  type: "custom";
  points: number[];
}

export interface RegularPolygonShape extends CanvasElement {
  type: "regularPolygon";
  sides: number;
  radius: number;
}

export interface ArcShape extends CanvasElement {
  type: "arc";
  innerRadius: number;
  outerRadius: number;
  angle: number;
}

export interface WedgeShape extends CanvasElement {
  type: "wedge";
  radius: number;
  angle: number;
}

export interface RingShape extends CanvasElement {
  type: "ring";
  innerRadius: number;
  outerRadius: number;
}

export interface ArrowShape extends CanvasElement {
  type: "arrow";
  points: number[];
  pointerLength?: number;
  pointerWidth?: number;
}

export type CanvasElementUnion =
  | CanvasElement
  | CanvasTextElement
  | CanvasImageElement
  | CircleShape
  | RectangleShape
  | EllipseShape
  | LineShape
  | TriangleShape
  | StarShape
  | CustomShape
  | RegularPolygonShape
  | ArcShape
  | WedgeShape
  | RingShape
  | ArrowShape
  | CanvasFrameElement;

export type AspectRatio = "1:1" | "9:16";
