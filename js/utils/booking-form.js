(function () {

    const form = document.getElementById("bookingForm");

    const eventNameField = document.getElementById("eventName");

    const title = document.getElementById("eventTitle");

    const errorBox = document.getElementById("formError");

    const fullNameInput = document.getElementById("fullName");

    const emailInput = document.getElementById("email");

    const ticketsInput = document.getElementById("tickets");


    const params = new URLSearchParams(window.location.search);

    const selectedEvent =

        params.get("event")?.trim() || "Italian Club Experience";


    eventNameField.value = selectedEvent;

    title.textContent = `Book tickets for ${selectedEvent}`;


    form.addEventListener("submit", async (evt) => {

        evt.preventDefault();

        errorBox.textContent = "";


        const name = fullNameInput.value.trim();

        const email = emailInput.value.trim();

        const tickets = Number.parseInt(ticketsInput.value, 10);


        if (!name || !email || Number.isNaN(tickets) || tickets < 1) {

            errorBox.textContent =

                "Please enter your name, a valid email, and at least 1 ticket.";

            return;

        }


        const booking = {

            name,

            email,

            tickets,

            event: selectedEvent,

            createdAt: new Date().toISOString(),

        };


        try {

            const response = await fetch("http://localhost:3000/bookings", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                },

                body: JSON.stringify(booking),

            });


            if (!response.ok) {

                throw new Error(`Save failed (${response.status})`);

            }


            alert("Your booking has been saved. See you soon!");


            if (window.opener) {

                window.close();

            } else {

                form.reset();

            }

        } catch (error) {

            console.error(error);

            errorBox.textContent =

                "We could not save your booking right now. Please try again.";

        }

    });

})();


