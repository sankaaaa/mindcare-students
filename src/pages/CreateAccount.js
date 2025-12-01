import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import '../styles/create-account.css';
import {ReactComponent as Frame} from '../assets/Frame.svg';
import supabase from '../config/databaseClient';

const CreateAccount = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: '',
        email: '',
        phone: '',
        address: '',
        login: '',
        password: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const nextStep = () => {
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const prevStep = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let genderInEnglish = '';
        if (formData.gender === 'male') {
            genderInEnglish = 'male';
        } else if (formData.gender === 'female') {
            genderInEnglish = 'female';
        } else if (formData.gender === 'another') {
            genderInEnglish = 'another';
        }

        try {
            const {data: lastPatient, error: lastPatientError} = await supabase
                .from('patients')
                .select('patient_id')
                .order('patient_id', {ascending: false})
                .limit(1);

            if (lastPatientError) throw lastPatientError;

            const nextPatientId = lastPatient[0] ? lastPatient[0].patient_id + 1 : 3;

            const {data, error} = await supabase
                .from('patients')
                .insert([
                    {
                        patient_id: nextPatientId,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        date_of_birth: formData.birthDate,
                        gender: genderInEnglish,
                        email: formData.email,
                        phone_number: formData.phone,
                        address: formData.address,
                        pat_login: formData.login,
                        pat_password: formData.password,
                    }
                ]);

            if (error) {
                setError('Помилка при створенні акаунту: ' + error.message);
            } else {
                console.log('Пацієнта додано успішно:', data);

                localStorage.setItem("email", formData.email);
                localStorage.setItem("patient_id", nextPatientId);
                localStorage.setItem("status", "patient");
                navigate('/login');
            }
        } catch (error) {
            setError('Помилка при обробці запиту: ' + error.message);
            console.error('Помилка при додаванні пацієнта:', error);
        }
    };


    return (
        <div className="createacc-page">
            <div className="logo">
                <Frame className="frameIcon"/>
                <div className="logoText">CareMatch</div>
            </div>

            <div className="createacc-container">
                <div className="header">
                    <h2>Створити акаунт</h2>
                    <p>Будь ласка, заповніть необхідні поля</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {currentStep === 1 && (
                        <>
                            <div className="input-container">
                                <input
                                    type="text"
                                    placeholder="Ім'я"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-container">
                                <input
                                    type="text"
                                    placeholder="Прізвище"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-container">
                                <p>Оберіть свою стать: </p>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="gender"
                                        checked={formData.gender === 'male'}
                                        onChange={() => setFormData({...formData, gender: 'male'})}
                                    />
                                    Чоловік
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="gender"
                                        checked={formData.gender === 'female'}
                                        onChange={() => setFormData({...formData, gender: 'female'})}
                                    />
                                    Жінка
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        name="gender"
                                        checked={formData.gender === 'another'}
                                        onChange={() => setFormData({...formData, gender: 'another'})}
                                    />
                                    Інша
                                </label>
                            </div>

                            <div className="input-container">
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <button type="button" className="login-button" onClick={nextStep}>
                                Далі
                            </button>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <div className="input-container">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-container">
                                <input
                                    type="text"
                                    placeholder="Телефон"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-container">
                                <input
                                    type="text"
                                    placeholder="Адреса"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <button type="button" className="prev-button" onClick={prevStep}>
                                Назад
                            </button>
                            <button type="button" className="login-button" onClick={nextStep}>
                                Далі
                            </button>
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
                            <div className="input-container">
                                <input
                                    type="text"
                                    placeholder="Логін"
                                    name="login"
                                    value={formData.login}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-container">
                                <input
                                    type="password"
                                    placeholder="Пароль"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <button type="button" className="prev-button" onClick={prevStep}>
                                Назад
                            </button>
                            <button type="submit" className="login-button">
                                Завершити
                            </button>
                        </>
                    )}
                </form>

                {error && <div className="error">{error}</div>}
            </div>

            <div className="pattern"></div>
        </div>
    );
};

export default CreateAccount;
