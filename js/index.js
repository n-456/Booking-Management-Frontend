urlBE = "https://booking-management-backend-kdwt.onrender.com"

function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
}

function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
}


// Định nghĩa hàm kiểm tra trạng thái đăng nhập
function checkLoginState() {
    const user = localStorage.getItem("user");
    
    // Kiểm tra nếu null, undefined hoặc chuỗi rỗng
    if (!user || user === "") {
        // Chưa đăng nhập
        console.log("chưa đăng nhập");
        document.getElementById("dropdown_1").classList.remove("d-none");
        document.getElementById("dropdown_2").classList.add("d-none");
    } else {
        // Đã đăng nhập
        document.getElementById("dropdown_2").classList.remove("d-none");
        document.getElementById("dropdown_1").classList.add("d-none");
    }
}

document.addEventListener("DOMContentLoaded", checkLoginState);



// document.getElementById("sign_out").addEventListener(
//     "click",
//     () => {
//         handleSignOut();
//     }
// )

// function handleSignOut() {
//     fetch(`${urlBE}/api/auth/logout`, {
//         method: 'POST',
//         credentials: 'include'
//     })
//         .then(response => {
//             if (response.status == 200) {
//                 document.getElementById("dropdown_1").classList.remove("d-none");
//                 document.getElementById("dropdown_2").classList.add("d-none");
//             }
//         })
//         .catch(err => console.error("Lỗi đăng xuất:", err));
// }


