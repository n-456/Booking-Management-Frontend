const urlBE = "https://booking-management-backend-kdwt.onrender.com"
// const urlBE = "http://localhost:8080"
const form = document.querySelector('form');


form.addEventListener('submit', e => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    form.classList.remove('was-validated');
    submitForm();
});



function submitForm() {

    const customerData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        pass: document.getElementById("pwd").value
    };

    addCustomer(customerData);

}


async function addCustomer(customerData) {

    $('#spinner').show();

    try {
        const response = await fetch(`${urlBE}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customerData),

        });

        if (!response.ok) {
            throw new Error(`Thêm thất bại: ${response.status}`);
        }

        const responseLogin = await fetch(`${urlBE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // credentials: 'include',
            body: JSON.stringify(customerData)
        })

        const newCustomer = await responseLogin.json();

        console.log("Thêm thành công: ", newCustomer);
        form.reset();
        localStorage.setItem("user", JSON.stringify(newCustomer));

        transPage("http://localhost:5500/index.html");

    } catch (error) {
        console.error("Lỗi: ", error);
    }

}