import React, { useState } from 'react';
import Button from './Button';

const ScheduleGenerator = ({
	numTeams,
	teamNames,
	handleNumTeamsChange,
	handleTeamNameChange,
	onGenerateSchedule,
	onBack,
}) => {
	const [useMatchTimes, setUseMatchTimes] = useState(false);
	const [firstMatchTime, setFirstMatchTime] = useState('');
	const [pauseDuration, setPauseDuration] = useState('');
	const [matchDuration, setMatchDuration] = useState('');

	const handleGenerateClick = () => {
		onGenerateSchedule({
			numTeams: parseInt(numTeams),
			teamNames: teamNames,
			useMatchTimes,
			firstMatchTime,
			pauseDuration: parseInt(pauseDuration),
			matchDuration: parseInt(matchDuration),
		});
	};

	return (
		<div>
			<h3>Generera spelschema</h3>
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

			<div className="team-names-grid-container">
				<div className="team-names-grid">
					{teamNames.map((teamName, index) => (
						<div key={index} className="team-input-group">
							<label htmlFor={`team${index + 1}`}>Lag {index + 1}:</label>
							<input
								id={`team${index + 1}`}
								type="text"
								value={teamName}
								onChange={(e) => handleTeamNameChange(e, index)}
							/>
						</div>
					))}
				</div>
			</div>

			<div className="schedule-options">
				<label>
					<input
						type="checkbox"
						checked={useMatchTimes}
						onChange={(e) => setUseMatchTimes(e.target.checked)}
					/>
					Lägg till speltider
				</label>
			</div>

			{useMatchTimes && (
				<div className="schedule-time-inputs">
					<div className="input-group">
						<label htmlFor="firstMatchTime">Starttid för första match:</label>
						<input
							id="firstMatchTime"
							type="time"
							value={firstMatchTime}
							onChange={(e) => setFirstMatchTime(e.target.value)}
						/>
					</div>
					<div className="input-group">
						<label htmlFor="matchDuration">Matchlängd (min):</label>
						<input
							id="matchDuration"
							type="number"
							value={matchDuration}
							onChange={(e) => setMatchDuration(e.target.value)}
							min="0"
						/>
					</div>
					<div className="input-group">
						<label htmlFor="pauseDuration">Paus mellan matcher (min):</label>
						<input
							id="pauseDuration"
							type="number"
							value={pauseDuration}
							onChange={(e) => setPauseDuration(e.target.value)}
							min="0"
						/>
					</div>
				</div>
			)}

			<div className="button-container">
				<Button onClick={handleGenerateClick}>Generera schema</Button>
				<Button onClick={onBack} className="back-button">
					Tillbaka
				</Button>
			</div>
		</div>
	);
};

export default ScheduleGenerator;
