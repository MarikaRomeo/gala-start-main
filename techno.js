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

const escapeHTML = str =>
  str.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

  const html = `
    <div class="card">
      <h1>${escapeHTML(club.name)}</h1>
      <p>${escapeHTML(club.description)}</p>
    

      <h2>Kommande evenemang</h2>
    <div class ="events-grid">
      ${clubEvents.map(e => `
        <article class="event ${getArtistClass(e.name)}">
          <h3>${escapeHTML(e.name)}</h3>
          ${e.image ? `<img src="${escapeHTML(e.image)}" alt="${escapeHTML(e.name)}" class="event-image">` : ''}
        <time>${formatDate(e.date)}</time>
        <p>${escapeHTML(e.description)}</p>
        <button class="book-ticket-btn" onclick="bookTicket('${e.id}', '${escapeHTML(e.name)}')">
          🎫 Boka Biljett
        </button>
        </article>
      `).join('')}
      </div>
    </div>
  `;
  document.getElementById('app').innerHTML = html;
}

// Funktion för att boka biljetter
function bookTicket(eventId, eventName) {
  alert(`🎫 Biljett bokad för "${eventName}"!\n\nDin bokning är bekräftad. Vi ses på eventet!`);

  // Här kan du senare lägga till riktigt bokningssystem
  console.log(`Biljett bokad för event ID: ${eventId}, Event: ${eventName}`);
}

window.addEventListener('load', showTechno);