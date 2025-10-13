import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import supabase from '../config/databaseClient';
import TerapistCard from "../components/TerapistCard";
import '../styles/terapists-page.css';
import '../styles/loader.css';

const TherapistResults = () => {
    const [therapists, setTherapists] = useState([]);
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const filters = location.state || {};

    const calculateAge = (dateString) => {
        const birthDate = new Date(dateString);
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const formatExperience = (years) => {
        const lastDigit = years % 10;
        const lastTwoDigits = years % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return `${years} років`;
        }

        if (lastDigit === 1) {
            return `${years} рік`;
        }

        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${years} роки`;
        }

        return `${years} років`;
    };

    const isAgeMatch = (age, range) => {
        switch (range) {
            case '20-30':
                return age >= 20 && age <= 30;
            case '31-40':
                return age >= 31 && age <= 40;
            case '41-50':
                return age >= 41 && age <= 50;
            case '50+':
                return age > 50;
            case 'Неважливо':
                return true;
            default:
                return true;
        }
    };

    const isExperienceMatch = (experience, range) => {
        switch (range) {
            case '0-5':
                return experience >= 0 && experience <= 5;
            case '6-10':
                return experience >= 6 && experience <= 10;
            case '11-15':
                return experience >= 11 && experience <= 15;
            case '15+':
                return experience > 15;
            case 'Неважливо':
                return true;
            default:
                return true;
        }
    };

    useEffect(() => {
        const fetchTherapistsByCategory = async () => {
            setLoading(true);
            try {
                const {data: categoryData, error: categoryError} = await supabase
                    .from('categories')
                    .select('category_id, name');

                if (categoryError) throw categoryError;

                const selectedCategoryIds = categoryData
                    .filter(category => filters.specialization.includes(category.name))
                    .map(category => category.category_id);

                const {data: doctorCategoriesData, error: doctorCategoriesError} = await supabase
                    .from('doctor_categories')
                    .select('doctor_id, category_id')
                    .in('category_id', selectedCategoryIds);

                if (doctorCategoriesError) throw doctorCategoriesError;

                const doctorIds = [...new Set(doctorCategoriesData.map(doc => doc.doctor_id))];

                const {data: doctorsData, error: doctorsError} = await supabase
                    .from('doctors')
                    .select('*')
                    .in('doctor_id', doctorIds);

                if (doctorsError) throw doctorsError;

                const filteredTherapists = doctorsData.filter(therapist => {
                    const age = calculateAge(therapist.doc_date);
                    const experience = therapist.experience;
                    let matches = true;

                    if (filters.gender && filters.gender !== 'Неважливо') {
                        const genderMatch = filters.gender === therapist.doc_sex;
                        if (!genderMatch) matches = false;
                    }

                    if (filters.age && !isAgeMatch(age, filters.age)) {
                        matches = false;
                    }

                    if (filters.qualification && filters.qualification !== 'Неважливо') {
                        const specializationMatch = Array.isArray(filters.qualification)
                            ? filters.qualification
                                .some(spec => therapist.specialization.includes(spec.trim()))
                            : therapist.specialization.includes(filters.qualification.trim());
                        if (!specializationMatch) matches = false;
                    }

                    if (filters.workFormat && filters.workFormat !== 'Неважливо') {
                        const workFormatMatch = filters.workFormat === therapist.meet_fomat;
                        if (!workFormatMatch) matches = false;
                    }

                    if (filters.experience && !isExperienceMatch(experience, filters.experience)) {
                        matches = false;
                    }

                    return matches;
                });

                const therapistsWithSpecialties = await Promise.all(filteredTherapists.map(async (therapist) => {
                    const {data: doctorSpecializations, error: doctorSpecializationsError} = await supabase
                        .from('doctor_categories')
                        .select('category_id')
                        .eq('doctor_id', therapist.doctor_id);

                    if (doctorSpecializationsError) throw doctorSpecializationsError;

                    const specialties = doctorSpecializations.map(specialty => categoryData.find(cat => cat.category_id === specialty.category_id)?.name || 'Не визначено');
                    therapist.specialties = specialties;
                    return therapist;
                }));

                setTherapists(therapistsWithSpecialties);
            } catch (error) {
                console.error('Error fetching therapists:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTherapistsByCategory();
    }, [filters]);


    return (
        <div className="all-terapists-container">
            <Header/>
            <div className="therapist-results">
                <h2 className="res">Результати пошуку</h2>
                {loading ? (
                    <div className="banter-loader">
                        <div className="banter-loader__box"></div>
                        <div className="banter-loader__box"></div>
                        <div className="banter-loader__box"></div>
                        <div className="banter-loader__box"></div>
                        <div className="banter-loader__box"></div>
                        <div className="banter-loader__box"></div>
                        <div className="banter-loader__box"></div>
                        <div className="banter-loader__box"></div>
                        <div className="banter-loader__box"></div>
                    </div>
                ) : therapists.length > 0 ? (
                    <div>
                        <div className="cards-container">
                            {therapists.map((therapist) => (
                                <TerapistCard
                                    key={therapist.doctor_id}
                                    name={`${therapist.first_name} ${therapist.last_name}`}
                                    experience={formatExperience(therapist.experience)}
                                    location={therapist.meet_fomat.includes('Офлайн') ? `Офлайн: ${therapist.city}` : therapist.meet_fomat}
                                    specialties={therapist.specialties}
                                    professions={therapist.specialization ? therapist.specialization.split(',') : []}
                                    photo={therapist.doc_photo}
                                    doctor_id={therapist.doctor_id}
                                />
                            ))}
                        </div>
                        <Footer/>
                    </div>

                ) : (
                    <p>Не знайдено терапевтів за заданими критеріями.</p>
                )}
            </div>
        </div>
    );
};

export default TherapistResults;
