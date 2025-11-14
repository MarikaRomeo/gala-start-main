//Funktion för att enbart hämta eventinformation.
async function clubEvents(clubId) {
  let url = 'http://localhost:3000/events';
  if (clubId) {
    url += '?clubId=' + clubId;
  }
  const events =
    await (await fetch(url)).json();
    console.log(JSON.stringify.events);
  // return html 
  return `
    ${events
      .toSorted((a, b) => a.date > b.date ? 1 : -1)
      .map(({ date, name, description, image, eventId }) => `
        <article class="event">
          <h3>${name} <br></h3> 
          ${image ? `<img src="${image}" alt="${image}" class="event-image">` : ''}
          <h3>${date}</h3>
          <div class="eventImageDescriptionContainer">
            <p class="eventImageDescription">${description}</p>
            <button class="book-country-ticket-btn" onclick="bookCountryTicket('${eventId}', '${name}')">
              Boka Biljett
            </button>
          </div>
        </article>
      `)
      .join('')
    }
  `;
}
//funktion för att generera bokningsnummer.
function generateCountryBookingNumber() {
  const prefix = 'Country';
  const timestamp = Date.now().toString().slice(-6); // Senaste 6 siffrorna av timestamp
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${randomNum}`;
}

// Funktion för att boka biljetter
function bookCountryTicket(eventId, eventName) {
  const bookingNumber = generateCountryBookingNumber();

  alert(` Biljett bokad för "${eventName}"!\n\n` +
    ` Bokningsnummer: ${bookingNumber}\n\n` +
    `Spara ditt bokningsnummer för framtida referens.\n` +
    `Vi ses på eventet!`);

  console.log(`Biljett bokad - Event: ${eventName}, Event ID: ${eventId}, Bokningsnummer: ${bookingNumber}`);
}
//Kallar på funktionen ovan och visar resultatet av eventinformationen i html-taggen .eventcontent
document.addEventListener("DOMContentLoaded", async () => {
  const element = document.querySelector(".eventContent");
  try{
    //byt ut klubb-id i parentesen efter clubEvents för att visa era events och ändra ovan i querySelectorn vart i er html den ska visas!
    const events = await clubEvents("5cc6");
    if(events){
      element.innerHTML = events;
    }
  }catch {
    element.innerHTML = `<p>Någonting gick fel!</p>`
  }
});












//Gamla meny funktionen för att visa min html sida och ta in min events del till rätt html tag. 


// export default async function countryClub() {
//   const eventHtml = await clubEvents('5cc6');
//   const countryClubHtml = await fetch('../country-club.html');
//   console.log(countryClubHtml);
//   //konverterar responsen från fetch till en string
//   const countryClubHtmlString = await countryClubHtml.text();

//   const parser = new DOMParser();
//   //Konverterar countryClubHtmlString till ett dokument genom DOMparser
//   const doc = parser.parseFromString(countryClubHtmlString, "text/html");
//   console.log(doc);
//   //Sparar innehållet från det elementet som använder klassen .eventSidebar i doc
//   const eventContent = doc.querySelector('.eventContent');
//   console.log(eventContent);
  
//   if(!eventContent){
//     throw new Error ("eventContent could not load!")
//   }
//   eventContent.innerHTML = eventHtml;

//   return doc.documentElement.outerHTML;
// }