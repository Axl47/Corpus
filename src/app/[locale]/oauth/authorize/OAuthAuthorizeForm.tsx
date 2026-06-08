'use client';

import { useTranslations } from 'next-intl';

interface Workspace {
  id: string;
  name: string;
  icon: string | null;
}

interface Props {
  clientName: string;
  scope: 'read' | 'write';
  workspaces: Workspace[];
  userName: string;
  onApprove: (formData: FormData) => Promise<void>;
  onDeny: () => Promise<void>;
}

export function OAuthAuthorizeForm({ clientName, scope, workspaces, userName, onApprove, onDeny }: Props) {
  const t = useTranslations('OAuthAuthorize');

  const scopePermissions = scope === 'write'
    ? [t('permReadWrite'), t('permCreateEdit')]
    : [t('permReadOnly')];

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/15 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#445c95" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider">{t('remnus')}</p>
              <h1 className="text-white font-semibold text-base leading-tight">{t('title')}</h1>
            </div>
          </div>
          <p className="text-neutral-300 text-sm">
            {t('subtitle', { client: clientName })}
          </p>
          <p className="text-neutral-500 text-xs mt-1">{t('signedInAs', { user: userName })}</p>
        </div>

        {/* Permissions */}
        <div className="px-6 py-4 border-b border-neutral-800">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">{t('permissions')}</p>
          <ul className="space-y-2">
            {scopePermissions.map((perm) => (
              <li key={perm} className="flex items-center gap-2 text-sm text-neutral-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="#7fc36d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {perm}
              </li>
            ))}
          </ul>
        </div>

        {/* Workspace selector */}
        <form action={onApprove} className="px-6 py-4 border-b border-neutral-800">
          <label className="text-xs text-neutral-500 uppercase tracking-wider mb-2 block">
            {t('selectWorkspace')}
          </label>
          <select
            name="workspace_id"
            required
            defaultValue={workspaces[0]?.id}
            className="w-full bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm px-3 py-2 rounded-none focus:outline-none focus:border-blue-500"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm py-2.5 transition-colors"
          >
            {t('authorize')}
          </button>
        </form>

        {/* Deny */}
        <div className="px-6 py-4">
          <form action={onDeny}>
            <button
              type="submit"
              className="w-full text-neutral-500 hover:text-neutral-300 text-sm py-1.5 transition-colors"
            >
              {t('deny')}
            </button>
          </form>
          <p className="text-center text-xs text-neutral-600 mt-3">{t('disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
