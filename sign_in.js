document.getElementById("sign_in").addEventListener(
    "click",
    event => {
        event.preventDefault();

        const customerData = {
            email : document.getElementById("email").value,
            pass : document.getElementById("pwd").value
        };

        sign_in(customerData);    
    }
)

async function sign_in(customerData) {
    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
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
            alert("Đăng nhập thành công!");
            window.location.href = "http://localhost:5500/index.html";    
        }
    
    } catch (error) {
        console.error("Lỗi: ",error);
    }
    
}
