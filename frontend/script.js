const API_URL = "http://localhost:3000/feedback";

const form = document.getElementById("feedbackForm");

let editId = localStorage.getItem("editId");

// ----------------------
// Load Edit Data
// ----------------------
if (editId) {
    loadSingleFeedback(editId);
}

// ----------------------
// Submit Feedback
// ----------------------
form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const feedback = {

        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim(),

        rating: document.getElementById("rating").value,

        comments: document.getElementById("comments").value.trim()

    };

    try {

        if (!editId) {

            // Add Feedback

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(feedback)

            });

            const data = await response.json();

            alert(data.message);

        }

        else {

            // Update Feedback

            const response = await fetch(API_URL + "/" + editId, {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(feedback)

            });

            const data = await response.json();

            alert(data.message);

            localStorage.removeItem("editId");

            editId = null;

            document.querySelector("button[type='submit']").innerHTML =
                '<i class="fa-solid fa-paper-plane"></i> Submit Feedback';

        }

        form.reset();

    }

    catch (error) {

        console.log(error);

        alert("Cannot connect to server.");

    }

});

// ----------------------
// Load Single Feedback
// ----------------------

async function loadSingleFeedback(id) {

    try {

        const response = await fetch(API_URL + "/" + id);

        const feedback = await response.json();

        document.getElementById("name").value = feedback.name;

        document.getElementById("email").value = feedback.email;

        document.getElementById("rating").value = feedback.rating;

        document.getElementById("comments").value = feedback.comments;

        document.querySelector("button[type='submit']").innerHTML =
            '<i class="fa-solid fa-pen"></i> Update Feedback';

    }

    catch (error) {

        console.log(error);

    }

}

// ----------------------
// View Feedback Button
// ----------------------

document.getElementById("viewBtn").addEventListener("click", function () {

    window.location.href = "admin.html";

});