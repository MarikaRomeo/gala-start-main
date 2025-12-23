import { createPage, formatDateTime, getClubs, getEvents, removeEvent, saveBooking, saveEvent } from '../utils/data-service.js';

const CLUB_ID = 't3ch';

const styles = [
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap',
  '/css/pages/techno.css',
];

const defaultClubCopy = {
  name: 'Techno @ Gala Emporium',
  description: 'Välkommen till Techno-klubben!',
};

function getArtistClass(eventName) {
  const name = (eventName ?? '').toLowerCase();
  if (name.includes('bunt')) return 'artist-bunt';
  if (name.includes('fred again')) return 'artist-fred';
  if (name.includes('daft punk')) return 'artist-daft';
  return 'artist-default';
}

function buildEventCard(event, isAdminView) {
  const imagePath = event.image ?? '../images/default-techno-picture.jpg';
  const dateFormatted = formatDateTime(event.date);
  const actionButton = isAdminView
    ? `<button class="delete-event-btn" data-delete-event="${event.id}">Ta bort event</button>`
    : `<button class="book-ticket-btn" data-book-techno="${event.id}" data-event-name="${event.name}">Boka Biljett</button>`;

  return `
    <article class="event ${getArtistClass(event.name)}">
      <h3>${event.name}</h3>
      <img src="${imagePath}" alt="Bild pa eventet" class="event-image">
      <time>${dateFormatted}</time>
      <div class="eventImageDescriptionContainer">
        <p class="eventImageDescription">${event.description ?? ''}</p>
        ${actionButton}
      </div>
    </article>
  `;
}

function buildAdminForm() {
  return `
    <div class="technoEventCreationForm">
      <h1>Skapa event</h1>
      <form id="addEventForm">
        <label for="name">Eventnamn: </label><br>
        <input type="text" id="name" name="name" required><br>
        <label for="date">Datum for eventet: </label><br>
        <input type="datetime-local" id="date" name="date" required><br>
        <label for="description">Eventbeskrivning: </label><br>
        <input type="text" id="description" name="description"><br>
        <input type="submit" value="Skapa" id="skapaEventKnapp">
      </form>
    </div>
  `;
}

async function buildEventsHtml(isAdminView) {
  const events = await getEvents(CLUB_ID);
  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const cards = sorted.map((event) => buildEventCard(event, isAdminView)).join('');
  return `${cards}${isAdminView ? buildAdminForm() : ''}`;
}

function generateBookingNumber() {
  const prefix = 'TECH';
  const timestamp = Date.now().toString().slice(-6);
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${randomNum}`;
}

async function bookTicket(eventId, eventName) {
  const bookingNumber = generateBookingNumber();
  const bookingDate = new Date().toISOString();
  const booking = {
    id: bookingNumber,
    eventId,
    eventName,
    clubId: CLUB_ID,
    bookingNumber,
    bookingDate,
    status: 'confirmed',
  };
  await saveBooking(booking);
  alert(` Biljett bokad for "${eventName}"!\n\n` +
    ` Bokningsnummer: ${bookingNumber}\n\n` +
    `Spara ditt bokningsnummer for framtida referens.\n` +
    `Vi ses pa eventet!`);
}

async function handleCreateEvent(form) {
  const formData = new FormData(form);
  const newEvent = { clubId: CLUB_ID };
  formData.forEach((value, key) => {
    newEvent[key] = value;
  });
  await saveEvent(newEvent);
}

export default createPage({
  id: 'techno',
  label: 'Techno',
  navLabel: 'Techno',
  styles,
  bodyClass: 'club-techcno page-full',
  render: async () => {
    const [clubs, eventsHtml] = await Promise.all([
      getClubs(),
      buildEventsHtml(false),
    ]);
    const club = clubs.find((entry) => entry.id === CLUB_ID);

    return `
      <section class="techno-page">
        <div class="card">
          <button class="back-to-main-btn" data-techno-home>
            << Tillbaka till huvudsidan
          </button>
          <button class="admin-btn" id="actionButton">Admin</button>
          <h1>${club?.name ?? defaultClubCopy.name}</h1>
          <p>${club?.description ?? defaultClubCopy.description}</p>
          <h2>Kommande evenemang</h2>
          <div class="eventContent">${eventsHtml}</div>
        </div>
      </section>
    `;
  },
  bind: (container) => {
    let isAdminView = false;
    const eventContent = container.querySelector('.eventContent');
    const adminButton = container.querySelector('#actionButton');
    const backButton = container.querySelector('[data-techno-home]');

    const refreshEvents = async () => {
      if (!eventContent) {
        return;
      }
      const html = await buildEventsHtml(isAdminView);
      eventContent.innerHTML = html;
      attachEventActions();
    };

    const attachEventActions = () => {
      eventContent?.querySelectorAll('[data-book-techno]').forEach((button) => {
        button.addEventListener('click', async () => {
          const eventId = button.dataset.bookTechno;
          const eventName = button.dataset.eventName ?? 'Techno event';
          try {
            await bookTicket(eventId, eventName);
          } catch (error) {
            console.error('Kunde inte boka biljetten', error);
            alert('Kunde inte boka biljetten just nu.');
          }
        });
      });

      eventContent?.querySelectorAll('[data-delete-event]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await removeEvent(button.dataset.deleteEvent);
            await refreshEvents();
          } catch (error) {
            console.error('Kunde inte ta bort event', error);
            alert('Kunde inte ta bort eventet just nu.');
          }
        });
      });

      const form = container.querySelector('#addEventForm');
      if (form) {
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          try {
            await handleCreateEvent(form);
            form.reset();
            await refreshEvents();
          } catch (error) {
            console.error('Kunde inte skapa event', error);
            alert('Kunde inte skapa event just nu.');
          }
        });
      }
    };

    adminButton?.addEventListener('click', async () => {
      isAdminView = !isAdminView;
      adminButton.textContent = isAdminView ? 'Logout' : 'Admin';
      await refreshEvents();
    });

    backButton?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    refreshEvents();
  },
});
