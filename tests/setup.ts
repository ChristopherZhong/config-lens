if (typeof window !== 'undefined' && window.Range) {
  if (!window.Range.prototype.getClientRects) {
    window.Range.prototype.getClientRects = function () {
      return [] as unknown as DOMRectList;
    };
  }
  if (!window.Range.prototype.getBoundingClientRect) {
    window.Range.prototype.getBoundingClientRect = function () {
      return {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect;
    };
  }
}
