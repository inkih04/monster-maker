import { useState, RefObject } from 'react';
import { TileSelection } from '../../Tilemap/TileMapGState';

interface UseTileSelectionProps {
    canvasRef: RefObject<HTMLCanvasElement>;
    tileSize: number;
    zoom: number;
    setSelectedArea: (area: TileSelection | null) => void;
}

export function useTileSelection({
    canvasRef,
    tileSize,
    zoom,
    setSelectedArea
}: UseTileSelectionProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

    const getTileCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return null;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scaledTileSize = tileSize * zoom;

        const tileX = Math.floor(x / scaledTileSize);
        const tileY = Math.floor(y / scaledTileSize);

        return { x: tileX, y: tileY };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getTileCoordinates(e);
        if (!coords) return;

        setIsDragging(true);
        setDragStart(coords);
        setSelectedArea({
            startX: coords.x,
            startY: coords.y,
            endX: coords.x,
            endY: coords.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging || !dragStart) return;

        const coords = getTileCoordinates(e);
        if (!coords) return;

        setSelectedArea({
            startX: dragStart.x,
            startY: dragStart.y,
            endX: coords.x,
            endY: coords.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            setDragStart(null);
        }
    };

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleMouseLeave
    };
}