import { useState, useRef } from 'react';
import { AnimationFrame as Frame } from '../../../domain/ecs/components';

export interface SpritePickerProps {
	imageUrl: string;
	cellW: number;
	cellH: number;
	selectedCells: Frame[];
	onToggleCell: (frame: Frame) => void;
}

function SpritePicker({ imageUrl, cellW, cellH, selectedCells, onToggleCell }: Readonly<SpritePickerProps>) {
	const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
	const imgRef = useRef<HTMLImageElement>(null);

	const cols = imgSize.w > 0 ? Math.floor(imgSize.w / cellW) : 0;
	const rows = imgSize.h > 0 ? Math.floor(imgSize.h / cellH) : 0;

	const isSelected = (f: Frame): boolean =>
		selectedCells.some((s) => s.x === f.x && s.y === f.y && s.w === f.w && s.h === f.h);

	const getIndex = (f: Frame): number =>
		selectedCells.findIndex((s) => s.x === f.x && s.y === f.y);

	return (
		<div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
			<img
				ref={imgRef}
				src={imageUrl}
				style={{ imageRendering: 'pixelated', display: 'block', maxWidth: '100%' }}
				onLoad={() =>
					setImgSize({ w: imgRef.current!.naturalWidth, h: imgRef.current!.naturalHeight })
				}
				draggable={false}
				alt="spritesheet"
			/>
			{cols > 0 &&
				Array.from({ length: rows }).map((_, row) =>
					Array.from({ length: cols }).map((_, col) => {
						const frame: Frame = { x: col * cellW, y: row * cellH, w: cellW, h: cellH };
						const sel = isSelected(frame);
						const idx = getIndex(frame);
						const pct = {
							x: ((col * cellW) / imgSize.w) * 100,
							y: ((row * cellH) / imgSize.h) * 100,
						};
						const pctW = (cellW / imgSize.w) * 100;
						const pctH = (cellH / imgSize.h) * 100;

						return (
							<div
								key={`${col}-${row}`}
								onClick={() => onToggleCell(frame)}
								style={{
									position: 'absolute',
									left: `${pct.x}%`,
									top: `${pct.y}%`,
									width: `${pctW}%`,
									height: `${pctH}%`,
									border: sel ? '2px solid var(--color-8)' : '1px solid rgba(0,0,0,0.12)',
									backgroundColor: sel ? 'rgba(45,45,34,0.18)' : 'transparent',
									cursor: 'crosshair',
									boxSizing: 'border-box',
									transition: 'background-color 0.1s',
								}}
							>
								{sel && <span className="animation--cell-badge">{idx + 1}</span>}
							</div>
						);
					})
				)}
		</div>
	);
}

export default SpritePicker;