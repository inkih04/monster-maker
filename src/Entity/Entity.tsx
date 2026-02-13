import './Entity.css';
import { Cube } from 'iconoir-react';

function entity() {
	return (
		<div className="Entity-container">
			<div className="entity--entity">
				<div className="entity--row1">
					<div className="entity--row1-left">
						<Cube className="entity--cube" />
						<div className="entity--input-container">Player</div>
					</div>
					<div className="entity--row-right">
						<p>ID:</p>
						<i>tile_1769196905199_x3zj4rrnk</i>
					</div>
				</div>
				<div className="entity--row2">
					<div className="entity--tag">
						<span>Tag :</span>
						<div className="entity--input-container">Player</div>
					</div>
					<div className="entity--layer">
						<span>Layer :</span>
						<div className="entity--input-container">Ground</div>
					</div>
				</div>
				<div className="enity--componentcontainer"></div>
			</div>
		</div>
	);
}

export default entity;
