import React from 'react';
import {Link} from 'react-router-dom';
import "../styles/therapist-card.css";

const TherapistCard = ({name, experience, location, specialties, professions, photo, doctor_id}) => {
    const hasMoreSpecialties = specialties.length > 3;
    const displayedSpecialties = hasMoreSpecialties ? specialties.slice(0, 3) : specialties;
    const remainingCount = specialties.length - 3;

    return (
        <div className="card-therapist">
            <div className="profile-image">
                {photo ? (
                    <img src={photo} alt={name} className="profile-photo"/>
                ) : (
                    <div className="placeholder-image"></div>
                )}
            </div>
            <h2 className="name">{name}</h2>
            <div className="info-professions">
                <div className="details-container">
                    <p className="details">{experience} досвіду</p>
                    <p className="details">{location}</p>
                </div>
                <div className="professions">
                    {professions.map((profession, index) => (
                        <span key={index} className="profession">{profession}</span>
                    ))}
                </div>
            </div>
            <span id="spanID">З чим працюю:</span>
            <div className="specialties">
                {displayedSpecialties.map((specialty, index) => (
                    <span key={index} className="specialty">{specialty}</span>
                ))}
                {hasMoreSpecialties && <span className="specialty more-specialties">+{remainingCount}</span>}
            </div>
            <Link to={`/all-therapists/${doctor_id}`} className="more-button">
                Дізнатися більше
            </Link>
        </div>
    );
};

export default TherapistCard;
