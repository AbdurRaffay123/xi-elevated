/**
 * XI homepage interactions
 * Shared logic for horizontal section tracks (product grid + community gallery).
 */
(() => {
  const setupScrollableTrack = (rootSelector, trackSelector, arrowSelector) => {
    const roots = document.querySelectorAll(rootSelector);
    if (!roots.length) return;

    roots.forEach((root) => {
      const track = root.querySelector(trackSelector);
      const arrow = root.querySelector(arrowSelector);
      if (!track || !arrow) return;

      const updateArrow = () => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        arrow.hidden = maxScroll <= 4 || track.scrollLeft >= maxScroll - 4;
      };

      const onArrowClick = () => {
        track.scrollBy({ left: track.clientWidth * 0.82, behavior: 'smooth' });
      };

      arrow.addEventListener('click', onArrowClick);
      track.addEventListener('scroll', updateArrow, { passive: true });
      window.addEventListener('resize', updateArrow, { passive: true });
      updateArrow();
    });
  };

  setupScrollableTrack(
    '[data-xi-product-grid]',
    '[data-xi-product-grid-track]',
    '[data-xi-product-grid-arrow]'
  );
  setupScrollableTrack(
    '[data-xi-community]',
    '[data-xi-community-track]',
    '[data-xi-community-arrow]'
  );
})();
