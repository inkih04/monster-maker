/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FileList from './FileList';

vi.mock('../common/utils/filesUtils', () => ({
	getFileIcon: (type: string) => <span data-testid={`icon-${type}`}>{type}</span>,
}));

vi.mock('../common/components/delete/DeleteConfirmation', () => ({
	default: ({ open, onConfirm, itemName }: any) =>
		open ? (
			<div data-testid="delete-confirmation">
				<span>{itemName}</span>
				<button onClick={onConfirm}>Confirm Delete</button>
			</div>
		) : null,
}));

vi.mock('../common/components/save/SaveConfirmation', () => ({
	default: ({ open, onConfirm }: any) =>
		open ? (
			<div data-testid="save-confirmation">
				<button onClick={onConfirm}>Confirm Save</button>
			</div>
		) : null,
}));

const mockUseFileWatcher = vi.fn();
vi.mock('../common/customHooks/useFileWatcher', () => ({
	useFileWatcher: () => mockUseFileWatcher(),
}));

const mockUseFileActions = vi.fn();
vi.mock('./customHooks/useFileActions', () => ({
	useFileActions: () => mockUseFileActions(),
}));

const mockUseFileRename = vi.fn();
vi.mock('./customHooks/useFileRename', () => ({
	useFileRename: () => mockUseFileRename(),
}));

const mockUseFileCreate = vi.fn();
vi.mock('./customHooks/useFileCreate', () => ({
	useFileCreate: () => mockUseFileCreate(),
	CREATABLE_TYPE_TO_ICON: { folder: 'folder-icon', file: 'file-icon' },
}));

const mockUseFileEventListener = vi.fn();
vi.mock('./customHooks/useFileEventListener', () => ({
	useFileEventListener: () => mockUseFileEventListener(),
}));

