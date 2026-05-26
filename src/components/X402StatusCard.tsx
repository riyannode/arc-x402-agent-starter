'use client';

interface X402StatusCardProps {
  title: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  children?: React.ReactNode;
}

const STATUS_STYLES: Record<string, string> = {
  idle: 'border-gray-700',
  loading: 'border-arc-500/50 animate-pulse',
  success: 'border-green-500',
  error: 'border-red-500',
};

const STATUS_ICONS: Record<string, string> = {
  idle: '○',
  loading: '◎',
  success: '✓',
  error: '✗',
};

export default function X402StatusCard({
  title,
  status,
  message,
  children,
}: X402StatusCardProps) {
  return (
    <div
      className={`rounded-lg border bg-gray-900/50 p-4 ${STATUS_STYLES[status] || 'border-gray-700'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-200">{title}</h3>
        <span
          className={`text-lg ${
            status === 'success'
              ? 'text-green-400'
              : status === 'error'
                ? 'text-red-400'
                : status === 'loading'
                  ? 'text-arc-400'
                  : 'text-gray-500'
          }`}
        >
          {STATUS_ICONS[status]}
        </span>
      </div>
      {message && (
        <p className="text-xs text-gray-400 font-mono mb-2">{message}</p>
      )}
      {children}
    </div>
  );
}
