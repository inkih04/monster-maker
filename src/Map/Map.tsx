import { useEffect, useRef, useState } from 'react';
import './Map.css'
import { drawGrid } from '../common/utils/canvasUtils';



function Map() {
    const [zoom, setZoom] = useState(1);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    
        useEffect(() => {
            if (!canvasRef.current) return;
    
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
    
            ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
            const scaledTileSize = 16 * zoom;
    
            drawGrid({
                ctx,
                width: canvas.width,
                height: canvas.height,
                tileSize: scaledTileSize,
                color: 'white',
                opacity: 0.3,
                lineWidth: 1,
            });
    
        }, [zoom]);



    const handleZoomIn = () => {
		setZoom(Math.min(zoom + 0.5, 5));
	};

	const handleZoomOut = () => {
		setZoom(Math.max(zoom - 0.5, 0.5));
	};


	return (
		<div className="tilemap-wrapper">
			<div className="tilemap-viewport">
				<canvas
					ref={canvasRef}
					className="tilemap-canvas"
				/>
			</div>

			<div className="tilemap-controls">
				<div className="tilemap-controls-zoom">
					<button onClick={handleZoomIn} className="zoom-btn">
						+
					</button>

					<span className="zoom-level">{Math.round(zoom * 100)}%</span>
					<button onClick={handleZoomOut} className="zoom-btn">
						-
					</button>
				</div>
			</div>
		</div>
	);
}

export default Map;
