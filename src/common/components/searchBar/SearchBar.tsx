import './SearchBar.css';
import { Search } from 'iconoir-react';

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: Readonly<SearchBarProps>) {
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	return (
		<div className="searchbar-container">
			<Search width={18} height={18} strokeWidth={2} />
			<input
				type="text"
				placeholder="Search projects..."
				value={value}
				onChange={handleSearch}
				className="searchbar-input"
			/>
		</div>
	);
}

export default SearchBar;
