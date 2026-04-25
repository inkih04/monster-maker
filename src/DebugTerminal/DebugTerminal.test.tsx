import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { EngineLog } from '../../global/types/engineLog';
import DebugTerminal from './DebugTerminal';

let logCallback: (log: EngineLog) => void;
let exitCallback: () => void;

const mockOnEngineLog = vi.fn((cb) => {
    logCallback = cb;
    return vi.fn();
});

const mockOnEngineExit = vi.fn((cb) => {
    exitCallback = cb;
    return vi.fn();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).api = {
    onEngineLog: mockOnEngineLog,
    onEngineExit: mockOnEngineExit,
};

Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
    },
});

describe('DebugTerminal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render initial empty state correctly', () => {
        render(<DebugTerminal />);

        expect(screen.getByText(/waiting for output/i)).toBeInTheDocument();
        expect(screen.getByTitle('Copy visible logs to clipboard')).toBeDisabled();
        expect(screen.getByTitle('Clear all logs')).toBeDisabled();
    });

    it('should display logs when received via callback', () => {
        render(<DebugTerminal />);

        act(() => {
            logCallback({
                level: 'info',
                message: 'Engine started successfully',
                timestamp: new Date('2026-04-25T10:00:00.000Z').getTime(),
            });
        });

        expect(screen.getByText('Engine started successfully')).toBeInTheDocument();
        expect(screen.queryByText(/waiting for output/i)).not.toBeInTheDocument();
        expect(screen.getByTitle('Copy visible logs to clipboard')).not.toBeDisabled();
        expect(screen.getByTitle('Clear all logs')).not.toBeDisabled();
    });

    it('should filter logs correctly when clicking level buttons', () => {
        render(<DebugTerminal />);

        act(() => {
            logCallback({ level: 'info', message: 'Info message', timestamp: Date.now() });
            logCallback({ level: 'error', message: 'Error message', timestamp: Date.now() });
        });

        expect(screen.getByText('Info message')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();

        const infoFilterBtn = screen.getByTitle('Toggle info logs');
        fireEvent.click(infoFilterBtn);

        expect(screen.queryByText('Info message')).not.toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should not allow deactivating the last active filter', () => {
        render(<DebugTerminal />);

        const infoFilterBtn = screen.getByTitle('Toggle info logs');
        const warnFilterBtn = screen.getByTitle('Toggle warn logs');
        const errorFilterBtn = screen.getByTitle('Toggle error logs');
        const luaFilterBtn = screen.getByTitle('Toggle lua logs');

        fireEvent.click(infoFilterBtn);
        fireEvent.click(warnFilterBtn);
        fireEvent.click(luaFilterBtn);

        fireEvent.click(errorFilterBtn);

        expect(errorFilterBtn).toHaveClass('debugTerminal__filter--active');
    });

    it('should clear logs when clicking the clear button', () => {
        render(<DebugTerminal />);

        act(() => {
            logCallback({ level: 'info', message: 'Test message', timestamp: Date.now() });
        });

        expect(screen.getByText('Test message')).toBeInTheDocument();

        const clearBtn = screen.getByTitle('Clear all logs');
        fireEvent.click(clearBtn);

        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
        expect(screen.getByText(/waiting for output/i)).toBeInTheDocument();
    });

    it('should clear logs when onEngineExit event is triggered', () => {
        render(<DebugTerminal />);

        act(() => {
            logCallback({ level: 'info', message: 'Test message', timestamp: Date.now() });
        });

        expect(screen.getByText('Test message')).toBeInTheDocument();

        act(() => {
            exitCallback();
        });

        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('should copy logs to clipboard and change button state temporarily', async () => {
        render(<DebugTerminal />);

        const timestamp = new Date('2026-04-25T10:00:00.000Z').getTime();

        act(() => {
            logCallback({ level: 'error', message: 'Critical failure', timestamp });
        });

        const copyBtn = screen.getByTitle('Copy visible logs to clipboard');
        
        await act(async () => {
            fireEvent.click(copyBtn);
        });

        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('[ERR] Critical failure'));

        expect(screen.getByText('✓ copied')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByText('⎘ copy')).toBeInTheDocument();
    });
});