import React from 'react';
import Button from './Button';

const StartView = ({ onSelectView }) => {
  return (
    <div className="start-view">
      <h2>Välkommen!</h2>
      <p>Välj vilken funktion du vill använda</p>
      <div className="button-container">
        <Button onClick={() => onSelectView('generate-teams')}>
          Generera slumpade lag
        </Button>
        <Button onClick={() => onSelectView('generate-schedule')}>
          Generera spelschema
        </Button>
        <Button onClick={() => onSelectView('generate-kiosk')}>
            Generera kioskschema
        </Button>
      </div>
    </div>
  );
};

export default StartView;