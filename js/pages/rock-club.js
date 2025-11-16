//Funktion för att enbart hämta eventinformation.
async function clubEvents(clubId) {
  const url = 'http://localhost:3000/events?clubId=' + clubId;
  const events =
    await (await fetch(url)).json();
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
    element.innerHTML = `<p>Någonting gick fel!</p>`;
  }
});
