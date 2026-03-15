import React, {useState} from 'react';
import '../styles/therapists-page.css';

const FilterComponent = ({categories, onFilter}) => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleCheckboxChange = (categoryId) => {
        setSelectedCategories((prevSelected) =>
            prevSelected.includes(categoryId)
                ? prevSelected.filter((id) => id !== categoryId)
                : [...prevSelected, categoryId]
        );
    };

    const handleFilterClick = () => {
        onFilter(selectedCategories);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        onFilter([]);
        setIsOpen(false);
    };

    return (
        <div className="filter-container">
            <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
                Теми <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <div className="dropdown">
                    {categories.map((category) => (
                        <label key={category.category_id} className="checkbox-label">
                            <input
                                type="checkbox"
                                value={category.category_id}
                                onChange={() => handleCheckboxChange(category.name)}
                                checked={selectedCategories.includes(category.name)}
                            />
                            {category.name}
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

export default FilterComponent;
