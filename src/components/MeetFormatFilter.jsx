import React, {useState} from 'react';
import '../styles/therapists-page.css';

const MeetFormatFilter = ({onFilterMeetFormat}) => {
    const [selectedFormat, setSelectedFormat] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const formatOptions = ['Онлайн', 'Офлайн'];

    const handleRadioChange = (format) => {
        setSelectedFormat(format);
    };

    const handleFilterClick = () => {
        onFilterMeetFormat(selectedFormat ? [selectedFormat] : []);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        setSelectedFormat('');
        onFilterMeetFormat([]);
        setIsOpen(false);
    };

    return (
        <div className="filter-container">
            <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
                Формат <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className="dropdowna">
                    {formatOptions.map((format) => (
                        <label key={format} className="checkbox-label">
                            <input
                                type="radio"
                                value={format}
                                onChange={() => handleRadioChange(format)}
                                checked={selectedFormat === format}
                            />
                            {format}
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

export default MeetFormatFilter;
