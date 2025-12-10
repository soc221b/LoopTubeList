// Ensure a minimal HTMLCanvasElement.getContext exists for axe-core under jsdom
try {
  if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
    HTMLCanvasElement.prototype.getContext = function () {
      return {
        getImageData: () => ({ data: [] }),
        putImageData: () => {},
        createImageData: () => [],
        getContextAttributes: () => ({}),
        measureText: () => ({ width: 0 }),
      };
    };
  }
} catch (e) {
  // ignore in non-browser environments
}
