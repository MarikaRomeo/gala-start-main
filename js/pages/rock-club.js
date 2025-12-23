import { bindBookingForm, renderBookingForm } from '../utils/booking.js';
import { createPage, formatDateTime, getEvents, removeEvent, saveEvent } from '../utils/data-service.js';

const CLUB_ID = 'f8ed';

function renderAdminForm() {
  return `
    <form class="admin-event-form" data-add-event>
      <label>Eventnamn <input type="text" name="name" required></label>
      <label>Datum <input type="datetime-local" name="date" required></label>
      <label>Beskrivning <input type="text" name="description"></label>
      <input type="submit" value="Skapa" class="book-rock-btn">
    </form>
  `;
}

function buildEventMarkup(events, isAdminView) {
  return events
    .map((event) => {
      const formattedDate = formatDateTime(event.date);
      const bookingLabel = `${event.name} - ${formattedDate}`.trim();
      const actionButton = isAdminView
        ? `<button type="button" class="book-rock-btn" data-delete-event="${event.id}">Ta bort event</button>`
        : `<button type="button" class="book-rock-btn" data-book-event="${bookingLabel}">Skaffa biljett for '${event.name}'</button>`;
      return `
        <article class="event">
          <h2>${event.name} <br> ${formattedDate}</h2>
          <p>${event.description ?? ''}</p>
          <div class="rock-actions">
            ${actionButton}
          </div>
        </article>
      `;
    })
    .join('');
}

export default createPage({
  id: 'rock',
  label: 'Riktiga Rockare',
  navLabel: 'Riktiga Rockare',
  styles: ['/css/pages/rock-club.css'],
  bodyClass: 'page-full',
  render: async () => {
    const events = await getEvents(CLUB_ID);
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    const eventsMarkup = buildEventMarkup(sortedEvents, false);

    return `
      <section class="rock-page">
        <header>
          <h1>Riktiga Rockare</h1>
          <h3>Hardrock for Riktiga Rockare!</h3>
        </header>
        <div class="container">
          <div class="bar">
            <nav>
              <a href="#home">Gala Emporium</a>
              <span class="nav-label">Riktiga Rockare</span>
            </nav>
          </div>
          <br>
          <button class="book-rock-btn admin-toggle" type="button" data-rock-admin>Admin</button>
          <h2>Kommande Konserter</h2>
          <div class="eventContent">
            ${eventsMarkup || '<p class="loading">Nagonting gick fel!</p>'}
          </div>
        </div>
        <div class="booking-host" data-booking-host></div>
      </section>
    `;
  },
  bind: (container) => {
    let isAdminView = false;
    const bookingHost = container.querySelector('[data-booking-host]');
    const adminButton = container.querySelector('[data-rock-admin]');
    const eventContent = container.querySelector('.eventContent');
    const clearHost = () => {
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
          const bookingElement = renderBookingForm(button.dataset.bookEvent ?? 'Riktiga Rockare');
          bookingHost.appendChild(bookingElement);
          bindBookingForm(bookingElement, button.dataset.bookEvent ?? 'Riktiga Rockare', clearHost);
        });
      });
    };

    const refreshEvents = async () => {
      if (!eventContent) return;
      const events = await getEvents(CLUB_ID);
      const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
      eventContent.innerHTML = buildEventMarkup(sorted, isAdminView) + (isAdminView ? renderAdminForm() : '');

      if (isAdminView) {
        eventContent.querySelectorAll('[data-delete-event]').forEach((button) => {
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

        const form = eventContent.querySelector('[data-add-event]');
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
            alert('Kunde inte skapa event just nu.');
          }
        });
      } else {
        wireBookings();
      }
    };

    adminButton?.addEventListener('click', async () => {
      isAdminView = !isAdminView;
      adminButton.textContent = isAdminView ? 'Logout' : 'Admin';
      clearHost();
      await refreshEvents();
    });

    wireBookings();
  },
});
