import { bindBookingForm, renderBookingForm } from '../utils/booking.js';
import { createPage, formatDateTime, getClubs, getEvents, removeEvent, saveEvent } from '../utils/data-service.js';

const CLUB_ID = 'it01';

const styles = [
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;600&display=swap',
  '/css/pages/italian-club.css',
];

const defaultHeading = {
  title: 'Radio Italia - Solo Musica Italiana',
  subtitle: 'Dina älskade italienska låtar',
};

function createEventCard(event, isAdminView) {
  const formattedDate = formatDateTime(event.date);
  const bookingLabel = `${event.name} - ${formattedDate}`.trim();
  const actionButton = isAdminView
    ? `<button class="gala-btn" data-delete-event="${event.id}">Ta bort event</button>`
    : `<button class="book-btn" data-book-event="${bookingLabel}">Book Now</button>`;
  return `
    <div class="club">
      <h2>${event.name}</h2>
      <p>${event.description ?? ''}</p>
      <h4>${formattedDate}</h4>
      ${event.image ? `<img src="${event.image}" alt="${event.name}">` : ''}
      ${actionButton}
    </div>
  `;
}

function renderBookingHost() {
  return `<div class="booking-host" data-booking-host></div>`;
}

function renderAdminForm() {
  return `
    <form class="admin-event-form" data-add-event>
      <label>Eventnamn <input type="text" name="name" required></label>
      <label>Datum <input type="datetime-local" name="date" required></label>
      <label>Beskrivning <input type="text" name="description"></label>
      <input type="submit" value="Skapa" class="gala-btn">
    </form>
  `;
}

export default createPage({
  id: 'italian',
  label: 'Radio Italia',
  navLabel: 'Radio Italia',
  styles,
  render: async () => {
    const [clubs, events] = await Promise.all([getClubs(), getEvents(CLUB_ID)]);
    const club = clubs.find((entry) => entry.id === CLUB_ID);
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    const headingTitle = club?.name ?? defaultHeading.title;
    const headingSubtitle = club?.description ?? defaultHeading.subtitle;

    const eventsMarkup = sortedEvents.length
      ? sortedEvents.map((event) => createEventCard(event, false)).join('')
      : '<p class="loading">Inga evenemang att visa just nu.</p>';

    return `
      <section class="italian-page">
        <h1>${headingTitle}</h1>
        <h2>${headingSubtitle}</h2>
        <div class="italian-actions">
          <a class="gala-btn" href="#home">Tillbaka till huvudsidan</a>
          <button class="gala-btn" type="button" data-italian-admin>Admin</button>
        </div>
        <nav id="italian-events" aria-live="polite">
          ${eventsMarkup}
        </nav>
        ${renderBookingHost()}
      </section>
    `;
  },
  bind: (container) => {
    let isAdminView = false;
    const bookingHost = container.querySelector('[data-booking-host]');
    const eventContainer = container.querySelector('#italian-events');
    const adminButton = container.querySelector('[data-italian-admin]');
    const clearBookingHost = () => {
      if (bookingHost) {
        bookingHost.innerHTML = '';
      }
    };

    const wireBookings = () => {
      container.querySelectorAll('[data-book-event]').forEach((button) => {
        button.addEventListener('click', () => {
          if (!bookingHost) {
            return;
          }
          bookingHost.innerHTML = '';
          const bookingElement = renderBookingForm(button.dataset.bookEvent ?? 'Italian Club Experience');
          bookingHost.appendChild(bookingElement);
          bindBookingForm(bookingElement, button.dataset.bookEvent ?? 'Italian Club Experience', clearBookingHost);
        });
      });
    };

    const refreshEvents = async () => {
      if (!eventContainer) return;
      const events = await getEvents(CLUB_ID);
      const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
      const content = sorted.length
        ? sorted.map((event) => createEventCard(event, isAdminView)).join('')
        : '<p class="loading">Inga evenemang att visa just nu.</p>';
      eventContainer.innerHTML = content + (isAdminView ? renderAdminForm() : '');

      if (isAdminView) {
        eventContainer.querySelectorAll('[data-delete-event]').forEach((button) => {
          button.addEventListener('click', async () => {
            try {
              await removeEvent(button.dataset.deleteEvent);
              await refreshEvents();
            } catch (error) {
              console.error('Kunde inte ta bort event', error);
              alert('Kunde inte ta bort eventet.');
            }
          });
        });
        const form = eventContainer.querySelector('[data-add-event]');
        form?.addEventListener('submit', async (event) => {
          event.preventDefault();
          const formData = new FormData(form);
          const newEvent = { clubId: CLUB_ID };
          formData.forEach((value, key) => {
            newEvent[key] = value;
          });
          try {
            await saveEvent(newEvent);
            form.reset();
            await refreshEvents();
          } catch (error) {
            console.error('Kunde inte skapa event', error);
            alert('Kunde inte skapa eventet.');
          }
        });
      } else {
        wireBookings();
      }
    };

    adminButton?.addEventListener('click', async () => {
      isAdminView = !isAdminView;
      adminButton.textContent = isAdminView ? 'Logout' : 'Admin';
      clearBookingHost();
      await refreshEvents();
    });

    wireBookings();
  },
});
