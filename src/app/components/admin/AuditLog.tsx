import { useState, useEffect, useCallback } from 'react';
import { Shield, Search, RefreshCw, ChevronLeft, ChevronRight, User, Link2, BookOpen, MessageSquare, Heart, FileText, CheckSquare, BarChart2, Settings } from 'lucide-react';
import { projectId } from '../../utils/supabase/info';

interface AuditEntry {
  id: string;
  event: string;
  category: string;
  userId: string;
  userName: string;
  userEmail: string;
  metadata: Record<string, any>;
  timestamp: string;
}

interface AuditLogProps {
  accessToken: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  'user.signup': <User className="w-4 h-4" />,
  'user.email_verified': <CheckSquare className="w-4 h-4" />,
  'couple.linked': <Link2 className="w-4 h-4" />,
  'couple.unlinked': <Link2 className="w-4 h-4" />,
  'devotional.completed': <BookOpen className="w-4 h-4" />,
  'prayer.created': <Heart className="w-4 h-4" />,
  'prayer.answered': <CheckSquare className="w-4 h-4" />,
  'journal.created': <FileText className="w-4 h-4" />,
  'qa.answered': <MessageSquare className="w-4 h-4" />,
  'mood.logged': <BarChart2 className="w-4 h-4" />,
  'admin.privilege_granted': <Settings className="w-4 h-4" />,
  'admin.privilege_revoked': <Settings className="w-4 h-4" />,
  'profile.updated': <User className="w-4 h-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  auth: 'var(--primary-500)',
  social: 'var(--success-500)',
  content: 'var(--warning-500, #f59e0b)',
  admin: 'var(--error-500)',
};

const ALL_EVENTS = [
  'user.signup', 'user.email_verified',
  'couple.linked', 'couple.unlinked',
  'devotional.completed',
  'prayer.created', 'prayer.answered',
  'journal.created',
  'qa.answered',
  'mood.logged',
  'admin.privilege_granted', 'admin.privilege_revoked',
  'profile.updated',
];

const PAGE_SIZE = 20;

export function AuditLog({ accessToken }: AuditLogProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  const [filterCategory, setFilterCategory] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [searchText, setSearchText] = useState('');

  const fetchLog = useCallback(async (pg: number = 0) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(pg * PAGE_SIZE) });
      if (filterCategory) params.set('category', filterCategory);
      if (filterEvent) params.set('event', filterEvent);
      if (filterUserId.trim()) params.set('userId', filterUserId.trim());

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6d579fee/admin/audit-log?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch audit log');
      setEntries(data.entries || []);
      setTotal(data.total || 0);
      setPage(pg);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, filterCategory, filterEvent, filterUserId]);

  useEffect(() => { fetchLog(0); }, [fetchLog]);

  const filteredEntries = searchText.trim()
    ? entries.filter(e =>
        e.userName.toLowerCase().includes(searchText.toLowerCase()) ||
        e.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
        e.event.includes(searchText.toLowerCase())
      )
    : entries;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function formatTime(ts: string) {
    return new Date(ts).toLocaleString();
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>System Audit Log</h2>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          {total} events
        </span>
        <button
          onClick={() => fetchLog(page)}
          disabled={loading}
          className="p-2 rounded-lg transition-colors"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search user or event..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border"
            style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <select
          value={filterCategory}
          onChange={e => { setFilterCategory(e.target.value); setPage(0); }}
          className="py-1.5 px-2 text-sm rounded-lg border"
          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        >
          <option value="">All categories</option>
          <option value="auth">Auth</option>
          <option value="social">Social</option>
          <option value="content">Content</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={filterEvent}
          onChange={e => { setFilterEvent(e.target.value); setPage(0); }}
          className="py-1.5 px-2 text-sm rounded-lg border"
          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        >
          <option value="">All events</option>
          {ALL_EVENTS.map(ev => (
            <option key={ev} value={ev}>{ev}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filter by user ID..."
          value={filterUserId}
          onChange={e => setFilterUserId(e.target.value)}
          className="py-1.5 px-3 text-sm rounded-lg border"
          style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      {error && (
        <div className="p-3 text-sm rounded-lg" style={{ background: 'var(--error-50, #fef2f2)', color: 'var(--error-500)' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {filteredEntries.length === 0 && !loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
            No audit events found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-4 py-2 font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Event</th>
                  <th className="text-left px-4 py-2 font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>User</th>
                  <th className="text-left px-4 py-2 font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Details</th>
                  <th className="text-left px-4 py-2 font-medium text-xs" style={{ color: 'var(--muted-foreground)' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    style={{
                      background: i % 2 === 0 ? 'var(--background)' : 'var(--muted)',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span style={{ color: CATEGORY_COLORS[entry.category] || 'var(--foreground)' }}>
                          {EVENT_ICONS[entry.event] || <Shield className="w-4 h-4" />}
                        </span>
                        <div>
                          <div className="font-medium text-xs" style={{ color: 'var(--foreground)' }}>{entry.event}</div>
                          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{entry.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-xs" style={{ color: 'var(--foreground)' }}>{entry.userName || '—'}</div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{entry.userEmail || entry.userId?.slice(0, 8) + '...'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {Object.entries(entry.metadata || {}).map(([k, v]) => (
                          <span key={k} className="mr-2">
                            <span style={{ color: 'var(--foreground)' }}>{k}:</span> {String(v).slice(0, 40)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                      {formatTime(entry.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--muted-foreground)' }}>
            Page {page + 1} of {totalPages} · {total} total events
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLog(page - 1)}
              disabled={page === 0 || loading}
              className="p-1.5 rounded-lg disabled:opacity-40"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchLog(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="p-1.5 rounded-lg disabled:opacity-40"
              style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
