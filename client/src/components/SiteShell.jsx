import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const SiteShell = ({
  children,
  headerVariant = 'site',
  headerTitle = 'grått',
  showNotice = true,
  showFooter = true,
  headerOverlay = false,
  headerTransparent = false,
  onBack
}) => {
  const noticeOffset = showNotice && headerVariant === 'site' ? 40 : 0;
  const headerOffset = headerVariant === 'site' ? 56 : 52;
  const totalOffset = noticeOffset + headerOffset;
  const topPadding = headerOverlay ? 0 : totalOffset;
  const location = useLocation();
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 420);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="pns-shell">
      <Header
        variant={headerVariant}
        title={headerTitle}
        showNotice={showNotice}
        transparent={headerTransparent}
        onBack={onBack}
      />
      <main
        className={`pns-main pns-page ${isEntering ? 'pns-page-enter' : 'pns-page-entered'}`}
        style={{ paddingTop: `${topPadding}px`, '--header-offset': `${totalOffset}px` }}
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default SiteShell;
