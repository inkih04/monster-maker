import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../TaggerBody.css';
import './GameConfig.css';
import { useGameConfigDrag } from './customHook/useGameConfigDrag';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useEngineConfigStore } from '../../useEngineConfigStore';
import { GameConfig, DEFAULT_GAME_CONFIG } from '../../../../global/types/engineConfig';

type GameConfigData = {
	gameName: string;
	gameVersion: string;
	initialMapPath: string;
	imageIconPath: string;
	defaultFont: string;
	virtualWidth: number | '';
	virtualHeight: number | '';
};

function gameConfigToData(gc: GameConfig): GameConfigData {
	return {
		gameName: gc.gameName,
		gameVersion: gc.gameVersion,
		initialMapPath: gc.initialMapPath,
		imageIconPath: gc.imageIconPath,
		defaultFont: gc.defaultFont,
		virtualWidth: gc.virtualWidth,
		virtualHeight: gc.virtualHeight,
	};
}

function dataToGameConfig(data: GameConfigData): GameConfig {
	return {
		gameName: data.gameName,
		gameVersion: data.gameVersion,
		initialMapPath: data.initialMapPath,
		imageIconPath: data.imageIconPath,
		defaultFont: data.defaultFont,
		virtualWidth: data.virtualWidth === '' ? DEFAULT_GAME_CONFIG.virtualWidth : data.virtualWidth,
		virtualHeight:
			data.virtualHeight === '' ? DEFAULT_GAME_CONFIG.virtualHeight : data.virtualHeight,
	};
}

function TaggerGameConfigBody() {
	const { t } = useTranslation();
	const currentProject = useProjectStore((s) => s.currentProject);
	const { gameConfig, isLoading, loadEngineConfig, saveGameConfig } = useEngineConfigStore();
	const [data, setData] = useState<GameConfigData>(() => gameConfigToData(gameConfig));
	const skipNextSync = useRef(false);
	const { handleDragOver, handleDragLeave, handleDrop, getDragClass } = useGameConfigDrag();

	useEffect(() => {
		if (!currentProject) return;
		loadEngineConfig(currentProject);
	}, [currentProject]);

	useEffect(() => {
		if (skipNextSync.current) {
			skipNextSync.current = false;
			return;
		}
		setData(gameConfigToData(gameConfig));
	}, [gameConfig]);

	const persist = (next: GameConfigData) => {
		if (!currentProject) return;
		skipNextSync.current = true;
		saveGameConfig(currentProject, dataToGameConfig(next));
	};

	const handleChange = <K extends keyof GameConfigData>(key: K, value: GameConfigData[K]) => {
		const next = { ...data, [key]: value };
		setData(next);
		persist(next);
	};

	const handleIntChange = (key: 'virtualWidth' | 'virtualHeight', raw: string) => {
		const value = raw === '' ? '' : parseInt(raw, 10);
		if (raw !== '' && isNaN(value as number)) return;
		const next = { ...data, [key]: value };
		setData(next);
		persist(next);
	};

	if (isLoading) {
		return <div className="tagger-body--scroll tagger-body--loading">Loading…</div>;
	}

	return (
		<div className="tagger-body--scroll">
			<div className="game-config--form">
				<div className="game-config--field">
					<label className="game-config--label">{t('gameConfig.gameName')}</label>
					<input
						className="tagger-kv--input game-config--input"
						type="text"
						placeholder="Monster Maker Engine"
						value={data.gameName}
						onChange={(e) => handleChange('gameName', e.target.value)}
					/>
				</div>

				<div className="game-config--field">
					<label className="game-config--label">{t('gameConfig.gameVersion')}</label>
					<input
						className="tagger-kv--input game-config--input game-config--input-short"
						type="text"
						placeholder="1.0.0"
						value={data.gameVersion}
						onChange={(e) => handleChange('gameVersion', e.target.value)}
					/>
				</div>

				<div className="game-config--field game-config--field-group-start">
					<label className="game-config--label">{t('gameConfig.initialMapPath')}</label>
					<input
						className={`tagger-kv--input game-config--input ${getDragClass('initialMapPath')}`}
						type="text"
						placeholder="maps/start.json"
						value={data.initialMapPath}
						onChange={(e) => handleChange('initialMapPath', e.target.value)}
						onDragOver={(e) => handleDragOver(e, 'initialMapPath')}
						onDragLeave={handleDragLeave}
						onDrop={(e) =>
							handleDrop(e, 'initialMapPath', (path) => handleChange('initialMapPath', path))
						}
					/>
				</div>

				<div className="game-config--field">
					<label className="game-config--label">{t('gameConfig.iconPath')}</label>
					<input
						className={`tagger-kv--input game-config--input ${getDragClass('imageIconPath')}`}
						type="text"
						placeholder="assets/icon.png"
						value={data.imageIconPath}
						onChange={(e) => handleChange('imageIconPath', e.target.value)}
						onDragOver={(e) => handleDragOver(e, 'imageIconPath')}
						onDragLeave={handleDragLeave}
						onDrop={(e) =>
							handleDrop(e, 'imageIconPath', (path) => handleChange('imageIconPath', path))
						}
					/>
				</div>

				<div className="game-config--field">
					<label className="game-config--label">{t('gameConfig.defaultFont')}</label>
					<input
						className={`tagger-kv--input game-config--input ${getDragClass('defaultFont')}`}
						type="text"
						placeholder="assets/fonts/font.ttf"
						value={data.defaultFont}
						onChange={(e) => handleChange('defaultFont', e.target.value)}
						onDragOver={(e) => handleDragOver(e, 'defaultFont')}
						onDragLeave={handleDragLeave}
						onDrop={(e) =>
							handleDrop(e, 'defaultFont', (path) => handleChange('defaultFont', path))
						}
					/>
				</div>

				<div className="game-config--field game-config--field-group-start game-config--field-no-border">
					<label className="game-config--label">{t('gameConfig.virtualResolution')}</label>
					<div className="game-config--resolution-row">
						<input
							className="tagger-kv--input game-config--input-num"
							type="number"
							placeholder="480"
							value={data.virtualWidth}
							min={1}
							onChange={(e) => handleIntChange('virtualWidth', e.target.value)}
						/>
						<span className="game-config--resolution-sep">×</span>
						<input
							className="tagger-kv--input game-config--input-num"
							type="number"
							placeholder="270"
							value={data.virtualHeight}
							min={1}
							onChange={(e) => handleIntChange('virtualHeight', e.target.value)}
						/>
						<span className="game-config--resolution-hint">px</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TaggerGameConfigBody;
