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
          <h3>${name} <br> ${date}</h3>
          <p>${description}</p>
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
  try{
    //byt ut klubb-id i parentesen efter clubEvents för att visa era events och ändra ovan i querySelectorn vart i er html den ska visas!
    const events = await clubEvents("f8ed");
    if(events){
      element.innerHTML = events;
    }
  }catch {
    element.innerHTML = `<p>Någonting gick fel!</p>`
  }
});















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