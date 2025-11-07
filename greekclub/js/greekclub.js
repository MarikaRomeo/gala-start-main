document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("events-container");

  fetch("http://localhost:3001/events")
    .then(response => response.json())
    .then(data => {
      // Εδώ τα data είναι ήδη λίστα, όχι αντικείμενο με "events"
      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p>No events available right now.</p>";
        return;
      }

      data.forEach(event => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event-card");

        eventDiv.innerHTML = `
          <img src="${event.image}" alt="${event.title}">
          <h2>${event.title}</h2>
          <p><strong>Date:</strong> ${event.date}</p>
          <p>${event.description}</p>
        `;

        container.appendChild(eventDiv);
      });
    })
    .catch(error => {
      console.error("Error loading data:", error);
      container.innerHTML = "<p>Could not load events right now.</p>";
    });
});
