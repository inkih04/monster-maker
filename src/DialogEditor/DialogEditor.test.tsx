/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DialogEditor from './DialogEditor';
import { useDialogEditor } from './useDialogEditor';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('./useDialogEditor', () => ({
	useDialogEditor: vi.fn(),
}));

vi.mock('../common/components/delete/DeleteConfirmation', () => ({
	__esModule: true,
	default: ({ open, onConfirm, itemName }: any) => 
		open ? (
			<div data-testid="delete-modal">
				<span>{itemName}</span>
				<button onClick={onConfirm}>Confirm</button>
			</div>
		) : null,
}));

describe('DialogEditor', () => {
	const mockAddDialogue = vi.fn();
	const mockDeleteDialogue = vi.fn();
	const mockAddPage = vi.fn();
	const mockUpdateDialogueId = vi.fn();
	const mockSetEditingIdIndex = vi.fn();
	const mockUpdatePage = vi.fn();
	const mockDeletePage = vi.fn();
	const mockAddChoice = vi.fn();
	const mockUpdateChoice = vi.fn();
	const mockDeleteChoice = vi.fn();

	const defaultMockReturn = {
		dialogues: [
			{
				id: 'greeting',
				pages: [
					{ 
						speaker: 'NPC', 
						text: 'Hello traveler', 
						choices: [{ text: 'Hi', next_chain: 'chain2' }] 
					}
				]
			}
		],
		isLoading: false,
		isSaving: false,
		error: null,
		editingIdIndex: null,
		focusedPageIndex: null,
		setEditingIdIndex: mockSetEditingIdIndex,
		updateDialogueId: mockUpdateDialogueId,
		handleAddDialogue: mockAddDialogue,
		deleteDialogue: mockDeleteDialogue,
		handleAddPage: mockAddPage,
		updatePage: mockUpdatePage,
		deletePage: mockDeletePage,
		addChoice: mockAddChoice,
		updateChoice: mockUpdateChoice,
		deleteChoice: mockDeleteChoice,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		(useDialogEditor as any).mockReturnValue(defaultMockReturn);
	});

	it('should render loading state', () => {
		(useDialogEditor as any).mockReturnValue({ ...defaultMockReturn, isLoading: true });
		render(<DialogEditor />);
		expect(screen.getByText('dialogueEditor.loading')).toBeInTheDocument();
	});

	it('should render error state', () => {
		(useDialogEditor as any).mockReturnValue({ ...defaultMockReturn, error: 'Network Error' });
		render(<DialogEditor />);
		expect(screen.getByText('Network Error')).toBeInTheDocument();
	});

	it('should render dialogues and content correctly', () => {
		render(<DialogEditor />);
		expect(screen.getByText('greeting')).toBeInTheDocument();
		expect(screen.getByDisplayValue('NPC')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Hello traveler')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Hi')).toBeInTheDocument();
	});

	it('should call handleAddDialogue when clicking the main add button', () => {
		render(<DialogEditor />);
		fireEvent.click(screen.getByText('dialogueEditor.addDialogue'));
		expect(mockAddDialogue).toHaveBeenCalled();
	});

	it('should trigger updatePage when speaker input changes', () => {
		render(<DialogEditor />);
		const input = screen.getByDisplayValue('NPC');
		fireEvent.change(input, { target: { value: 'Hero' } });
		expect(mockUpdatePage).toHaveBeenCalledWith(0, 0, 'speaker', 'Hero');
	});

	it('should call addChoice when clicking add choice button', () => {
		render(<DialogEditor />);
		fireEvent.click(screen.getByText('dialogueEditor.addChoice'));
		expect(mockAddChoice).toHaveBeenCalledWith(0, 0);
	});

	it('should trigger updateChoice when choice text changes', () => {
		render(<DialogEditor />);
		const input = screen.getByDisplayValue('Hi');
		fireEvent.change(input, { target: { value: 'Bye' } });
		expect(mockUpdateChoice).toHaveBeenCalledWith(0, 0, 0, 'text', 'Bye');
	});

    it('should call handleAddPage for a specific dialogue', () => {
		render(<DialogEditor />);
		fireEvent.click(screen.getByText('dialogueEditor.addPage'));
		expect(mockAddPage).toHaveBeenCalledWith(0);
	});
});