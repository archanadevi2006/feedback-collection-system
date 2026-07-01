const admin=JSON.parse(localStorage.getItem("admin"));

if(!admin){

window.location.href="login.html";

}
const API_URL = "http://localhost:3000/feedback";

let feedbackList = [];
let chart = null;

// Load all feedback when page opens
window.onload = function () {
    loadFeedback();
};

// --------------------
// Load Feedback
// --------------------
async function loadFeedback() {

    try {

        const response = await fetch(API_URL);
        feedbackList = await response.json();

        displayFeedback(feedbackList);
        updateDashboard(feedbackList);
        loadChart(feedbackList);

    } catch (err) {
        console.error(err);
        alert("Cannot connect to server.");
    }
}

// --------------------
// Display Feedback
// --------------------
function displayFeedback(data) {

    const table = document.getElementById("feedbackTable");

    table.innerHTML = "";

    data.forEach(item => {

        table.innerHTML += `
        <tr>

            <td>${item.id}</td>

            <td>${item.name}</td>

            <td>${item.email}</td>

            <td>${"⭐".repeat(item.rating)}</td>

            <td>${item.comments}</td>

            <td>

                <button
                class="action-btn edit"
                onclick="editFeedback(${item.id})">

                Edit

                </button>

                <button
                class="action-btn delete"
                onclick="deleteFeedback(${item.id})">

                Delete

                </button>

            </td>

        </tr>
        `;
    });

}

// --------------------
// Dashboard Cards
// --------------------
function updateDashboard(data) {

    document.getElementById("totalFeedback").innerText = data.length;

    if (data.length > 0) {

        const avg =
            data.reduce((sum, x) => sum + Number(x.rating), 0) /
            data.length;

        document.getElementById("avgRating").innerText =
            avg.toFixed(1);

    } else {

        document.getElementById("avgRating").innerText = "0";

    }

    document.getElementById("fiveStar").innerText =
        data.filter(x => Number(x.rating) === 5).length;

    document.getElementById("oneStar").innerText =
        data.filter(x => Number(x.rating) === 1).length;

}

// --------------------
// Search & Filter
// --------------------
function filterFeedback() {

    const search =
        document.getElementById("search")
        .value
        .toLowerCase();

    const rating =
        document.getElementById("ratingFilter")
        .value;

    const filtered = feedbackList.filter(item => {

        const nameMatch =
            item.name.toLowerCase().includes(search);

        const ratingMatch =
            rating === "" ||
            item.rating == rating;

        return nameMatch && ratingMatch;

    });

    displayFeedback(filtered);
    updateDashboard(filtered);
    loadChart(filtered);

}

// --------------------
// Delete Feedback
// --------------------
async function deleteFeedback(id) {

    if (!confirm("Delete this feedback?")) return;

    await fetch(API_URL + "/" + id, {

        method: "DELETE"

    });

    loadFeedback();

}

// --------------------
// Edit Feedback
// --------------------
function editFeedback(id) {

    localStorage.setItem("editId", id);

    window.location.href = "index.html";

}

// --------------------
// Logout
// --------------------
function logout() {

    if (confirm("Are you sure you want to logout?")) {

        window.location.href = "login.html";

    }

}

// --------------------
// Chart
// --------------------
function loadChart(data) {

    const count = [0, 0, 0, 0, 0];

    data.forEach(item => {

        count[item.rating - 1]++;

    });

    const ctx = document
        .getElementById("ratingChart")
        .getContext("2d");

    if (chart) {

        chart.destroy();

    }

    chart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [

                "1★",
                "2★",
                "3★",
                "4★",
                "5★"

            ],

            datasets: [{

                label: "Feedback Count",

                data: count,

                borderWidth: 1

            }]

        },

        options: {

            responsive: true,

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}