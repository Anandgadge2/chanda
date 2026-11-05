'use client';

import clsx from 'clsx';

/**
 * Standard Portal Loader Component
 * Visual Identity:
 * Sleek modern electric indigo spinner ring with high-contrast cyber glow
 */
export default function PortalLoader({
  size = 'md', // 'sm' | 'md' | 'lg'
  text,
  className = '',
  py = 'py-12',
}) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-10 h-10 border-2.5',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center text-center select-none', py, className)}>
      <div
        className={clsx(
          sizeClasses[size] || sizeClasses.md,
          'border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2.5'
        )}
      />
      {text && (
        <p className="text-xs font-semibold text-slate-600 tracking-tight">
          {text}
        </p>
      )}
    </div>
  );
}
