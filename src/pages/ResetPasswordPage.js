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
        if (email && password) {
            try {
                const { data: user, error: fetchError } = await supabase
                    .from('patients')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (fetchError) {
                    throw fetchError;
                }

                if (user) {
                    const { error: updateError } = await supabase
                        .from('patients')
                        .update({ pat_password: password })
                        .eq('email', email);

                    if (updateError) {
                        throw updateError;
                    }

                    setSuccess('Пароль успішно змінено!');
                    setError('');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError('Користувача з таким email не знайдено');
                }
            } catch (error) {
                console.error('Помилка при зміні пароля: ', error.message);
                setError('Сталася помилка при зміні пароля');
                setSuccess('');
            }
        } else {
            setError('Будь ласка, введіть email та новий пароль');
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
                <Frame className="frameIcon"/>
                <div className="logoText">MindCare Students</div>
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
