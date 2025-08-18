import React from 'react';
import Button from './Button';

const ScheduleGenerator = ({
  numTeams,
  teamNames,
  handleNumTeamsChange,
  handleTeamNameChange,
  onGenerateSchedule,
  onBack, // NY PROP
}) => {
  return (
    <div>
      <h3>Ange egna lag</h3>
      <div className="input-group centered-input">
        <label htmlFor="numTeams">Antal lag:</label>
        <input
          id="numTeams"
          type="number"
          value={numTeams}
          onChange={handleNumTeamsChange}
          min="2"
        />
      </div>

      {numTeams > 0 && teamNames.length > 0 && (
        <>
          <div className="team-names-grid-container">
            <div className="team-names-grid">
              {teamNames.map((name, index) => (
                <div key={index} className="team-input-group">
                  <label>Lag {index + 1}:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleTeamNameChange(e, index)}
                    placeholder="T.ex. VSK Fotboll"
                  />
                </div>
              ))}
            </div>
          </div>
          <Button onClick={onGenerateSchedule}>
            Generera spelschema
          </Button>
        </>
      )}
      {/* NY TILLBAKAKNAPP */}
      <Button onClick={onBack} className="back-button">
        Tillbaka
      </Button>
    </div>
  );
};

export default ScheduleGenerator;