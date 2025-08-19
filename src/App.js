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
  }) => {
    setError('');
    setSchedule(null);
    setGeneratedTeams([]);

    const teams = teamNames.filter((name) => name.trim() !== '');
    if (teams.length < 2) {
      setError('Minst två lag måste anges.');
      return;
    }

    if (useMatchTimes) {
      if (!firstMatchTime) {
        setError('Starttid måste anges.');
        return;
      }
      if (pauseDuration === '' || isNaN(pauseDuration) || pauseDuration < 0) {
        setError('Paustid måste anges och vara ett positivt nummer.');
        return;
      }
    }

    let simulatedSchedule = generateSimulatedSchedule(teams);

    if (useMatchTimes) {
      const totalDuration = 20 + pauseDuration; // Matchtid (20 min) + paus
      let currentTime = new Date(`1970-01-01T${firstMatchTime}`);
      
      const allMatches = simulatedSchedule.flat();
      const shuffledMatches = [...allMatches].sort(() => 0.5 - Math.random());
      
      let newSchedule = [];
      let currentRound = [];
      
      shuffledMatches.forEach((match, index) => {
        const matchStart = new Date(currentTime);
        const matchEnd = new Date(currentTime.getTime() + 20 * 60000); // 20 min match

        const matchStartTimeFormatted = matchStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const matchEndTimeFormatted = matchEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        currentRound.push({
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          time: `${matchStartTimeFormatted} - ${matchEndTimeFormatted}`
        });

        currentTime = new Date(currentTime.getTime() + totalDuration * 60000);

        // Skapar en ny omgång när rundan är full eller när alla matcher har schemalagts
        if (currentRound.length === teams.length / 2 || index === shuffledMatches.length - 1) {
          newSchedule.push(currentRound);
          currentRound = [];
        }
      });
      setSchedule(newSchedule);
    } else {
      setSchedule(simulatedSchedule);
    }
  };

  const handleGenerateTeams = () => {
    setError('');
    setSchedule(null);
    setGeneratedTeams([]);
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
    setSchedule(null);
  };

  const handleGenerateKioskSchedule = ({ startTime, endTime, people }) => {
    setError('');
    setKioskSchedule(null);
    setGeneratedTeams([]);
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
        person: person
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

  const generateSimulatedSchedule = (teams) => {
    let tempTeams = [...teams];
    const rounds = [];
    if (tempTeams.length % 2 !== 0) {
      tempTeams.push(null);
    }
    const numRounds = tempTeams.length - 1;
    const half = tempTeams.length / 2;
    for (let round = 0; round < numRounds; round++) {
      const currentRound = [];
      for (let i = 0; i < half; i++) {
        const homeTeam = tempTeams[i];
        const awayTeam = tempTeams[tempTeams.length - 1 - i];
        if (homeTeam && awayTeam) {
          currentRound.push({ homeTeam: homeTeam, awayTeam: awayTeam });
        }
      }
      rounds.push(currentRound);
      const last = tempTeams.pop();
      tempTeams.splice(1, 0, last);
    }
    return rounds;
  };
  
  const handleSaveSchedulePdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(22);
    doc.text('Spelschema', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    doc.setFontSize(12);
    schedule.forEach((round, index) => {
      if (yPos > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(16);
      doc.text(`Omgång ${index + 1}`, margin, yPos);
      yPos += 10;
      doc.setFontSize(12);
      round.forEach(match => {
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`${match.homeTeam} vs ${match.awayTeam} ${match.time ? `(${match.time})` : ''}`, margin + 5, yPos);
        yPos += 10;
      });
      yPos += 5;
    });
    doc.save('spelschema.pdf');
  };

  const handleSaveRosterPdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(22);
    doc.text('Laguppdelning', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    doc.setFontSize(14);
    generatedTeams.forEach((team, index) => {
      if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(16);
      doc.text(`Lag ${index + 1}`, margin, yPos);
      yPos += 10;
      doc.setFontSize(12);
      team.forEach(player => {
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`- ${player}`, margin + 5, yPos);
        yPos += 7;
      });
      yPos += 5;
    });
    doc.save('lagindelning.pdf');
  };

  const handleSaveKioskPdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(22);
    doc.text('Kioskschema', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    doc.setFontSize(14);
    kioskSchedule.forEach((shift, index) => {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`${shift.person} | ${shift.time}`, margin, yPos);
      yPos += 10;
    });
    doc.save('kioskschema.pdf');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Poolspelsverktyget</h1>
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
                      <span className="team-name">{shift.person}</span>
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