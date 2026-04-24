import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawGrid, drawSelection } from './canvasUtils';

describe('Canvas Drawing Utils', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockCtx: any;

    beforeEach(() => {
        mockCtx = {
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            strokeStyle: '',
            fillStyle: '',
            lineWidth: 0,
        };
    });

    describe('drawGrid', () => {
        it('should set the correct stroke style and line width', () => {
            drawGrid({
                ctx: mockCtx,
                width: 100,
                height: 100,
                tileSize: 50,
                color: 'white',
                opacity: 0.5
            });

            expect(mockCtx.strokeStyle).toBe('rgba(255, 255, 255, 0.5)');
            expect(mockCtx.lineWidth).toBe(1);
        });

        it('should draw the correct number of lines based on tileSize', () => {
            const width = 100;
            const height = 100;
            const tileSize = 50;

            drawGrid({ ctx: mockCtx, width, height, tileSize });

            expect(mockCtx.moveTo).toHaveBeenCalledTimes(6);
            expect(mockCtx.lineTo).toHaveBeenCalledTimes(6);
            expect(mockCtx.stroke).toHaveBeenCalledTimes(6);
        });

        it('should convert hex color to rgb correctly', () => {
            drawGrid({
                ctx: mockCtx,
                width: 10,
                height: 10,
                tileSize: 10,
                color: '#ff0000'
            });

            expect(mockCtx.strokeStyle).toContain('255, 0, 0');
        });
    });

    describe('drawSelection', () => {
        it('should calculate coordinates and dimensions based on tileSize', () => {
            const options = {
                ctx: mockCtx,
                minX: 2,
                minY: 3,
                width: 2,
                height: 1,
                tileSize: 32
            };

            drawSelection(options);

            expect(mockCtx.fillRect).toHaveBeenCalledWith(64, 96, 64, 32);
            expect(mockCtx.strokeRect).toHaveBeenCalledWith(64, 96, 64, 32);
        });

        it('should apply default styles if optional parameters are missing', () => {
            drawSelection({
                ctx: mockCtx,
                minX: 0,
                minY: 0,
                width: 1,
                height: 1,
                tileSize: 10
            });

            expect(mockCtx.fillStyle).toBe('rgba(0, 255, 0, 0.2)');
            expect(mockCtx.strokeStyle).toBe('#00ff00');
            expect(mockCtx.lineWidth).toBe(3);
        });
    });
});