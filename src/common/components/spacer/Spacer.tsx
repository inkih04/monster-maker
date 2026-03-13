import './Spacer.css';
import { useResize } from '../../customHooks/useResize';

interface SpacerProps {
	direction?: 'horizontal' | 'vertical';
	size?: 'normal' | 'small';
	resizable?: boolean;
	onResize?: (delta: number) => void;
	marginRight?: boolean;
}

function Spacer({
	direction = 'horizontal',
	size = 'normal',
	resizable = false,
	onResize,
	marginRight = true,
}: Readonly<SpacerProps>) {
	const { ref, isDragging } = useResize({
		direction,
		onResize: onResize ?? (() => {}),
	});

	if (!resizable) {
		return <div className={`spacer ${direction} ${size}`} />;
	}

	return (
		<div
			ref={ref}
			className={`spacer ${marginRight ? '' : 'spacer--no-margin-right'} ${direction} ${size} resizable ${isDragging ? 'dragging' : ''}`}
			role="separator"
			aria-orientation={direction === 'vertical' ? 'vertical' : 'horizontal'}
		>
			<div className="spacer-handle">
				<span className="spacer-dots" />
			</div>
		</div>
	);
}

export default Spacer;
