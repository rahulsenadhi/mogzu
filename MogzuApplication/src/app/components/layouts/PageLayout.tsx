import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  className?: string;
}

/**
 * Consistent page layout component for all post-signup pages
 * Ensures uniform spacing, text sizing, and alignment
 */
export function PageLayout({
  children,
  title,
  subtitle,
  showHeader = true,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`h-full w-full overflow-y-auto bg-[#FFFDF9] ${className}`}>
      {showHeader && (title || subtitle) && (
        <div className="relative bg-white border-b border-gray-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {title && (
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
            )}
            {subtitle && (
              <p className="text-base text-gray-600">{subtitle}</p>
            )}
          </div>
          {/* Decorative curved shape */}
          <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path d="M0,100 Q50,0 100,50 T200,100 V200 H0 Z" fill="#4379ee" />
            </svg>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl';
}

/**
 * Page content wrapper with consistent padding and max-width
 */
export function PageContent({
  children,
  className = '',
  maxWidth = '7xl',
}: PageContentProps) {
  const maxWidthClass = {
    full: 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl',
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto px-6 py-6 ${className}`}>
      {children}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Section component for consistent spacing between page sections
 */
export function Section({
  children,
  title,
  subtitle,
  action,
  className = '',
}: SectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Consistent card component
 */
export function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  const paddingClass = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }[padding];

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 ${paddingClass} ${
        hover ? 'transition-all hover:shadow-md hover:border-gray-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Responsive grid component with consistent breakpoints
 */
export function Grid({
  children,
  cols = 4,
  gap = 'md',
  className = '',
}: GridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  }[cols];

  const gapClass = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }[gap];

  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>
      {children}
    </div>
  );
}
