import { Trash } from 'iconoir-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

type ResetableInputProps = {
	className?: string;
	value: string;
	placeholder?: string;
	defaultValue: string;
	onChange: (value: string) => void;
	onDragOver?: React.DragEventHandler;
	onDragLeave?: React.DragEventHandler;
	onDrop?: React.DragEventHandler;
	options?: string[];
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
	options,
}: Readonly<ResetableInputProps>) {
	const isDirty = value !== defaultValue;
	const [open, setOpen] = useState(false);
	const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	const handleInputClick = () => {
		if (!options || options.length === 0) return;

		if (wrapperRef.current) {
			const rect = wrapperRef.current.getBoundingClientRect();
			setDropdownStyle({
				position: 'fixed',
				top: rect.bottom + 3,
				left: rect.left,
				width: rect.width,
			});
		}
		setOpen(true);
	};

	return (
		<div className="game-config--input-wrapper" ref={wrapperRef}>
			<input
				className={`tagger-kv--input game-config--input ${className ?? ''}`}
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
				onClick={handleInputClick}
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
			{open &&
				options &&
				options.length > 0 &&
				createPortal(
					<ul className="game-config--select-dropdown" style={dropdownStyle}>
						{options.map((option) => (
							<li
								key={option}
								className={`game-config--select-option ${option === value ? 'is-selected' : ''}`}
								onMouseDown={() => {
									onChange(option);
									setOpen(false);
								}}
							>
								{option}
							</li>
						))}
					</ul>,
					document.body
				)}
		</div>
	);
}

export default ResetableInput;
