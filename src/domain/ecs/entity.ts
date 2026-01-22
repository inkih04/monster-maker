import { ComponentMap } from "./componentMap";
import { Layer } from "./layer";
import { Tag } from "./tags";

export default interface Entity {
	id: string;
	tag?: Tag;
	layer: Layer;
	components: Partial<ComponentMap>;
}