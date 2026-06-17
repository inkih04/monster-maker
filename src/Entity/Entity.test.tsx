/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Entity from './Entity';
import { useMapStore } from '../Map/MapGState';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../Map/MapGState', () => ({
    useMapStore: vi.fn(),
}));

vi.mock('./Components/basic/EntityHeader', () => ({
    default: ({ onUpdateName, onUpdateTag }: any) => (
        <div data-testid="entity-header">
            <button onClick={() => onUpdateName('New Name')}>Update Name</button>
            <button onClick={() => onUpdateTag('PLAYER')}>Update Tag</button>
        </div>
    ),
}));

vi.mock('./Components/basic/AddComponent', () => ({
    default: () => <div data-testid="add-component" />,
}));

vi.mock('./Components/Renderer/Renderer', () => ({ default: () => <div data-testid="component-render" /> }));
vi.mock('./Components/Collision/Collision', () => ({ default: () => <div data-testid="component-collider" /> }));
vi.mock('./Components/Script/ScriptComponent', () => ({ default: () => <div data-testid="component-script" /> }));
vi.mock('./Components/Movement/MovementComponent', () => ({ default: () => <div data-testid="component-movement" /> }));
vi.mock('./Components/Interaction/InteractionComponent', () => ({ default: () => <div data-testid="component-interaction" /> }));
vi.mock('./Components/Animation/AnimatorInspector', () => ({ default: () => <div data-testid="component-animation" /> }));
vi.mock('./Components/Persistence/PersistenceComponent', () => ({ default: () => <div data-testid="component-persistence" /> }));

describe('Entity', () => {
    const mockSetIsDirty = vi.fn();
    const mockUpdateEntity = vi.fn();

    const setupMapStore = (selectedIds: string[], entities: any) => {
        (useMapStore as any).mockImplementation((selector: any) => {
            const state = {
                selectedEntityIds: selectedIds,
                setIsDirty: mockSetIsDirty,
                updateEntity: mockUpdateEntity,
                map: { entities },
            };
            return selector(state);
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render empty state when no entity is selected', () => {
        setupMapStore([], {});
        const { container } = render(<Entity />);
        expect(container.querySelector('.is-empty')).toBeInTheDocument();
    });

    it('should render single entity correctly with its components', () => {
        setupMapStore(['e1'], {
            e1: {
                id: 'e1',
                name: 'Test Entity',
                components: {
                    RENDER: {},
                    COLLIDER: {},
                },
            },
        });

        render(<Entity />);

        expect(screen.getByTestId('entity-header')).toBeInTheDocument();
        expect(screen.getByTestId('component-render')).toBeInTheDocument();
        expect(screen.getByTestId('component-collider')).toBeInTheDocument();
        expect(screen.getByTestId('add-component')).toBeInTheDocument();
        expect(screen.queryByTestId('component-script')).not.toBeInTheDocument();
    });

    it('should call updateEntity and setIsDirty when updating name or tag', () => {
        setupMapStore(['e1'], {
            e1: {
                id: 'e1',
                name: 'Test Entity',
                components: {},
            },
        });

        render(<Entity />);

        fireEvent.click(screen.getByText('Update Name'));
        expect(mockUpdateEntity).toHaveBeenCalledWith('e1', { name: 'New Name' });

        fireEvent.click(screen.getByText('Update Tag'));
        expect(mockUpdateEntity).toHaveBeenCalledWith('e1', { tag: 'PLAYER' });
        expect(mockSetIsDirty).toHaveBeenCalledWith(true);
    });

    it('should render multiselect state correctly when there are no common components', () => {
        setupMapStore(['e1', 'e2'], {
            e1: { id: 'e1', components: { RENDER: {} } },
            e2: { id: 'e2', components: { COLLIDER: {} } },
        });

        render(<Entity />);

        expect(screen.getByText('2 selectedTiles')).toBeInTheDocument();
        expect(screen.getByText('no_common_components_title')).toBeInTheDocument();
        expect(screen.getByText('no_common_components_description')).toBeInTheDocument();
        expect(screen.getByTestId('add-component')).toBeInTheDocument();
        expect(screen.queryByTestId('component-render')).not.toBeInTheDocument();
        expect(screen.queryByTestId('component-collider')).not.toBeInTheDocument();
    });

    it('should render multiselect state correctly with shared components', () => {
        setupMapStore(['e1', 'e2', 'e3'], {
            e1: { id: 'e1', components: { RENDER: {}, COLLIDER: {}, SCRIPT: {} } },
            e2: { id: 'e2', components: { RENDER: {}, COLLIDER: {} } },
            e3: { id: 'e3', components: { RENDER: {}, COLLIDER: {}, MOVEMENT: {} } },
        });

        render(<Entity />);

        expect(screen.getByText('3 selectedTiles')).toBeInTheDocument();
        expect(screen.getByText('commmonComponents')).toBeInTheDocument();
        
        expect(screen.getByTestId('component-render')).toBeInTheDocument();
        expect(screen.getByTestId('component-collider')).toBeInTheDocument();
        
        expect(screen.queryByTestId('component-script')).not.toBeInTheDocument();
        expect(screen.queryByTestId('component-movement')).not.toBeInTheDocument();
    });
});