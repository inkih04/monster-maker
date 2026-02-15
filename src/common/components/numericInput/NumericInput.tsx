import { useState, useEffect } from 'react';
import { NavArrowUp, NavArrowDown } from 'iconoir-react';
import './NumberInput.css';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
}

export default function NumberInput({ value, onChange, step = 1, min = -Infinity }: NumberInputProps) {
    const [localValue, setLocalValue] = useState(value.toString());


    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const handleBlur = () => {
        let num = Number(localValue);
        if (isNaN(num)) num = min;
        num = Math.max(min, Math.round(num / step) * step);
        setLocalValue(num.toString());
        onChange(num);
    };

    const handleIncrement = () => {
        const newVal = Number(localValue) + step;
        setLocalValue(newVal.toString());
        onChange(newVal);
    };

    const handleDecrement = () => {
        const newVal = Math.max(min, Number(localValue) - step);
        setLocalValue(newVal.toString());
        onChange(newVal);
    };

    return (
        <div className="custom-number-wrapper">
            <input
                type="number"
                className="custom-number-input"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
            <div className="custom-number-spinners">
                <button type="button" onClick={handleIncrement} className="spinner-btn up">
                    <NavArrowUp width={12} height={12} strokeWidth={3} />
                </button>
                <button type="button" onClick={handleDecrement} className="spinner-btn down">
                    <NavArrowDown width={12} height={12} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}