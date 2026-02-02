import { useEffect, useRef, useCallback, MutableRefObject } from 'react';

interface UseMapCaptureParams {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
    drawBackground: (ctx: CanvasRenderingContext2D) => void;
    onCaptureStart?: () => void;
    onCaptureEnd?: () => void;
}

export function useMapCapture({
    canvasRef,
    drawBackground,
    onCaptureStart,
    onCaptureEnd,
}: UseMapCaptureParams) {
    const isCapturingRef = useRef(false);

    const captureCanvas = useCallback(async (): Promise<string> => {
        const canvas = canvasRef.current;
        if (!canvas) {
            throw new Error('Canvas not available for capture');
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('2D Context not available');
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        isCapturingRef.current = true;
        onCaptureStart?.();

        try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackground(ctx);
            const dataUrl = canvas.toDataURL('image/png');
            ctx.putImageData(imageData, 0, 0);

            return dataUrl;
        } finally {
            isCapturingRef.current = false;
            onCaptureEnd?.();
        }
    }, [canvasRef, drawBackground, onCaptureStart, onCaptureEnd]);


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
        isCapturing: isCapturingRef.current,
    };
}