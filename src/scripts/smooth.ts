/**
 * Inertial smooth scrolling for content pages (Lenis). Wheel and trackpad input is eased; touch devices keep
 * their native scrolling, and visitors who prefer reduced motion get plain native scroll (Lenis is not started).
 * Lenis drives the real window scroll position, so sticky elements, scroll events and IntersectionObservers
 * all keep working unchanged.
 */
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HEADER_OFFSET = -84;

let lenis: Lenis | null = null;

export function initSmoothScroll(): Lenis | null {
  if (lenis || reduce) return lenis;
  lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 0.95,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: true,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
  });
  document.addEventListener('click', onAnchorClick);
  return lenis;
}

/** Smoothly bring an element into view; `center` keeps it in the middle of the viewport. */
export function scrollToElement(el: HTMLElement, { center = false } = {}) {
  if (!lenis) {
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: center ? 'center' : 'start' });
    return;
  }
  const offset = center ? -Math.max(0, (window.innerHeight - el.offsetHeight) / 2) : HEADER_OFFSET;
  lenis.scrollTo(el, { offset, duration: 1.4, easing: easeInOutExpo });
}

// In-page links (including "Skip to content"): glide there, then move keyboard focus like a native jump would.
function onAnchorClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
  if (!a || a.origin !== location.origin || a.pathname !== location.pathname || !a.hash) return;
  const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
  if (!target || !lenis) return;
  e.preventDefault();
  lenis.scrollTo(target, {
    offset: HEADER_OFFSET,
    duration: 1.2,
    easing: easeInOutExpo,
    onComplete: () => {
      if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    },
  });
  history.pushState(null, '', a.hash);
}

function easeInOutExpo(t: number) {
  if (t === 0 || t === 1) return t;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}
