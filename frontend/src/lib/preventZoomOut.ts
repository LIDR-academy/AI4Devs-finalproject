/**
 * Prevent page zoom-out below 100% (trackpad pinch / Ctrl+wheel / Ctrl+-).
 * Zoom-in remains allowed for accessibility.
 *
 * Desktop Chromium ignores viewport minimum-scale; trackpad pinch arrives as
 * wheel events with ctrlKey set, so those must be cancelled in JS.
 */
export function installPreventZoomOut(): void {
  const currentScale = () => window.visualViewport?.scale ?? 1;

  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    // Chromium: positive deltaY on ctrl+wheel / trackpad pinch => zoom out
    if (event.deltaY > 0 && currentScale() <= 1.01) {
      event.preventDefault();
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    if (event.key !== '-' && event.key !== '_') return;
    if (currentScale() <= 1.01) {
      event.preventDefault();
    }
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeyDown);
}
