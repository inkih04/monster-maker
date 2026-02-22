import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './DebugTerminal.css';
import { EngineLog, LogLevel } from '../../global/types/engineLog';

const MAX_LOGS = 500;

const ALL_LEVELS: LogLevel[] = ['info', 'warn', 'error', 'lua'];

const LEVEL_LABEL: Record<LogLevel, string> = {
	info: 'ENG',
	warn: 'WARN',
	error: 'ERR',
	lua: 'LUA',
};

function formatTimestamp(ts: number): string {
	const d = new Date(ts);
	const hh = String(d.getHours()).padStart(2, '0');
	const mm = String(d.getMinutes()).padStart(2, '0');
	const ss = String(d.getSeconds()).padStart(2, '0');
	const ms = String(d.getMilliseconds()).padStart(3, '0');
	return `${hh}:${mm}:${ss}.${ms}`;
}

function formatLogLine(entry: EngineLog): string {
	return `[${formatTimestamp(entry.timestamp)}] [${LEVEL_LABEL[entry.level]}] ${entry.message}`;
}

type CopyState = 'idle' | 'copied';

function DebugTerminal() {
	const [logs, setLogs] = useState<EngineLog[]>([]);
	const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(new Set(ALL_LEVELS));
	const [copyState, setCopyState] = useState<CopyState>('idle');

	const bodyRef = useRef<HTMLDivElement>(null);
	const isAtBottomRef = useRef<boolean>(true);
	const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const countByLevel = useMemo<Record<LogLevel, number>>(() => {
		const counts: Record<LogLevel, number> = { info: 0, warn: 0, error: 0, lua: 0 };
		for (const log of logs) {
			counts[log.level]++;
		}
		return counts;
	}, [logs]);

	const visibleLogs = useMemo<EngineLog[]>(
		() => logs.filter((l) => activeFilters.has(l.level)),
		[logs, activeFilters]
	);

	const handleScroll = () => {
		const el = bodyRef.current;
		if (!el) return;
		isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 32;
	};

	useEffect(() => {
		if (isAtBottomRef.current && bodyRef.current) {
			bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
		}
	}, [visibleLogs]);

	useEffect(() => {
		const removeLog = window.api.onEngineLog((engineLog: EngineLog) => {
			setLogs((prev) => {
				const next = [...prev, engineLog];
				return next.length > MAX_LOGS ? next.slice(next.length - MAX_LOGS) : next;
			});
		});

		const removeExit = window.api.onEngineExit(() => {
			setLogs([]);
			isAtBottomRef.current = true;
		});

		return () => {
			removeLog();
			removeExit();
		};
	}, []);

	useEffect(() => {
		return () => {
			if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
		};
	}, []);

	const handleClear = useCallback(() => {
		setLogs([]);
		isAtBottomRef.current = true;
	}, []);

	const handleCopy = useCallback(() => {
		if (visibleLogs.length === 0) return;
		const text = visibleLogs.map(formatLogLine).join('\n');
		navigator.clipboard.writeText(text).then(() => {
			setCopyState('copied');
			if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
			copyTimeoutRef.current = setTimeout(() => setCopyState('idle'), 2000);
		});
	}, [visibleLogs]);

	const toggleFilter = useCallback((level: LogLevel) => {
		setActiveFilters((prev) => {
			const next = new Set(prev);
			if (next.has(level) && next.size === 1) return prev;
			next.has(level) ? next.delete(level) : next.add(level);
			return next;
		});
	}, []);

	const handleScrollToBottom = useCallback(() => {
		if (bodyRef.current) {
			bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
			isAtBottomRef.current = true;
		}
	}, []);

	const emptyMessage =
		logs.length > 0 ? (
			'no logs match active filters'
		) : (
			<>
				waiting for output<span className="debugTerminal__emptyCaret">▌</span>
			</>
		);

	return (
		<div className="debugTerminal">
			<div className="debugTerminal__toolbar">
				<div className="debugTerminal__filters">
					{ALL_LEVELS.map((level) => (
						<button
							key={level}
							type="button"
							className={[
								'debugTerminal__filter',
								`debugTerminal__filter--${level}`,
								activeFilters.has(level) ? 'debugTerminal__filter--active' : '',
							].join(' ')}
							onClick={() => toggleFilter(level)}
							title={`Toggle ${level} logs`}
						>
							<span className="debugTerminal__filterLabel">{LEVEL_LABEL[level]}</span>
							{countByLevel[level] > 0 && (
								<span className="debugTerminal__filterCount">{countByLevel[level]}</span>
							)}
						</button>
					))}
				</div>

				<div className="debugTerminal__actions">
					<button
						type="button"
						className={[
							'debugTerminal__action',
							copyState === 'copied' ? 'debugTerminal__action--copied' : '',
						].join(' ')}
						onClick={handleCopy}
						disabled={visibleLogs.length === 0}
						title="Copy visible logs to clipboard"
					>
						{copyState === 'copied' ? '✓ copied' : '⎘ copy'}
					</button>
					<button
						type="button"
						className="debugTerminal__action debugTerminal__action--danger"
						onClick={handleClear}
						disabled={logs.length === 0}
						title="Clear all logs"
					>
						✕ clear
					</button>
				</div>
			</div>

			<div ref={bodyRef} className="debugTerminal__body" onScroll={handleScroll}>
				{visibleLogs.length === 0 ? (
					<div className="debugTerminal__empty">{emptyMessage}</div>
				) : (
					visibleLogs.map((entry, idx) => (
						<div key={idx} className={`debugTerminal__entry debugTerminal__entry--${entry.level}`}>
							<span className="debugTerminal__timestamp">{formatTimestamp(entry.timestamp)}</span>
							<span className={`debugTerminal__level debugTerminal__level--${entry.level}`}>
								{LEVEL_LABEL[entry.level]}
							</span>
							<span className={`debugTerminal__message debugTerminal__message--${entry.level}`}>
								{entry.message}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default DebugTerminal;
