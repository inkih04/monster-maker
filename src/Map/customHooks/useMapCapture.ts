import { useEffect, useRef, useCallback, MutableRefObject } from 'react';

interface UseMapCaptureParams {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
    drawBackground: (ctx: CanvasRenderingContext2D) => void;
    zoom: number;
    onCaptureStart?: () => void;
    onCaptureEnd?: () => void;
}

export function useMapCapture({
    canvasRef,
    drawBackground,
    zoom,
    onCaptureStart,
    onCaptureEnd,
}: UseMapCaptureParams) {
    const isCapturingRef = useRef(false);

    const captureCanvas = useCallback(async (): Promise<string> => {
        const canvas = canvasRef.current;
        if (!canvas) {
            throw new Error('Canvas not available for capture');
        }

        isCapturingRef.current = true;
        onCaptureStart?.();

        try {
            const offscreen = document.createElement('canvas');
            offscreen.width = Math.round(canvas.width / zoom);
            offscreen.height = Math.round(canvas.height / zoom);

            const offCtx = offscreen.getContext('2d');
            if (!offCtx) {
                throw new Error('2D Context not available for offscreen canvas');
            }

            offCtx.scale(1 / zoom, 1 / zoom);
            drawBackground(offCtx);

            return offscreen.toDataURL('image/png');
        } finally {
            isCapturingRef.current = false;
            onCaptureEnd?.();
        }
    }, [canvasRef, drawBackground, zoom, onCaptureStart, onCaptureEnd]);


    useEffect(() => {
        const handleExportPNG = async () => {
            try {
                const dataUrl = await captureCanvas();
                await window.api.saveImage(dataUrl);
            } catch (error) {
                console.error('Error exporting PNG:', error);
            }
        };

        const cleanup = window.api.onExportMapPNGRequest(handleExportPNG);

        return () => cleanup();
    }, [captureCanvas]);

    return {
        captureCanvas,
        isCapturingRef,
    };
}