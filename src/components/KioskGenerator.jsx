import React, { useState } from 'react';
import Button from './Button';

const KioskGenerator = ({ onGenerateKioskSchedule, onBack }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [people, setPeople] = useState(['']);

  const handlePersonNameChange = (e, index) => {
    const newPeople = [...people];
    newPeople[index] = e.target.value;

    if (index === newPeople.length - 1 && e.target.value.trim() !== '') {
      newPeople.push('');
    }

    setPeople(newPeople);
  };

  const handleGenerateClick = () => {
    onGenerateKioskSchedule({ startTime, endTime, people });
  };

  return (
    <div>
      <h3>Skapa kioskschema</h3>
      <div className="input-group centered-input">
        <label htmlFor="startTime">Starttid:</label>
        <input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div className="input-group centered-input">
        <label htmlFor="endTime">Sluttid:</label>
        <input
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <h4>Personer</h4>
      <div className="team-names-grid-container">
        <div className="team-names-grid">
          {people.map((person, index) => (
            <div key={index} className="team-input-group">
              <label>Person {index + 1}:</label>
              <input
                type="text"
                value={person}
                onChange={(e) => handlePersonNameChange(e, index)}
                placeholder="Namn"
              />
            </div>
          ))}
        </div>
      </div>
      
      <Button onClick={handleGenerateClick}>Generera schema</Button>
      <Button onClick={onBack} className="back-button">
        Tillbaka
      </Button>
    </div>
  );
};

export default KioskGenerator;