const urlBE = "https://booking-management-backend-kdwt.onrender.com";
// const urlBE = "http://localhost:8080";

const form = document.querySelector("form");
const tbody = document.querySelector("tbody");
const modalEl = document.getElementById("productModal");

let editMode = false;


document.addEventListener("DOMContentLoaded", () => {
    loadProducts(0);
});


async function loadProducts(page) {
    try {
        const response = await fetch(
            `${urlBE}/products?page=${page}`
        );

        if (!response.ok) {
            throw new Error(`GET lỗi: ${response.status}`);
        }

        const data = await response.json();

        clearProducts();
        renderProducts(data.content);
        renderPagination(data.totalPages, page);

    } catch (error) {
        console.error("Lỗi load products:", error);
    }
}


document.addEventListener("click", async (e) => {

    const link = e.target.closest(".page-link");

    if (!link) return;

    e.preventDefault();

    const page = Number(link.dataset.page);

    // Bỏ chọn dòng cũ khi chuyển trang
    removeActiveRow();

    await loadProducts(page);
});


function renderPagination(totalPages, currentPage) {

    const pagination =
        document.querySelector(".pagination");

    if (!pagination) return;

    let html = "";

    for (let p = 0; p < totalPages; p++) {

        html += `
            <li class="page-item ${p === currentPage ? "active" : ""}">
                <a
                    class="page-link"
                    href="#"
                    data-page="${p}">
                    ${p + 1}
                </a>
            </li>
        `;
    }

    pagination.innerHTML = html;
}


function clearProducts() {

    document
        .querySelectorAll(
            "tbody tr:not(#row-product-template)"
        )
        .forEach(row => row.remove());
}


function renderProducts(products) {

    const template =
        document.getElementById("row-product-template");

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

        const img =
            row.querySelector(".product-img");

        if (img) {
            img.src = product.img;
        }

        tbody.appendChild(row);
    });
}


tbody.addEventListener("click", (e) => {

    const row = e.target.closest("tr");

    if (!row) return;

    if (row.id === "row-product-template") {
        return;
    }

    removeActiveRow();

    row.classList.add("active-tr");
});


function removeActiveRow() {

    const row =
        tbody.querySelector(".active-tr");

    if (row) {
        row.classList.remove("active-tr");
    }
}


function getFormData() {

    return {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value,
        unitPrice: document.getElementById("price").value,
        cost: document.getElementById("cost").value,
        discontinued:
            document.getElementById("discontinued").checked,
        stock: document.getElementById("stock").value,
        img: document.getElementById("img").value
    };
}

document
    .getElementById("addProduct")
    .addEventListener("click", () => {

        editMode = false;

        form.reset();
        form.classList.remove("was-validated");

        bootstrap.Modal
            .getOrCreateInstance(modalEl)
            .show();
    });


document
    .getElementById("updateProduct")
    .addEventListener("click", () => {

        const row =
            tbody.querySelector(".active-tr");

        if (!row) {
            alert("Vui lòng chọn sản phẩm cần sửa");
            return;
        }

        editMode = true;

        // Đưa dữ liệu sản phẩm vào form
        document.getElementById("name").value =
            row.querySelector(".product-name").innerText;

        document.getElementById("category").value =
            row.querySelector(".product-category").innerText;

        document.getElementById("price").value =
            row.querySelector(".product-unit-price").innerText;

        document.getElementById("cost").value =
            row.querySelector(".product-cost").innerText;

        document.getElementById("discontinued").checked =
            row.querySelector(".product-discontinued").innerText.trim() === "x";

        document.getElementById("stock").value =
            row.querySelector(".product-stock").innerText;

        const img = row.querySelector(".product-img");
        document.getElementById("img").value = img ? img.src : "";

        form.classList.remove("was-validated");

        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    });

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

async function addProduct(productData) {

    $("#spinner").show();

    try {

        const response = await fetch(
            `${urlBE}/products`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            }
        );

        if (!response.ok) {
            throw new Error(
                `Thêm thất bại: ${response.status}`
            );
        }

        const pageCount =
            document.querySelectorAll(
                ".pagination .page-link"
            ).length;

        await loadProducts(
            Math.max(pageCount - 1, 0)
        );

        closeModal();

    } catch (error) {

        console.error("Lỗi thêm:", error);

    } finally {

        $("#spinner").hide();
    }
}


async function updateProduct(productData) {

    const row =
        tbody.querySelector(".active-tr");

    if (!row) {
        alert("Không tìm thấy sản phẩm");
        return;
    }

    const id =
        row.querySelector(".product-id").innerText;

    $("#spinner").show();

    try {

        const response = await fetch(
            `${urlBE}/products/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            }
        );

        if (!response.ok) {
            throw new Error(
                `Sửa thất bại: ${response.status}`
            );
        }

        row.querySelector(".product-name").textContent = productData.name;
        row.querySelector(".product-category").textContent = productData.category;
        row.querySelector(".product-unit-price").textContent = productData.unitPrice;
        row.querySelector(".product-cost").textContent = productData.cost;
        row.querySelector(".product-discontinued").textContent = productData.discontinued ? "x" : "";
        row.querySelector(".product-stock").textContent = productData.stock;
        const img =
            row.querySelector(".product-img");

        if (img) {
            img.src = productData.img;
        }

        closeModal();

    } catch (error) {

        console.error("Lỗi sửa:", error);

    } finally {

        $("#spinner").hide();
    }
}

document
    .getElementById("deleteProduct")
    .addEventListener("click", async () => {

        const row =
            tbody.querySelector(".active-tr");

        if (!row) {
            alert("Vui lòng chọn sản phẩm cần xóa");
            return;
        }

        await deleteProduct(row);
    });


async function deleteProduct(row) {

    const id =
        row.querySelector(".product-id").innerText;

    try {

        const response = await fetch(
            `${urlBE}/products/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Xóa thất bại: ${response.status}`
            );
        }

        row.remove();

    } catch (error) {

        console.error("Lỗi xóa:", error);
    }
}

function closeModal() {

    bootstrap.Modal
        .getOrCreateInstance(modalEl)
        .hide();
}

modalEl.addEventListener(
    "hidden.bs.modal",
    () => {

        form.reset();

        form.classList.remove(
            "was-validated"
        );

        editMode = false;

        removeActiveRow();
    }
);
