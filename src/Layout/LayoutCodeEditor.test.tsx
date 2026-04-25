/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LayoutCodeEditor from './LayoutCodeEditor';
import { useEngineStore } from '../ToolBar/EngineGState';
import { useCodeEditorStore } from '../CodeEditor/CodeEditorGState';
import { useEngineConfigStore } from '../Tagger/useEngineConfigStore';
import { useLayoutCodeEditorResize } from './customHooks/useLayoutCodeEditorResize';
import { updateLiveCssContent } from '../CodeEditor/monacoConfig';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('../ToolBar/EngineGState', () => ({
	useEngineStore: vi.fn(),
}));

vi.mock('../CodeEditor/CodeEditorGState', () => ({
	useCodeEditorStore: vi.fn(),
}));

vi.mock('../Tagger/useEngineConfigStore', () => ({
	useEngineConfigStore: vi.fn(),
}));

vi.mock('./customHooks/useLayoutCodeEditorResize', () => ({
	useLayoutCodeEditorResize: vi.fn(),
	CODE_EDITOR_LIMITS: {
		leftPanelWidth: { min: 100 },
		rightPanelWidth: { min: 100 },
	},
}));

vi.mock('../CodeEditor/monacoConfig', () => ({
	updateLiveCssContent: vi.fn(),
}));

vi.mock('../common/components/spacer/Spacer', () => ({
	default: () => <div data-testid="spacer" />,
}));
vi.mock('../Map/MapPreview/MapPreview', () => ({
	default: () => <div data-testid="map-preview" />,
}));
vi.mock('../CodeEditor/CodeEditor', () => ({
	default: (props: any) => (
		<div data-testid={`code-editor-${props.language}`} data-value={props.value} />
	),
}));
vi.mock('../CodeEditor/CodeEditorLoadingOverlay', () => ({
	CodeEditorLoadingOverlay: () => <div data-testid="loading-overlay" />,
}));
vi.mock('./UiScriptPanel', () => ({ default: () => <div data-testid="ui-script-panel" /> }));
vi.mock('../DialogEditor/LocalizationTable', () => ({
	LocalizationTable: () => <div data-testid="localization-table" />,
}));
vi.mock('../DialogEditor/DialogEditor', () => ({
	default: () => <div data-testid="dialog-editor" />,
}));

describe('LayoutCodeEditor', () => {
	const mockUpdateContent = vi.fn();
	const mockUpdateHtmlContent = vi.fn();
	const mockUpdateCssContent = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(useLayoutCodeEditorResize as any).mockReturnValue({
			leftPanelWidth: 200,
			rightPanelWidth: 200,
			mapPreviewHeight: 200,
			resizeLeftPanel: vi.fn(),
			resizeRightPanel: vi.fn(),
			resizeMapPreview: vi.fn(),
		});

		(useCodeEditorStore as any).mockImplementation((selector: any) =>
			selector({
				openFile: null,
				openUiFile: null,
				updateContent: mockUpdateContent,
				updateHtmlContent: mockUpdateHtmlContent,
				updateCssContent: mockUpdateCssContent,
			})
		);

		(useEngineConfigStore as any).mockImplementation((selector: any) =>
			selector({
				tags: ['player', 'enemy'],
			})
		);
	});

	it('should render empty state when codeEditorMode is null', () => {
		(useEngineStore as any).mockImplementation((selector: any) =>
			selector({ codeEditorMode: null })
		);
		render(<LayoutCodeEditor />);
		expect(screen.getByText('noFileOpen')).toBeInTheDocument();
	});

	it('should render single lua editor when codeEditorMode is single', () => {
		(useEngineStore as any).mockImplementation((selector: any) =>
			selector({ codeEditorMode: 'single' })
		);
		(useCodeEditorStore as any).mockImplementation((selector: any) =>
			selector({
				openFile: { content: 'print("hello")' },
				updateContent: mockUpdateContent,
			})
		);

		render(<LayoutCodeEditor />);

		const editor = screen.getByTestId('code-editor-lua');
		expect(editor).toBeInTheDocument();
		expect(editor).toHaveAttribute('data-value', 'print("hello")');
		expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
	});

	it('should render duo html/css editor when codeEditorMode is duo', () => {
		(useEngineStore as any).mockImplementation((selector: any) =>
			selector({ codeEditorMode: 'duo' })
		);
		(useCodeEditorStore as any).mockImplementation((selector: any) =>
			selector({
				openUiFile: { htmlContent: '<div></div>', cssContent: '.red { color: red; }' },
				updateHtmlContent: mockUpdateHtmlContent,
				updateCssContent: mockUpdateCssContent,
			})
		);

		render(<LayoutCodeEditor />);

		const htmlEditor = screen.getByTestId('code-editor-html');
		expect(htmlEditor).toBeInTheDocument();
		expect(htmlEditor).toHaveAttribute('data-value', '<div></div>');

		const cssEditor = screen.getByTestId('code-editor-css');
		expect(cssEditor).toBeInTheDocument();
		expect(cssEditor).toHaveAttribute('data-value', '.red { color: red; }');

		expect(screen.getByTestId('map-preview')).toBeInTheDocument();
		expect(screen.getByTestId('ui-script-panel')).toBeInTheDocument();
		expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
		expect(screen.getAllByTestId('spacer')).toHaveLength(3);

		expect(updateLiveCssContent).toHaveBeenCalledWith('.red { color: red; }');
	});

	it('should render dialog editor when codeEditorMode is dialog', () => {
		(useEngineStore as any).mockImplementation((selector: any) =>
			selector({ codeEditorMode: 'dialog' })
		);

		render(<LayoutCodeEditor />);

		expect(screen.getByTestId('dialog-editor')).toBeInTheDocument();
		expect(screen.getByTestId('localization-table')).toBeInTheDocument();
		expect(screen.getByTestId('spacer')).toBeInTheDocument();
		expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
	});

	it('should render single json editor when codeEditorMode is json', () => {
		(useEngineStore as any).mockImplementation((selector: any) =>
			selector({ codeEditorMode: 'json' })
		);
		(useCodeEditorStore as any).mockImplementation((selector: any) =>
			selector({
				openFile: { content: '{"key": "value"}' },
				updateContent: mockUpdateContent,
			})
		);

		render(<LayoutCodeEditor />);

		const editor = screen.getByTestId('code-editor-json');
		expect(editor).toBeInTheDocument();
		expect(editor).toHaveAttribute('data-value', '{"key": "value"}');
		expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
	});
});
