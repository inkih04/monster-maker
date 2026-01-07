interface DrawGridOptions {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    tileSize: number;
    color?: string;
    lineWidth?: number;
    opacity?: number;
}


export function drawGrid(options: DrawGridOptions): void {
    const {
        ctx,
        width,
        height,
        tileSize,
        color = 'white',
        lineWidth = 1,
        opacity = 0.3
    } = options;

    ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${opacity})`;
    ctx.lineWidth = lineWidth;


    for (let x = 0; x <= width; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }


    for (let y = 0; y <= height; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}


function hexToRgb(hex: string): string {
    if (!hex.startsWith('#') && hex.includes(',')) {
        return hex;
    }

    hex = hex.replace('#', '');

    const colorMap: Record<string, string> = {
        'white': '255, 255, 255',
        'black': '0, 0, 0',
        'red': '255, 0, 0',
        'green': '0, 255, 0',
        'blue': '0, 0, 255',
    };

    if (colorMap[hex.toLowerCase()]) {
        return colorMap[hex.toLowerCase()];
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
}

interface DrawSelectionOptions {
    ctx: CanvasRenderingContext2D;
    minX: number;
    minY: number;
    width: number;
    height: number;
    tileSize: number;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWidth?: number;
}


export function drawSelection(options: DrawSelectionOptions): void {
    const {
        ctx,
        minX,
        minY,
        width,
        height,
        tileSize,
        fillColor = '0, 255, 0',
        fillOpacity = 0.2,
        strokeColor = '#00ff00',
        strokeWidth = 3
    } = options;

    const x = minX * tileSize;
    const y = minY * tileSize;
    const w = width * tileSize;
    const h = height * tileSize;

    ctx.fillStyle = `rgba(${fillColor}, ${fillOpacity})`;
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.strokeRect(x, y, w, h);
}