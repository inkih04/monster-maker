import { Plus, Xmark } from 'iconoir-react';
import '../TaggerBody.css';
import { useTranslation } from 'react-i18next';
import { useTagEntries } from './customHooks/useTagEntries';


function TaggerTagsBody() {
	const { t } = useTranslation();
	const {
		entries,
		isLoading,
		dragOverId,
		handleTagChange,
		handlePathChange,
		handleAdd,
		handleRemove,
		handleDragOver,
		handleDragLeave,
		handleDrop,
	} = useTagEntries();

	if (isLoading) {
		return <div className="tagger-body--scroll tagger-body--loading">Loading…</div>;
	}

	return (
		<div className="tagger-body--scroll">
			<div className="tagger-kv--header-row">
				<span className="tagger-kv--col-label col-tag-map">Tag</span>
				<span className="tagger-kv--col-label col-path">{t('filePath')}</span>
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
								value={entry.tag}
								onChange={(e) => handleTagChange(entry.id, e.target.value)}
							/>
							<input
								className={`tagger-kv--input input-path ${dragOverId === entry.id ? 'tagger-kv--input-drag-over' : ''}`}
								type="text"
								placeholder="maps/town.json"
								value={entry.path}
								onChange={(e) => handlePathChange(entry.id, e.target.value)}
								onDragOver={(e) => handleDragOver(e, entry.id)}
								onDragLeave={handleDragLeave}
								onDrop={(e) => handleDrop(e, entry.id)}
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
					<span>{t('addTag') ?? 'Add tag'}</span>
				</button>
			</div>
		</div>
	);
}

export default TaggerTagsBody;
