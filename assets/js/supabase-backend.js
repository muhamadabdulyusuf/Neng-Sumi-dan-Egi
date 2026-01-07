import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* =============================
   SUPABASE CONFIG (PUNYA LO)
============================= */
const supabase = createClient(
  "https://oqapxoysxtacvbongoxc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYXB4b3lzeHRhY3Zib25nb3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzI3OTMsImV4cCI6MjA4Mjc0ODc5M30.vTOW02O6DAVZeaOpJ2fOAEXloyI1MhGCbE-Z_iuUASg"
);

/* =============================
   SLUG HANDLER
============================= */
function getGuestSlug() {
  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return path || null;
}

function slugToName(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const guestSlug = getGuestSlug();
const guestName = guestSlug ? slugToName(guestSlug) : "";

function renderGuestbook(data) {
  const list = document.getElementById("guestbook-list");
  if (!list) return;

  list.innerHTML = "";

  data.forEach((item) => {
    const likes = item.guestbook_likes?.length || 0;
    const replies = item.guestbook_replies || [];

    list.innerHTML += `
      <div class="guestbook-card ${
        item.name?.toLowerCase().trim() === guestName.toLowerCase().trim()
          ? "me"
          : ""
      }">

        <div class="guestbook-header">
          <div class="guestbook-name">${item.name}</div>
          <div class="guestbook-date">
            ${new Date(item.created_at).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div class="guestbook-message">
          ${item.message}
        </div>

        <div class="guestbook-actions">
          <button class="gb-action" onclick="likeGuestbook('${item.id}')">
            ❤️ <span>${likes}</span>
          </button>

          <button class="gb-action" onclick="toggleReplyForm('${item.id}')">
            💬 <span>${replies.length}</span>
          </button>
        </div>

        <div class="guestbook-replies">
          ${replies
            .map(
              (r) => `
            <div class="guestbook-reply">
              <div class="reply-name">${r.name}</div>
              <div class="reply-message">${r.message}</div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="reply-form d-none" id="reply-${item.id}">
          <input type="text" placeholder="Nama" class="form-control mb-1" id="reply-name-${
            item.id
          }">
          <textarea placeholder="Balasan..." class="form-control mb-1" id="reply-msg-${
            item.id
          }"></textarea>
          <button class="btn btn-sm btn-outline-primary w-100"
            onclick="submitReply('${item.id}')">Kirim Balasan</button>
        </div>
      </div>
    `;
  });
}

/* =============================
   LOAD GUESTBOOK
============================= */
window.loadGuestbook = async function () {
  const { data, error } = await supabase
    .from("guestbook")
    .select(
      `
      id,
      name,
      message,
      created_at,
      guestbook_likes(id),
      guestbook_replies(
        id,
        name,
        message,
        created_at
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  renderGuestbook(data);
};

/* =============================
   LIKE
============================= */
window.likeGuestbook = async function (messageId) {
  await supabase.from("guestbook_likes").insert({ message_id: messageId });

  loadGuestbook();
};

/* =============================
   REPLY
============================= */
window.replyGuestbook = async function (messageId, name, message) {
  const { error } = await supabase.from("guestbook_replies").insert({
    message_id: messageId,
    name,
    message,
  });

  if (error) {
    console.error(error);
    alert("Gagal balas");
    return;
  }

  loadGuestbook();
};

/* =============================
   RSVP
============================= */
window.submitRSVP = async function (attend) {
  const people = document.getElementById("rsvp-people")?.value || 1;

  const { error } = await supabase.from("rsvp").insert({
    name: guestName || "Guest",
    attend,
    people,
  });

  if (error) {
    console.error(error);
    alert("RSVP gagal");
    return;
  }

  alert("RSVP terkirim");
};


/* =============================
   INIT AUTO LOAD
============================= */
document.addEventListener("DOMContentLoaded", () => {
  // 1. TAMPILKAN NAMA TAMU DARI SLUG
  document.querySelectorAll("[data-guest-name]").forEach((el) => {
    el.innerText = guestName || "Tamu Undangan";
  });

  // 2. AUTO ISI INPUT NAMA
  const nameInput = document.getElementById("guestbook-name");
  if (nameInput && guestName) {
    nameInput.value = guestName;
  }

  loadGuestbook();

  document
    .getElementById("guestbook-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const rsvp = document.querySelector('input[name="rsvp"]:checked');
      if (!rsvp) {
        alert("Mohon pilih kehadiran terlebih dahulu");
        return;
      }

      const attend = rsvp.value === "true";
      const name =
        guestName || document.getElementById("guestbook-name").value.trim();
      const message = document.getElementById("guestbook-message").value.trim();

      if (!name || !message) {
        alert("Nama dan ucapan harus diisi");
        return;
      }

      // INSERT RSVP
      const { error: rsvpError } = await supabase.from("rsvp").insert({
        name,
        attend,
        people: 1,
      });

      if (rsvpError) {
        console.error(rsvpError);
        alert("Gagal kirim RSVP");
        return;
      }

      // INSERT GUESTBOOK
      const { error: gbError } = await supabase.from("guestbook").insert({
        name,
        message,
      });

      if (gbError) {
        console.error(gbError);
        alert("Gagal kirim ucapan");
        return;
      }

      alert("Terima kasih atas ucapan & konfirmasinya 🙏");
      e.target.reset();

      await loadGuestbook(); // pastikan render selesai
      setTimeout(() => {
        document.querySelector(".guestbook-card.me")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500);
    });
});

/* =============================
   TOGGLE REPLY FORM
============================= */
window.toggleReplyForm = function (id) {
  const el = document.getElementById(`reply-${id}`);
  if (!el) return;
  el.classList.toggle("d-none");
};

/* =============================
   SUBMIT REPLY
============================= */
window.submitReply = async function (messageId) {
  const nameInput = document.getElementById(`reply-name-${messageId}`);
  const msgInput = document.getElementById(`reply-msg-${messageId}`);

  if (!nameInput || !msgInput) return;

  const name = nameInput.value.trim();
  const message = msgInput.value.trim();

  if (!name || !message) {
    alert("Nama dan balasan wajib diisi");
    return;
  }

  const { error } = await supabase.from("guestbook_replies").insert({
    message_id: messageId,
    name,
    message,
  });

  if (error) {
    console.error(error);
    alert("Gagal mengirim balasan");
    return;
  }

  // reset input
  nameInput.value = "";
  msgInput.value = "";

  loadGuestbook();
};
