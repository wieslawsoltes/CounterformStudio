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
export {
  normalizeFloatingLayout
};
//# sourceMappingURL=floating-layout.js.map
