urlBE = "https://booking-management-backend-kdwt.onrender.com"

document.getElementById("sign_up").addEventListener(
    "click",
    e => {
        e.preventDefault();

        const customerData = {
            name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            pass : document.getElementById("pwd").value
        };

        addCustomer(customerData);
    }
)

async function addCustomer(customerData) {
    try {
        const response = await fetch(`${urlBE}/customers`, {
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

        alert("Đăng ký thành công. Hãy đăng nhập để tiếp tục")
        window.location.href = "http://localhost:5500/component/sign_in.html";
    } catch (error) {
        console.error("Lỗi: ",error);
    }
}