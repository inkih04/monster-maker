import { useState, useRef, useCallback, useEffect } from 'react';
import { useMapStore } from '../../../../Map/MapGState';
import { useProjectStore } from '../../../../Project/ProjectConfigGState';
import { AnimationFrame as Frame, Animation } from '../../../../domain/ecs/components';


interface AnimationInspectorState {
	animations: Animation[];
	defaultAnimation?: string;
}


export function useAnimationInspector() {
	const selectedEntityId = useMapStore((s) => s.selectedEntityId);
	const map = useMapStore((s) => s.map);
	const updateComponent = useMapStore((s) => s.updateComponent);
	const currentProject = useProjectStore((s) => s.currentProject);

	const entity = selectedEntityId && map ? map.entities[selectedEntityId] : null;
	const renderComp = entity?.components.RENDER;
	const animComp = entity?.components.ANIMATION;

	const spriteSheetPath = renderComp?.spriteSheetPath ?? '';

	const [imageUrl, setImageUrl] = useState<string>('');
	const [cellW, setCellW] = useState<number>(64);
	const [cellH, setCellH] = useState<number>(64);
	const [data, setData] = useState<AnimationInspectorState>({ animations: [] });
	const [activeAnim, setActiveAnim] = useState<number | null>(null);
	const [previewFrame, setPreviewFrame] = useState<number>(0);
	const [isPreviewRunning, setIsPreviewRunning] = useState<boolean>(false);
	const previewTimer = useRef<ReturnType<typeof setInterval> | null>(null);


	useEffect(() => {
		setData({ animations: animComp ? animComp.animations : [] });
		setActiveAnim(null);
	}, [selectedEntityId]); 

	useEffect(() => {
		if (!spriteSheetPath || !currentProject) {
			setImageUrl('');
			return;
		}
		window.api
			.pathUnion(`${currentProject.path}/${currentProject.name}`, spriteSheetPath)
			.then((absPath: string) => setImageUrl(`project-file://${absPath}`))
			.catch(() => setImageUrl(''));
	}, [spriteSheetPath, currentProject]);

	const persistAnimations = useCallback(
		(animations: Animation[]) => {
			if (!selectedEntityId) return;
			updateComponent(selectedEntityId, 'ANIMATION', { animations });
		},
		[selectedEntityId, updateComponent]
	);

	const stopPreview = useCallback(() => {
		if (previewTimer.current) {
			clearInterval(previewTimer.current);
			previewTimer.current = null;
		}
		setPreviewFrame(0);
		setIsPreviewRunning(false);
	}, []);

	const startPreview = useCallback(
		(anim: Animation) => {
			stopPreview();
			setIsPreviewRunning(true);
			previewTimer.current = setInterval(() => {
				setPreviewFrame((p) => (p + 1) % anim.frames.length);
			}, anim.frameDuration);
		},
		[stopPreview]
	);

	const handleSelectSpritesheet = async () => {
		if (!selectedEntityId) return;
		const result = await window.api.selectFile(undefined, [
			{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
			{ name: 'All Files', extensions: ['*'] },
		]);
		if (!result.success || !result.path) return;
		const relativePath = await window.api.toRelativePath(result.path);
		if (relativePath.success && relativePath.path) {
			updateComponent(selectedEntityId, 'RENDER', { spriteSheetPath: relativePath.path });
		}
	};

	const addAnimation = () => {
		const next: Animation = {
			name: `anim_${data.animations.length}`,
			frames: [],
			frameDuration: 150,
			loop: true,
			priority: 0,
		};
		const nextIdx = data.animations.length;
		setData((d) => {
			const updated = [...d.animations, next];
			persistAnimations(updated);
			return { ...d, animations: updated };
		});
		setActiveAnim(nextIdx);
	};

	const deleteAnimation = (index: number) => {
		setData((d) => {
			const updated = d.animations.filter((_, i) => i !== index);
			persistAnimations(updated);
			return { ...d, animations: updated };
		});
		setActiveAnim(null);
	};

	const updateAnim = (index: number, patch: Partial<Animation>) => {
		setData((d) => {
			const anims = [...d.animations];
			anims[index] = { ...anims[index], ...patch };
			persistAnimations(anims);
			return { ...d, animations: anims };
		});
	};

	const setDefaultAnimation = (name: string | undefined) => {
		setData((d) => ({ ...d, defaultAnimation: name }));
	};

	const toggleCell = (frame: Frame) => {
		if (activeAnim === null) return;
		const anim = data.animations[activeAnim];
		const exists = anim.frames.findIndex((f) => f.x === frame.x && f.y === frame.y);
		const newFrames =
			exists >= 0 ? anim.frames.filter((_, i) => i !== exists) : [...anim.frames, frame];
		updateAnim(activeAnim, { frames: newFrames });
	};

	const removeFrame = (frameIndex: number) => {
		if (activeAnim === null) return;
		updateAnim(activeAnim, {
			frames: data.animations[activeAnim].frames.filter((_, i) => i !== frameIndex),
		});
	};

	const moveFrame = (from: number, to: number) => {
		if (activeAnim === null) return;
		const frames = [...data.animations[activeAnim].frames];
		const [item] = frames.splice(from, 1);
		frames.splice(to, 0, item);
		updateAnim(activeAnim, { frames });
	};

	const currentAnim = activeAnim !== null ? data.animations[activeAnim] : null;

	return {
		imageUrl,
		cellW,
		cellH,
		data,
		activeAnim,
		previewFrame,
		currentAnim,
		spriteSheetPath,
		setCellW,
		setCellH,
		setActiveAnim,
		setDefaultAnimation,
		handleSelectSpritesheet,
		startPreview,
		stopPreview,
		isPreviewRunning,
		addAnimation,
		deleteAnimation,
		updateAnim,
		toggleCell,
		removeFrame,
		moveFrame,
	};
}
