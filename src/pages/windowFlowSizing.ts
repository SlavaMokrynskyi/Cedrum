export const enableWindowFlowSizing = (): (() => void) => {
  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById("root");

  const previous = {
    htmlWidth: html.style.width,
    htmlHeight: html.style.height,
    htmlMinWidth: html.style.minWidth,
    htmlMinHeight: html.style.minHeight,
    bodyWidth: body.style.width,
    bodyHeight: body.style.height,
    bodyMinWidth: body.style.minWidth,
    bodyMinHeight: body.style.minHeight,
    bodyPosition: body.style.position,
    bodyInset: body.style.inset,
    rootWidth: root?.style.width || "",
    rootHeight: root?.style.height || "",
    rootMinWidth: root?.style.minWidth || "",
    rootMinHeight: root?.style.minHeight || "",
  };

  html.style.width = "100vw";
  html.style.height = "100vh";
  html.style.minWidth = "0";
  html.style.minHeight = "0";

  body.style.width = "100vw";
  body.style.height = "100vh";
  body.style.minWidth = "0";
  body.style.minHeight = "0";
  body.style.position = "static";
  body.style.inset = "auto";

  if (root) {
    root.style.width = "100vw";
    root.style.height = "100vh";
    root.style.minWidth = "0";
    root.style.minHeight = "0";
  }

  return () => {
    html.style.width = previous.htmlWidth;
    html.style.height = previous.htmlHeight;
    html.style.minWidth = previous.htmlMinWidth;
    html.style.minHeight = previous.htmlMinHeight;

    body.style.width = previous.bodyWidth;
    body.style.height = previous.bodyHeight;
    body.style.minWidth = previous.bodyMinWidth;
    body.style.minHeight = previous.bodyMinHeight;
    body.style.position = previous.bodyPosition;
    body.style.inset = previous.bodyInset;

    if (root) {
      root.style.width = previous.rootWidth;
      root.style.height = previous.rootHeight;
      root.style.minWidth = previous.rootMinWidth;
      root.style.minHeight = previous.rootMinHeight;
    }
  };
};
