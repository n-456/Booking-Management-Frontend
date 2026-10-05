const urlBE = "https://booking-management-backend-kdwt.onrender.com"
// const urlBE = "http://localhost:8080"

document.getElementById("signin-form").addEventListener(
    "submit",
    event => {
        event.preventDefault();

        const customerData = {
            email: document.getElementById("email").value,
            pass: document.getElementById("pwd").value
        };

        sign_in(customerData);
    }
)

async function sign_in(customerData) {

    $('#spinner').show();
    
    try {
        const response = await fetch(`${urlBE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(customerData)
        })

        if (!response.ok) {
            alert("Sai email hoặc mật khẩu");
        } else {
            const currentCustomer = await response.json();
            localStorage.setItem("user", JSON.stringify(currentCustomer));
            transPage("../index.html");
        }

    } catch (error) {
        console.error("Lỗi: ", error);
    }

}
