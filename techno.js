const API_URL = 'http://localhost:3000';
const FALLBACK = './json/db.json';

// här försöker koden hämta datan från först servern annars lokalt
async function getData(type) {
  try {
    const res = await fetch(`${API_URL}/${type}`);
    if (!res.ok)
      throw new Error();
    return await res.json();
  } catch {
    const res = await fetch(FALLBACK);
    const json = await res.json();
    return json[type];
  }
}


const formatDate = d => new Date(d).toLocaleString('sv-SE');

// Funktion för att få artist-specifik CSS-klass
function getArtistClass(eventName) {
  const name = eventName.toLowerCase();
  if (name.includes('bunt')) return 'artist-bunt';
  if (name.includes('fred again')) return 'artist-fred';
  if (name.includes('daft punk')) return 'artist-daft';
  return 'artist-default';
}

//här visas datan på sidan club techno
async function showTechno() {
  const clubs = await getData('clubs');
  const events = await getData('events');
  const club = clubs.find(c => c.id === 't3ch');
  const clubEvents = events.filter(e => e.clubId === 't3ch');
  document.body.className = 'club-techcno';

  //här skapas knappen för back till main samt evenemangslistan
  const html = `
    <div class="card">
      <button class="back-to-main-btn" onclick="goToMainPage()">
        ← Tillbaka till huvudsidan
      </button>
      <h1>${club.name}</h1>
      <p>${club.description}</p>


      <h2>Kommande evenemang</h2>
    <div class ="events-grid">
      ${clubEvents.map(e => `
        <article class="event ${getArtistClass(e.name)}">
          <h3>${e.name}</h3>
          ${e.image ? `<img src="${e.image}" alt="${e.name}" class="event-image">` : ''}
        <time>${formatDate(e.date)}</time>
        <p>${e.description}</p>
        <button class="book-ticket-btn" onclick="bookTicket('${e.id}', '${e.name}')">
           Boka Biljett
        </button>
        </article>
      `).join('')}
      </div>
    </div>
  `;
  document.getElementById('app').innerHTML = html;
}

// Funktion för att generera unikt bokningsnummer
function generateBookingNumber() {
  const prefix = 'TECH';
  const timestamp = Date.now().toString().slice(-6); // Senaste 6 siffrorna av timestamp
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${randomNum}`;
}

// Funktion för att boka biljetter
function bookTicket(eventId, eventName) {
  const bookingNumber = generateBookingNumber();

  alert(` Biljett bokad för "${eventName}"!\n\n` +
    ` Bokningsnummer: ${bookingNumber}\n\n` +
    `Spara ditt bokningsnummer för framtida referens.\n` +
    `Vi ses på eventet!`);

  console.log(`Biljett bokad - Event: ${eventName}, Event ID: ${eventId}, Bokningsnummer: ${bookingNumber}`);
}

// Funktion för att gå tillbaka till huvudsidan
function goToMainPage() {
  window.location.href = 'index.html';
}

window.addEventListener('load', showTechno);