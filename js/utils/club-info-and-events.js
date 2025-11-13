export default async function clubInfoAndEvents(clubId) {
  let name = '', description = '', backgroundPath = '';
  // if there is a clubId -> fetch the info about the club
  // and calculate the correct url for fetching filtered events
  let url = 'http://localhost:3000/events';
  if (clubId) {
    const { name: clubName, description: clubDescription, backgroundPath: clubBackground} =
      await (await fetch('http://localhost:3000/clubs/' + clubId)).json();
    name = clubName;
    description = clubDescription;
    backgroundPath = clubBackground;
    url += '?clubId=' + clubId;
  }

  //Lagt till filter "isNaN" då det finns 2 databaser i projektet som krockar.
  let events =
    await (await fetch(url)).json();
     events = events.filter((event) => {
      return isNaN(event.id)
    })
    const latestByClubId = Object.values(
  events.reduce((acc, item) => {
    const currentDate = new Date(item.date);
    if(!acc[item.clubId] || currentDate > new Date(acc[item.clubId].date)){
      acc[item.clubId] = item;
    }
    return acc;
  },{}) 
);
  // return html
  return `
    <h1>${name}</h1>
    <p>${description}</p>
    <!-- <img src=${backgroundPath}> -->
    <div>
    <h2>Events</h2>
    ${latestByClubId
      .toSorted((a, b) => a.date > b.date ? 1 : -1)
      .map(({ date, name, description }) => `
        <article class="event">
          <h3>${name} ${date}</h3>
          <p>${description}</p>
        </article>
      `)
      .join('')
    }
    </div>
  `;
}