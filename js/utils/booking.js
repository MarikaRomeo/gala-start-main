import { saveBooking } from './data-service.js';

const closeSelector = '[data-booking-close]';

const formTemplate = `
  <section class="booking-page" data-booking-wrapper>
    <main class="booking-card">
      <div class="booking-header">
        <h1 class="booking-title" data-booking-title>Book your tickets</h1>
        <button type="button" class="booking-close" aria-label="Stang bokning" data-booking-close>&times;</button>
      </div>
      <form class="booking-form" novalidate data-booking-form>
        <label>
          Event
          <input data-booking-event name="event" type="text" readonly>
        </label>
        <label>
          Full name
          <input data-booking-name name="name" type="text" required>
        </label>
        <label>
          Email
          <input data-booking-email name="email" type="email" required>
        </label>
        <label>
          Number of tickets
          <input data-booking-tickets name="tickets" type="number" min="1" max="10" value="1" required>
        </label>
        <div class="booking-error" data-booking-error role="alert"></div>
        <button type="submit" class="booking-submit">Save</button>
      </form>
    </main>
  </section>
`;

function generateBookingNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${year}${month}${day}-${randomPart}`;
}

export function renderBookingForm(eventTitle) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = formTemplate.trim();
  const bookingElement = wrapper.firstElementChild;

  const titleElement = bookingElement.querySelector('[data-booking-title]');
  const eventInput = bookingElement.querySelector('[data-booking-event]');
  titleElement.textContent = `Book tickets for ${eventTitle}`;
  eventInput.value = eventTitle;

  return bookingElement;
}

export function bindBookingForm(bookingElement, eventTitle, onClose) {
  const form = bookingElement.querySelector('[data-booking-form]');
  const nameInput = bookingElement.querySelector('[data-booking-name]');
  const emailInput = bookingElement.querySelector('[data-booking-email]');
  const ticketsInput = bookingElement.querySelector('[data-booking-tickets]');
  const errorBox = bookingElement.querySelector('[data-booking-error]');

  const closeButton = bookingElement.querySelector(closeSelector);
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      onClose?.();
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorBox.textContent = '';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const tickets = Number.parseInt(ticketsInput.value, 10);

    if (!name || !email || Number.isNaN(tickets) || tickets < 1) {
      errorBox.textContent = 'Please enter your name, a valid email, and at least 1 ticket.';
      return;
    }

    const booking = {
      name,
      email,
      tickets,
      event: eventTitle,
      bookingNumber: generateBookingNumber(),
    };

    try {
      await saveBooking(booking);
      alert(` Biljett bokad for "${booking.event}"!\n\n` +
        ` Bokningsnummer: ${booking.bookingNumber}\n\n` +
        `Spara ditt bokningsnummer for framtida referens.\n` +
        `Vi ses pa eventet!`);
      form.reset();
      onClose?.();
    } catch (error) {
      console.error(error);
      errorBox.textContent = 'We could not save your booking right now. Please try again.';
    }
  });
}
