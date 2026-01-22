import Entity from "../domain/ecs/entity";
import { Layer } from "../domain/ecs/layer";


export const createTileEntity = (
	entityId: string,
	layer: Layer,
	mapX: number,
	mapY: number,
	tilesetX: number,
	tilesetY: number,
	tileSize: number,
	spriteSheetPath: string
): Entity => ({
	id: entityId,
	tag: 'TILEMAP',
	layer,
	components: {
		POSITION: {
			x: mapX * tileSize,
			y: mapY * tileSize,
			rotation: 0,
		},
		RENDER: {
			spriteSheetPath,
			x: tilesetX * tileSize,
			y: tilesetY * tileSize,
			w: tileSize,
			h: tileSize,
			width: tileSize,
			height: tileSize,
		},
	},
});
