import React, {useState} from 'react';
import '../styles/therapists-page.css';

const GenderFilter = ({onFilterGender}) => {
    const [selectedGender, setSelectedGender] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const genderOptions = ['Чоловік', 'Жінка', 'Інше'];

    const handleRadioChange = (gender) => {
        setSelectedGender(gender);
    };

    const handleFilterClick = () => {
        onFilterGender(selectedGender ? [selectedGender] : []);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        setSelectedGender('');
        onFilterGender([]);
        setIsOpen(false);
    };

    return (
        <div className="filter-container">
            <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
                Стать <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className="dropdowna">
                    {genderOptions.map((gender) => (
                        <label key={gender} className="checkbox-label">
                            <input
                                type="radio"
                                value={gender}
                                onChange={() => handleRadioChange(gender)}
                                checked={selectedGender === gender}
                            />
                            {gender}
                        </label>
                    ))}
                    <button className="apply-button" onClick={handleFilterClick}>
                        Фільтрувати
                    </button>
                    <button className="clear-button" onClick={handleClearFilters}>
                        Скинути фільтри
                    </button>
                </div>
            )}
        </div>
    );
};

export default GenderFilter;
