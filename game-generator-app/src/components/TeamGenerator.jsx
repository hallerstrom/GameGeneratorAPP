import React from 'react';
import Button from './Button';

const TeamGenerator = ({
  numTeams,
  setNumTeams,
  players,
  setPlayers,
  onGenerateTeams,
  onBack, // NY PROP
}) => {
  const handlePlayerNameChange = (e, index) => {
    const newPlayers = [...players];
    newPlayers[index] = e.target.value;
    
    if (index === newPlayers.length - 1 && e.target.value.trim() !== '') {
      newPlayers.push('');
    }
    
    setPlayers(newPlayers);
  };

  return (
    <div>
      <h3>Slumpa lag från spelare</h3>
      <div className="input-group centered-input">
        <label htmlFor="numTeams">Antal lag:</label>
        <input
          id="numTeams"
          type="number"
          value={numTeams}
          onChange={(e) => setNumTeams(e.target.value)}
          min="2"
        />
      </div>

      <div className="team-names-grid-container">
        <div className="team-names-grid">
          {players.map((player, index) => (
            <div key={index} className="team-input-group">
              <label>Spelare {index + 1}:</label>
              <input
                type="text"
                value={player}
                onChange={(e) => handlePlayerNameChange(e, index)}
                placeholder="Namn"
              />
            </div>
          ))}
        </div>
      </div>
      
      <Button onClick={onGenerateTeams}>
        Generera lag
      </Button>

      {/* NY TILLBAKAKNAPP */}
      <Button onClick={onBack} className="back-button">
        Tillbaka
      </Button>
    </div>
  );
};

export default TeamGenerator;