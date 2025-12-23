import { formatDateTime, getClub, getEvents } from './data-service.js';

const CLUB_ROUTES = {
  '5cc6': '#country',
  't3ch': '#techno',
  'gr01': '#greek',
  'f8ed': '#rock',
  'it01': '#italian',
};

export default async function clubInfoAndEvents(clubId) {
  let name = '';
  let description = '';
  if (clubId) {
    const club = await getClub(clubId);
    name = club?.name ?? '';
    description = club?.description ?? '';
  }

  const events = await getEvents();
  const latestByClubId = Object.values(
    events.reduce((acc, item) => {
      const currentDate = new Date(item.date);
      if (!acc[item.clubId] || currentDate < new Date(acc[item.clubId].date)) {
        acc[item.clubId] = item;
      }
      return acc;
    }, {}),
  );

  return `
    ${name ? `<h1>${name}</h1>` : ''}
    ${description ? `<p>${description}</p>` : ''}
    <div>
      <h2>Events</h2>
      ${[...latestByClubId]
        .sort((a, b) => a.date > b.date ? 1 : -1)
        .map(({ date, name: eventName, description: eventDescription, clubId: eventClubId }) => `
          <article class="event">
            <a href="${CLUB_ROUTES[eventClubId] ?? '#home'}"><h3>${eventName} ${formatDateTime(date)}</h3></a>
            <p>${eventDescription ?? ''}</p>
          </article>
        `)
        .join('')}
    </div>
  `;
}
