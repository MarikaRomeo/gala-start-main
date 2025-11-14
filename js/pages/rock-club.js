//Funktion för att enbart hämta eventinformation.
async function clubEvents(clubId) {
  let url = 'http://localhost:3000/events';
  if (clubId) {
    url += '?clubId=' + clubId;
  }
  let events =
    await (await fetch(url)).json();
  events = events.filter((event) => {
    return isNaN(event.id)
  })
  // return html 
  return `
    <div>
    ${events
      .toSorted((a, b) => a.date > b.date ? 1 : -1)
      .map(({ date, name, description }) => `
        <article class="event">
          <h2>${name} <br> ${date}</h2>
          <p>${description}</p>
          <button type="button" onclick="window.location.href='booking-form-rock.html'">Skaffa biljett för '${name}'</button>
        </article>
      `)
      .join('')
    }
    </div>
  `;
}
//Kallar på funktionen ovan och visar resultatet av eventinformationen i html-taggen .eventcontent
document.addEventListener("DOMContentLoaded", async () => {
  const element = document.querySelector(".eventContent");
  try {
    //byt ut klubb-id i parentesen efter clubEvents för att visa era events och ändra ovan i querySelectorn vart i er html den ska visas!
    const events = await clubEvents("f8ed");
    if (events) {
      element.innerHTML = events;
    }
  } catch {
    element.innerHTML = `<p>Någonting gick fel!</p>`
  }
});

// open the booking form
const openBookingWindow = (eventTitle = 'Booking form Rock Club Experience') => {
  const baseUrl = new URL('booking-form.html', window.location.href);
  baseUrl.searchParams.set('event', eventTitle);
  window.open(
    baseUrl.toString(),
    'RiktigaRockareClubBooking',
    'width=520,height=640,menubar=no,toolbar=no,location=no,status=no'
  );
};