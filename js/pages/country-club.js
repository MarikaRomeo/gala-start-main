//Funktion för att enbart hämta eventinformation.
async function clubEvents(clubId) {
  let url = 'http://localhost:3000/events';
  if (clubId) {
    url += '?clubId=' + clubId;
  }
  const events =
    await (await fetch(url)).json();
  // return html 
  return `
    ${events
      .toSorted((a, b) => a.date > b.date ? 1 : -1)
      .map(({ date, name, description, image, id }) => {
        const imagepath = image ?? "../images/default-country-picture.jpg"
        const dateFormatted = date.replace("T", " ")

        return `
        <article class="event">
          <h3>${name} <br></h3> 
          <img src="${imagepath}" alt="Bild på eventet" class="event-image">
          <h3>${dateFormatted}</h3>
          <div class="eventImageDescriptionContainer">
            <p class="eventImageDescription">${description}</p>
            <button class="book-country-ticket-btn" onclick="bookCountryTicket('${id}', '${name}')">
              Boka Biljett
            </button>
          </div>
        </article>
      `;
      })
      .join('')
    }
  `;
}

async function adminClubEvents(clubId) {
  let url = 'http://localhost:3000/events';
  if (clubId) {
    url += '?clubId=' + clubId;
  }
  const events =
    await (await fetch(url)).json();
  // return html 
  return `
    ${events
      .toSorted((a, b) => a.date > b.date ? 1 : -1)
      .map(({ date, name, description, image, id }) => {
        const imagepath = image ?? "../images/default-country-picture.jpg"
        const dateFormatted = date.replace("T", " ")

        return `
        <article class="event">
          <h3>${name} <br></h3> 
          <img src="${imagepath}" alt="Bild på eventet" class="event-image">
          <h3>${dateFormatted}</h3>
          <div class="eventImageDescriptionContainer">
            <p class="eventImageDescription">${description}</p>
            <button class="delete-event-btn" onclick="deleteEvent('${id}')">
              Ta bort event
            </button>
          </div>
        </article>
      `;
      })
      .join('')
    }
    <div class="countryEventCreationForm">
    <h1>Skapa event</h1>
    <form id="addEventForm" onsubmit="addEvent(); return false;">
      <label for="name">Eventnamn: </label><br>
      <input type="text" id="name" name="name"><br>
      <label for="date">Datum för eventet: </label><br>
      <input type="datetime-local" id="date" name="date"><br>
      <label for="description">Eventbeskrivning: </label><br>
      <input type="text" id="description" name="description"><br>
      <input type="submit" value="Skapa" id="skapaEventKnapp">
    </form>
    </div>
  `;
}

async function addEvent() {
  const url = 'http://localhost:3000/events';
  const clubId = "5cc6"

  // Skapa ett FormData objekt utifrån elementet
  const form  = document.getElementById("addEventForm")
  const formData = new FormData(form)

  // Debug log
  console.log(`Lägger till ${formData.entries()}..`)

  // Skapa ett objekt utifrån key-values i FormData objektet och gör om till json-string
  const newEvent = {clubId: clubId};
  formData.forEach((value, key) => newEvent[key] = value);
  const postBody = JSON.stringify(newEvent);

  // Skicka POST-request till json-server url:en, vi gör samma sen med delete
  try {
    const response = await fetch(url, {method: "POST", body: postBody});
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    populateEventContent(isAdminView);
  } catch (error) {
    console.error(error.message);
  }
}

async function deleteEvent(eventId) {
  const shouldDelete = confirm("Är du säker på att du vill ta bort detta event?")
  if (!shouldDelete) return
  console.log(`Deleting event ${eventId}`)
const url = `http://localhost:3000/events/${eventId}`;
  try {
    const response = await fetch(url, {method: "Delete"});
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    populateEventContent(isAdminView);
  } catch (error) {
    console.error(error.message);
  }
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

async function populateEventContent(isAdminView) {
  //Kallar på funktionen ovan och visar resultatet av eventinformationen i html-taggen .eventcontent
  const element = document.querySelector(".eventContent");
  try{
    let events
    if (isAdminView) {
      events = await adminClubEvents("5cc6")
    } else {
      events = await clubEvents("5cc6")
    }
    if(events){
      element.innerHTML = events;
    }
    }catch {
    element.innerHTML = `<p>Någonting gick fel!</p>`
    }
};

document.addEventListener("DOMContentLoaded", async () => {
  await populateEventContent(isAdminView)
});



let isAdminView = false;

document.addEventListener('DOMContentLoaded', () => {
  const actionButton = document.getElementById('actionButton');
  // const content = document.getElementById('content');

  actionButton.addEventListener('click', async () => {
    isAdminView = !isAdminView
    await populateEventContent(isAdminView)
    actionButton.textContent = isAdminView ? 'Logout' : 'Admin'
  });
});











//Gamla meny funktionen för att visa min html sida och ta in mina events del till rätt html tag.


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