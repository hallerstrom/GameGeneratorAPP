import React, { useState } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';
import StartView from './components/StartView';
import TeamGenerator from './components/TeamGenerator';
import ScheduleGenerator from './components/ScheduleGenerator';
import KioskGenerator from './components/KioskGenerator';
import Button from './components/Button';

function App() {
  const [view, setView] = useState('start');
  const [numTeams, setNumTeams] = useState('');
  const [teamNames, setTeamNames] = useState([]);
  const [players, setPlayers] = useState(['']);
  const [schedule, setSchedule] = useState(null);
  const [kioskSchedule, setKioskSchedule] = useState(null);
  const [error, setError] = useState('');
  const [generatedTeams, setGeneratedTeams] = useState([]);

  const handleSetView = (newView) => {
    setView(newView);
    setPlayers(['']);
    setNumTeams('');
    setTeamNames([]);
    setSchedule(null);
    setKioskSchedule(null);
    setGeneratedTeams([]);
    setError('');
  };

  const handleNumTeamsChange = (e) => {
    const count = parseInt(e.target.value);
    setNumTeams(e.target.value);
    if (!isNaN(count) && count > 0) {
      setTeamNames(new Array(count).fill(''));
    } else {
      setTeamNames([]);
    }
  };

  const handleTeamNameChange = (e, index) => {
    const newTeamNames = [...teamNames];
    newTeamNames[index] = e.target.value;
    setTeamNames(newTeamNames);
  };

const handleGenerateSchedule = ({
  numTeams,
  teamNames,
  useMatchTimes,
  firstMatchTime,
  pauseDuration,
  matchDuration,
}) => {
  setError('');
  setSchedule(null);
  setGeneratedTeams([]);

  // Filtrera bort tomma lag
  const teams = teamNames.filter(name => name.trim() !== '');
  if (teams.length < 2) {
    setError('Minst två lag måste anges.');
    return;
  }

  let pause = 0;
  let match = 0;

  if (useMatchTimes) {
    if (!firstMatchTime) {
      setError('Starttid måste anges.');
      return;
    }

    // Konvertera till nummer
    pause = Number(pauseDuration);
    match = Number(matchDuration);

    if (isNaN(pause) || pause < 0 || isNaN(match) || match < 0) {
      setError('Match- och paustid måste anges och vara positiva nummer.');
      return;
    }
  }

  // Skapa schemat
  let tempTeams = [...teams];
  const rounds = [];
  if (tempTeams.length % 2 !== 0) tempTeams.push(null);
  const numRounds = tempTeams.length - 1;
  const half = tempTeams.length / 2;

  for (let round = 0; round < numRounds; round++) {
    const currentRound = [];
    for (let i = 0; i < half; i++) {
      const homeTeam = tempTeams[i];
      const awayTeam = tempTeams[tempTeams.length - 1 - i];
      if (homeTeam && awayTeam) {
        currentRound.push({ homeTeam, awayTeam });
      }
    }
    rounds.push(currentRound);

    const last = tempTeams.pop();
    tempTeams.splice(1, 0, last);
  }

  // Lägg till tider om behövs
  if (useMatchTimes) {
    let currentTime = new Date(`1970-01-01T${firstMatchTime}`);

    rounds.forEach(round => {
      round.forEach(matchObj => {
        const matchStart = new Date(currentTime);
        const matchEnd = new Date(currentTime.getTime() + match * 60000);

        matchObj.time = `${matchStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${matchEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        currentTime = new Date(matchEnd.getTime() + pause * 60000);
      });
    });
  }

  setGeneratedTeams(teams);
  setSchedule(rounds);
};


  const handleGenerateTeams = ({ numTeams, players }) => {
    setError('');
    setSchedule(null);
    setGeneratedTeams([]);
    // FIX: players kommer nu som en prop och kan användas direkt
    const playersArray = players.filter((p) => p.trim() !== '');
    const numTeamsToCreate = parseInt(numTeams);

    if (isNaN(numTeamsToCreate) || numTeamsToCreate <= 0) {
      setError('Ange ett giltigt antal lag.');
      return;
    }

    if (playersArray.length < numTeamsToCreate) {
      setError('Inte tillräckligt med spelare för att skapa så många lag.');
      return;
    }

    const shuffledPlayers = [...playersArray].sort(() => 0.5 - Math.random());
    const newTeams = Array.from({ length: numTeamsToCreate }, () => []);
    let teamIndex = 0;
    shuffledPlayers.forEach((player) => {
      newTeams[teamIndex].push(player);
      teamIndex = (teamIndex + 1) % numTeamsToCreate;
    });

    setGeneratedTeams(newTeams);
  };

  const handleGenerateKioskSchedule = ({ startTime, endTime, people }) => {
    setError('');
    setKioskSchedule(null);
    const cleanedPeople = people.filter((p) => p.trim() !== '');

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    if (start >= end) {
      setError('Sluttiden måste vara efter starttiden.');
      return;
    }
    if (cleanedPeople.length === 0) {
      setError('Minst en person måste anges.');
      return;
    }
    
    const totalMinutes = (end - start) / 1000 / 60;
    const shiftDuration = Math.floor(totalMinutes / cleanedPeople.length);

    if (shiftDuration === 0) {
        setError('Tidsintervallet är för kort för att delas upp på så många personer.');
        return;
    }

    const shuffledPeople = [...cleanedPeople].sort(() => 0.5 - Math.random());
    
    const newSchedule = [];
    let currentTime = new Date(start);

    for (let i = 0; i < shuffledPeople.length; i++) {
      const shiftStart = new Date(currentTime);
      const shiftEnd = new Date(currentTime.getTime() + shiftDuration * 60000);
      const person = shuffledPeople[i];

      const formattedStartTime = shiftStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedEndTime = shiftEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      newSchedule.push({
        time: `${formattedStartTime} - ${formattedEndTime}`,
        people: [person] 
      });

      currentTime = shiftEnd;
    }
    
    const remainingMinutes = totalMinutes % cleanedPeople.length;
    if (remainingMinutes > 0 && newSchedule.length > 0) {
      const lastShift = newSchedule[newSchedule.length - 1];
      const lastShiftEnd = new Date(new Date(`1970-01-01T${lastShift.time.split(' - ')[1]}`).getTime() + remainingMinutes * 60000);
      lastShift.time = `${lastShift.time.split(' - ')[0]} - ${lastShiftEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    setKioskSchedule(newSchedule);
  };

  const handleSaveSchedulePdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#34495e'); 
    doc.text('Spelschema', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);
    
    schedule.forEach((round, index) => {
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPos = margin;
        }
        
        doc.setFillColor('#ecf0f1'); 
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor('#34c234'); 
        doc.text(`Omgång ${index + 1}`, margin + 5, yPos + 6);
        yPos += 12;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#333'); 
        
        round.forEach(match => {
            if (yPos > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPos = margin;
            }
            
            const matchText = `${match.homeTeam} vs ${match.awayTeam}`;
            const timeText = match.time ? `(${match.time})` : '';
            
            doc.text(matchText, margin + 5, yPos);
            doc.text(timeText, pageWidth - margin - 5, yPos, { align: 'right' });
            yPos += 8;
        });
        yPos += 10;
    });

    doc.save('spelschema.pdf');
  };

  const handleSaveRosterPdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#34495e');
    doc.text('Laguppdelning', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);

    generatedTeams.forEach((roster, index) => {
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFillColor('#ecf0f1'); 
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor('#34c234'); 
        doc.text(`Lag ${index + 1}`, margin + 5, yPos + 6);
        yPos += 12;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#333'); 
        
        roster.forEach(player => {
            if (yPos > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(`- ${player}`, margin + 5, yPos);
            yPos += 8;
        });
        yPos += 10;
    });

    doc.save('laguppdelning.pdf');
  };

  const handleSaveKioskPdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#34495e'); 
    doc.text('Kioskschema', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(14);

    kioskSchedule.forEach((period, index) => {
        if (yPos > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFillColor('#ecf0f1'); 
        doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor('#34c234'); 
        doc.text(`Pass ${index + 1}`, margin + 5, yPos + 6);
        yPos += 12;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#333');

        doc.text(`Tid: ${period.time}`, margin + 5, yPos);
        yPos += 8;
        doc.text(`Personer: ${period.people.join(', ')}`, margin + 5, yPos);
        yPos += 15;
    });

    doc.save('kioskschema.pdf');
  };

  return (
    <div className="app-container">
      <header className="header">
        <img
          src={`${process.env.PUBLIC_URL}/icons/icon-180.png`}
          alt="Poolspelsverktyget"
          className="header-logo"
        />
      </header>
      
      <main className="main-content">
        {view === 'start' && <StartView onSelectView={handleSetView} />}
        {view === 'generate-teams' && (
          <TeamGenerator
            numTeams={numTeams}
            setNumTeams={setNumTeams}
            players={players}
            setPlayers={setPlayers}
            onGenerateTeams={handleGenerateTeams}
            onBack={() => handleSetView('start')}
          />
        )}
        {view === 'generate-schedule' && (
          <ScheduleGenerator
            numTeams={numTeams}
            teamNames={teamNames}
            handleNumTeamsChange={handleNumTeamsChange}
            handleTeamNameChange={handleTeamNameChange}
            onGenerateSchedule={handleGenerateSchedule}
            onBack={() => handleSetView('start')}
          />
        )}
        {view === 'generate-kiosk' && (
          <KioskGenerator
            onGenerateKioskSchedule={handleGenerateKioskSchedule}
            onBack={() => handleSetView('start')}
          />
        )}

        {error && <p className="error-message">{error}</p>}
        
        {generatedTeams.length > 0 && (
          <div className="schedule-section">
            <h2>Laguppdelning</h2>
            <div className="schedule-container">
              {generatedTeams.map((team, index) => (
                <div key={index} className="round-card">
                  <h3>Lag {index + 1}</h3>
                  <ul>
                    {team.map((player, playerIndex) => (
                      <li key={playerIndex}>{player}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Button onClick={handleSaveRosterPdf} className="save-pdf-button">
              Spara lagindelning som PDF
            </Button>
          </div>
        )}

        {schedule && (
          <div className="schedule-section">
            <h2>Spelschema</h2>
            <div className="schedule-container">
              {schedule.map((round, index) => (
                <div key={index} className="round-card">
                  <h3>Omgång {index + 1}</h3>
                  <ul className="match-list">
                    {round.map((match, matchIndex) => (
                      <li key={matchIndex} className="match-item">
                        <span className="team-name">{match.homeTeam}</span>
                        <span className="vs-text">vs</span>
                        <span className="team-name">{match.awayTeam}</span>
                        {match.time && <span className="match-time">({match.time})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Button onClick={handleSaveSchedulePdf} className="save-pdf-button">
              Spara spelschema som PDF
            </Button>
          </div>
        )}

        {kioskSchedule && (
          <div className="schedule-section">
            <h2>Kioskschema</h2>
            <div className="schedule-container">
              <div className="round-card">
                <h3>Schema</h3>
                <ul className="match-list">
                  {kioskSchedule.map((shift, index) => (
                    <li key={index} className="match-item">
                      <span className="team-name">{shift.people.join(', ')}</span>
                      <span className="vs-text"></span>
                      <span className="team-name">{shift.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Button onClick={handleSaveKioskPdf} className="save-pdf-button">
              Spara kioskschema som PDF
            </Button>
          </div>
        )}
      </main>
      
      <footer className="footer">
        <p>Skapad med React, Javascript och CSS</p>
      </footer>
    </div>
  );
}

export default App;