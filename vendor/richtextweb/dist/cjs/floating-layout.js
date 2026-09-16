"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var floating_layout_exports = {};
__export(floating_layout_exports, {
  normalizeFloatingLayout: () => normalizeFloatingLayout
});
module.exports = __toCommonJS(floating_layout_exports);
function normalizeFloatingLayout(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new TypeError("Floating layout must be an options object.");
  const result = {};
  for (const [key, raw] of Object.entries(value)) {
    if ([
      "Width",
      "Height",
      "HorizontalOffset",
      "VerticalOffset",
      "Rotation",
      "WrapDistance"
    ].includes(key)) {
      if (typeof raw !== "number" || !Number.isFinite(raw))
        throw new TypeError(`${key} must be a finite number.`);
      const minimum = key === "Width" || key === "Height" ? 1 : key === "WrapDistance" ? 0 : -2e4;
      const maximum = key === "Rotation" ? 360 : 2e4;
      if (raw < minimum || raw > maximum || key === "Rotation" && raw < -360)
        throw new RangeError(`${key} is outside the supported layout range.`);
      result[key] = raw;
    } else if (key === "WrapStyle") {
      if (![
        "Inline",
        "Square",
        "Tight",
        "TopAndBottom",
        "BehindText",
        "InFrontOfText"
      ].includes(String(raw)))
        throw new TypeError("Unsupported text wrapping style.");
      result[key] = raw;
    } else if (key === "HorizontalAlignment") {
      if (!["Left", "Center", "Right", "Stretch"].includes(String(raw)))
        throw new TypeError("Unsupported horizontal alignment.");
      result[key] = raw;
    } else if (key === "Shape") {
      if (raw !== "Rectangle" && raw !== "Ellipse")
        throw new TypeError("Unsupported wrapping shape.");
      result[key] = raw;
    } else throw new TypeError(`Unsupported floating layout property: ${key}`);
  }
  return result;
}
//# sourceMappingURL=floating-layout.js.map
