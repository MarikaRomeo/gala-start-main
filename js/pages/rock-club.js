import { bindBookingForm, renderBookingForm } from '../utils/booking.js';
import { createPage, formatDateTime, getEvents } from '../utils/data-service.js';

const CLUB_ID = 'f8ed';

export default createPage({
  id: 'rock',
  label: 'Riktiga Rockare',
  navLabel: 'Riktiga Rockare',
  styles: ['/css/pages/rock-club.css'],
  bodyClass: 'page-full',
  render: async () => {
    const events = await getEvents(CLUB_ID);
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

    const eventsMarkup = sortedEvents
      .map((event) => {
        const formattedDate = formatDateTime(event.date);
        const bookingLabel = `${event.name} - ${formattedDate}`.trim();
        return `
          <article class="event">
            <h2>${event.name} <br> ${formattedDate}</h2>
            <p>${event.description ?? ''}</p>
            <button type="button" class="book-rock-btn" data-book-event="${bookingLabel}">
              Skaffa biljett för '${event.name}'
            </button>
          </article>
        `;
      })
      .join('');

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
              <a href="#create">Skapa event (Admin)</a>
            </nav>
          </div>
          <br>
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
    const bookingHost = container.querySelector('[data-booking-host]');
    const clearHost = () => {
      if (bookingHost) {
        bookingHost.innerHTML = '';
      }
    };

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
  },
});
