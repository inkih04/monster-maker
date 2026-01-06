import { useEffect, useRef, useState } from 'react';
import './TileMap.css';

function TileMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const TILE_SIZE = 16;

  useEffect(() => {
    const img = new Image();
     img.src = '../../engine/resources/maps/tilesets/TileMap2.png'; 
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    const scaledWidth = img.width * zoom;
    const scaledHeight = img.height * zoom;
    
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    const tileSize = TILE_SIZE * zoom;

    for (let x = 0; x <= scaledWidth; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, scaledHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y <= scaledHeight; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(scaledWidth, y);
      ctx.stroke();
    }
  }, [zoom, imageLoaded]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  return (
    <div className="tilemap-wrapper">
      <div className="tilemap-viewport">
        <canvas ref={canvasRef} className="tilemap-canvas" />
      </div>
      <div className="tilemap-controls">
          <div className='tilemap-controls-zoom'>
            <button onClick={handleZoomOut} className="zoom-btn">-</button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="zoom-btn">+</button>
          </div>
          <div className='tilemap-controls-name'>
            <span> Nombre.png</span>

          </div>
      </div>
    </div>
  );
}

export default TileMap;