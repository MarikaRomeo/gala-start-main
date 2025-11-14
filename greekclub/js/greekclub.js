document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("events-container");

  fetch("./json/events.json")
    .then(response => response.json())
    .then(data => {
      data.events.forEach(event => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event-card");

        eventDiv.innerHTML = `
          <img src="${event.image}" alt="${event.title}">
          <h2>${event.title}</h2>
          <p><strong>Datum:</strong> ${event.date}</p>
          <p><strong>Tid:</strong> ${event.startTime}</p>
          <p><strong>Plats:</strong> ${event.location}</p>
          <p><strong>Pris:</strong> ${event.price}</p>
          <p>${event.description}</p>
          <button class="book-btn">Boka biljett</button>
        `;

        const bookButton = eventDiv.querySelector(".book-btn");

        bookButton.addEventListener("click", () => {
      
          const formDiv = document.createElement("div");
          formDiv.classList.add("booking-form");

          formDiv.innerHTML = `
  <h3>Boka biljett för ${event.title}</h3>
  <input type="text" id="name-${event.id}" placeholder="Ditt namn" required>
  <input type="email" id="email-${event.id}" placeholder="Din e-post" required>
  <input type="number" id="quantity-${event.id}" placeholder="Antal biljetter" min="1" value="1" required>
  <button class="confirm-btn">Bekräfta bokning</button>
`;


          
          if (eventDiv.querySelector(".booking-form")) return;

          eventDiv.appendChild(formDiv);

          
          const confirmBtn = formDiv.querySelector(".confirm-btn");
          confirmBtn.addEventListener("click", () => {
            const name = document.getElementById(`name-${event.id}`).value;
            const email = document.getElementById(`email-${event.id}`).value;
            const quantity = document.getElementById(`quantity-${event.id}`).value;

if (!name || !email || quantity < 1) {
  alert("Fyll i namn, e-post och antal biljetter.");
  return;
}

            

            const bookingData = {
  eventId: event.id,
  eventTitle: event.title,
  name: name,
  email: email,
  quantity: Number(quantity)
};


            fetch("http://localhost:3001/bookings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bookingData)
            })
              .then(response => response.json())
              .then(() => {
                alert(`Tack ${name}! Din bokning till "${event.title}" är bekräftad.`);
                formDiv.remove();
              })
              .catch(error => {
                console.error("Fel vid bokning:", error);
                alert("Ett fel uppstod vid bokningen. Försök igen senare.");
              });
          });
        });

        container.appendChild(eventDiv);
      });
    })
    .catch(error => {
      console.error("Error loading data:", error);
      container.innerHTML = "<p>Could not load events right now.</p>";
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const backButton = document.getElementById("back-to-home");
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.href = "../index.html";
    });
  }
});


