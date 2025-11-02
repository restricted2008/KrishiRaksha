import React, { ReactNode } from 'react';
import '../styles/responsive.css';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Main responsive layout wrapper
 * Mobile-first approach with flexbox
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`app-layout ${className}`}>
      {children}
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * Responsive page header with title and actions
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  actions, 
  className = '' 
}) => {
  return (
    <header className={`app-header ${className}`} style={{ styles.header }}>
      <div className="container">
        <div style={styles.headerContent}>
          <div style={styles.headerText}>
            <h1 style={styles.title}>{title}</h1>
            {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && (
            <div style={styles.headerActions}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

/**
 * Main content container with responsive padding
 */
export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  maxWidth = 'xl',
  className = '' 
}) => {
  const widthClass = maxWidth === 'full' ? '' : 'container';
  
  return (
    <main className={`app-main ${widthClass} ${className}`}>
      {children}
    </main>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

/**
 * Responsive grid with configurable columns per breakpoint
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'lg',
  className = '' 
}) => {
  return (
    <div 
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols.mobile}, 1fr)`,
        ...styles.responsiveGrid(cols)
      }}
    >
      {children}
    </div>
  );
};

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
}

/**
 * Responsive card component
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  hover = false,
  padding = 'lg',
  className = '',
  onClick 
}) => {
  return (
    <div 
      className={`card p-${padding} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...styles.card
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  responsive?: boolean; // Stack on mobile
}

/**
 * Flexible flex container with responsive options
 */
export const Flex: React.FC<FlexProps> = ({ 
  children, 
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  gap = 'md',
  responsive = false,
  className = '' 
}) => {
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  const wrapClass = wrap ? 'flex-wrap' : '';
  
  return (
    <div 
      className={`flex gap-${gap} ${alignClass} ${justifyClass} ${wrapClass} ${className}`}
      style={responsive ? styles.responsiveFlex : { flexDirection: direction }}
    >
      {children}
    </div>
  );
};

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

/**
 * Content section with optional title
 */
export const Section: React.FC<SectionProps> = ({ 
  children, 
  title, 
  subtitle,
  spacing = 'xl',
  className = '' 
}) => {
  return (
    <section className={`mb-${spacing} ${className}`}>
      {(title || subtitle) && (
        <div style={styles.sectionHeader}>
          {title && <h2>{title}</h2>}
          {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
};

// Styles object for inline styles (can be moved to CSS modules)
const styles = {
  header: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--spacing-md)',
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
  headerText: {
    flex: 1,
  },
  title: {
    margin: 0,
    marginBottom: 'var(--spacing-xs)',
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: 'var(--font-size-sm)',
  },
  headerActions: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    flexWrap: 'wrap' as const,
  },
  responsiveGrid: (cols: { mobile?: number; tablet?: number; desktop?: number }) => ({
    '@media (min-width: 768px)': {
      gridTemplateColumns: `repeat(${cols.tablet || 2}, 1fr)`,
    },
    '@media (min-width: 1024px)': {
      gridTemplateColumns: `repeat(${cols.desktop || 3}, 1fr)`,
    },
  }),
  card: {
    transition: 'all 0.3s ease',
  },
  responsiveFlex: {
    flexDirection: 'column' as const,
    '@media (min-width: 768px)': {
      flexDirection: 'row',
    },
  },
  sectionHeader: {
    marginBottom: 'var(--spacing-lg)',
  },
  sectionSubtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: 'var(--font-size-sm)',
  },
};

export default ResponsiveLayout;
