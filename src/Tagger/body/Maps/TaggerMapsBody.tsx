import { useState } from 'react';
import { Plus, Xmark } from 'iconoir-react';
import '../TaggerBody.css';

type MapEntry = {
	id: string;
	tagMap: string;
	pathMap: string;
};

function TaggerMapsBody() {
	const [entries, setEntries] = useState<MapEntry[]>([
		{ id: crypto.randomUUID(), tagMap: '', pathMap: '' },
	]);

	const handleTagChange = (id: string, value: string) => {
		setEntries((prev) =>
			prev.map((entry) => (entry.id === id ? { ...entry, tagMap: value } : entry))
		);
	};

	const handlePathChange = (id: string, value: string) => {
		setEntries((prev) =>
			prev.map((entry) => (entry.id === id ? { ...entry, pathMap: value } : entry))
		);
	};

	const handleAdd = () => {
		setEntries((prev) => [...prev, { id: crypto.randomUUID(), tagMap: '', pathMap: '' }]);
	};

	const handleRemove = (id: string) => {
		setEntries((prev) => prev.filter((entry) => entry.id !== id));
	};

	return (
		<div className="tagger-body--scroll">
			<div className="tagger-kv--header-row">
				<span className="tagger-kv--col-label col-tag-map">Tag</span>
				<span className="tagger-kv--col-label col-path">Map path</span>
				<span className="tagger-kv--col-spacer" />
			</div>

			<ul className="tagger-kv--list">
				{entries.map((entry, index) => (
					<>
						{index > 0 && <li key={`sep-${entry.id}`} className="tagger-kv--row-separator" />}
						<li key={entry.id} className="tagger-kv--row">
							<input
								className="tagger-kv--input input-tag-map"
								type="text"
								placeholder="e.g. town"
								value={entry.tagMap}
								onChange={(e) => handleTagChange(entry.id, e.target.value)}
							/>
							<input
								className="tagger-kv--input input-path"
								type="text"
								placeholder="maps/town.json"
								value={entry.pathMap}
								onChange={(e) => handlePathChange(entry.id, e.target.value)}
							/>
							<button
								className="tagger-kv--remove-btn"
								onClick={() => handleRemove(entry.id)}
								title="Remove entry"
							>
								<Xmark width={12} strokeWidth={2} />
							</button>
						</li>
					</>
				))}
			</ul>

			<div className="tagger-kv--add-container">
				<button className="tagger-kv--add-button" onClick={handleAdd}>
					<Plus width={14} strokeWidth={2.5} />
					<span>Add map entry</span>
				</button>
			</div>
		</div>
	);
}

export default TaggerMapsBody;
