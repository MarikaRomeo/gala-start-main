import { createPage, formatDateTime, getClubs, getEvents, removeEvent, saveBooking, saveEvent } from '../utils/data-service.js';

const CLUB_ID = 'gr01';
const styles = ['/css/pages/greekclub.css'];

function extractTimePart(dateString) {
  if (!dateString) {
    return '';
  }
  const parts = dateString.split(/[T ]/);
  return parts[1] ?? '';
}

function normalizeEvent(event) {
  return {
    id: event.id ?? `gre-${Date.now()}`,
    title: event.title ?? event.name ?? 'Greek Club Event',
    date: event.date ?? '',
    startTime: event.startTime ?? extractTimePart(event.date),
    location: event.location ?? 'Greek Club',
    price: event.price ?? '',
    image: event.image ?? '../images/event1.jpg',
    description: event.description ?? '',
  };
}

async function loadGreekEvents() {
  const events = await getEvents(CLUB_ID);
  return events.map(normalizeEvent);
}

function createEventCard(event, isAdminView) {
  const action = isAdminView
    ? `<button class="book-btn danger" data-delete-event="${event.id}">Ta bort event</button>`
    : `<button class="book-btn" data-book-greek="${event.id}">Boka biljett</button>`;
  return `
    <div class="event-card" data-greek-event="${event.id}">
      <img src="${event.image}" alt="${event.title}">
      <h2>${event.title}</h2>
      <p><strong>Datum:</strong> ${formatDateTime(event.date)}</p>
      <p><strong>Tid:</strong> ${event.startTime}</p>
      <p><strong>Plats:</strong> ${event.location}</p>
      <p><strong>Pris:</strong> ${event.price}</p>
      <p>${event.description}</p>
      <div class="greek-actions">
        ${action}
      </div>
    </div>
  `;
}

function createInlineBooking(event) {
  return `
    <div class="booking-form">
      <h3>Boka biljett for ${event.title}</h3>
      <input type="text" data-booking-name placeholder="Ditt namn" required>
      <input type="email" data-booking-email placeholder="Din e-post" required>
      <input type="number" data-booking-quantity placeholder="Antal biljetter" min="1" value="1" required>
      <button class="confirm-btn" data-confirm-booking>Bekrafta bokning</button>
    </div>
  `;
}

async function submitGreekBooking(cardElement, event) {
  const nameInput = cardElement.querySelector('[data-booking-name]');
  const emailInput = cardElement.querySelector('[data-booking-email]');
  const quantityInput = cardElement.querySelector('[data-booking-quantity]');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const quantity = Number(quantityInput.value);

  if (!name || !email || quantity < 1) {
    alert('Fyll i namn, e-post och antal biljetter.');
    return;
  }

  const bookingData = {
    eventId: event.id,
    eventTitle: event.title,
    name,
    email,
    quantity,
  };

  await saveBooking(bookingData);
  alert(`Tack ${name}! Din bokning for eventet "${event.title}" har registrerats.`);
}

function renderAdminForm() {
  return `
    <form class="admin-event-form" data-add-event>
      <label>Eventnamn <input type="text" name="title" required></label>
      <label>Datum <input type="datetime-local" name="date" required></label>
      <label>Beskrivning <input type="text" name="description"></label>
      <input type="submit" value="Skapa" class="book-btn">
    </form>
  `;
}

export default createPage({
  id: 'greek',
  label: 'Greek Club',
  navLabel: 'Greek Club',
  styles,
  bodyClass: 'page-full',
  render: async () => {
    const [clubs, events] = await Promise.all([getClubs(), loadGreekEvents()]);
    const club = clubs.find((entry) => entry.id === CLUB_ID);
    const cards = events.map((event) => createEventCard(event, false)).join('');

    return `
      <section class="greek-page">
        <header>
          <h1>${club?.name ?? 'Greek Club'}</h1>
          <p>${club?.description ?? 'Upplev Greklands musik, dans och kultur'}</p>
        </header>
        <div class="greek-actions">
          <button class="book-btn wide" id="back-to-home">Tillbaka till huvudsidan</button>
          <button class="book-btn wide" type="button" data-greek-admin>Admin</button>
        </div>
        <main id="events-container">
          ${cards || '<p>Inga event hittades.</p>'}
        </main>
        <footer>
          <p>Ac 2025 Greek Club - Gala Emporium</p>
        </footer>
      </section>
    `;
  },
  bind: (container) => {
    let isAdminView = false;
    const backButton = container.querySelector('#back-to-home');
    const adminButton = container.querySelector('[data-greek-admin]');
    const eventsContainer = container.querySelector('#events-container');

    const wireBookings = () => {
      const cards = container.querySelectorAll('[data-greek-event]');
      cards.forEach((card) => {
        const bookButton = card.querySelector('[data-book-greek]');
        if (!bookButton) {
          return;
        }
        bookButton.addEventListener('click', () => {
          if (card.querySelector('.booking-form')) {
            return;
          }
          const event = {
            id: card.dataset.greekEvent,
            title: card.querySelector('h2')?.textContent ?? 'Greek Club Event',
          };
          card.insertAdjacentHTML('beforeend', createInlineBooking(event));
          const confirmBtn = card.querySelector('[data-confirm-booking]');
          confirmBtn?.addEventListener('click', async () => {
            try {
              await submitGreekBooking(card, event);
              const form = card.querySelector('.booking-form');
              form?.remove();
              const confirmation = document.createElement('p');
              confirmation.textContent = 'Din bokning har registrerats!';
              confirmation.style.color = 'green';
              confirmation.style.fontWeight = 'bold';
              confirmation.style.marginTop = '10px';
              card.appendChild(confirmation);
              setTimeout(() => confirmation.remove(), 6000);
            } catch (error) {
              console.error('Fel vid bokning', error);
              alert('Ett fel uppstod vid bokningen. Forsok igen senare.');
            }
          });
        });
      });
    };

    const refreshEvents = async () => {
      if (!eventsContainer) return;
      const events = await loadGreekEvents();
      const cards = events.map((event) => createEventCard(event, isAdminView)).join('');
      eventsContainer.innerHTML = cards + (isAdminView ? renderAdminForm() : '');

      if (isAdminView) {
        eventsContainer.querySelectorAll('[data-delete-event]').forEach((button) => {
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

        const form = eventsContainer.querySelector('[data-add-event]');
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
      await refreshEvents();
    });

    backButton?.addEventListener('click', () => {
      window.location.hash = '#home';
    });

    wireBookings();
  },
});
