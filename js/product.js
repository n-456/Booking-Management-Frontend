const urlBE = "https://booking-management-backend-kdwt.onrender.com";

// const urlBE = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", async () => {

    try {
        const res = await getProducts(0);

        if (!res) {
            console.error("Không lấy được dữ liệu products");
            return;
        }

        const products = await res.json();

        console.log("products:", products);

        renderLi(products.totalPages);
        renderProducts(products.content);


    } catch (error) {
        console.error("Lỗi khi tải dữ liệu khởi tạo:", error);
    }
});


// Bắt sự kiện click pagination
document.addEventListener("click", async function (e) {
    const link = e.target.closest(".page-link");

    if (!link) return;

    e.preventDefault();

    const pageIndex = Number(link.dataset.page);
    console.log("pageIndex:", pageIndex);

    try {
        const res = await getProducts(pageIndex);

        if (!res) return;

        const data = await res.json();

        // Xóa các row sản phẩm, không xóa template
        document
            .querySelectorAll("tbody tr:not(#row-product-template)")
            .forEach(row => row.remove());

        renderProducts(data.content);

        renderLi(data.totalPages, pageIndex);

    } catch (error) {
        console.error("Lỗi khi đổi trang:", error);
    }
});



async function getProducts(pageNumber) {
    try {
        const response = await fetch(
            `${urlBE}/products?page=${pageNumber}`
        );

        if (!response.ok) {
            console.error(
                "Lỗi get products HTTP status:",
                response.status
            );

            return null;
        }

        return response;

    } catch (error) {
        console.error("Lỗi kết nối:", error);
        return null;
    }
}


function renderLi(totalPages, currentPage) {
    const paginationEl = document.querySelector(".pagination");

    if (!paginationEl) return;

    let list = "";

    for (let p = 0; p < totalPages; p++) {
        list += `
            <li class="page-item ${p === currentPage ? "active" : ""}">
                <a class="page-link" href="#" data-page="${p}">
                    ${p + 1}
                </a>
            </li>
        `;
    }

    paginationEl.innerHTML = list;
}



function renderProducts(products) {
    const template = document.getElementById("row-product-template");
    const tbody = document.querySelector("tbody");

    products.forEach(product => {
        const rowElement = template.cloneNode(true);

        rowElement.removeAttribute("id");
        rowElement.style.display = "";

        rowElement.querySelector(".product-id").textContent = product.id;
        rowElement.querySelector(".product-name").textContent = product.name;
        rowElement.querySelector(".product-category").textContent = product.category;
        rowElement.querySelector(".product-unit-price").textContent = product.unitPrice;
        rowElement.querySelector(".product-cost").textContent = product.cost;
        rowElement.querySelector(".product-discontinue").textContent = product.discontinue;
        rowElement.querySelector(".product-stock").textContent = product.stock;

        const imgEl = rowElement.querySelector(".product-img");

        if (imgEl) {
            imgEl.src = product.img;
        }

        tbody.appendChild(rowElement);
    });
}
