/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Layout from './Layout';
import { useEngineStore } from '../ToolBar/EngineGState';
import { useCodeEditorStore } from '../CodeEditor/CodeEditorGState';
import { useLayoutResize } from './customHooks/useLayoutResize';
import { useLayoutCodeEditorResize } from './customHooks/useLayoutCodeEditorResize';
import { useNotify } from '../common/components/toast/ToastContext';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../common/components/spacer/Spacer', () => ({ default: () => <div data-testid="spacer" /> }));
vi.mock('../ToolBar/ToolBar', () => ({ default: () => <div data-testid="toolbar" /> }));
vi.mock('../Tileset/TileSet', () => ({ default: () => <div data-testid="tileset" /> }));
vi.mock('../Map/Map', () => ({ default: () => <div data-testid="map" /> }));
vi.mock('../Project/ModalProject', () => ({ default: () => <div data-testid="modal-project" /> }));
vi.mock('../Files/FolderTree', () => ({ default: () => <div data-testid="folder-tree" /> }));
vi.mock('../Files/FileList', () => ({ default: () => <div data-testid="file-list" /> }));
vi.mock('../common/components/createFile/CreateFile', () => ({ default: () => <div data-testid="create-file" /> }));
vi.mock('../Entity/Entity', () => ({ default: () => <div data-testid="entity" /> }));
vi.mock('../DebugTerminal/DebugTerminal', () => ({ default: () => <div data-testid="debug-terminal" /> }));
vi.mock('../Tagger/Tagger', () => ({ default: () => <div data-testid="tagger" /> }));
vi.mock('./LayoutCodeEditor', () => ({ default: () => <div data-testid="layout-code-editor" /> }));
vi.mock('../DialogEditor/LocalizationTable', () => ({ default: () => <div data-testid="localization-table" /> }));

vi.mock('./customHooks/useLayoutResize', () => ({
    useLayoutResize: vi.fn(),
    LIMITS: {
        mapUtilityWidth: { min: 100 },
        entityWidth: { min: 100 },
        filesHeight: { min: 100 },
        filesMenuWidth: { min: 100 },
    },
}));

vi.mock('./customHooks/useLayoutCodeEditorResize', () => ({
    useLayoutCodeEditorResize: vi.fn(),
}));

vi.mock('../common/components/toast/ToastContext', () => ({
    useNotify: vi.fn(),
}));

vi.mock('../ToolBar/EngineGState', () => ({
    useEngineStore: vi.fn(),
}));

vi.mock('../CodeEditor/CodeEditorGState', () => ({
    useCodeEditorStore: vi.fn(),
}));

let resetLayoutCallback: () => void;
let engineExitCallback: () => void;

const mockOnResetLayout = vi.fn((cb) => {
    resetLayoutCallback = cb;
    return vi.fn();
});

const mockOnEngineExit = vi.fn((cb) => {
    engineExitCallback = cb;
    return vi.fn();
});

(window as any).api = {
    onResetLayout: mockOnResetLayout,
    onEngineExit: mockOnEngineExit,
};

describe('Layout', () => {
    const mockResetLayout = vi.fn();
    const mockResetCodeEditorLayout = vi.fn();
    const mockNotify = vi.fn();
    const mockResetEngineState = vi.fn();

    const setupStores = (engineState: any = {}, codeEditorState: any = {}) => {
        (useEngineStore as any).mockImplementation((selector: any) =>
            selector({
                translate: false,
                isRunning: false,
                runMode: null,
                editorMode: 'map',
                resetEngineState: mockResetEngineState,
                ...engineState,
            })
        );

        (useCodeEditorStore as any).mockImplementation((selector: any) =>
            selector({
                openFile: null,
                openUiFile: null,
                ...codeEditorState,
            })
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (useLayoutResize as any).mockReturnValue({
            mapUtilityWidth: 200,
            entityWidth: 200,
            filesHeight: 200,
            filesMenuWidth: 200,
            tilesetHeight: 200,
            resizeMapUtility: vi.fn(),
            resizeEntity: vi.fn(),
            resizeFiles: vi.fn(),
            resizeFilesMenu: vi.fn(),
            resetLayout: mockResetLayout,
            resizeTileset: vi.fn(),
        });

        (useLayoutCodeEditorResize as any).mockReturnValue({
            resetCodeEditorLayout: mockResetCodeEditorLayout,
        });

        (useNotify as any).mockReturnValue({
            notify: mockNotify,
        });
    });

    it('should render map editor layout by default', () => {
        setupStores();
        render(<Layout />);

        expect(screen.getByTestId('modal-project')).toBeInTheDocument();
        expect(screen.getByTestId('create-file')).toBeInTheDocument();
        expect(screen.getByTestId('toolbar')).toBeInTheDocument();
        
        expect(screen.getByTestId('tileset')).toBeInTheDocument();
        expect(screen.getByTestId('tagger')).toBeInTheDocument();
        expect(screen.getByTestId('map')).toBeInTheDocument();
        expect(screen.getByTestId('entity')).toBeInTheDocument();
        
        expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
        expect(screen.getByTestId('file-list')).toBeInTheDocument();

        expect(screen.queryByTestId('layout-code-editor')).not.toBeInTheDocument();
        expect(screen.queryByTestId('localization-table')).not.toBeInTheDocument();
        expect(screen.queryByTestId('debug-terminal')).not.toBeInTheDocument();
    });

    it('should render code editor layout when editorMode is code', () => {
        setupStores({ editorMode: 'code' });
        render(<Layout />);

        expect(screen.getByTestId('layout-code-editor')).toBeInTheDocument();
        
        expect(screen.getByTestId('tileset').parentElement?.parentElement?.parentElement).toHaveStyle('display: none');
    });


    it('should render debug terminal when running in debug mode', () => {
        setupStores({ isRunning: true, runMode: 'debug' });
        render(<Layout />);

        expect(screen.getByTestId('debug-terminal')).toBeInTheDocument();
        
        expect(screen.queryByTestId('folder-tree')).not.toBeInTheDocument();
        expect(screen.queryByTestId('file-list')).not.toBeInTheDocument();
    });

    it('should apply dirty glow class to toolbar container when in code mode and file is dirty', () => {
        setupStores(
            { editorMode: 'code' },
            { openFile: { isDirty: true } }
        );
        render(<Layout />);

        const toolbarWrapper = screen.getByTestId('toolbar').parentElement;
        expect(toolbarWrapper).toHaveClass('layout--toolbar-dirty');
    });

    it('should not apply dirty glow class if in map mode even if file is dirty', () => {
        setupStores(
            { editorMode: 'map' },
            { openFile: { isDirty: true } }
        );
        render(<Layout />);

        const toolbarWrapper = screen.getByTestId('toolbar').parentElement;
        expect(toolbarWrapper).not.toHaveClass('layout--toolbar-dirty');
    });

    it('should handle onResetLayout event', () => {
        setupStores();
        render(<Layout />);

        act(() => {
            resetLayoutCallback();
        });

        expect(mockResetLayout).toHaveBeenCalled();
        expect(mockResetCodeEditorLayout).toHaveBeenCalled();
        expect(mockNotify).toHaveBeenCalledWith('layout', 'resetLayout', 'success', 3000);
    });

    it('should handle onEngineExit event', () => {
        setupStores();
        render(<Layout />);

        act(() => {
            engineExitCallback();
        });

        expect(mockResetEngineState).toHaveBeenCalled();
    });
});