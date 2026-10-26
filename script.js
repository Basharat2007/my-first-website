const needs = [
  {
    id: 1,
    home: "Anand Elder Care Home",
    item: "Blood pressure monitors",
    category: "Medical",
    priority: "High",
    quantity: 12,
    pledged: 8,
    reason: "Daily checkups require additional monitors for bedridden residents."
  },
  {
    id: 2,
    home: "Shanti Nivas Old-Age Home",
    item: "Rice bags",
    category: "Food",
    priority: "Medium",
    quantity: 30,
    pledged: 18,
    reason: "Monthly kitchen stock is below the minimum level for 64 residents."
  },
  {
    id: 3,
    home: "Silver Years Foundation",
    item: "Adult diapers",
    category: "Hygiene",
    priority: "High",
    quantity: 100,
    pledged: 62,
    reason: "Required for residents with long-term mobility and health issues."
  },
  {
    id: 4,
    home: "Karuna Senior Shelter",
    item: "Warm blankets",
    category: "Comfort",
    priority: "Low",
    quantity: 40,
    pledged: 15,
    reason: "Needed before winter for new residents and emergency beds."
  }
];

const ledgerEntries = [
  {
    home: "Anand Elder Care Home",
    resource: "4 BP monitors",
    received: "12 Sep 2026",
    usedFor: "Morning and evening health checks",
    proof: "Photo + nurse note"
  },
  {
    home: "Silver Years Foundation",
    resource: "38 adult diapers",
    received: "10 Sep 2026",
    usedFor: "Resident hygiene care",
    proof: "Inventory receipt"
  },
  {
    home: "Shanti Nivas Old-Age Home",
    resource: "12 rice bags",
    received: "8 Sep 2026",
    usedFor: "Kitchen stock for September",
    proof: "Kitchen register"
  }
];

const donations = [
  {
    donor: "Asha R.",
    item: "Adult diapers",
    home: "Silver Years Foundation",
    quantity: 38,
    status: "Delivered and verified"
  },
  {
    donor: "Vikram S.",
    item: "Rice bags",
    home: "Shanti Nivas Old-Age Home",
    quantity: 12,
    status: "In transit"
  },
  {
    donor: "Meera Trust",
    item: "Blood pressure monitors",
    home: "Anand Elder Care Home",
    quantity: 4,
    status: "Pledged"
  }
];

const needsGrid = document.querySelector("#needsGrid");
const categoryFilter = document.querySelector("#categoryFilter");
const priorityFilter = document.querySelector("#priorityFilter");
const searchInput = document.querySelector("#searchInput");
const timeline = document.querySelector("#timeline");
const ledgerBody = document.querySelector("#ledgerBody");
const donationDialog = document.querySelector("#donationDialog");
const donationForm = document.querySelector("#donationForm");
const donationMessage = document.querySelector("#donationMessage");
const dialogTitle = document.querySelector("#dialogTitle");
const needIdInput = document.querySelector("#needIdInput");
const donationQuantity = document.querySelector("#donationQuantity");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const needForm = document.querySelector("#needForm");
const formMessage = document.querySelector("#formMessage");

const SUBMIT_LOGIN_ID = "admin";
const SUBMIT_PASSWORD = "NeedLink@123";
let isSubmitterAuthenticated = false;

function remainingQuantity(need) {
  return Math.max(need.quantity - need.pledged, 0);
}

function renderMetrics() {
  const fulfilled = needs.filter((need) => remainingQuantity(need) === 0).length + 8;
  const homes = new Set(needs.map((need) => need.home)).size + 12;
  const prevented = needs.reduce((total, need) => total + Math.max(need.pledged - need.quantity, 0), 0) + 26;

  document.querySelector("#metricFulfilled").textContent = fulfilled;
  document.querySelector("#metricHomes").textContent = homes;
  document.querySelector("#metricPrevented").textContent = prevented;
}

