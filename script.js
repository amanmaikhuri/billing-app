// DOM helper
const $ = (selector, err = true) => {
    const el = document.querySelector(selector);
    if (!el && err) console.error(`${selector} missing`, err.message);
    return el;
};

// DOM references
const dom = {
    body: $("body"),
    customerName: $("#name"),
    particulars: $("#particulars"),
    sizeText: $("#size-text"),
    quantity: $("#quantity"),
    addItemBtn: $("#add-item-btn"),
    cartPreview: $("#cart-preview")
};

let cartItems = [];
let editIndex = -1;
let itemEditIndex = -1;

// Event Listeners
function addEvents() {
    dom.addItemBtn.addEventListener("click", () => {
        if (itemEditIndex >= 0) updateCartItem();
        else addItemToCart();
    });
    // dom.submitBtn.addEventListener("click", submitBill);
}

// Pricing Logic
function fetchPricing(item, quantity, size) {
    const shirtPrices = {
        22: "380", 24: "400", 26: "420", 28: "440", 30: "460",
        32: "480", 34: "500", 36: "520", 38: "540", 40: "560"
    };
    const pantPrices = {
        22: "360", 24: "370", 26: "380", 28: "390", 30: "400", 32: "420",
        34: "440", 36: "460", 38: "480", 40: "500",
        "28/38": "600", "28/40": "650", "30/40": "680", "32/40": "720", "34/40": "750"
    };
    const trackPrices = {
        22: "450", 24: "500", 26: "550", 28: "600", 30: "650",
        32: "700", 34: "750", 36: "800", 38: "850", 40: "900"
    };

    let price = 0;
    if (item === "shirt" && shirtPrices[size]) price = +shirtPrices[size];
    else if (item === "pant" && pantPrices[size]) price = +pantPrices[size];
    else if (item === "tracksuit" && trackPrices[size]) price = +trackPrices[size];
    else return "Invalid item or size";

    return price * quantity;
}

// Add or Update Item
function addItemToCart() {
    const particular = dom.particulars.value.trim().toLowerCase();
    const size = dom.sizeText.value.trim();
    const quantity = Number(dom.quantity.value.trim());

    if (!particular || !size || !quantity) return alert("Please fill all item fields.");

    const total = fetchPricing(particular, quantity, size);
    if (typeof total === "string") return alert(total);

    cartItems.push({ particular, size, quantity, pricePerItem: total / quantity, total });
    renderCartPreview();
    clearInputs(true);
}

function updateCartItem() {
    const particular = dom.particulars.value.trim().toLowerCase();
    const size = dom.sizeText.value.trim();
    const quantity = Number(dom.quantity.value.trim());

    if (!particular || !size || !quantity) return alert("Please fill all item fields.");
    const total = fetchPricing(particular, quantity, size);
    if (typeof total === "string") return alert(total);

    cartItems[itemEditIndex] = { particular, size, quantity, pricePerItem: total / quantity, total };
    itemEditIndex = -1;
    dom.addItemBtn.innerText = "Add Item";
    renderCartPreview();
    clearInputs(true);
}

// Render Cart Preview
function renderCartPreview() {
    dom.cartPreview.innerHTML = "";
    if (cartItems.length === 0) {
        dom.cartPreview.innerHTML = "<p>No items in cart.</p>";
        return;
    }

    cartItems.forEach((item, i) => {
        const div = document.createElement("div");
        div.classList.add("box")
        div.innerHTML = `
            <p>${item.particular} (Size: ${item.size}) × ${item.quantity} = ₹${item.total}</p>
            <div id="btn-container">
                <button onclick="editCartItem(${i})" class="edit-btn">✏️</button>
                <button onclick="removeCartItem(${i})" class="delete-btn">❌</button>
            </div>
        `;
        dom.cartPreview.appendChild(div);
    });

    const total = cartItems.reduce((sum, item) => sum + item.total, 0);
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<p><strong>Total: ₹${total}</strong></p>`;
    dom.cartPreview.appendChild(totalDiv);
}

function removeCartItem(index) {
    cartItems.splice(index, 1);
    renderCartPreview();
}

function editCartItem(index) {
    const item = cartItems[index];
    dom.particulars.value = item.particular;
    dom.sizeText.value = item.size;
    dom.quantity.value = item.quantity;
    dom.addItemBtn.innerText = "Update Item";
    itemEditIndex = index;
}

// Submit Bill
function submitBill() {
    const name = dom.customerName.value.trim();
    if (!name || cartItems.length === 0) {
        alert("Add customer name and at least one item.");
        return;
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
    const bill = {
        name,
        items: [...cartItems],
        timestamp: new Date().toISOString(),
        total: totalAmount
    };

    const bills = JSON.parse(localStorage.getItem("bills")) || [];

    if (editIndex !== -1) {
        bills[editIndex] = bill;
        editIndex = -1;
        dom.submitBtn.innerText = "Submit Bill";
    } else {
        bills.push(bill);
    }

    localStorage.setItem("bills", JSON.stringify(bills));
    cartItems = [];
    renderCartPreview();
    clearInputs();
    renderBillList();
}

// Render Bills
function renderBillList() {
    const bills = JSON.parse(localStorage.getItem("bills")) || [];
    dom.billSection.innerHTML = "";

    bills.forEach((bill, index) => {
        const container = document.createElement("div");
        container.classList.add("container");

        const itemsHTML = bill.items.map(item =>
            `<li>${item.particular} (Size: ${item.size}) × ${item.quantity} = ₹${item.total}</li>`
        ).join("");

        container.innerHTML = `
            <div class="box">
                <p><strong>Name:</strong> ${bill.name}</p>
                <p><strong>Date:</strong> ${new Date(bill.timestamp).toLocaleString()}</p>
                <ul>${itemsHTML}</ul>
                <p><strong>Total:</strong> ₹${bill.total}</p>
                <button onclick="editBill(${index})">✏️ Edit</button>
                <button onclick="deleteBill(${index})">🗑 Delete</button>
            </div>
        `;
        dom.billSection.appendChild(container);
    });
}

// Edit/Delete Bill
function editBill(index) {
    const bills = JSON.parse(localStorage.getItem("bills")) || [];
    const bill = bills[index];
    dom.customerName.value = bill.name;
    cartItems = [...bill.items];
    renderCartPreview();
    editIndex = index;
    dom.submitBtn.innerText = "Update Bill";
}

function deleteBill(index) {
    const bills = JSON.parse(localStorage.getItem("bills")) || [];
    bills.splice(index, 1);
    localStorage.setItem("bills", JSON.stringify(bills));
    renderBillList();
}

// Input Handling
function clearInputs(skipName = false) {
    dom.particulars.value = "";
    dom.sizeText.value = "";
    dom.quantity.value = "";
    if (!skipName) dom.customerName.value = "";
    dom.addItemBtn.innerText = "Add Item";
}

// Init
function init() {
    addEvents();
    // renderBillList();
    renderCartPreview();
    console.log("Billing system ready.");
}

document.addEventListener("DOMContentLoaded", init);
