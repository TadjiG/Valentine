const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const card = document.getElementById("card");
const success = document.getElementById("success");
const replayBtn = document.getElementById("replay");

let noCount = 0;
let isDodging = false;
let lastMouse = { x: -9999, y: -9999 };

// Remember original place so we can put the button back
const originalParent = noBtn.parentElement;
const originalNextSibling = noBtn.nextSibling;

// Track mouse so we don’t place the button under the cursor
document.addEventListener("mousemove", (e) => {
  lastMouse = { x: e.clientX, y: e.clientY };
});

function rectsOverlap(a, b) {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}

function pointInRect(x, y, r) {
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function ensureOnBodyAndLockSize() {
  // Lock width/height ONCE so it never changes when switching layout contexts
  if (!noBtn.dataset.locked) {
    const r = noBtn.getBoundingClientRect();
    noBtn.style.width = `${Math.ceil(r.width)}px`;
    noBtn.style.height = `${Math.ceil(r.height)}px`;
    noBtn.dataset.locked = "1";
  }

  // If it’s still inside the card, move it to body (so fixed = viewport fixed)
  if (noBtn.parentElement !== document.body) {
    document.body.appendChild(noBtn);
  }
}

function restoreNoButton() {
  // Put it back where it was in the card
  if (originalNextSibling) {
    originalParent.insertBefore(noBtn, originalNextSibling);
  } else {
    originalParent.appendChild(noBtn);
  }

  // Reset positioning
  noBtn.style.position = "relative";
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.zIndex = "";
}

function dodgeNo() {
  if (isDodging) return;
  isDodging = true;
  setTimeout(() => (isDodging = false), 120);

  noCount++;

  ensureOnBodyAndLockSize();

  noBtn.style.position = "fixed";
  noBtn.style.zIndex = "999999";

  requestAnimationFrame(() => {
    const padding = 12;

    const yesRect = yesBtn.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const btnRect = noBtn.getBoundingClientRect();
    const btnW = btnRect.width || 120;
    const btnH = btnRect.height || 50;

    const vw = window.visualViewport?.width ?? window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;

    const maxLeft = Math.max(0, vw - btnW);
    const maxTop = Math.max(0, vh - btnH);

    let left = padding;
    let top = padding;

    for (let i = 0; i < 200; i++) {
      const rawLeft = Math.random() * maxLeft;
      const rawTop = Math.random() * maxTop;

      left = Math.min(Math.max(rawLeft, padding), Math.max(padding, maxLeft - padding));
      top = Math.min(Math.max(rawTop, padding), Math.max(padding, maxTop - padding));

      const candidate = {
        left,
        top,
        right: left + btnW,
        bottom: top + btnH
      };

      const overlapsYes = rectsOverlap(candidate, yesRect);
      const overlapsCard = rectsOverlap(candidate, cardRect);
      const underMouse = pointInRect(lastMouse.x, lastMouse.y, candidate);

      if (!overlapsYes && !overlapsCard && !underMouse) break;
    }

    noBtn.style.left = `${Math.floor(left)}px`;
    noBtn.style.top = `${Math.floor(top)}px`;

    const scale = 1 + Math.min(noCount * 0.08, 0.8);
    yesBtn.style.transform = `scale(${scale})`;
  });
}

// Hover + click
noBtn.addEventListener("mouseenter", dodgeNo);
noBtn.addEventListener("click", dodgeNo);

// Yes -> success
yesBtn.addEventListener("click", () => {
  card.classList.add("hidden");
  success.classList.remove("hidden");
});

// Replay -> reset
replayBtn.addEventListener("click", () => {
  success.classList.add("hidden");
  card.classList.remove("hidden");

  noCount = 0;
  yesBtn.style.transform = "scale(1)";

  restoreNoButton();
});


