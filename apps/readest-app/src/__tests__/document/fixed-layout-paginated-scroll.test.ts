import { describe, expect, it } from 'vitest';

import { computePaginatedScroll } from 'foliate-js/fixed-layout.js';

describe('fixed-layout paginated page-turn scroll reset', () => {
  it('resets the vertical scroll to the top of the page on a page turn (#4683)', () => {
    // A tall fit-width page leaves the host scrolled to the bottom; turning to
    // the next page must start at the top, not inherit the previous offset.
    expect(
      computePaginatedScroll({
        elementWidth: 800,
        containerWidth: 800,
        scrollTop: 1200,
        scrollLeft: 0,
        pageTurn: true,
        lockPanX: false,
      }),
    ).toEqual({ scrollLeft: 0, scrollTop: 0 });
  });

  it('preserves the vertical scroll on a non-navigation re-render (resize/zoom/theme)', () => {
    expect(
      computePaginatedScroll({
        elementWidth: 800,
        containerWidth: 800,
        scrollTop: 1200,
        scrollLeft: 0,
        pageTurn: false,
        lockPanX: false,
      }),
    ).toEqual({ scrollLeft: 0, scrollTop: 1200 });
  });

  it('re-centers horizontally when the page is wider than the viewport', () => {
    expect(
      computePaginatedScroll({
        elementWidth: 1200,
        containerWidth: 800,
        scrollTop: 0,
        scrollLeft: 0,
        pageTurn: true,
        lockPanX: false,
      }),
    ).toEqual({ scrollLeft: 200, scrollTop: 0 });
  });
});

describe('fixed-layout horizontal pan lock (#5976)', () => {
  it('keeps the current horizontal offset on a page turn when locked', () => {
    // The reader panned a zoomed page so its wide side margins fall outside the
    // viewport. Turning the page must land on the same column of the new page
    // instead of snapping back to the centre.
    expect(
      computePaginatedScroll({
        elementWidth: 1200,
        containerWidth: 800,
        scrollTop: 900,
        scrollLeft: 340,
        pageTurn: true,
        lockPanX: true,
      }),
    ).toEqual({ scrollLeft: 340, scrollTop: 0 });
  });

  it('keeps the current horizontal offset on a re-render when locked', () => {
    expect(
      computePaginatedScroll({
        elementWidth: 1200,
        containerWidth: 800,
        scrollTop: 900,
        scrollLeft: 340,
        pageTurn: false,
        lockPanX: true,
      }),
    ).toEqual({ scrollLeft: 340, scrollTop: 900 });
  });

  it('still re-centers when the lock is off', () => {
    expect(
      computePaginatedScroll({
        elementWidth: 1200,
        containerWidth: 800,
        scrollTop: 0,
        scrollLeft: 340,
        pageTurn: true,
        lockPanX: false,
      }),
    ).toEqual({ scrollLeft: 200, scrollTop: 0 });
  });
});

describe('fixed-layout zoom keeps the viewport centre', () => {
  it('centres a page that fit the viewport once zoom makes it overflow', () => {
    // Fit-page at 100% (centre fraction 0.5) zoomed until the page is 2000px
    // tall in an 800px viewport: the middle of the page must be in view, not
    // its top.
    expect(
      computePaginatedScroll({
        elementWidth: 800,
        containerWidth: 800,
        containerHeight: 800,
        scrollHeight: 2000,
        scrollTop: 0,
        scrollLeft: 0,
        pageTurn: false,
        lockPanX: false,
        centerFraction: 0.5,
      }),
    ).toEqual({ scrollLeft: 0, scrollTop: 600 });
  });

  it('keeps the point the reader was looking at in the centre', () => {
    // Viewing the lower part (centre at 3/4 of the page) before zooming in.
    expect(
      computePaginatedScroll({
        elementWidth: 800,
        containerWidth: 800,
        containerHeight: 800,
        scrollHeight: 4000,
        scrollTop: 0,
        scrollLeft: 0,
        pageTurn: false,
        lockPanX: false,
        centerFraction: 0.75,
      }),
    ).toEqual({ scrollLeft: 0, scrollTop: 2600 });
  });
});
