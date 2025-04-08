// Shared style constants
export const nestingLabelStyle = {
  writingMode: "vertical-lr" as const,
  transform: "rotate(180deg)",
  whiteSpace: "nowrap" as const,
  textAlign: "center" as const,
  fontSize: "16px",
  fontWeight: "bold" as const,
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const verticalTextStyle = {
  writingMode: "vertical-lr" as const,
  transform: "rotate(180deg)",
  whiteSpace: "nowrap" as const,
  textAlign: "center" as const,
  fontSize: "16px",
  fontWeight: "bold" as const,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
};

export const flowerStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: "#d6b4fd",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative" as const,
};

export const flowerDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#9333ea",
  display: "inline-block",
};
