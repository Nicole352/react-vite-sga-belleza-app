import React from 'react';
import Header from './Header';
import ThemeWrapper from './ThemeWrapper';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <ThemeWrapper>
      <Header />
      <main>{children}</main>
    </ThemeWrapper>
  );
};

export default PublicLayout;
