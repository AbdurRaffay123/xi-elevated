/**
 * XI Elevated — Header & navigation drawer
 */

class XiHeaderComponent extends HTMLElement {
  #scrollHandler = null;
  #resizeObserver = null;

  connectedCallback() {
    this.#bindDrawerTriggers();
    this.#initScrollState();
    this.#setHeaderMetrics();
    this.#resizeObserver = new ResizeObserver(() => this.#setHeaderMetrics());
    this.#resizeObserver.observe(this);

    const headerGroup = document.querySelector('#header-group');
    if (headerGroup) {
      this.#resizeObserver.observe(headerGroup);
    }
  }

  disconnectedCallback() {
    if (this.#scrollHandler) {
      window.removeEventListener('scroll', this.#scrollHandler);
    }
    this.#resizeObserver?.disconnect();
  }

  #bindDrawerTriggers() {
    const drawer = document.querySelector('xi-drawer');
    if (!drawer) return;

    this.querySelectorAll('[data-xi-drawer-open]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        drawer.open();
        trigger.setAttribute('aria-expanded', 'true');
      });
    });

    drawer.addEventListener('xi-drawer:close', () => {
      this.querySelectorAll('[data-xi-drawer-open]').forEach((trigger) => {
        trigger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  #initScrollState() {
    const wantsTransparent = this.dataset.transparent === 'true';
    const scrollOffset = Number.parseInt(this.dataset.scrollOffset || '24', 10);

    if (!wantsTransparent || !this.#canUseTransparentOverlay()) {
      this.#applySolidState();
      return;
    }

    this.classList.remove('xi-header--solid');
    this.#updateScrollState(scrollOffset);

    this.#scrollHandler = () => this.#updateScrollState(scrollOffset);
    window.addEventListener('scroll', this.#scrollHandler, { passive: true });
  }

  #canUseTransparentOverlay() {
    const main = document.querySelector('#MainContent');
    if (!main) return false;

    const firstSection = main.querySelector(':scope > .shopify-section:first-child');
    if (!firstSection?.classList.contains('xi-home__section-slot--hero')) return false;

    return Boolean(
      firstSection.querySelector('.xi-home__pull-under-header, [data-xi-hero-overlap="true"]')
    );
  }

  #applySolidState() {
    this.classList.remove('xi-header--transparent', 'xi-header--scrolled', 'xi-header--transparent-mode');
    this.classList.add('xi-header--solid');
  }

  #updateScrollState(offset) {
    if (!this.#canUseTransparentOverlay()) {
      this.#applySolidState();
      return;
    }

    const scrolled = window.scrollY > offset;
    this.classList.remove('xi-header--solid');
    this.classList.toggle('xi-header--scrolled', scrolled);
    this.classList.toggle('xi-header--transparent', !scrolled);
  }

  #setHeaderMetrics() {
    const headerGroup = document.querySelector('#header-group');
    if (!headerGroup) return;

    let headerGroupHeight = 0;
    for (const child of headerGroup.children) {
      if (child instanceof HTMLElement) {
        headerGroupHeight += child.offsetHeight;
      }
    }

    const headerHeight = this.offsetHeight;
    document.body.style.setProperty('--xi-header-height', `${headerHeight}px`);
    document.body.style.setProperty('--xi-header-group-height', `${headerGroupHeight}px`);
    document.body.style.setProperty('--header-height', `${headerHeight}px`);
    document.body.style.setProperty('--header-group-height', `${headerGroupHeight}px`);
  }
}

class XiDrawer extends HTMLElement {
  #previouslyFocused = null;

  connectedCallback() {
    this.overlay = this.querySelector('[data-xi-drawer-overlay]');
    this.panel = this.querySelector('[data-xi-drawer-panel]');

    this.querySelectorAll('[data-xi-drawer-close]').forEach((trigger) => {
      trigger.addEventListener('click', () => this.close());
    });

    this.overlay?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.classList.contains('is-open')) {
        this.close();
      }
    });
  }

  open() {
    this.#previouslyFocused = document.activeElement;
    this.classList.add('is-open');
    document.body.classList.add('xi-drawer-open');
    this.panel?.focus();
  }

  close() {
    this.classList.remove('is-open');
    document.body.classList.remove('xi-drawer-open');
    this.dispatchEvent(new CustomEvent('xi-drawer:close'));
    if (this.#previouslyFocused instanceof HTMLElement) {
      this.#previouslyFocused.focus();
    }
  }
}

if (!customElements.get('xi-header-component')) {
  customElements.define('xi-header-component', XiHeaderComponent);
}

if (!customElements.get('xi-drawer')) {
  customElements.define('xi-drawer', XiDrawer);
}
