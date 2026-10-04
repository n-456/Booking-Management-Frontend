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

document.addEventListener("DOMContentLoaded", () => { info(); })

function submitForm() {

    const customerData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        pass: document.getElementById("pwd").value
    };

    updateCustomer(customerData);

}


async function updateCustomer(customerData) {

    $('#spinner').show();
    let id = JSON.parse(localStorage.getItem("user")).id;

    try {
        const response = await fetch(`${urlBE}/customers/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customerData),

        });

        if (!response.ok) {
            throw new Error(`Sửa thất bại: ${response.status}`);
        }

        const newCustomer = await response.json();

        console.log("Sửa thành công: ", newCustomer);

        alert("Sửa thông tin thành công");

        localStorage.setItem("user", JSON.stringify(newCustomer));

    } catch (error) {
        console.error("Lỗi: ", error);
    }

}

async function info() {
    try {
        let id = JSON.parse(localStorage.getItem("user")).id;
        const response = await fetch(`${urlBE}/api/auth/profile`, { credentials: 'include' });
        // const response = await fetch(`${urlBE}/customers/${id}`);

        if (!response.ok) {
            alert("Lỗi không lấy được thông tin");
        } else {
            const currentCustomer = await response.json();
            document.getElementById("idNumber").value = currentCustomer.id;
            document.getElementById("name").value = currentCustomer.name;
            document.getElementById("phone").value = currentCustomer.phone;
            document.getElementById("email").value = currentCustomer.email;
            document.getElementById("pwd").value = currentCustomer.pass;
            console.log(currentCustomer);
        }

    } catch (error) {
        console.error("Lỗi: ", error);
    }

}
