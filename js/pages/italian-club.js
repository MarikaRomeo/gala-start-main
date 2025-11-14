(() => {
    const API_URL = 'http://localhost:3000';
    const FALLBACK = './json/db.json';
    const CLUB_ID = 'it01';

    //Getting data from json.db
    async function getData(type) {
        try {
            const response = await fetch(`${API_URL}/${type}`);
            if (!response.ok) {
                throw new Error('Remote fetch failed');
            }
            return await response.json();
        } catch (error) {
            const localResponse = await fetch(FALLBACK);
            const json = await localResponse.json();
            return json[type];
        }
    }

    // formatting date to look presentable for the user 
    function formatDate(dateString) {
        if (!dateString) {
            return '';
        }
        const isoString = dateString.replace(' ', 'T');
        const parsedDate = new Date(isoString);
        if (Number.isNaN(parsedDate.getTime())) {
            return dateString;
        }
        const datePart = parsedDate.toLocaleDateString('sv-SE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const timePart = parsedDate.toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${datePart} kl ${timePart}`;
    }

    // open the booking form
    const openBookingWindow = (eventTitle = 'Italian Club Experience') => {
        const baseUrl = new URL('booking-form.html', window.location.href);
        baseUrl.searchParams.set('event', eventTitle);
        window.open(
            baseUrl.toString(),
            'italianClubBooking',
            'width=520,height=640,menubar=no,toolbar=no,location=no,status=no'
        );
    };

    // create the event card from the json.db
    function createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'club';
        const formattedDate = formatDate(event.date);
        card.innerHTML = `
            <h2>${event.name}</h2>
            <p>${event.description || ''}</p>
            <h4>${formattedDate}</h4>
            ${event.image ? `<img src="${event.image}" alt="${event.name}">` : ''}
            <button class="book-btn">Book Now</button>
        `;
        const button = card.querySelector('.book-btn');
        const bookingLabel = `${event.name} - ${formattedDate}`.trim();
        button.dataset.event = bookingLabel;
        button.addEventListener('click', (evt) => {
            evt.preventDefault();
            openBookingWindow(bookingLabel);
        });
        return card;
    }

    // load the events on the page
    function renderEvents(container, events) {
        container.innerHTML = '';
        if (!events.length) {
            container.innerHTML = '<p class="loading">Inga evenemang att visa just nu.</p>';
            return;
        }
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
        sortedEvents.forEach((event) => {
            container.appendChild(createEventCard(event));
        });
    }

    function updateHeadingTexts(club) {
        if (!club) {
            return;
        }
        const title = document.querySelector('h1');
        const subtitle = document.querySelector('h2');
        if (club.name && title) {
            title.textContent = club.name;
        }
        if (club.description && subtitle) {
            subtitle.textContent = club.description;
        }
    }

    //start the italian web page
    async function initItalianClub() {
        const container = document.getElementById('italian-events');
        if (!container) {
            return;
        }
        try {
            const [clubs, events] = await Promise.all([
                getData('clubs'),
                getData('events')
            ]);
            const club = clubs.find((entry) => entry.id === CLUB_ID);
            const clubEvents = events.filter((event) => event.clubId === CLUB_ID);
            updateHeadingTexts(club);
            renderEvents(container, clubEvents);
        } catch (error) {
            console.error('Kunde inte ladda italienska klubben', error);
            container.innerHTML = '<p class="loading">Kunde inte ladda evenemang just nu.</p>';
        }
    }

    document.addEventListener('DOMContentLoaded', initItalianClub);
})();