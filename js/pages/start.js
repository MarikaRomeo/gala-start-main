import { createPage } from '../utils/data-service.js';
import clubInfoAndEvents from '../utils/club-info-and-events.js';

export default createPage({
  id: 'home',
  label: 'Home',
  navLabel: 'Home',
  styles: [],
  render: async () => {
    const eventHtml = await clubInfoAndEvents();
    return `
      <section class="start-hero">
        <h1>Gala Emporium</h1>
        <h2>the sky is not the limit - is the backdrop</h2>
        <p class="lead">Your local source of Music and cultural events!</p>
        <p>Here you can find the latest events and book a spot for you and your friends. Come on in and explore our clubs.</p>
      </section>
      <section class="start-events">
        ${eventHtml}
      </section>
    `;
  },
});
