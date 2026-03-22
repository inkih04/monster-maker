import { Trash } from 'iconoir-react';

type ResetableInputProps = {
	className?: string;
	value: string;
	placeholder?: string;
	defaultValue: string;
	onChange: (value: string) => void;
	onDragOver?: React.DragEventHandler;
	onDragLeave?: React.DragEventHandler;
	onDrop?: React.DragEventHandler;
};

function ResetableInput({
	className,
	value,
	placeholder,
	defaultValue,
	onChange,
	onDragOver,
	onDragLeave,
	onDrop,
}: Readonly<ResetableInputProps>) {
	const isDirty = value !== defaultValue;

	return (
		<div className="game-config--input-wrapper">
			<input
				className={`tagger-kv--input game-config--input ${className ?? ''}`}
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
			/>
			{isDirty && (
				<button
					className="game-config--reset-btn"
					onClick={() => onChange(defaultValue)}
					title="Reset to default"
					tabIndex={-1}
				>
					<Trash width={11} strokeWidth={1.8} />
				</button>
			)}
		</div>
	);
}

export default ResetableInput;
