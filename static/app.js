const form = document.querySelector("#chat-form");
const input = document.querySelector("#message");
const response = document.querySelector("#response");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();
    if (!message) return;

    response.textContent =
        "omi is getting ready to think...";

    // Azure AI integration comes next.
    console.log("Message:", message);
});
