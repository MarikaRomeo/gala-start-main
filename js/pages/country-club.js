import { createPage, formatDateTime, getEvents, removeEvent, saveEvent } from '../utils/data-service.js';

const CLUB_ID = '5cc6';
const DEFAULT_IMAGE = '../images/default-country-picture.jpg';

const styles = ['/css/pages/country-club.css'];

function generateCountryBookingNumber() {
  const prefix = 'Country';
  const timestamp = Date.now().toString().slice(-6);
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${randomNum}`;
}

function buildEventCard(event, isAdminView) {
  const imagePath = event.image ?? DEFAULT_IMAGE;
  const dateFormatted = formatDateTime(event.date);
  const actionButton = isAdminView
    ? `<button class="delete-event-btn" data-delete-event="${event.id}">Ta bort event</button>`
    : `<button class="book-country-ticket-btn" data-book-country="${event.name}">Boka Biljett</button>`;

  return `
    <article class="event">
      <h3>${event.name} <br></h3>
      <img src="${imagePath}" alt="Bild pa eventet" class="event-image">
      <h3>${dateFormatted}</h3>
      <div class="eventImageDescriptionContainer">
        <p class="eventImageDescription">${event.description ?? ''}</p>
        ${actionButton}
      </div>
    </article>
  `;
}

function buildAdminForm() {
  return `
    <div class="countryEventCreationForm">
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
  const eventCards = sorted.map((event) => buildEventCard(event, isAdminView)).join('');
  return `${eventCards}${isAdminView ? buildAdminForm() : ''}`;
}

function bookCountryTicket(eventName) {
  const bookingNumber = generateCountryBookingNumber();
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

async function handleDeleteEvent(eventId) {
  const shouldDelete = confirm('Ar du saker pa att du vill ta bort detta event?');
  if (!shouldDelete) {
    return;
  }
  await removeEvent(eventId);
}

export default createPage({
  id: 'country',
  label: 'Country Music',
  navLabel: 'Country Music',
  styles,
  bodyClass: 'page-full',
  render: async () => {
    const events = await buildEventsHtml(false);
    return `
      <div id="countryContainer">
        <div class="buttonContainer">
          <button id="backToMainBtn" class="book-country-ticket-btn" title="Hemknapp">Tillbaka till huvudsidan</button>
          <button id="actionButton" class="book-country-ticket-btn">Admin</button>
        </div>
        <div class="container">
          <div class="mainContainer">
            <div class="main2">
              <h4 class="headMenu">Country Klubben</h4>
              <p class="headText">Välkommen till Country klubben!<br> Här spelar vi countrymusik från hela världen.</p>
            </div>
            <div class="content">
              <div class="upcomingEvents"><h4>Kommande evenemang</h4></div>
              <div class="eventContent">${events}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  bind: (container) => {
    let isAdminView = false;
    const eventContent = container.querySelector('.eventContent');
    const backButton = container.querySelector('#backToMainBtn');
    const actionButton = container.querySelector('#actionButton');

    const refreshEvents = async () => {
      if (!eventContent) {
        return;
      }
      const html = await buildEventsHtml(isAdminView);
      eventContent.innerHTML = html;
      attachEventActions();
    };

    const attachEventActions = () => {
      eventContent?.querySelectorAll('[data-book-country]').forEach((button) => {
        button.addEventListener('click', () => {
          const eventName = button.dataset.bookCountry ?? 'Country event';
          bookCountryTicket(eventName);
        });
      });

      eventContent?.querySelectorAll('[data-delete-event]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await handleDeleteEvent(button.dataset.deleteEvent);
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
            console.error('Kunde inte spara event', error);
            alert('Kunde inte spara eventet just nu.');
          }
        });
      }
    };

    backButton?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    actionButton?.addEventListener('click', async () => {
      isAdminView = !isAdminView;
      actionButton.textContent = isAdminView ? 'Logout' : 'Admin';
      await refreshEvents();
    });

    refreshEvents();
  },
});
