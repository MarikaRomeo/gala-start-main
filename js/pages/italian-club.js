(function () {
    const bookingButtons = document.querySelectorAll(".book-btn");

    if (!bookingButtons.length) {
        return;
    }

    const openBookingWindow = (eventTitle = "Italian Club Experience") => {
        const baseUrl = new URL("booking-form.html", window.location.href);
        baseUrl.searchParams.set("event", eventTitle);

        window.open(
            baseUrl.toString(),
            "italianClubBooking",
            "width=520,height=640,menubar=no,toolbar=no,location=no,status=no"
        );
    };

    bookingButtons.forEach((button) => {
        button.addEventListener("click", (evt) => {
            evt.preventDefault();
            const eventTitle = button.dataset.event || button.previousElementSibling?.textContent?.trim();
            openBookingWindow(eventTitle);
        });

    });

})();
