const urlBE = "https://booking-management-backend-kdwt.onrender.com";
// const urlBE = "http://localhost:8080";

const form = document.querySelector("#product-form");
const search = document.querySelector("#search");
const tbody = document.querySelector("tbody");
const modalEl = document.getElementById("productModal");

let editMode = false;

// Khi DOM sẵn sàng, tải trang đầu tiên
document.addEventListener("DOMContentLoaded", () => {
    loadProducts(0);
});

// Chuyển trang khi bấm nút phân trang
document.addEventListener("click", async (e) => {
    const link = e.target.closest(".page-link");
    if (!link) return;

    e.preventDefault();
    const page = Number(link.dataset.page);

    removeActiveRow();
    const productName = document.querySelector("#search input").value;
    await loadProducts(page, productName);
});

// Chọn một dòng trong bảng
tbody.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row || row.id === "row-product-template") return;

    removeActiveRow();
    row.classList.add("active-tr");
});

// Bấm nút Tất cả sản phẩm
document.getElementById("allProduct").addEventListener("click", () => {
    document.querySelector("#search input").value="";
    loadProducts(0);
});

// Bấm nút mở modal Thêm sản phẩm
document.getElementById("addProduct").addEventListener("click", () => {
    editMode = false;
    form.reset();
    form.classList.remove("was-validated");
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
});

// Bấm nút mở modal Sửa sản phẩm
document.getElementById("updateProduct").addEventListener("click", (e) => {
    e.stopPropagation();
    const row = tbody.querySelector(".active-tr");

    if (!row) {
        showInfoModal("Vui lòng chọn sản phẩm cần sửa","OK");
        return;
    }

    editMode = true;
    fillFormFromRow(row);
    form.classList.remove("was-validated");
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
});

// Bấm nút Xóa sản phẩm
document.getElementById("deleteProduct").addEventListener("click", async () => {
    const row = tbody.querySelector(".active-tr");
    if (!row) {
        showInfoModal("Vui lòng chọn sản phẩm cần xóa","OK");
        return;
    }

    if (showInfoModal("Bạn có chắc chắn muốn xóa sản phẩm này không?","Huỷ","OK")) {
        const id = row.querySelector(".product-id").innerText;
        await deleteProduct(id, row);
    }
});

// Submit Form
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    form.classList.remove("was-validated");
    const data = getFormData();

    if (editMode) {
        await updateProduct(data);
    } else {
        await addProduct(data);
    }
});

// Bấm nút search
search.addEventListener("submit", (e) => {
    e.preventDefault();

    const productName = document.querySelector("#search input").value;
    loadProducts(0, productName);
});



// Lấy danh sách sản phẩm
async function loadProducts(page, productName = "") {
    try {

        document.getElementById("info").innerText = "";

        const response = await fetch(`${urlBE}/products?page=${page}&name=${productName}`);
        if (!response.ok) throw new Error(`GET lỗi: ${response.status}`);

        const data = await response.json();

        clearProducts();

        if (data.content.length == 0) {
            document.getElementById("info").innerText = "Không tìm thấy sản phẩm";
            // return;
        }

        renderProducts(data.content);
        renderPagination(data.totalPages, page);
    } catch (error) {
        console.error("Lỗi load products:", error);
    }
}

// Thêm sản phẩm
async function addProduct(productData) {
    $("#spinner").show();
    try {
        const response = await fetch(`${urlBE}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });

        if (!response.ok) throw new Error(`Thêm thất bại: ${response.status}`);

        const pageCount = document.querySelectorAll(".pagination .page-link").length;
        await loadProducts(Math.max(pageCount - 1, 0));
        closeModal();
    } catch (error) {
        console.error("Lỗi thêm:", error);
    } finally {
        $("#spinner").hide();
    }
}

// Sửa sản phẩm
async function updateProduct(productData) {
    const row = tbody.querySelector(".active-tr");
    if (!row) {
        showInfoModal("Không tìm thấy sản phẩm","OK");
        return;
    }

    const id = row.querySelector(".product-id").innerText;
    $("#spinner").show();

    try {
        const response = await fetch(`${urlBE}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });

        if (!response.ok) throw new Error(`Sửa thất bại: ${response.status}`);

        updateRowUI(row, productData);
        closeModal();
    } catch (error) {
        console.error("Lỗi sửa:", error);
    } finally {
        $("#spinner").hide();
    }
}

