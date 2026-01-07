import React from 'react';
import { useBreakpoints } from '../hooks/useMediaQuery';

interface AdminSectionHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
  marginBottom?: string;
}

const AdminSectionHeader: React.FC<AdminSectionHeaderProps> = ({ title, subtitle, rightSlot, marginBottom }) => {
  const { isMobile } = useBreakpoints();

  return (
    <div
      style={{
        marginBottom: marginBottom ?? (isMobile ? '0.75rem' : '1rem'),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}
    >
      <div>
        <h2
          style={{
            color: 'var(--admin-text-primary, #1e293b)',
            margin: '0 0 0.25rem 0',
            fontSize: isMobile ? '1rem' : '1.25rem',
            fontWeight: '700'
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            style={{
              color: 'var(--admin-text-muted, #9ca3af)',
              fontSize: '0.7rem',
              margin: 0
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {rightSlot ? <div style={{ flexShrink: 0 }}>{rightSlot}</div> : null}
    </div>
  );
};

export default AdminSectionHeader;
