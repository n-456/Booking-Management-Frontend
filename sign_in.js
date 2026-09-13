document.getElementById("sign_in").addEventListener(
    "click",
    event => {
        event.preventDefault();

        const customerData = {
            name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            pass : document.getElementById("pwd").ariaValueMax
        };

        addCustomer(customerData);
    }
)

async function addCustomer(customerData) {
    try {
        const response = await fetch("http://localhost:8080/customers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            throw new Error(`Thêm thất bại: ${response.status}`);
        }

        const newCustomer = await response.json();
        console.log("Thêm thành công: ", newCustomer);

        document.querySelector("form").reset();
        editingId = null;

    } catch (error) {
        console.error("Lỗi: ",error);
    }
}