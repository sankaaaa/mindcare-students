import React, {useState} from 'react';
import '../styles/therapists-page.css';

const SpecializationFilter = ({specializations, onFilterSpecialization}) => {
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleCheckboxChange = (specialization) => {
        setSelectedSpecializations((prevSelected) =>
            prevSelected.includes(specialization)
                ? prevSelected.filter((spec) => spec !== specialization)
                : [...prevSelected, specialization]
        );
    };

    const handleFilterClick = () => {
        onFilterSpecialization(selectedSpecializations);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        setSelectedSpecializations([]);
        onFilterSpecialization([]);
        setIsOpen(false);
    };

    return (
        <div className="filter-container">
            <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
                Спеціалізація <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className="dropdowna">
                    {specializations.map((spec) => (
                        <label key={spec} className="checkbox-label">
                            <input
                                type="checkbox"
                                value={spec}
                                onChange={() => handleCheckboxChange(spec)}
                                checked={selectedSpecializations.includes(spec)}
                            />
                            {spec}
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

export default SpecializationFilter;
