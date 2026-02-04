import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const SiteShell = ({
  children,
  headerVariant = 'site',
  headerTitle = 'Elements',
  showNotice = true,
  showFooter = true,
  onBack
}) => {
  const noticeOffset = showNotice && headerVariant === 'site' ? 40 : 0;
  const headerOffset = headerVariant === 'site' ? 56 : 52;
  const topPadding = noticeOffset + headerOffset;

  return (
    <div className="pns-shell">
      <Header
        variant={headerVariant}
        title={headerTitle}
        showNotice={showNotice}
        onBack={onBack}
      />
      <main className="pns-main" style={{ paddingTop: `${topPadding}px` }}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default SiteShell;
