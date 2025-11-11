import start from './pages/start.js';
import jazzClub from './pages/jazz-club.js';
import metalClub from './pages/metal-club.js';
import rockClub from './pages/rock-club.js';
import createClub from './pages/create-club.js';
import clubCreated from './pages/club-created.js';

const isAdmin = true; // "resultat av en inloggning"

// Our menu: label to display in menu and
// function to run on menu choice
// urlHash
const menu = {
  "start": { label: 'Start', function: start },
  "jazz-klubben": { label: 'Jazz-klubben', function: jazzClub },
  "metal-klubben": { label: 'Metal-klubben', function: metalClub },
  "riktiga-rockare": {label: 'Riktiga-Rockare', function: rockClub},
  "create-club": { label: 'Skapa en klubb', function: createClub, isAdminPage: true },
  "club-created": { label: 'Skapa en klubb', function: clubCreated, isAdminPage: true, showInMenu: false }
};

function createMenu() {
  // Object.entries -> convert object to array
  // then map to create a-tags (links)
  // then join everything into one big string
  return Object.entries(menu)
    .map(([urlHash, { label, isAdminPage, showInMenu }]) => {
      if (showInMenu === false) { return; }
      if (isAdminPage && isAdmin) {
        return `<a href="#${urlHash}">${label}</a>`;
      } else if (!isAdminPage) {
        return `<a href="#${urlHash}">${label}</a>`;
      }
    })
    .filter(x => x) // remove empty entries
    .join(' | ');
}

async function loadPageContent() {
  // if no hash redirect to #start
  if (location.hash === '') { location.replace('#start'); }
  // add a class on body so that we can style different pages differently
  document.body.setAttribute('class', location.hash.slice(1));
  // get the correct function to run depending on location.hash
  const functionToRun = menu[location.hash.slice(1)].function;
  // run the function and expect it return a html string
  const html = await functionToRun();
  // replace the contents of the main element
  document.querySelector('main').innerHTML = html;
}

// call loadPageContent once on page load
loadPageContent();

// and then on every hash change of the url/location
window.onhashchange = loadPageContent;

// create the menu and display it
document.querySelector('header nav').innerHTML = createMenu();