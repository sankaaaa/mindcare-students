import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import "../styles/loader.css";
import "../styles/single-therapist-page.css";
import supabase from "../config/databaseClient";
import Header from "./Header";
import Star from '../assets/star.png';
import Calendar from '../assets/calendar.png';
import Lang from '../assets/lang.png';
import Footer from "./Footer";
import TherCalendar from "./TherCalendar";
import {Accordion, AccordionItem} from "@nextui-org/react";


const TherapistDetails = () => {
    const {id} = useParams();
    const [therapist, setTherapist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [activeSection, setActiveSection] = useState('about');

    useEffect(() => {
        const fetchTherapistDetails = async () => {
            setLoading(true);
            try {
                const {data: doctor, error} = await supabase
                    .from("doctors")
                    .select(
                        "doctor_id, first_name, last_name, experience, city, specialization, doc_photo, " +
                        "doc_date, meet_fomat, doc_session, doc_rev, doc_lang, doc_about, doc_education, doc_way"
                    )
                    .eq("doctor_id", id)
                    .single();

                if (error) throw error;
                setTherapist(doctor);

                const {data: doctorCategories, error: doctorCategoriesError} = await supabase
                    .from('doctor_categories')
                    .select('doctor_id, category_id')
                    .eq('doctor_id', id);

                if (doctorCategoriesError) throw doctorCategoriesError;

                const {data: categoriesData, error: categoriesError} = await supabase
                    .from('categories')
                    .select('category_id, name');

                if (categoriesError) throw categoriesError;

                const categoryMap = {};
                categoriesData.forEach(category => {
                    categoryMap[category.category_id] = category.name;
                });

                const doctorSpecialties = doctorCategories
                    .map(dc => categoryMap[dc.category_id])
                    .filter(Boolean);

                setCategories(doctorSpecialties);

            } catch (error) {
                console.error("Error fetching therapist details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTherapistDetails();
    }, [id]);

    const calculateAge = (birthDate) => {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();

        if (month < birth.getMonth() || (month === birth.getMonth() && day < birth.getDate())) {
            age--;
        }

        return age;
    };

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            const sectionTop = section.offsetTop;

            window.scrollTo({
                top: sectionTop - 20,
                behavior: 'smooth',
            });
        }
    };

    const handleBookSession = () => {
        setTimeout(() => scrollToSection('calendar'), 100);
    };

    const formatAge = (age) => {
        const lastDigit = age % 10;
        if (lastDigit === 1 && age !== 11) {
            return `${age} рік`;
        } else if ([2, 3, 4].includes(lastDigit) && !(age >= 12 && age <= 14)) {
            return `${age} роки`;
        } else {
            return `${age} років`;
        }
    };

    const formatExperience = (experience) => {
        const lastDigit = experience % 10;
        if (lastDigit === 1 && experience !== 11) {
            return `${experience} рік досвіду`;
        } else if ([2, 3, 4].includes(lastDigit) && !(experience >= 12 && experience <= 14)) {
            return `${experience} роки досвіду`;
        } else {
            return `${experience} років досвіду`;
        }
    };

    const formatSessions = (sessions) => {
        const lastDigit = sessions % 10;
        if (lastDigit === 1 && sessions !== 11) {
            return `${sessions} сесія`;
        } else if ([2, 3, 4].includes(lastDigit) && !(sessions >= 12 && sessions <= 14)) {
            return `${sessions} сесії`;
        } else {
            return `${sessions} сесій`;
        }
    };

    const formatReviews = (reviews) => {
        const lastDigit = reviews % 10;
        if (lastDigit === 1 && reviews !== 11) {
            return `${reviews}  відгук`;
        } else if ([2, 3, 4].includes(lastDigit) && !(reviews >= 12 && reviews <= 14)) {
            return `${reviews}  відгуки`;
        } else {
            return `${reviews}  відгуків`;
        }
    };

    const handleRadioChange = (section) => {
        setActiveSection(section);
    };

    if (loading) {
        return (
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
        );
    }

    if (!therapist) {
        return <div>Therapist not found.</div>;
    }

    let location = therapist.meet_fomat;
    if (therapist.meet_fomat.includes('Офлайн')) {
        location = therapist.meet_fomat.replace('Офлайн', `Офлайн: ${therapist.city}`);
    }

    const age = therapist.doc_date ? calculateAge(therapist.doc_date) : null;

    return (
        <div>
            <Header/>
            <div className="therapist-detail-page">
                <div className="therapist-card">
                    <div className="therapist-photo-section">
                        <img
                            className="therapist-photo"
                            src={therapist.doc_photo || "default-photo.png"}
                            alt={`${therapist.first_name} ${therapist.last_name}`}
                        />
                        <div className="therapist-name">
                            {therapist.first_name} {therapist.last_name}
                        </div>
                    </div>
                    <div className="therapist-info">
                        <p className="age">
                            {formatAge(age)}
                        </p>
                        <div className="therapist-details">
                            <div className="details-line">
                                <img className="ther-image" src={Calendar} alt="Calendar icon"/>
                                <span>{formatExperience(therapist.experience)}</span>
                            </div>
                            <p>{location}</p>
                        </div>

                        <div className="therapist-details-two">
                            <div className="details-line">
                                <img className="ther-image" src={Star} alt="Star icon"/>
                                <span>{formatSessions(therapist.doc_session)}</span>
                            </div>
                            <p>{formatReviews(therapist.doc_rev)}</p>
                        </div>

                        <button className="book-session-btn" onClick={handleBookSession}>Забронювати сеанс</button>
                    </div>
                    <div className="second-col">
                        <div className="details-line-two">
                            Кваліфікація: {therapist.specialization}
                        </div>
                        <div className="therapist-specialization">
                            <span>З чим працюю:</span>
                            <ul>
                                {categories.map((category, index) => (
                                    <li key={index}>{category}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="therapist-languages">
                            <div className="details-line">
                                <img id="langimg" src={Lang} alt="Lang icon"/>
                                <span>Мова надання послуг:</span>
                            </div>
                            <p>{therapist.doc_lang}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mydict">
                <div>
                    <label>
                        <input
                            type="radio"
                            name="radio"
                            checked={activeSection === 'about'}
                            onChange={() => handleRadioChange('about')}
                        />
                        <span>Про мене</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="radio"
                            checked={activeSection === 'education'}
                            onChange={() => handleRadioChange('education')}
                        />
                        <span>Освіта</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="radio"
                            checked={activeSection === 'work'}
                            onChange={() => handleRadioChange('work')}
                        />
                        <span>Підхід</span>
                    </label>
                </div>

                {activeSection === 'about' && (
                    <div className="section-content">
                        <p>{therapist.doc_about}</p>
                    </div>
                )}
                {activeSection === 'education' && (
                    <div className="section-content">
                        <p>{therapist.doc_education}</p>
                    </div>
                )}
                {activeSection === 'work' && (
                    <div className="section-content">
                        <p>{therapist.doc_way}</p>
                    </div>
                )}
            </div>

            <div id="calendar" className="calendar-section">
                <h3>Забронювати сеанс</h3>
                <TherCalendar/>
            </div>

            <div className="accordion-container">
                <Accordion variant="splitted">
                    <AccordionItem
                        key="1"
                        aria-label="Accordion 1"
                        title="Як сформулювати запит до психолога?"
                        css={{
                            border: 'none',
                            padding: 0,
                        }}
                        className="custom-accordion-item"
                    >
                        <div className="custom-accordion-content">
                            Самостійно ідентифікувати корінь проблеми може бути доволі складно.
                            Не треба переживати – психотерапевт доможе із визначенням запиту. У такому разі вам слід
                            описати симптоматику проблеми: що саме приносить дискомфорт, як це впливає на ваше
                            повсякдення,
                            як саме це пов'язано з наслідками війни.
                        </div>
                    </AccordionItem>
                    <AccordionItem
                        key="2"
                        aria-label="Accordion 2"
                        title="У чому різниця між психологом, психотерапевтом і психіатром?"
                        className="custom-accordion-item"
                    >
                        <div className="custom-accordion-content">
                            <strong>Психолог</strong>
                            — фахівець, який здобув вищу психологічну освіту. Зазвичай робота з психологом
                            короткострокова: потрібні кілька зустрічей, щоб розібратися з конкретною проблемою чи
                            ситуацією.
                            <br/>
                            <br/>
                            <strong>Психотерапевт</strong>
                            — спеціаліст із медичною освітою або з вищою/додатковою психологічною освітою. Перші можуть
                            виписувати медикаментозне лікування та доповнювати його деякими видами психотерапії. Другі
                            працюють із тим, що ми зазвичай маємо на увазі під психотерапією. Цих терапевтів на нашій
                            платформі – більшість. Вони використовують такі довгострокові методи, як психоаналіз, і
                            короткострокові – як, наприклад, когнітивно-поведінкова терапія.
                            <br/>
                            <br/>
                            <strong>Психіатр</strong>
                            — спеціаліст, який має вищу медичну освіту. Психіатр займається діагностикою, профілактикою
                            та лікуванням психічних хвороб, спираючись на фізіологію. У більшості випадків йдеться про
                            медикаментозне лікування.
                        </div>
                    </AccordionItem>
                    <AccordionItem
                        key="3"
                        aria-label="Accordion 3"
                        title="Як вибрати психолога онлайн?"
                        className="custom-accordion-item"
                    >
                        <div className="custom-accordion-content">
                            На нашій платформі є два способи вибрати фахівця:
                            <br/>
                            <br/>
                            1. відповісти на кілька запитань й отримати добірку спеціалістів, які найкраще вам
                            підходять;
                            <br/>
                            2. вибрати самостійно серед усіх спеціалістів платформи.
                        </div>
                    </AccordionItem>
                    <AccordionItem
                        key="4"
                        aria-label="Accordion 4"
                        title="Як відбувається перша сесія?"
                        className="custom-accordion-item"
                    >
                        <div className="custom-accordion-content">
                            Здебільшого це зустріч-знайомство. Для роботи фахівцю потрібно більше дізнатися про вас.
                            Він може розпитувати, що привело на сеанс, а також про різні життєві події, сім'ю, стосунки
                            тощо. Або ж слухатиме вашу розповідь, спрямовуючи уточнювальними запитаннями.
                        </div>
                    </AccordionItem>
                    <AccordionItem
                        key="5"
                        aria-label="Accordion 5"
                        title="Скільки сесій мені знадобиться та який результат я отримаю?"
                        className="custom-accordion-item"
                    >
                        <div className="custom-accordion-content">
                            Кількість сесій залежить від структури вашої особистості та потрібного рівня змін.
                            Психотерапевту вистачить 1-2 сесії для загального аналізу стану та історії. Надалі для
                            поверхневих змін (допомоги з адаптацією) достатньо від 5 до 20 сеансів,
                            на більш глибокі та цілісні трансформації (розбору травмуючих ситуацій) знадобиться більше
                            часу.
                            <br/>
                            <br/>
                            Результат психотерапії безпосередньо залежить від тих запитів, із якими на неї приходять.
                            Якщо вас непокоїть пост-траматичний синдром, то результатом буде вміння самостійно опанувати
                            панічні атаки та страх.
                            Якщо важливо згладити наслідки фобій для адаптації в цивільному житті, то психотерапія
                            допоможе впоратися
                            та навчитися жити зі старим досвідом у новому житті.
                        </div>
                    </AccordionItem>
                </Accordion>
            </div>


            <Footer/>
        </div>
    );
};

export default TherapistDetails;
