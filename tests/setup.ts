if (typeof window !== 'undefined' && typeof window.Range !== 'undefined') {
  if (typeof window.Range.prototype.getClientRects !== 'function') {
    window.Range.prototype.getClientRects = function getClientRects(): DOMRectList {
      const rects: DOMRect[] = [];
      return Object.assign(rects, {
        item: (index: number) => rects[index] || null,
      }) as unknown as DOMRectList;
    };
  }

  if (typeof window.Range.prototype.getBoundingClientRect !== 'function') {
    window.Range.prototype.getBoundingClientRect = function getBoundingClientRect(): DOMRect {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => ({}),
      };
    };
  }
}
