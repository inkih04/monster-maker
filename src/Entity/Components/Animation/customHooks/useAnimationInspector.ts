import { useState, useRef, useCallback, useEffect } from 'react';
import { useMapStore } from '../../../../Map/MapGState';
import { useProjectStore } from '../../../../Project/ProjectConfigGState';
import {
	AnimationFrame as Frame,
	Animation,
	AnimationSet,
} from '../../../../domain/ecs/components';

export const DEFAULT_SET = 'default';

export const BASIC_ANIMATION_NAMES = [
	'standdown',
	'standup',
	'standleft',
	'standright',
	'movedown',
	'moveup',
	'moveleft',
	'moveright',
] as const;

export type BasicAnimationName = (typeof BASIC_ANIMATION_NAMES)[number];

function makeEmptyAnimation(name: string): Animation {
	return { name, frames: [], frameDuration: 150, loop: true };
}

export function makeDefaultAnimations(): Animation[] {
	return BASIC_ANIMATION_NAMES.map(makeEmptyAnimation);
}

export function makeEmptySet(): AnimationSet {
	return { animations: makeDefaultAnimations() };
}

export interface ActiveSelection {
	setName: string;
	animIndex: number | null;
}

export function useAnimationInspector() {
	const selectedEntityIds = useMapStore((s) => s.selectedEntityIds);
	const selectedEntityId = selectedEntityIds[0] ?? null;

	const map = useMapStore((s) => s.map);
	const updateComponent = useMapStore((s) => s.updateComponent);
	const removeComponent = useMapStore((s) => s.removeComponent);
	const currentProject = useProjectStore((s) => s.currentProject);

	const entity = selectedEntityId && map ? map.entities[selectedEntityId] : null;
	const renderComp = entity?.components.RENDER;
	const animComp = entity?.components.ANIMATION;

	const spriteSheetPath = renderComp?.spriteSheetPath ?? '';

	const sets: Record<string, AnimationSet> = animComp?.sets ?? { [DEFAULT_SET]: makeEmptySet() };
	const defaultAnimation = animComp?.defaultAnimation;

	const [cellW, setCellW] = useState<number>(renderComp?.w ?? 64);
	const [cellH, setCellH] = useState<number>(renderComp?.h ?? 64);
	const [imageUrl, setImageUrl] = useState<string>('');
	const [selection, setSelection] = useState<ActiveSelection>({
		setName: DEFAULT_SET,
		animIndex: null,
	});
	const [previewFrame, setPreviewFrame] = useState<number>(0);
	const [isPreviewRunning, setIsPreviewRunning] = useState<boolean>(false);
	const previewTimer = useRef<ReturnType<typeof setInterval> | null>(null);

	const stopPreview = useCallback(() => {
		if (previewTimer.current) {
			clearInterval(previewTimer.current);
			previewTimer.current = null;
		}
		setPreviewFrame(0);
		setIsPreviewRunning(false);
	}, []);

	useEffect(() => {
		setCellW(renderComp?.w ?? 64);
		setCellH(renderComp?.h ?? 64);
		setSelection({ setName: DEFAULT_SET, animIndex: null });
		stopPreview();
	}, [selectedEntityId]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (!spriteSheetPath || !currentProject) {
			setImageUrl('');
			return;
		}
		window.api
			.pathUnion(`${currentProject.path}/${currentProject.name}`, spriteSheetPath)
			.then((absPath: string) => setImageUrl(`project-file://${absPath}`))
			.catch(() => setImageUrl(''));
	}, [spriteSheetPath, currentProject, selectedEntityId]);

	const persist = useCallback(
		(nextSets: Record<string, AnimationSet>, nextDefault?: string) => {
			if (!selectedEntityId) return;
			updateComponent(selectedEntityId, 'ANIMATION', {
				sets: nextSets,
				defaultAnimation: nextDefault,
			});
		},
		[selectedEntityId, updateComponent]
	);

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

	const addSet = (name: string) => {
		if (!name || sets[name]) return;
		const next = { ...sets, [name]: makeEmptySet() };
		persist(next, defaultAnimation);
		setSelection({ setName: name, animIndex: null });
	};

	const deleteSet = (name: string) => {
		if (name === DEFAULT_SET) return;
		const next = { ...sets };
		delete next[name];
		persist(next, defaultAnimation);
		setSelection({ setName: DEFAULT_SET, animIndex: null });
	};

	const renameSet = (oldName: string, newName: string) => {
		if (oldName === DEFAULT_SET || !newName || sets[newName]) return;
		const next: Record<string, AnimationSet> = {};
		for (const [k, v] of Object.entries(sets)) {
			next[k === oldName ? newName : k] = v;
		}
		persist(next, defaultAnimation);
		if (selection.setName === oldName) setSelection((s) => ({ ...s, setName: newName }));
	};

	const addAnimation = (setName: string) => {
		const currentAnims = sets[setName]?.animations ?? [];
		const next: Animation = {
			name: `anim_${currentAnims.length}`,
			frames: [],
			frameDuration: 150,
			loop: true,
		};
		const nextSets = { ...sets, [setName]: { animations: [...currentAnims, next] } };
		persist(nextSets, defaultAnimation);
		setSelection({ setName, animIndex: currentAnims.length });
	};

	const deleteAnimation = (setName: string, index: number) => {
		if (setName === DEFAULT_SET && index < BASIC_ANIMATION_NAMES.length) return;
		const anims = sets[setName]?.animations ?? [];
		const nextSets = { ...sets, [setName]: { animations: anims.filter((_, i) => i !== index) } };
		persist(nextSets, defaultAnimation);
		setSelection((s) => ({ ...s, animIndex: null }));
	};

	const updateAnim = (setName: string, index: number, patch: Partial<Animation>) => {
		const anims = [...(sets[setName]?.animations ?? [])];
		anims[index] = { ...anims[index], ...patch };
		const nextSets = { ...sets, [setName]: { animations: anims } };
		persist(nextSets, defaultAnimation);
	};

	const toggleCell = (frame: Frame) => {
		const { setName, animIndex } = selection;
		if (animIndex === null) return;
		const anim = sets[setName]?.animations[animIndex];
		if (!anim) return;
		const exists = anim.frames.findIndex((f) => f.x === frame.x && f.y === frame.y);
		const newFrames =
			exists >= 0 ? anim.frames.filter((_, i) => i !== exists) : [...anim.frames, frame];
		updateAnim(setName, animIndex, { frames: newFrames });
	};

	const removeFrame = (setName: string, animIndex: number, frameIndex: number) => {
		const anim = sets[setName]?.animations[animIndex];
		if (!anim) return;
		updateAnim(setName, animIndex, { frames: anim.frames.filter((_, i) => i !== frameIndex) });
	};

	const moveFrame = (setName: string, animIndex: number, from: number, to: number) => {
		const anim = sets[setName]?.animations[animIndex];
		if (!anim) return;
		const frames = [...anim.frames];
		const [item] = frames.splice(from, 1);
		frames.splice(to, 0, item);
		updateAnim(setName, animIndex, { frames });
	};

	const handleSetDefault = (name: string | undefined) => {
		persist(sets, name);
	};

	const handleDelete = () => {
		if (selectedEntityIds.length === 0) return;
		selectedEntityIds.forEach((id) => removeComponent(id, 'ANIMATION'));
	};

	const currentAnim =
		selection.animIndex !== null
			? (sets[selection.setName]?.animations[selection.animIndex] ?? null)
			: null;

	return {
		imageUrl,
		cellW,
		cellH,
		sets,
		defaultAnimation,
		selection,
		previewFrame,
		currentAnim,
		spriteSheetPath,
		isPreviewRunning,
		setCellW,
		setCellH,
		setSelection,
		handleSetDefault,
		handleSelectSpritesheet,
		startPreview,
		stopPreview,
		addSet,
		deleteSet,
		renameSet,
		addAnimation,
		deleteAnimation,
		updateAnim,
		toggleCell,
		removeFrame,
		moveFrame,
		handleDelete,
	};
}
