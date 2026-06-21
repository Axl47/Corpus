'use client';
import { useState, useTransition, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { UserPlus, AlertCircle, Check, Trash, Copy, Mail } from 'lucide-react';
import {
  inviteToWorkspace,
  removeFromWorkspace,
  updateWorkspaceMemberRole,
  transferWorkspaceOwnership,
} from '@/lib/actions/auth';
import { getWorkspaceInvites, revokeWorkspaceInvite } from '@/lib/actions/invites';
import type { CurrentUser, WorkspaceMember } from './types';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';

interface MembersTabProps {
  workspaceId: string;
  currentUser: CurrentUser;
  hasPrivilegedAccess: boolean;
  members: WorkspaceMember[];
  isLoadingMembers: boolean;
  onMembersChanged: () => void;
}

export default function MembersTab({
  workspaceId,
  currentUser,
  hasPrivilegedAccess,
  members,
  isLoadingMembers,
  onMembersChanged,
}: MembersTabProps) {
  const t = useTranslations('WorkspaceSettings');

  const [invites, setInvites] = useState<{ id: string; email: string; role: string; inviteLink: string }[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadInvites = () => {
    if (!hasPrivilegedAccess) return;
    getWorkspaceInvites(workspaceId).then(setInvites).catch(() => {});
  };
  useEffect(() => {
    loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, members.length]);

  const copyLink = (link: string) => {
    navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  };

  const handleRevokeInvite = async (id: string) => {
    await revokeWorkspaceInvite(id).catch(() => {});
    loadInvites();
  };

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'viewer'>('member');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [isInviting, startInviteTransition] = useTransition();
  const [actionPendingId, setActionPendingId] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState<{ userId: string; name: string } | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<{ userId: string; name: string } | null>(null);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) { setInviteError(t('emailRequired')); return; }
    setInviteError('');
    setInviteSuccess('');
    setInviteLink(null);
    startInviteTransition(async () => {
      const res = await inviteToWorkspace(workspaceId, email, inviteRole);
      if (res && 'error' in res && res.error) {
        setInviteError(res.error);
      } else if (res && 'inviteLink' in res && res.inviteLink) {
        // No account yet → show a shareable invite link.
        setInviteLink(res.inviteLink);
        setInviteEmail('');
        loadInvites();
      } else {
        setInviteSuccess(t('inviteSuccess', { email }));
        setInviteEmail('');
        onMembersChanged();
      }
    });
  };

  const handleRoleChange = async (userId: string, newRole: 'member' | 'viewer') => {
    setActionPendingId(userId);
    setActionError('');
    try {
      const res = await updateWorkspaceMemberRole(workspaceId, userId, newRole);
      if (res && 'error' in res) setActionError(res.error ?? '');
      else onMembersChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setActionPendingId(null);
    }
  };

  const handleTransferOwnership = (userId: string, userName: string | null) => {
    setShowTransferConfirm({ userId, name: userName || 'this user' });
  };

  const doTransferOwnership = async () => {
    if (!showTransferConfirm) return;
    const { userId } = showTransferConfirm;
    setShowTransferConfirm(null);
    setActionPendingId(userId);
    setActionError('');
    try {
      const res = await transferWorkspaceOwnership(workspaceId, userId);
      if (res && 'error' in res) setActionError(res.error ?? '');
      else onMembersChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setActionPendingId(null);
    }
  };

  const handleRemoveMember = (userId: string, userName: string | null) => {
    setShowRemoveConfirm({ userId, name: userName || 'this user' });
  };

  const doRemoveMember = async () => {
    if (!showRemoveConfirm) return;
    const { userId } = showRemoveConfirm;
    setShowRemoveConfirm(null);
    setActionPendingId(userId);
    setActionError('');
    try {
      const res = await removeFromWorkspace(workspaceId, userId);
      if (res && 'error' in res) setActionError(res.error ?? '');
      else onMembersChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setActionPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {hasPrivilegedAccess && (
        <form onSubmit={handleInvite} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
              {t('inviteNewMember')}
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              disabled={isInviting}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 placeholder-neutral-600 px-3 py-1.5 text-sm outline-none focus:border-blue-500/60 transition-colors disabled:opacity-50"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'member' | 'viewer')}
              disabled={isInviting}
              className="bg-neutral-900 border border-neutral-700 rounded-md text-neutral-100 px-2 py-1.5 text-xs outline-none cursor-pointer focus:border-blue-500/60"
            >
              <option value="member">{t('roleMember')}</option>
              <option value="viewer">{t('roleViewer')}</option>
            </select>
            <button
              type="submit"
              disabled={isInviting || !inviteEmail.trim()}
              className="text-xs bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
            >
              <UserPlus size={13} />
              {isInviting ? t('inviting') : t('invite')}
            </button>
          </div>
          {inviteError && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> {inviteError}
            </p>
          )}
          {inviteSuccess && (
            <p className="text-xs text-sky-400 flex items-center gap-1 mt-1">
              <Check size={12} /> {inviteSuccess}
            </p>
          )}
        </form>
      )}

      {/* Invite link for a not-yet-registered person */}
      {inviteLink && (
        <div className="rounded-lg border border-blue-500/25 bg-blue-500/5 p-3 space-y-2">
          <p className="m-0 text-[11px] text-neutral-300 flex items-center gap-1.5">
            <Mail size={12} className="text-blue-400" /> {t('inviteLinkReady')}
          </p>
          <div className="flex gap-1.5">
            <input
              readOnly
              value={inviteLink}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-md text-neutral-200 px-2 py-1.5 text-[11px] outline-none"
            />
            <button
              onClick={() => copyLink(inviteLink)}
              className="shrink-0 inline-flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-400 text-white px-2.5 py-1.5 rounded-md font-medium transition-colors"
            >
              <Copy size={12} /> {copied ? t('copied') : t('copy')}
            </button>
          </div>
        </div>
      )}

      {/* Pending invites */}
      {hasPrivilegedAccess && invites.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
            {t('pendingInvites')}
          </label>
          <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/20">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-2 px-3 py-2">
                <Mail size={13} className="text-neutral-500 shrink-0" />
                <span className="text-xs text-neutral-200 truncate flex-1">{inv.email}</span>
                <span className="text-[10px] text-neutral-500 shrink-0">{inv.role === 'viewer' ? t('roleViewer') : t('roleMember')}</span>
                <button onClick={() => copyLink(inv.inviteLink)} className="shrink-0 text-neutral-500 hover:text-neutral-200 transition-colors" title={t('copy')}>
                  <Copy size={13} />
                </button>
                <button onClick={() => handleRevokeInvite(inv.id)} className="shrink-0 text-neutral-500 hover:text-red-400 transition-colors" title={t('revokeInvite')}>
                  <Trash size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
          {t('membersCount', { count: members.length })}
        </label>
        {isLoadingMembers ? (
          <div className="py-8 flex justify-center items-center">
            <div className="w-5 h-5 rounded-full border-2 border-neutral-800 border-t-neutral-500 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900/20">
            {members.map((member) => {
              const isMe = member.id === currentUser.id;
              const isOwner = member.role === 'owner';
              const isPending = actionPendingId === member.id;
              return (
                <div key={member.id} className="flex items-center justify-between p-3 gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {member.image && member.image !== '' && member.image !== 'null' && !brokenImages[member.id] ? (
                      <img
                        src={member.image}
                        alt={member.name || 'User'}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                        onError={() => setBrokenImages(prev => ({ ...prev, [member.id]: true }))}
                      />
                    ) : (
                      <div
                        translate="no"
                        className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-200 shrink-0 notranslate"
                      >
                        {(member.name || member.email || 'U').trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-neutral-200 truncate">
                          {member.name || member.email || 'User'}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-semibold text-neutral-500 bg-neutral-800 px-1 py-0.5 rounded">
                            {t('you')}
                          </span>
                        )}
                      </div>
                      {member.name && member.email && (
                        <p className="text-[10px] text-neutral-500 truncate">{member.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isOwner ? (
                      <span className="text-[9px] font-bold text-sky-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                        {t('roleOwner')}
                      </span>
                    ) : isPending ? (
                      <div className="w-3.5 h-3.5 rounded-full border border-neutral-700 border-t-neutral-400 animate-spin shrink-0" />
                    ) : hasPrivilegedAccess && !isMe ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as 'member' | 'viewer')}
                        className="bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] font-semibold text-neutral-300 outline-none cursor-pointer hover:border-neutral-600 focus:border-blue-500/60"
                      >
                        <option value="member">{t('roleMember')}</option>
                        <option value="viewer">{t('roleViewer')}</option>
                      </select>
                    ) : (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        member.role === 'viewer'
                          ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                          : 'text-neutral-300 bg-neutral-800 border-neutral-700'
                      }`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    )}
                    {hasPrivilegedAccess && !isMe && !isOwner && !isPending && (
                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          onClick={() => handleTransferOwnership(member.id, member.name || member.email)}
                          className="text-[10px] font-semibold text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-1.5 py-0.5 rounded border border-neutral-700 transition-colors"
                        >
                          {t('makeOwner')}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name || member.email)}
                          className="p-1 text-neutral-500 hover:text-red-400 transition-colors rounded hover:bg-neutral-800"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {actionError && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={12} /> {actionError}
        </p>
      )}

      {showTransferConfirm && (
        <ConfirmDialog
          title={t('transferOwnershipTitle')}
          description={t('transferConfirm', { name: showTransferConfirm.name })}
          confirmLabel={t('makeOwner')}
          cancelLabel={t('cancel')}
          onConfirm={doTransferOwnership}
          onCancel={() => setShowTransferConfirm(null)}
        />
      )}

      {showRemoveConfirm && (
        <ConfirmDialog
          title={t('removeMemberTitle')}
          description={t('removeConfirm', { name: showRemoveConfirm.name })}
          confirmLabel={t('remove')}
          cancelLabel={t('cancel')}
          onConfirm={doRemoveMember}
          onCancel={() => setShowRemoveConfirm(null)}
        />
      )}
    </div>
  );
}
