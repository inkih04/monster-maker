import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash } from 'iconoir-react';
import '../TaggerBody.css';
import './GameConfig.css';
import { useGameConfigDrag } from './customHook/useGameConfigDrag';
import { useProjectStore } from '../../../Project/ProjectConfigGState';
import { useEngineConfigStore } from '../../useEngineConfigStore';
import { GameConfig, DEFAULT_GAME_CONFIG } from '../../../../global/types/engineConfig';
import ResetableInput from './ResetableInput';

type GameConfigData = {
	gameName: string;
	gameVersion: string;
	initialMapPath: string;
	imageIconPath: string;
	defaultFont: string;
	virtualWidth: number | '';
	virtualHeight: number | '';
	letterboxing: boolean;
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
		letterboxing: gc.letterboxing ?? DEFAULT_GAME_CONFIG.letterboxing,
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
		letterboxing: data.letterboxing,
	};
}

function TaggerGameConfigBody() {
	const { t } = useTranslation();
	const currentProject = useProjectStore((s) => s.currentProject);
	const { gameConfig, tags, isLoading, loadEngineConfig, saveGameConfig } = useEngineConfigStore();
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

	const tagOptions = Object.keys(tags || {});

	return (
		<div className="tagger-body--scroll">
			<div className="game-config--form">
				<div className="game-config--field">
					<label className="game-config--label">{t('gameConfig.gameName')}</label>
					<ResetableInput
						value={data.gameName}
						defaultValue={DEFAULT_GAME_CONFIG.gameName}
						placeholder="Monster Maker Engine"
						onChange={(v) => handleChange('gameName', v)}
					/>
				</div>

				<div className="game-config--field">
					<label className="game-config--label">{t('gameConfig.gameVersion')}</label>
					<ResetableInput
						className="game-config--input-short"
						value={data.gameVersion}
						defaultValue={DEFAULT_GAME_CONFIG.gameVersion}
						placeholder="1.0.0"
						onChange={(v) => handleChange('gameVersion', v)}
					/>
				</div>

				<div className="game-config--field game-config--field-group-start">
					<label className="game-config--label">{t('gameConfig.initialMapPath')}</label>
					<ResetableInput
						className={getDragClass('initialMapPath')}
						value={data.initialMapPath}
						defaultValue={DEFAULT_GAME_CONFIG.initialMapPath}
						placeholder="maps/start.json"
						onChange={(v) => handleChange('initialMapPath', v)}
						onDragOver={(e) => handleDragOver(e, 'initialMapPath')}
						onDragLeave={handleDragLeave}
						onDrop={(e) =>
							handleDrop(e, 'initialMapPath', (path) => handleChange('initialMapPath', path))
						}
						options={tagOptions}
					/>
				</div>

				<div className="game-config--field">
					<label className="game-config--label">{t('gameConfig.iconPath')}</label>
					<ResetableInput
						className={getDragClass('imageIconPath')}
						value={data.imageIconPath}
						defaultValue={DEFAULT_GAME_CONFIG.imageIconPath}
						placeholder="assets/icon.png"
						onChange={(v) => handleChange('imageIconPath', v)}
						onDragOver={(e) => handleDragOver(e, 'imageIconPath')}
						onDragLeave={handleDragLeave}
						onDrop={(e) =>
							handleDrop(e, 'imageIconPath', (path) => handleChange('imageIconPath', path))
						}
						options={tagOptions}
					/>
				</div>

				<div className="game-config--field">
					<label className="game-config--label">{t('gameConfig.defaultFont')}</label>
					<ResetableInput
						className={getDragClass('defaultFont')}
						value={data.defaultFont}
						defaultValue={DEFAULT_GAME_CONFIG.defaultFont}
						placeholder="assets/fonts/font.ttf"
						onChange={(v) => handleChange('defaultFont', v)}
						onDragOver={(e) => handleDragOver(e, 'defaultFont')}
						onDragLeave={handleDragLeave}
						onDrop={(e) =>
							handleDrop(e, 'defaultFont', (path) => handleChange('defaultFont', path))
						}
						options={tagOptions}
					/>
				</div>
				<div
					className="game-config--field game-config--field-group-start"
					style={{ paddingBottom: '8px' }}
				>
					<label className="game-config--label">{t('gameConfig.letterboxing')}</label>
					<label className="game-config--checkbox-row">
						<input
							type="checkbox"
							className="game-config--checkbox"
							checked={data.letterboxing}
							onChange={(e) => handleChange('letterboxing', e.target.checked)}
						/>
						<span className="game-config--checkbox-hint">
							{data.letterboxing ? t('gameConfig.letterboxingOn') : t('gameConfig.letterboxingOff')}
						</span>
					</label>
				</div>

				<div className="game-config--field game-config--field-group-start game-config--field-no-border">
					<label className="game-config--label">{t('gameConfig.virtualResolution')}</label>
					<div className="game-config--resolution-row">
						<div className="game-config--num-wrapper">
							<input
								className="tagger-kv--input game-config--input-num"
								type="number"
								placeholder="480"
								value={data.virtualWidth}
								min={1}
								onChange={(e) => handleIntChange('virtualWidth', e.target.value)}
							/>
							{data.virtualWidth !== DEFAULT_GAME_CONFIG.virtualWidth && (
								<button
									className="game-config--reset-btn"
									onClick={() => handleChange('virtualWidth', DEFAULT_GAME_CONFIG.virtualWidth)}
									title="Reset to default"
									tabIndex={-1}
								>
									<Trash width={11} strokeWidth={1.8} />
								</button>
							)}
						</div>
						<span className="game-config--resolution-sep">×</span>
						<div className="game-config--num-wrapper">
							<input
								className="tagger-kv--input game-config--input-num"
								type="number"
								placeholder="270"
								value={data.virtualHeight}
								min={1}
								onChange={(e) => handleIntChange('virtualHeight', e.target.value)}
							/>
							{data.virtualHeight !== DEFAULT_GAME_CONFIG.virtualHeight && (
								<button
									className="game-config--reset-btn"
									onClick={() => handleChange('virtualHeight', DEFAULT_GAME_CONFIG.virtualHeight)}
									title="Reset to default"
									tabIndex={-1}
								>
									<Trash width={11} strokeWidth={1.8} />
								</button>
							)}
						</div>
						<span className="game-config--resolution-hint">px</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TaggerGameConfigBody;