// Xóa sản phẩm
async function deleteProduct(id, row) {
    $("#spinner").show();
    try {
        const response = await fetch(`${urlBE}/products/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error(`Xóa thất bại: ${response.status}`);

        row.remove();
        const activePageLink = document.querySelector(".pagination .page-item.active .page-link");
        const currentPage = activePageLink ? Number(activePageLink.dataset.page) : 0;
        await loadProducts(currentPage);
    } catch (error) {
        console.error("Lỗi xóa:", error);
    } finally {
        $("#spinner").hide();
    }
}



// Hiển thị sản phẩm vào Table
function renderProducts(products) {
    const template = document.getElementById("row-product-template");

    products.forEach(product => {
        const row = template.cloneNode(true);
        row.removeAttribute("id");
        row.style.display = "";

        row.querySelector(".product-id").textContent = product.id;
        row.querySelector(".product-name").textContent = product.name;
        row.querySelector(".product-category").textContent = product.category;
        row.querySelector(".product-unit-price").textContent = product.unitPrice;
        row.querySelector(".product-cost").textContent = product.cost;
        row.querySelector(".product-discontinued").textContent = product.discontinued ? "x" : "";
        row.querySelector(".product-stock").textContent = product.stock;

        const img = row.querySelector(".product-img");
        if (img) img.src = product.img;

        tbody.appendChild(row);
    });
}

// Hiển thị các nút bấm phân trang
function renderPagination(totalPages, currentPage) {
    const pagination = document.querySelector(".pagination");
    if (!pagination) return;

    let html = "";
    for (let p = 0; p < totalPages; p++) {
        html += `
            <li class="page-item ${p === currentPage ? "active" : ""}">
                <a class="page-link" href="#" data-page="${p}">${p + 1}</a>
            </li>
        `;
    }
    pagination.innerHTML = html;
}

// Cập nhật lại các cell trên một Row
function updateRowUI(row, productData) {
    row.querySelector(".product-name").textContent = productData.name;
    row.querySelector(".product-category").textContent = productData.category;
    row.querySelector(".product-unit-price").textContent = productData.unitPrice;
    row.querySelector(".product-cost").textContent = productData.cost;
    row.querySelector(".product-discontinued").textContent = productData.discontinued ? "x" : "";
    row.querySelector(".product-stock").textContent = productData.stock;

    const img = row.querySelector(".product-img");
    if (img) img.src = productData.img;
}



// Xóa bảng
function clearProducts() {
    document
        .querySelectorAll("tbody tr:not(#row-product-template)")
        .forEach(row => row.remove());
}

// Loại bỏ class active trên dòng
function removeActiveRow() {
    const row = tbody.querySelector(".active-tr");
    if (row) row.classList.remove("active-tr");
}

// Lấy dữ liệu từ Form
function getFormData() {
    return {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        unitPrice: document.getElementById("price").value,
        cost: document.getElementById("cost").value,
        discontinued: document.getElementById("discontinued").checked,
        stock: document.getElementById("stock").value,
        img: document.getElementById("img").value
    };
}

// Đổ dữ liệu từ Row vào Form
function fillFormFromRow(row) {
    document.getElementById("name").value = row.querySelector(".product-name").innerText;
    document.getElementById("category").value = row.querySelector(".product-category").innerText;
    document.getElementById("price").value = row.querySelector(".product-unit-price").innerText;
    document.getElementById("cost").value = row.querySelector(".product-cost").innerText;
    document.getElementById("discontinued").checked = row.querySelector(".product-discontinued").innerText.trim() === "x";
    document.getElementById("stock").value = row.querySelector(".product-stock").innerText;

    const img = row.querySelector(".product-img");
    document.getElementById("img").value = img ? img.src : "";
}

// Đóng modal
function closeModal() {
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}
