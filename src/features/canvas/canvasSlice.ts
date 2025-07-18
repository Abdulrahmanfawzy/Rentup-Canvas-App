import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import type { AspectRatio, CanvasElementUnion, ElementType } from "./types";
import type {
  CanvasElement,
  CanvasTextElement,
  CircleShape,
  RectangleShape,
  EllipseShape,
  LineShape,
  TriangleShape,
  StarShape,
  CustomShape,
  RegularPolygonShape,
  ArcShape,
  WedgeShape,
  RingShape,
  ArrowShape,
} from "./types";

interface CanvasState {
  elements: CanvasElement[];
  past: CanvasElement[][];
  future: CanvasElement[][];
  stageWidth: number;
  stageHeight: number;
  aspectRatio?: AspectRatio;
}

const initialState: CanvasState = {
  elements: [],
  past: [],
  future: [],
  stageWidth: 1080,
  stageHeight: 1080,
  aspectRatio: "1:1",
};

let shapeIdCounter = 1;

// const createBaseElement = (id: string): Omit<CanvasElement, "type"> => ({
//   id,
//   x: 100,
//   y: 100,
//   width: 150,
//   height: 100,
//   x_percent: 0.1,
//   y_percent: 0.1,
//   width_percent: 0.15,
//   height_percent: 0.16,
//   rotation: 0,
//   selected: false,
//   fill: "#00A8E8",
//   opacity: 1,
//   fillBrandingType: "fixed",
//   strokeBrandingType: "fixed",
// });