describe('FileList', () => {
	const mockTryOpenFile = vi.fn();
	const mockHandleConfirmDelete = vi.fn();
	const mockHandleOpenFile = vi.fn();
	const mockSetNewFileName = vi.fn();
	const mockHandleRenameKeyDown = vi.fn();
	const mockCancelRename = vi.fn();
	const mockSetNewCreateName = vi.fn();
	const mockHandleCreateKeyDown = vi.fn();
	const mockCancelCreation = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(window as any).api = {
			showFileListContextMenu: vi.fn(),
			showFileContextMenu: vi.fn(),
		};

		mockUseFileWatcher.mockReturnValue({
			files: [],
			isLoading: false,
		});

		mockUseFileActions.mockReturnValue({
			showDeleteConfirm: false,
			showSaveConfirm: false,
			fileToDelete: null,
			setShowDeleteConfirm: vi.fn(),
			setShowSaveConfirm: vi.fn(),
			tryOpenFile: mockTryOpenFile,
			handleOpenFile: mockHandleOpenFile,
			handleConfirmDelete: mockHandleConfirmDelete,
			handleDeleteRequest: vi.fn(),
		});

		mockUseFileRename.mockReturnValue({
			renamingFile: null,
			newFileName: '',
			setNewFileName: mockSetNewFileName,
			startRename: vi.fn(),
			cancelRename: mockCancelRename,
			handleRenameKeyDown: mockHandleRenameKeyDown,
		});

		mockUseFileCreate.mockReturnValue({
			creatingFileType: null,
			newFileName: '',
			setNewFileName: mockSetNewCreateName,
			inputRef: { current: null },
			cancelCreation: mockCancelCreation,
			handleCreateKeyDown: mockHandleCreateKeyDown,
		});

		mockUseFileEventListener.mockReturnValue({});
	});

	it('should return null when isLoading is true', () => {
		mockUseFileWatcher.mockReturnValue({ files: [], isLoading: true });
		const { container } = render(<FileList />);
		expect(container).toBeEmptyDOMElement();
	});

	it('should render the file list correctly', () => {
		mockUseFileWatcher.mockReturnValue({
			files: [
				{ name: 'test.txt', path: '/test.txt', type: 'text' },
				{ name: 'image.png', path: '/image.png', type: 'image' },
			],
			isLoading: false,
		});

		render(<FileList />);

		expect(screen.getByText('test.txt')).toBeInTheDocument();
		expect(screen.getByText('image.png')).toBeInTheDocument();
		expect(screen.getByTestId('icon-text')).toBeInTheDocument();
		expect(screen.getByTestId('icon-image')).toBeInTheDocument();
	});


	it('should call showFileContextMenu on item context menu', () => {
		mockUseFileWatcher.mockReturnValue({
			files: [{ name: 'file1', path: '/file1', type: 'doc' }],
			isLoading: false,
		});

		render(<FileList />);
		const item = screen.getByText('file1').closest('.files--item');

		if (item) {
			fireEvent.contextMenu(item);
			expect((window as any).api.showFileContextMenu).toHaveBeenCalledWith({
				name: 'file1',
				path: '/file1',
				type: 'doc',
			});
		}
	});

	it('should call tryOpenFile on double click', () => {
		mockUseFileWatcher.mockReturnValue({
			files: [{ name: 'doc1', path: '/doc1', type: 'doc' }],
			isLoading: false,
		});

		render(<FileList />);
		const item = screen.getByText('doc1').closest('.files--item');

		if (item) {
			fireEvent.doubleClick(item);
			expect(mockTryOpenFile).toHaveBeenCalledWith({
				name: 'doc1',
				path: '/doc1',
				type: 'doc',
			});
		}
	});

	it('should not call tryOpenFile on double click if renaming', () => {
		mockUseFileWatcher.mockReturnValue({
			files: [{ name: 'doc1', path: '/doc1', type: 'doc' }],
			isLoading: false,
		});
		mockUseFileRename.mockReturnValue({
			renamingFile: '/doc1',
			newFileName: 'doc1_new',
			setNewFileName: mockSetNewFileName,
			startRename: vi.fn(),
			cancelRename: mockCancelRename,
			handleRenameKeyDown: mockHandleRenameKeyDown,
		});

		render(<FileList />);
		const input = screen.getByDisplayValue('doc1_new');
		const item = input.closest('.files--item');

		if (item) {
			fireEvent.doubleClick(item);
			expect(mockTryOpenFile).not.toHaveBeenCalled();
		}
	});

	it('should render rename input and handle events', () => {
		mockUseFileWatcher.mockReturnValue({
			files: [{ name: 'doc1', path: '/doc1', type: 'doc' }],
			isLoading: false,
		});
		mockUseFileRename.mockReturnValue({
			renamingFile: '/doc1',
			newFileName: 'doc1_new',
			setNewFileName: mockSetNewFileName,
			startRename: vi.fn(),
			cancelRename: mockCancelRename,
			handleRenameKeyDown: mockHandleRenameKeyDown,
		});

		render(<FileList />);

		const input = screen.getByDisplayValue('doc1_new');
		expect(input).toBeInTheDocument();

		fireEvent.change(input, { target: { value: 'test' } });
		expect(mockSetNewFileName).toHaveBeenCalledWith('test');

		fireEvent.keyDown(input, { key: 'Enter' });
		expect(mockHandleRenameKeyDown).toHaveBeenCalled();

		fireEvent.blur(input);
		expect(mockCancelRename).toHaveBeenCalled();
	});

	it('should render create input when creatingFileType is set', () => {
		mockUseFileCreate.mockReturnValue({
			creatingFileType: 'folder',
			newFileName: 'New Folder',
			setNewFileName: mockSetNewCreateName,
			inputRef: { current: null },
			cancelCreation: mockCancelCreation,
			handleCreateKeyDown: mockHandleCreateKeyDown,
		});

		render(<FileList />);

		expect(screen.getByTestId('icon-folder-icon')).toBeInTheDocument();

		const input = screen.getByDisplayValue('New Folder');
		expect(input).toBeInTheDocument();

		fireEvent.change(input, { target: { value: 'Test Folder' } });
		expect(mockSetNewCreateName).toHaveBeenCalledWith('Test Folder');

		fireEvent.keyDown(input, { key: 'Enter' });
		expect(mockHandleCreateKeyDown).toHaveBeenCalled();

		fireEvent.blur(input);
		expect(mockCancelCreation).toHaveBeenCalled();
	});

	it('should set drag data on drag start', () => {
		mockUseFileWatcher.mockReturnValue({
			files: [{ name: 'dragFile', path: '/drag', type: 'image' }],
			isLoading: false,
		});

		render(<FileList />);
		const item = screen.getByText('dragFile').closest('.files--item');

		const mockSetData = vi.fn();
		const mockEvent = {
			dataTransfer: {
				setData: mockSetData,
				effectAllowed: '',
			},
		};

		if (item) {
			fireEvent.dragStart(item, mockEvent);
			expect(mockSetData).toHaveBeenCalledWith(
				'application/file-item',
				JSON.stringify({ name: 'dragFile', path: '/drag', type: 'image' })
			);
			expect(mockSetData).toHaveBeenCalledWith('file-type/image', '');
			expect(mockEvent.dataTransfer.effectAllowed).toBe('copy');
		}
	});

	it('should render DeleteConfirmation when showDeleteConfirm is true', () => {
		mockUseFileActions.mockReturnValue({
			showDeleteConfirm: true,
			showSaveConfirm: false,
			fileToDelete: { name: 'delete.txt', path: '/delete.txt', type: 'file' },
			setShowDeleteConfirm: vi.fn(),
			setShowSaveConfirm: vi.fn(),
			tryOpenFile: mockTryOpenFile,
			handleOpenFile: mockHandleOpenFile,
			handleConfirmDelete: mockHandleConfirmDelete,
			handleDeleteRequest: vi.fn(),
		});

		render(<FileList />);

		expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument();
		expect(screen.getByText('delete.txt')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Confirm Delete'));
		expect(mockHandleConfirmDelete).toHaveBeenCalled();
	});

	it('should render SaveConfirmation when showSaveConfirm is true', () => {
		mockUseFileActions.mockReturnValue({
			showDeleteConfirm: false,
			showSaveConfirm: true,
			fileToDelete: null,
			setShowDeleteConfirm: vi.fn(),
			setShowSaveConfirm: vi.fn(),
			tryOpenFile: mockTryOpenFile,
			handleOpenFile: mockHandleOpenFile,
			handleConfirmDelete: mockHandleConfirmDelete,
			handleDeleteRequest: vi.fn(),
		});

		render(<FileList />);

		expect(screen.getByTestId('save-confirmation')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Confirm Save'));
		expect(mockHandleOpenFile).toHaveBeenCalled();
	});
});
