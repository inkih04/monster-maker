import { Plus, Xmark } from 'iconoir-react';
import '../TaggerBody.css';
import { useShaderEntries } from './useShaderEntries';
import { DEFAULT_SHADER_TAG } from './shaderEntryUtils';
import { useTranslation } from 'react-i18next';

function TaggerShadersBody() {
	const { entries, isLoading, handleTagChange, handleModeChange, handleAdd, handleRemove } =
		useShaderEntries();

	const { t } = useTranslation();

	if (isLoading) {
		return <div className="tagger-body--scroll tagger-body--loading">Loading…</div>;
	}

	return (
		<div className="tagger-body--scroll">
			<div className="tagger-kv--header-row">
				<span className="tagger-kv--col-label col-tag-shader">Tag</span>
				<span className="tagger-kv--col-label col-mode">{t('mode')}</span>
				<span className="tagger-kv--col-spacer" />
			</div>

			<ul className="tagger-kv--list">
				{entries.map((entry, index) => {
					const isDefault = entry.tag === DEFAULT_SHADER_TAG;
					return (
						<>
							{index > 0 && <li key={`sep-${entry.id}`} className="tagger-kv--row-separator" />}
							<li key={entry.id} className="tagger-kv--row">
								<input
									className="tagger-kv--input input-tag-shader"
									type="text"
									placeholder="e.g. water"
									value={entry.tag}
									readOnly={isDefault}
									onChange={(e) => handleTagChange(entry.id, e.target.value)}
								/>
								<input
									className="tagger-kv--input input-mode"
									type="number"
									placeholder="0"
									value={entry.mode}
									min={0}
									onChange={(e) => handleModeChange(entry.id, e.target.value)}
								/>
								<button
									className="tagger-kv--remove-btn"
									onClick={() => handleRemove(entry.id)}
									title="Remove entry"
									disabled={isDefault}
									style={isDefault ? { visibility: 'hidden' } : undefined}
								>
									<Xmark width={12} strokeWidth={2} />
								</button>
							</li>
						</>
					);
				})}
			</ul>

			<div className="tagger-kv--add-container">
				<button className="tagger-kv--add-button" onClick={handleAdd}>
					<Plus width={14} strokeWidth={2.5} />
					<span>{t('addShader')}</span>
				</button>
			</div>
		</div>
	);
}

export default TaggerShadersBody;
