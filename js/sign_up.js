(() => {
    'use strict';

    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            event.stopPropagation();

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
            } else {
                form.classList.remove('was-validated');
                submitForm();
            }
        }, false);
    });
})();



urlBE = "https://booking-management-backend-kdwt.onrender.com"

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

    $(document).ready(function () {
        $('#spinner').load('spinner.html');
    });

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

        const newCustomer = await response.json();

        console.log("Thêm thành công: ", newCustomer);
        document.querySelector("form").reset();
        localStorage.setItem("user", JSON.stringify(newCustomer));

        setTimeout(() => {
            // window.location.href = "http://localhost:5500/index.html";
        }, 5000);

    } catch (error) {
        console.error("Lỗi: ", error);
    }



}

