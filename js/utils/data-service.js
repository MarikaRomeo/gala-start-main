const API_URL = 'http://localhost:3000';
const FALLBACK_URLS = ['/json/db.json', '../json/db.json', './json/db.json'];

async function fetchCollection(name) {
  try {
    const response = await fetch(`${API_URL}/${name}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${name} from API`);
    }
    return await response.json();
  } catch (error) {
    for (const url of FALLBACK_URLS) {
      try {
        const fallback = await fetch(url);
        if (!fallback.ok) {
          continue;
        }
        const json = await fallback.json();
        return json[name] ?? [];
      } catch {
        // try next fallback
      }
    }
    console.error(`Could not load ${name} from API or fallback`, error);
    return [];
  }
}

export function createPage(config) {
  return config;
}

export function formatDateTime(dateString) {
  if (!dateString) {
    return '';
  }
  const parsed = new Date(dateString.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }
  const datePart = parsed.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timePart = parsed.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} kl ${timePart}`;
}

export async function getEvents(clubId) {
  const events = await fetchCollection('events');
  if (!clubId) {
    return events;
  }
  return events.filter((event) => event.clubId === clubId);
}

export async function getClubs() {
  return fetchCollection('clubs');
}

export async function getClub(clubId) {
  if (!clubId) {
    return null;
  }
  const clubs = await getClubs();
  return clubs.find((club) => club.id === clubId) ?? null;
}

export async function saveEvent(event) {
  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    throw new Error(`Could not save event (${response.status})`);
  }
  return response.json();
}

export async function removeEvent(eventId) {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Could not delete event (${response.status})`);
  }
  return response.json();
}

export async function saveBooking(booking) {
  const response = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  if (!response.ok) {
    throw new Error(`Could not save booking (${response.status})`);
  }
  return response.json();
}
