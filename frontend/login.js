const API_URL = "http://localhost:3000/admin/login";

async function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please enter username and password.");
        return;
    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("admin", JSON.stringify(data.admin));

            alert("Login Successful");

            window.location.href = "admin.html";

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("Cannot connect to server.");

    }

}