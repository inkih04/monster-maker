import { useState } from 'react';
import { Plus, Trash, EditPencil, CornerBottomRight } from 'iconoir-react';
import { useTranslation } from 'react-i18next';
import { useDialogEditor } from './useDialogEditor';

import './DialogEditor.css';
import DeleteConfirmation from '../common/components/delete/DeleteConfirmation';

type PendingDelete =
	| { type: 'dialogue'; dIndex: number; name: string }
	| { type: 'page'; dIndex: number; pIndex: number; name: string }
	| { type: 'choice'; dIndex: number; pIndex: number; cIndex: number; name: string };

export default function DialogEditor() {
	const { t } = useTranslation();

	const {
		dialogues,
		isLoading,
		isSaving,
		error,
		editingIdIndex,
		focusedPageIndex,

		setEditingIdIndex,

		updateDialogueId,
		handleAddDialogue,
		deleteDialogue,
		handleAddPage,
		updatePage,
		deletePage,
		addChoice,
		updateChoice,
		deleteChoice,
	} = useDialogEditor();

	const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

	const handleConfirmDelete = () => {
		if (!pendingDelete) return;
		if (pendingDelete.type === 'dialogue') deleteDialogue(pendingDelete.dIndex);
		if (pendingDelete.type === 'page') deletePage(pendingDelete.dIndex, pendingDelete.pIndex);
		if (pendingDelete.type === 'choice')
			deleteChoice(pendingDelete.dIndex, pendingDelete.pIndex, pendingDelete.cIndex);
		setPendingDelete(null);
	};

	if (isLoading) {
		return <div className="dialogue-editor-status">{t('dialogueEditor.loading')}</div>;
	}

	if (error) {
		return <div className="dialogue-editor-status dialogue-editor-error">{error}</div>;
	}

	return (
		<div className="dialogue-editor-wrapper">
			{isSaving && <div className="dialogue-editor-saving">{t('dialogueEditor.saving')}</div>}

			{dialogues.map((dialog, dIndex) => (
				<div key={dIndex} className="dialogue-card">
					<div className="dialogue-header">
						<div className="dialogue-header-left">
							{editingIdIndex === dIndex ? (
								<input
									className="dialogue-id-input"
									value={dialog.id}
									onChange={(e) => updateDialogueId(dIndex, e.target.value)}
									onBlur={() => setEditingIdIndex(null)}
									autoFocus
								/>
							) : (
								<div className="dialogue-id-display" onClick={() => setEditingIdIndex(dIndex)}>
									<span>{dialog.id}</span>
									<EditPencil width={14} />
								</div>
							)}
						</div>
						<button
							className="dialogue-icon-btn delete-btn action-btn-dialogue"
							onClick={() => setPendingDelete({ type: 'dialogue', dIndex, name: dialog.id })}
							title={t('dialogueEditor.deleteDialogueTooltip')}
						>
							<Trash width={16} />
						</button>
					</div>

					<div className="dialogue-pages">
						{dialog.pages.map((page, pIndex) => {
							const isNewFocused =
								focusedPageIndex?.dialogIndex === dIndex && focusedPageIndex?.pageIndex === pIndex;

							return (
								<div key={pIndex} className="dialogue-page-row">
									<div className="dialogue-page-inputs">
										<input
											className="dialogue-input dialogue-speaker-input"
											placeholder={t('dialogueEditor.speakerPlaceholder')}
											value={page.speaker}
											onChange={(e) => updatePage(dIndex, pIndex, 'speaker', e.target.value)}
											autoFocus={isNewFocused}
										/>
										<div className="dialogue-text-container">
											<input
												className="dialogue-input dialogue-text-input"
												placeholder={t('dialogueEditor.dialogueTextPlaceholder')}
												value={page.text}
												onChange={(e) => updatePage(dIndex, pIndex, 'text', e.target.value)}
											/>
											<button
												className="dialogue-icon-btn delete-btn"
												onClick={() =>
													setPendingDelete({
														type: 'page',
														dIndex,
														pIndex,
														name: page.text || `Page ${pIndex + 1}`,
													})
												}
												title={t('dialogueEditor.deletePageTooltip')}
											>
												<Trash width={16} />
											</button>
										</div>
									</div>

									<div className="dialogue-choices-section">
										{page.choices && page.choices.length > 0 && (
											<div className="dialogue-choices-list">
												{page.choices.map((choice, cIndex) => (
													<div key={cIndex} className="dialogue-choice-row">
														<CornerBottomRight width={16} className="choice-icon" />
														<div className="choice-inputs-wrapper">
															<input
																className="dialogue-input choice-input"
																placeholder={t('dialogueEditor.choiceTextPlaceholder')}
																value={choice.text}
																onChange={(e) =>
																	updateChoice(dIndex, pIndex, cIndex, 'text', e.target.value)
																}
															/>
															<input
																className="dialogue-input choice-input"
																placeholder={t('dialogueEditor.nextChainIdPlaceholder')}
																value={choice.next_chain}
																onChange={(e) =>
																	updateChoice(dIndex, pIndex, cIndex, 'next_chain', e.target.value)
																}
															/>
														</div>
														<button
															className="dialogue-icon-btn delete-btn"
															onClick={() =>
																setPendingDelete({
																	type: 'choice',
																	dIndex,
																	pIndex,
																	cIndex,
																	name: choice.text || `Choice ${cIndex + 1}`,
																})
															}
															title={t('dialogueEditor.deleteChoiceTooltip')}
														>
															<Trash width={14} />
														</button>
													</div>
												))}
											</div>
										)}
										<button
											className="dialogue-add-choice-btn"
											onClick={() => addChoice(dIndex, pIndex)}
										>
											<Plus width={12} strokeWidth={3} />
											<span>{t('dialogueEditor.addChoice')}</span>
										</button>
									</div>
								</div>
							);
						})}
					</div>

					<div className="dialogue-footer">
						<button className="dialogue-add-page-btn" onClick={() => handleAddPage(dIndex)}>
							<Plus width={16} strokeWidth={2.5} />
							<span>{t('dialogueEditor.addPage')}</span>
						</button>
					</div>
				</div>
			))}

			<div className="dialogue-add-main-btn-container">
				<button className="dialogue-add-main-btn" onClick={handleAddDialogue}>
					<Plus width={20} strokeWidth={2.5} />
					<span>{t('dialogueEditor.addDialogue')}</span>
				</button>
			</div>

			<DeleteConfirmation
				open={pendingDelete !== null}
				onOpenChange={(open) => {
					if (!open) setPendingDelete(null);
				}}
				itemName={pendingDelete?.name ?? ''}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
}
