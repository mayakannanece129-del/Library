import React, { useState } from 'react';
import { History, Search, Filter, Shield, Clock, BookOpen, Users, RotateCcw, ArrowUpRight } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.user_name || '').toLowerCase().includes(q);
    const matchesType = typeFilter === 'All' || log.entity_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('ADD') || action.includes('REGISTER') || action.includes('PAY')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
    }
    if (action.includes('ISSUE')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300';
    }
    if (action.includes('RETURN')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300';
    }
    if (action.includes('DELETE') || action.includes('OVERDUE')) {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  };

  return (
    <div id="activity-logs-view" className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          System Activity & Audit Trail
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Immutable logging of library transactions, accession additions, circulation issues, returns, and cashier collections.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="activity-search-input"
            type="text"
            placeholder="Search by action, details, or officer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
          />
        </div>

        <select
          id="activity-entity-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
        >
          <option value="All">All Operations</option>
          <option value="book">Books</option>
          <option value="member">Members</option>
          <option value="issue">Issues</option>
          <option value="return">Returns</option>
          <option value="fine">Fines</option>
        </select>
      </div>

      {/* Logs Timeline */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No activity logs found matching search.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {log.details}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>Logged by: <strong>{log.user_name || 'System Auto-Daemon'}</strong></span>
                      <span>•</span>
                      <span>Entity: <span className="capitalize">{log.entity_type}</span></span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs font-mono text-slate-500">
                    {new Date(log.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
