export default async function countryClub() {
  const eventHtml = await clubEvents('5cc6');
  const countryClubHtml = await fetch('../country-club.html');
  console.log(countryClubHtml);
  //konverterar responsen från fetch till en string
  const countryClubHtmlString = await countryClubHtml.text();

  const parser = new DOMParser();
  //Konverterar countryClubHtmlString till ett dokument genom DOMparser
  const doc = parser.parseFromString(countryClubHtmlString, "text/html");
  console.log(doc);
  //Sparar innehållet från det elementet som använder klassen .eventSidebar i doc
  const eventSidebar = doc.querySelector('.eventSidebar');
  console.log(eventSidebar);
  
  if(!eventSidebar){
    throw new Error ("EventSidebar could not load!")
  }
  eventSidebar.innerHTML = eventHtml;

  return doc.documentElement.outerHTML;
}

async function clubEvents(clubId) {
  let url = 'http://localhost:3000/events';
  if (clubId) {
    url += '?clubId=' + clubId;
  }
  const events =
    await (await fetch(url)).json();
  // return html 
  return `
    <div>
    <h2 class="eventMenu">Events</h2>
    ${events
      .toSorted((a, b) => a.date > b.date ? 1 : -1)
      .map(({ date, name, description }) => `
        <article class="event">
          <h3>${name} <br> ${date}</h3>
          <p>${description}</p>
        </article>
      `)
      .join('')
    }
    </div>
  `;
}