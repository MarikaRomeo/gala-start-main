import { createPage, saveEvent } from '../utils/data-service.js';

const styles = ['/css/pages/create-club.css'];

async function submitForm(form, messageElement) {
  const formData = new FormData(form);
  const eventName = formData.get('eventName')?.toString().trim();
  const clubID = formData.get('clubID')?.toString().trim();
  const eventDate = formData.get('eventDate')?.toString().trim();
  const eventDescription = formData.get('eventDescription')?.toString().trim();

  if (!eventName || !clubID || !eventDate) {
    messageElement.textContent = 'Fyll i eventnamn, klubbID och datum.';
    return;
  }

  try {
    await saveEvent({
      name: eventName,
      clubId: clubID,
      date: eventDate,
      description: eventDescription ?? '',
    });
    messageElement.textContent = 'Eventet sparades!';
    form.reset();
  } catch (error) {
    console.error('Kunde inte spara eventet', error);
    messageElement.textContent = 'Kunde inte spara eventet just nu.';
  }
}

export default createPage({
  id: 'create',
  label: 'Skapa event',
  navLabel: 'Skapa event',
  showInNav: false,
  styles,
  render: async () => `
    <section class="create-club-page">
      <h2>Skapa event</h2>
      <form id="create-club">
        <input name="eventName" placeholder="Eventnamn" required>
        <input name="clubID" placeholder="KlubbID: XXXX" required>
        <input name="eventDate" placeholder="Nar ar eventet?" type="date" required>
        <textarea name="eventDescription" placeholder="Beskrivning av eventet"></textarea>
        <input type="submit" value="Skapa">
        <p class="form-message" data-create-message></p>
      </form>
    </section>
  `,
  bind: (container) => {
    const form = container.querySelector('#create-club');
    const messageElement = container.querySelector('[data-create-message]');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!messageElement) {
        return;
      }
      await submitForm(form, messageElement);
    });
  },
});
