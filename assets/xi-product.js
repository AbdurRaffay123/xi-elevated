/**
 * XI product page — media gallery, full-width thumbs + nav
 */
(() => {
  const initMediaGallery = (root) => {
    const frames = root.querySelectorAll('[data-xi-product-media-frame]');
    const thumbs = root.querySelectorAll('[data-xi-product-media-thumb]');
    const zoomLink = root.querySelector('.xi-product-media__zoom');
    const viewport = root.querySelector('[data-xi-product-media-viewport]');
    const prevBtn = root.querySelector('[data-xi-product-media-prev]');
    const nextBtn = root.querySelector('[data-xi-product-media-next]');
    const thumbsList = root.querySelector('[data-xi-product-media-thumbs]');

    if (!frames.length) return;

    const setActive = (mediaId) => {
      frames.forEach((frame) => {
        const isMatch = frame.dataset.mediaId === mediaId;
        frame.hidden = !isMatch;
        frame.classList.toggle('is-active', isMatch);

        if (isMatch && zoomLink) {
          const image = frame.querySelector('.xi-product-media__image');
          const fullSrc = image?.getAttribute('src') || image?.currentSrc;
          if (fullSrc) zoomLink.href = fullSrc;
        }
      });

      thumbs.forEach((thumb) => {
        const isActive = thumb.dataset.mediaId === mediaId;
        thumb.classList.toggle('is-active', isActive);
        thumb.setAttribute('aria-current', isActive ? 'true' : 'false');

        if (isActive && viewport) {
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      });
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const mediaId = thumb.dataset.mediaId;
        if (mediaId) setActive(mediaId);
      });
    });

    if (!viewport || !thumbsList) return;

    const getScrollStep = () => {
      const firstItem = thumbsList.querySelector('li');
      if (!firstItem) return viewport.clientWidth;
      const styles = getComputedStyle(thumbsList);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      return firstItem.offsetWidth + gap;
    };

    const updateNav = () => {
      if (!prevBtn || !nextBtn) return;

      const { scrollLeft, scrollWidth, clientWidth } = viewport;
      const hasOverflow = scrollWidth - clientWidth > 2;

      prevBtn.hidden = !hasOverflow || scrollLeft <= 2;
      nextBtn.hidden = !hasOverflow || scrollLeft + clientWidth >= scrollWidth - 2;
    };

    prevBtn?.addEventListener('click', () => {
      viewport.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });

    nextBtn?.addEventListener('click', () => {
      viewport.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
    });

    viewport.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateNav);
      observer.observe(viewport);
      observer.observe(thumbsList);
    }

    updateNav();
  };

  document.querySelectorAll('[data-xi-product-media]').forEach(initMediaGallery);

  document.addEventListener('shopify:section:load', (event) => {
    event.target.querySelectorAll('[data-xi-product-media]').forEach(initMediaGallery);
  });
})();
