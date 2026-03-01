export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div className="app-footer__brand">
          <img
            src="/stressed4heaven-logo.png"
            alt="Stressed4Heaven"
            className="app-footer__logo"
          />
          <span className="app-footer__name">2Stressed4Heaven</span>
        </div>
        <p className="app-footer__copy">
          &copy; {new Date().getFullYear()} 2Stressed4Heaven. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
