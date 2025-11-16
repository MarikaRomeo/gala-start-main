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

// Normal eventvisning för techno
async function technoEvents(clubId) {
  const events = await getData('events');
  const clubEvents = events.filter(e => e.clubId === clubId);

  return `
    ${clubEvents
      .toSorted((a, b) => a.date > b.date ? 1 : -1)
      .map(({ date, name, description, image, id }) => {
        const imagepath = image ?? "../images/default-techno-picture.jpg";
        const dateFormatted = formatDate(date);

        return `
        <article class="event ${getArtistClass(name)}">
          <h3>${name}</h3>
          <img src="${imagepath}" alt="Bild på eventet" class="event-image">
          <time>${dateFormatted}</time>
          <div class="eventImageDescriptionContainer">
            <p class="eventImageDescription">${description}</p>
            <button class="book-ticket-btn" onclick="bookTicket('${id}', '${name}')">
              Boka Biljett
            </button>
          </div>
        </article>
      `;
      })
      .join('')
    }
  `;
}

// Admin eventvisning för techno
async function adminTechnoEvents(clubId) {
  const events = await getData('events');
  const clubEvents = events.filter(e => e.clubId === clubId);

  return `
    ${clubEvents
      .toSorted((a, b) => a.date > b.date ? 1 : -1)
      .map(({ date, name, description, image, id }) => {
        const imagepath = image ?? "../images/default-techno-picture.jpg";
        const dateFormatted = formatDate(date);

        return `
        <article class="event ${getArtistClass(name)}">
          <h3>${name}</h3>
          <img src="${imagepath}" alt="Bild på eventet" class="event-image">
          <time>${dateFormatted}</time>
          <div class="eventImageDescriptionContainer">
            <p class="eventImageDescription">${description}</p>
            <button class="delete-event-btn" onclick="deleteEvent('${id}')">
              Ta bort event
            </button>
          </div>
        </article>
      `;
      })
      .join('')
    }
    <div class="technoEventCreationForm">
    <h1>Skapa event</h1>
    <form id="addEventForm" onsubmit="addEvent(); return false;">
      <label for="name">Eventnamn: </label><br>
      <input type="text" id="name" name="name"><br>
      <label for="date">Datum för eventet: </label><br>
      <input type="datetime-local" id="date" name="date"><br>
      <label for="description">Eventbeskrivning: </label><br>
      <input type="text" id="description" name="description"><br>
      <input type="submit" value="Skapa" id="skapaEventKnapp">
    </form>
    </div>
  `;
}

async function addEvent() {
  const url = 'http://localhost:3000/events';
  const clubId = "t3ch";

  // Skapa ett FormData objekt utifrån elementet
  const form = document.getElementById("addEventForm");
  const formData = new FormData(form);

  // Debug log
  console.log(`Lägger till ${formData.entries()}..`);

  // Skapa ett objekt utifrån key-values i FormData objektet och gör om till json-string
  const newEvent = { clubId: clubId };
  formData.forEach((value, key) => newEvent[key] = value);
  const postBody = JSON.stringify(newEvent);

  // Skicka POST-request till json-server url:en
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: postBody
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    populateEventContent(isAdminView);
  } catch (error) {
    console.error(error.message);
  }
}

async function deleteEvent(eventId) {
  const shouldDelete = confirm("Är du säker på att du vill ta bort detta event?");
  if (!shouldDelete) return;
  console.log(`Deleting event ${eventId}`);
  const url = `http://localhost:3000/events/${eventId}`;
  try {
    const response = await fetch(url, { method: "Delete" });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    populateEventContent(isAdminView);
  } catch (error) {
    console.error(error.message);
  }
}

async function populateEventContent(isAdminView) {
  const element = document.querySelector(".eventContent");
  try {
    let events;
    if (isAdminView) {
      events = await adminTechnoEvents("t3ch");
    } else {
      events = await technoEvents("t3ch");
    }
    if (events) {
      element.innerHTML = events;
    }
  } catch {
    element.innerHTML = `<p>Någonting gick fel!</p>`;
  }
}

//här visas datan på sidan club techno
async function showTechno() {
  const clubs = await getData('clubs');
  const club = clubs.find(c => c.id === 't3ch');
  document.body.className = 'club-techcno';

  //här skapas knappen för back till main samt admin-knapp
  const html = `
    <div class="card">
      <button class="back-to-main-btn" onclick="goToMainPage()">
        ← Tillbaka till huvudsidan
      </button>
      
      <button class="admin-btn" id="actionButton">Admin</button>
      
      <h1>${club.name}</h1>
      <p>${club.description}</p>

      <h2>Kommande evenemang</h2>
      <div class="eventContent">
        <!-- Events kommer att laddas här -->
      </div>
    </div>
  `;
  document.getElementById('app').innerHTML = html;

  // Ladda initial content
  await populateEventContent(isAdminView);
}

// Funktion för att generera unikt bokningsnummer
function generateBookingNumber() {
  const prefix = 'TECH';
  const timestamp = Date.now().toString().slice(-6);
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${randomNum}`;
}

// Funktion för att boka biljetter
async function bookTicket(eventId, eventName) {
  const bookingNumber = generateBookingNumber();
  const bookingDate = new Date().toISOString();

  // Skapa bokningsobjekt
  const booking = {
    id: bookingNumber,
    eventId: eventId,
    eventName: eventName,
    clubId: "t3ch",
    bookingNumber: bookingNumber,
    bookingDate: bookingDate,
    status: "confirmed"
  };

  try {
    // Spara bokningen till JSON servern
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Bokning sparad:', result);

    // Visa bekräftelse till användaren
    alert(` Biljett bokad för "${eventName}"!\n\n` +
      ` Bokningsnummer: ${bookingNumber}\n\n` +
      `Spara ditt bokningsnummer för framtida referens.\n` +
      `Vi ses på eventet!`);

    console.log(`Biljett bokad - Event: ${eventName}, Event ID: ${eventId}, Bokningsnummer: ${bookingNumber}`);

  } catch (error) {
    console.error('Fel vid sparande av bokning:', error.message);

    // Visa felmeddelande men låt användaren veta att bokningen kanske ändå fungerade
    alert(`Ett fel uppstod vid sparande av bokningen.\n\n` +
      `Bokningsnummer: ${bookingNumber}\n\n` +
      `Kontakta kundservice om du behöver hjälp.`);
  }
}

// Funktion för att gå tillbaka till huvudsidan
function goToMainPage() {
  window.location.href = 'index.html';
}

let isAdminView = false;

document.addEventListener('DOMContentLoaded', () => {
  // Vänta lite för att säkerställa att showTechno har körts först
  setTimeout(() => {
    const actionButton = document.getElementById('actionButton');
    if (actionButton) {
      actionButton.addEventListener('click', async () => {
        isAdminView = !isAdminView;
        await populateEventContent(isAdminView);
        actionButton.textContent = isAdminView ? 'Logout' : 'Admin';
      });
    }
  }, 100);
});

window.addEventListener('load', showTechno);