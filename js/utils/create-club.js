//Potentiella förbättringar: 
//- Filnamn, navnamn och liknande är kvar från den gamla funktionen (dvs, namnen stämmer inte överens med vad som görs)
//- ingen av formulär inputs är obligatoriska, vilket leder till att du kan spamma tomma events eller glömma skriva in datum osv.
//- Ingen check att clubbID stämmer överens med någon existerande klubb
//- 

export default async function createEvent(clubID) {
  const clubIDNameDict = {
  "5cc6": "Country Music",
  "t3ch": "Techno",
  "gr01": "Greek Club",
  "f8ed": "Riktiga Rockare",
  "it01": "Radio Italia"
  } 

  if(clubID in clubIDNameDict){ //om clubID finns I clubIDNameDict, returera true. Älskar JS hjälpfunktioner
    const clubName = clubIDNameDict[clubID]
    clubID = clubName;
  }

  return `
    <h2>Skapa event</h2>
    <form id="create-event">
      <p>Skapa event för ${clubID}</p>
      <input name="eventName"   placeholder="Eventnamn" required>
      <!--<input name="clubID"      placeholder="KlubbID: XXXX">-->
      <input name="eventDate"   placeholder="När är eventet?" type="date" required>

      <textarea name="eventDescription" placeholder="Beskrivning av eventet" required></textarea>

      <input type="submit" value="Skapa"> 
    </form>
  `;
}

// Listar klubbar för html element (får se om det används, hade varit bäst att visa klubbarna i en drop down meny)
async function listClubs() {
  const clubsInDB = await (await fetch('http://localhost:3000/clubs', { method: 'GET' })).json();
  //const clubsData = await clubsInDB.json();
  const simplified = clubsInDB.map(({ id, name }) => { id: clubID; name: clubName })
}

async function submitForm(event) {
  const target = event.target;
  // easy way to read values from forms - no querySelector needed!
  const name = target.eventName.value;
  const description = target.eventDescription.value;
  const date = target.eventDate.value;
  const clubID = target.clubID.value;
  await fetch('http://localhost:3000/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, name, description, clubID }) // stringify = serialize
  });
  window.location.replace('/html/index.html');
}

// add event listener
document.body.addEventListener('submit', async event => {
  if (!event.target.closest('#create-event')) { return; }
  event.preventDefault();
  await submitForm(event);
});