function renderNeeds() {
  const selectedCategory = categoryFilter.value;
  const selectedPriority = priorityFilter.value;
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredNeeds = needs.filter((need) => {
    const matchesCategory = selectedCategory === "all" || need.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || need.priority === selectedPriority;
    const matchesSearch = `${need.home} ${need.item}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesPriority && matchesSearch;
  });

  if (filteredNeeds.length === 0) {
    needsGrid.innerHTML = '<div class="empty-state">No matching verified needs found.</div>';
    return;
  }

  needsGrid.innerHTML = filteredNeeds.map((need) => {
    const remaining = remainingQuantity(need);
    const percentage = Math.min((need.pledged / need.quantity) * 100, 100);
    const disabled = remaining === 0 ? "disabled" : "";
    const buttonText = remaining === 0 ? "Fulfilled" : "Donate";

    return `
      <article class="need-card">
        <div class="need-top">
          <div>
            <h3>${need.item}</h3>
            <p class="need-home">${need.home}</p>
          </div>
          <span class="pill ${need.priority}">${need.priority}</span>
        </div>
        <p class="need-reason">${need.reason}</p>
        <div>
          <div class="progress-label">
            <span>${need.pledged} pledged</span>
            <span>${remaining} left</span>
          </div>
          <div class="progress-track" aria-label="${percentage.toFixed(0)} percent fulfilled">
            <div class="progress-fill" style="width: ${percentage}%"></div>
          </div>
        </div>
        <div class="card-actions">
          <span class="verified">Verified requirement</span>
          <button class="donate-btn" type="button" data-need-id="${need.id}" ${disabled}>${buttonText}</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderTimeline() {
  timeline.innerHTML = donations.map((donation) => `
    <article class="timeline-item">
      <span class="timeline-dot"></span>
      <div>
        <strong>${donation.status}</strong>
        <p>${donation.donor} pledged ${donation.quantity} ${donation.item} for ${donation.home}.</p>
      </div>
    </article>
  `).join("");
}

function renderLedger() {
  ledgerBody.innerHTML = ledgerEntries.map((entry) => `
    <tr>
      <td>${entry.home}</td>
      <td>${entry.resource}</td>
      <td>${entry.received}</td>
      <td>${entry.usedFor}</td>
      <td><span class="proof">${entry.proof}</span></td>
    </tr>
  `).join("");
}

function openDonationDialog(needId) {
  const need = needs.find((item) => item.id === Number(needId));
  if (!need) {
    return;
  }

  const remaining = remainingQuantity(need);
  dialogTitle.textContent = `Donate ${need.item}`;
  needIdInput.value = need.id;
  donationQuantity.value = "";
  donationQuantity.max = remaining;
  donationQuantity.placeholder = `Up to ${remaining}`;
  donationMessage.textContent = "";
  donationDialog.showModal();
}

function handleDonationSubmit(event) {
  event.preventDefault();
  const formData = new FormData(donationForm);
  const need = needs.find((item) => item.id === Number(formData.get("needId")));
  const quantity = Number(formData.get("quantity"));
  const donor = formData.get("donor").toString().trim();
  const note = formData.get("note").toString().trim();

  if (!need || !donor || !note || quantity < 1) {
    donationMessage.textContent = "Please complete all donation details.";
    return;
  }

  const remaining = remainingQuantity(need);
  if (quantity > remaining) {
    donationMessage.textContent = `Only ${remaining} required. Extra donation prevented.`;
    return;
  }

  need.pledged += quantity;
  donations.unshift({
    donor,
    item: need.item,
    home: need.home,
    quantity,
    status: "Pledged"
  });

  donationForm.reset();
  donationDialog.close();
  renderAll();
}

function handleNeedSubmit(event) {
  event.preventDefault();

  if (!isSubmitterAuthenticated) {
    return;
  }

  const formData = new FormData(needForm);
  const quantity = Number(formData.get("quantity"));

  needs.unshift({
    id: Date.now(),
    home: formData.get("home").toString().trim(),
    item: formData.get("item").toString().trim(),
    category: formData.get("category").toString(),
    priority: formData.get("priority").toString(),
    quantity,
    pledged: 0,
    reason: formData.get("reason").toString().trim()
  });

  needForm.reset();
  formMessage.textContent = "Need added as verified for this demo.";
  renderAll();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const loginId = formData.get("loginId").toString().trim();
  const password = formData.get("password").toString();

  if (loginId !== SUBMIT_LOGIN_ID || password !== SUBMIT_PASSWORD) {
    loginMessage.textContent = "Incorrect login ID or password.";
    return;
  }

  isSubmitterAuthenticated = true;
  loginForm.hidden = true;
  needForm.hidden = false;
  loginForm.reset();
  formMessage.textContent = "Login successful. You can now submit a verified need.";
}

function renderAll() {
  renderMetrics();
  renderNeeds();
  renderTimeline();
  renderLedger();
}

needsGrid.addEventListener("click", (event) => {
  const donateButton = event.target.closest("[data-need-id]");
  if (donateButton) {
    openDonationDialog(donateButton.dataset.needId);
  }
});

categoryFilter.addEventListener("change", renderNeeds);
priorityFilter.addEventListener("change", renderNeeds);
searchInput.addEventListener("input", renderNeeds);
donationForm.addEventListener("submit", handleDonationSubmit);
loginForm.addEventListener("submit", handleLoginSubmit);
needForm.addEventListener("submit", handleNeedSubmit);

renderAll();