const createBaseElement = (id: string): Omit<CanvasElement, "type"> => {
  const width = 150;
  const height = 100;
  const toPercent = (value: number, total: number) => {
    return Number(Number(value / total));
  };
  return {
    id,
    x: 100,
    y: 100,
    width,
    height,
    x_percent: toPercent(100, 1080),
    y_percent: toPercent(100, 1080),
    width_percent: toPercent(width, 1080),
    height_percent: toPercent(height, 1080),
    rotation: 0,
    selected: false,
    fill: "#00A8E8",
    opacity: 1,
    fillBrandingType: "fixed",
    strokeBrandingType: "fixed",
  };
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    addElement: (
      state,
      action: PayloadAction<
        | { type: "icon"; iconName: string }
        | {
            type: "text";
            text: string;
            toi_labels?: string;
          }
        | { type: Exclude<ElementType, "icon" | "text"> }
      >
    ) => {
      const currentId = shapeIdCounter++;
      const base = createBaseElement(String(currentId));
      let newElement: CanvasElement;

      switch (action.payload.type) {
        case "text":
          newElement = {
            ...base,
            id: `text-${currentId}`,
            fontSize_percent: 2.5,
            text: action.payload.text ?? "Edit Me Now...",
            toi_labels: action.payload.toi_labels ?? "", // ✅ لو جت من الديسباتش خدها، لو لأ خالي
            fill: "#524C4C", // background rect
            background: "#fff",
            padding: 8,
            fontSize: 20,
            opacity: 1,
            type: "text",
            backgroundStroke: "#A3A3A3",
            backgroundStrokeWidth: 0,
            fontFamily: "Arial",
            fontVariant: "regular", // Initialize font variant
            fontWeight: "normal",
            fontStyle: "normal",
            stroke: undefined,
            strokeTextWidth: 0,
            fontBrandingType: "fixed",
            borderRadius: {
              topLeft: 4,
              topRight: 4,
              bottomRight: 4,
              bottomLeft: 4,
            },
            alignment: "left",
            visible: true,
          } as CanvasTextElement;
          break;

        case "frame":
          newElement = {
            ...base,
            type: "frame",
            width: 250,
            height: 200,
            stroke: "#B5B0B0",
            strokeWidth: 1,
            fill: "transparent",
            dash: [5, 5],
            assetType: "frame",
            tags: [],
            visible: true,
            fitMode: "fill",
            objectFit: "cover",
            borderRadiusSpecial: 0,
          } as CanvasElement;
          break;

        case "icon":
          newElement = {
            ...base,
            type: "icon",
            iconName: action.payload.iconName,
            width: 50,
            height: 50,
            color: "#000000",
            visible: true,
          } as CanvasElement;
          break;

        case "circle":
          newElement = {
            ...base,
            type: "circle",
            radius: Math.min(base.width, base.height) / 2,
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as CircleShape;
          break;

        case "rectangle":
          newElement = {
            ...base,
            type: "rectangle",
            cornerRadius: 0,
            borderRadius: {
              topLeft: 0,
              topRight: 0,
              bottomRight: 0,
              bottomLeft: 0,
            },
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as RectangleShape;
          break;

        case "ellipse":
          newElement = {
            ...base,
            type: "ellipse",
            radiusX: base.width / 2,
            radiusY: base.height / 2,
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as EllipseShape;
          break;

        case "line":
          newElement = {
            ...base,
            type: "line",
            points: [0, 0, base.width, base.height],
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as LineShape;
          break;

        case "triangle":
          newElement = {
            ...base,
            type: "triangle",
            points: [
              0,
              base.height,
              base.width / 2,
              0,
              base.width,
              base.height,
            ],
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as TriangleShape;
          break;

        case "star":
          newElement = {
            ...base,
            type: "star",
            innerRadius: 20,
            outerRadius: 50,
            numPoints: 5,
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as StarShape;
          break;

        case "regularPolygon":
          newElement = {
            ...base,
            type: "regularPolygon",
            sides: 6,
            radius: Math.min(base.width, base.height) / 2,
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as RegularPolygonShape;
          break;

        case "arc":
          newElement = {
            ...base,
            type: "arc",
            innerRadius: 20,
            outerRadius: 50,
            angle: 60,
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as ArcShape;
          break;

        case "wedge":
          newElement = {
            ...base,
            type: "wedge",
            radius: Math.min(base.width, base.height) / 2,
            angle: 60,
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as WedgeShape;
          break;

        case "ring":
          newElement = {
            ...base,
            type: "ring",
            innerRadius: 20,
            outerRadius: 50,
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as RingShape;
          break;

        case "arrow":
          newElement = {
            ...base,
            type: "arrow",
            points: [0, 0, base.width, base.height],
            pointerLength: 10,
            pointerWidth: 10,
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as ArrowShape;
          break;

        case "custom":
          newElement = {
            ...base,
            type: "custom",
            points: [0, 0, base.width / 2, base.height, base.width, 0],
            stroke: "#000000",
            strokeWidth: 2,
            visible: true,
          } as CustomShape;
          break;

        default:
          throw new Error(`Unsupported element type: ${action.payload.type}`);
      }

      state.past.push(state.elements.map((el) => ({ ...el })));
      state.future = [];
      state.elements.push(newElement);
    },
    addImageElement: (
      state,
      action: PayloadAction<{ src: string; width: number; height: number }>
    ) => {
      const { src, width, height } = action.payload;

      state.elements.push({
        id: nanoid(),
        type: "image",
        x: 150,
        y: 150,
        width,
        height,
        rotation: 0,
        selected: false,
        src,
        originalWidth: width,
        originalHeight: height,
        fill: "",
      });
    },
    selectElement: (state, action: PayloadAction<string | null>) => {
      state.elements.forEach((el) => {
        el.selected = el.id === action.payload;
      });
    },
    deselectAllElements: (state) => {
      state.elements = state.elements.map((el) => ({
        ...el,
        selected: false,
      }));
    },
    updateElement: (
      state,
      action: PayloadAction<{
        id: string | number | undefined;
        updates: Partial<CanvasElementUnion>;
      }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.elements.findIndex((el) => el.id === id);
      if (index !== -1) {
        state.past.push(state.elements.map((el) => ({ ...el })));
        state.future = [];
        state.elements[index] = { ...state.elements[index], ...updates };
      }
    },
    deleteSelectedElement: (state) => {
      const selectedIndex = state.elements.findIndex((el) => el.selected);
      if (selectedIndex !== -1) {
        state.past.push(state.elements.map((el) => ({ ...el })));
        state.future = [];
        state.elements.splice(selectedIndex, 1);
      }
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past.pop();
        if (previous) {
          state.future.unshift(state.elements.map((el) => ({ ...el })));
          state.elements = previous;
        }
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future.shift();
        if (next) {
          state.past.push(state.elements.map((el) => ({ ...el })));
          state.elements = next;
        }
      }
    },
    moveElementUp: (state, action: PayloadAction<string>) => {
      const index = state.elements.findIndex((el) => el.id === action.payload);
      if (index < state.elements.length - 1) {
        state.past.push(state.elements.map((el) => ({ ...el })));
        state.future = [];
        [state.elements[index], state.elements[index + 1]] = [
          state.elements[index + 1],
          state.elements[index],
        ];
      }
    },
    moveElementDown: (state, action: PayloadAction<string>) => {
      const index = state.elements.findIndex((el) => el.id === action.payload);
      if (index > 0) {
        state.past.push(state.elements.map((el) => ({ ...el })));
        state.future = [];
        [state.elements[index], state.elements[index - 1]] = [
          state.elements[index - 1],
          state.elements[index],
        ];
      }
    },
    toggleElementVisibility(state, action: PayloadAction<string>) {
      const element = state.elements.find((el) => el.id === action.payload);
      if (element) {
        element.visible = !(element.visible ?? true);
      }
    },
    setStageSize: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.stageWidth = action.payload.width;
      state.stageHeight = action.payload.height;
    },
    setAspectRatio: (state, action: PayloadAction<AspectRatio | undefined>) => {
      state.aspectRatio = action.payload;
    },
    setElements: (state, action: PayloadAction<CanvasElement[]>) => {
      state.past.push(state.elements.map((el) => ({ ...el })));
      state.future = [];
      state.elements = action.payload;
    },
    clearCanvas: (state) => {
      state.past.push(state.elements.map((el) => ({ ...el })));
      state.future = [];
      state.elements = [];
    },
  },
});

export const {
  addElement,
  addImageElement,
  selectElement,
  updateElement,
  deleteSelectedElement,
  moveElementDown,
  moveElementUp,
  undo,
  redo,
  setStageSize,
  setAspectRatio,
  setElements,
  clearCanvas,
  deselectAllElements,
  toggleElementVisibility,
} = canvasSlice.actions;

export default canvasSlice.reducer;
