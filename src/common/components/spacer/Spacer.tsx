import './Spacer.css';

interface SpacerProps {
  direction?: 'horizontal' | 'vertical';
  size?: 'normal' | 'small';
}

function Spacer({ direction = 'horizontal', size= 'normal' }: SpacerProps) {
  return <div className={`spacer ${direction} ${size}`}></div>;
}

export default Spacer;
