'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Shield,
  UserPlus,
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  Trash2,
  X,
  Sparkles,
  Users,
  Check,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'AGENT';
  status: 'ACTIVE' | 'INVITED';
  assignedConversations: number;
  lastActive: string;
}

const mockMembers: TeamMember[] = [
  {
    id: 'u1',
    name: 'Isuru Perera',
    email: 'isuru@demofashion.com',
    role: 'OWNER',
    status: 'ACTIVE',
    assignedConversations: 12,
    lastActive: 'Now (Active)',
  },
  {
    id: 'u2',
    name: 'Kasun Kalhara',
    email: 'kasun@demofashion.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    assignedConversations: 28,
    lastActive: '12 mins ago',
  },
  {
    id: 'u3',
    name: 'Dilini Fernando',
    email: 'dilini@demofashion.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    assignedConversations: 45,
    lastActive: '1 hour ago',
  },
  {
    id: 'u4',
    name: 'Nuwan Pradeep',
    email: 'nuwan@demofashion.com',
    role: 'AGENT',
    status: 'INVITED',
    assignedConversations: 0,
    lastActive: 'Invitation Pending',
  },
];

const roleBadges: Record<string, string> = {
  OWNER: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ADMIN: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  MANAGER: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  AGENT: 'bg-slate-800 text-slate-300 border-slate-700',
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MANAGER' | 'AGENT'>('AGENT');

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMem: TeamMember = {
      id: `u_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'INVITED',
      assignedConversations: 0,
      lastActive: 'Invitation Pending',
    };

    setMembers([...members, newMem]);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-emerald-400" /> Team & RBAC Permissions
          </h1>
          <p className="text-xs text-slate-400">
            Manage tenant team members, human chat takeover assignments, and granular access controls
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
        >
          <UserPlus className="h-4 w-4" /> Invite Team Member
        </button>
      </div>

      {/* MEMBERS TABLE */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" /> Active Team Members ({members.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Member Name & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Chats</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 shrink-0">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{m.name}</p>
                        <p className="text-slate-400 text-[11px]">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${roleBadges[m.role]}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${m.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {m.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-white">{m.assignedConversations} chats</td>
                  <td className="py-4 px-4 text-slate-400">{m.lastActive}</td>
                  <td className="py-4 px-4 text-right">
                    {m.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-all"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PERMISSION MATRIX */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" /> Role Permission Matrix Overview
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Feature / Action</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Manager</th>
                <th className="py-3 px-4">Support Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {[
                { feature: 'Manage Billing & Subscriptions', owner: true, admin: false, manager: false, agent: false },
                { feature: 'Edit AI Assistant Persona & System Prompts', owner: true, admin: true, manager: false, agent: false },
                { feature: 'Manage Team & Assign Roles', owner: true, admin: true, manager: false, agent: false },
                { feature: 'Human Chat Takeover & Messaging', owner: true, admin: true, manager: true, agent: true },
                { feature: 'Fulfill & Update Order Kanban Status', owner: true, admin: true, manager: true, agent: true },
                { feature: 'Upload & Delete Product Catalog Items', owner: true, admin: true, manager: true, agent: false },
              ].map((row) => (
                <tr key={row.feature} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 text-slate-300 font-medium">{row.feature}</td>
                  <td className="py-3 px-4">{row.owner ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-600" />}</td>
                  <td className="py-3 px-4">{row.admin ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-600" />}</td>
                  <td className="py-3 px-4">{row.manager ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-600" />}</td>
                  <td className="py-3 px-4">{row.agent ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-600" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-400" /> Invite New Team Member
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="agent@demofashion.com"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="ADMIN">Admin (Full store access except billing)</option>
                  <option value="MANAGER">Manager (Orders, Knowledge, Products)</option>
                  <option value="AGENT">Support Agent (Human chat takeover only)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
