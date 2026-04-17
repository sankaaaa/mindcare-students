import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/reset-password.css';
import { ReactComponent as Frame } from '../assets/Frame.svg';
import supabase from '../config/databaseClient';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        if (!email || !password) {
            setError('Будь ласка, введіть email та новий пароль');
            setSuccess('');
            return;
        }

        try {
            setError('');
            setSuccess('');

            // 1. Спочатку шукаємо пацієнта
            const { data: patient, error: patientFetchError } = await supabase
                .from('patients')
                .select('patient_id, email')
                .eq('email', email)
                .maybeSingle();

            if (patientFetchError) {
                throw patientFetchError;
            }

            if (patient) {
                const { error: updatePatientError } = await supabase
                    .from('patients')
                    .update({ pat_password: password })
                    .eq('email', email);

                if (updatePatientError) {
                    throw updatePatientError;
                }

                try {
                    await fetch("http://localhost:4000/send-password-changed-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                    });
                } catch (mailErr) {
                    console.error("Помилка відправки листа про зміну пароля:", mailErr);
                }

                setSuccess('Пароль успішно змінено!');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            // 2. Якщо пацієнта нема — шукаємо лікаря
            const { data: doctor, error: doctorFetchError } = await supabase
                .from('doctors')
                .select('doctor_id, email')
                .eq('email', email)
                .maybeSingle();

            if (doctorFetchError) {
                throw doctorFetchError;
            }

            if (doctor) {
                const { error: updateDoctorError } = await supabase
                    .from('doctors')
                    .update({ doc_password: password })
                    .eq('email', email);

                if (updateDoctorError) {
                    throw updateDoctorError;
                }

                try {
                    await fetch("http://localhost:4000/send-password-changed-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                    });
                } catch (mailErr) {
                    console.error("Помилка відправки листа про зміну пароля:", mailErr);
                }

                setSuccess('Пароль успішно змінено!');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            setError('Користувача з таким email не знайдено');
        } catch (error) {
            console.error('Помилка при зміні пароля:', error.message);
            setError('Сталася помилка при зміні пароля');
            setSuccess('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleResetPassword();
        }
    };

    return (
        <div className="reset-page">
            <div className="logo">
                <Frame className="frameIcon" />
                <div className="logoText">MindCare</div>
            </div>

            <div className="reset-container">
                <div className="header">
                    <h2>Відновлення паролю</h2>
                    <p>Введіть свій email та новий пароль</p>
                </div>

                <div className="input-container">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                </div>

                <div className="input-container">
                    <input
                        type="password"
                        placeholder="Новий пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                </div>

                <button className="login-button" onClick={handleResetPassword}>
                    Зберегти
                </button>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
            </div>

            <div className="pattern"></div>
        </div>
    );
};

export default ResetPasswordPage;