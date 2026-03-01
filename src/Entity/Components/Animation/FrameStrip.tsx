import { AnimationFrame as Frame } from '../../../domain/ecs/components';
import { useTranslation } from 'react-i18next';

export interface FrameStripProps {
	frames: Frame[];
	imageUrl: string;
	cellW: number;
	cellH: number;
	onRemove: (index: number) => void;
	onMove: (from: number, to: number) => void;
}

function FrameStrip({
	frames,
	imageUrl,
	cellW,
	cellH,
	onRemove,
	onMove,
}: Readonly<FrameStripProps>) {
	const { t } = useTranslation();

	if (frames.length === 0) {
		return <div className="animation--strip-empty">{t('animation.noFrames')}</div>;
	}

	return (
		<div className="animation--strip">
			{frames.map((f, i) => (
				<div key={i} className="animation--frame-thumb">
					<div className="animation--frame-img-wrap">
						<img
							src={imageUrl}
							draggable={false}
							style={{
								imageRendering: 'pixelated',
								position: 'absolute',
								left: -f.x * (48 / cellW),
								top: -f.y * (48 / cellH),
								transform: `scale(${48 / cellW})`,
								transformOrigin: '0 0',
							}}
							alt=""
						/>
						<span className="animation--frame-num">{i + 1}</span>
					</div>

					<button className="animation--frame-remove" onClick={() => onRemove(i)}>
						×
					</button>

					{i > 0 && (
						<button
							className="animation--frame-arrow animation--frame-arrow--left"
							onClick={() => onMove(i, i - 1)}
						>
							‹
						</button>
					)}
					{i < frames.length - 1 && (
						<button
							className="animation--frame-arrow animation--frame-arrow--right"
							onClick={() => onMove(i, i + 1)}
						>
							›
						</button>
					)}
				</div>
			))}
		</div>
	);
}

export default FrameStrip;
