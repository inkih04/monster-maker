/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Tagger from './Tagger';
import { useProjectStore } from '../Project/ProjectConfigGState';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('../Project/ProjectConfigGState', () => ({
	useProjectStore: vi.fn(),
}));

vi.mock('./body/TaggerBody', () => ({
	default: ({ activeTab }: { activeTab: string }) => (
		<div data-testid="tagger-body">{activeTab}</div>
	),
}));

describe('Tagger', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render empty state when no project is loaded', () => {
		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({ currentProject: null })
		);
		const { container } = render(<Tagger />);

		expect(container.firstChild).toHaveClass('is-tagger-empty');
		expect(screen.queryByTestId('tagger-body')).not.toBeInTheDocument();
	});

	it('should render tabs and body when project is loaded', () => {
		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({ currentProject: { id: 'test-project' } })
		);
		render(<Tagger />);

		expect(screen.getByText('menu.map')).toBeInTheDocument();
		expect(screen.getByText('Shaders')).toBeInTheDocument();
		expect(screen.getByText('maps')).toBeInTheDocument();
		expect(screen.getByText('gameConfig.tabLabel')).toBeInTheDocument();
		expect(screen.getByTestId('tagger-body')).toBeInTheDocument();
		expect(screen.getByTestId('tagger-body')).toHaveTextContent('layers');
	});

	it('should change active tab when a button is clicked', () => {
		(useProjectStore as any).mockImplementation((selector: any) =>
			selector({ currentProject: { id: 'test-project' } })
		);
		render(<Tagger />);

		const shadersBtn = screen.getByText('Shaders');
		fireEvent.click(shadersBtn);

		expect(shadersBtn).toHaveClass('tagger--tab-active');
		expect(screen.getByTestId('tagger-body')).toHaveTextContent('shaders');

		const mapsBtn = screen.getByText('maps');
		fireEvent.click(mapsBtn);

		expect(mapsBtn).toHaveClass('tagger--tab-active');
		expect(screen.getByTestId('tagger-body')).toHaveTextContent('tags');

		const gameConfigBtn = screen.getByText('gameConfig.tabLabel');
		fireEvent.click(gameConfigBtn);

		expect(gameConfigBtn).toHaveClass('tagger--tab-active');
		expect(screen.getByTestId('tagger-body')).toHaveTextContent('gameConfig');

		const layersBtn = screen.getByText('menu.map');
		fireEvent.click(layersBtn);

		expect(layersBtn).toHaveClass('tagger--tab-active');
		expect(screen.getByTestId('tagger-body')).toHaveTextContent('layers');
	});
});