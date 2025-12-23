import { bindBookingForm, renderBookingForm } from '../utils/booking.js';
import { createPage, formatDateTime, getClubs, getEvents } from '../utils/data-service.js';

const CLUB_ID = 'it01';

const styles = [
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;600&display=swap',
  '/css/pages/italian-club.css',
];

const defaultHeading = {
  title: 'Radio Italia - Solo Musica Italiana',
  subtitle: 'Dina älskade italienska låtar',
};

function createEventCard(event) {
  const formattedDate = formatDateTime(event.date);
  const bookingLabel = `${event.name} - ${formattedDate}`.trim();
  return `
    <div class="club">
      <h2>${event.name}</h2>
      <p>${event.description ?? ''}</p>
      <h4>${formattedDate}</h4>
      ${event.image ? `<img src="${event.image}" alt="${event.name}">` : ''}
      <button class="book-btn" data-book-event="${bookingLabel}">Book Now</button>
    </div>
  `;
}

function renderBookingHost() {
  return `<div class="booking-host" data-booking-host></div>`;
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
      ? sortedEvents.map(createEventCard).join('')
      : '<p class="loading">Inga evenemang att visa just nu.</p>';

    return `
      <section class="italian-page">
        <h1>${headingTitle}</h1>
        <h2>${headingSubtitle}</h2>
        <div class="italian-actions">
          <a class="gala-btn" href="#home">Gala Emporium</a>
          <a href="#create" class="gala-btn">Skapa event (Admin)</a>
        </div>
        <nav id="italian-events" aria-live="polite">
          ${eventsMarkup}
        </nav>
        ${renderBookingHost()}
      </section>
    `;
  },
  bind: (container) => {
    const bookingHost = container.querySelector('[data-booking-host]');
    const clearBookingHost = () => {
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
        const bookingElement = renderBookingForm(button.dataset.bookEvent ?? 'Italian Club Experience');
        bookingHost.appendChild(bookingElement);
        bindBookingForm(bookingElement, button.dataset.bookEvent ?? 'Italian Club Experience', clearBookingHost);
      });
    });
  },
});
