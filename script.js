document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchInput = document.getElementById('search');
  const resourcesGrid = document.getElementById('resourcesGrid');
  const eventsGrid = document.getElementById('eventsGrid');

  const openTicketBtn = document.getElementById('openTicketBtn');
  const ticketModal = document.getElementById('ticketModal');
  const backdrop = document.getElementById('backdrop');
  const ticketForm = document.getElementById('ticketForm');
  const viewPendingBtn = document.getElementById('viewPendingBtn');
  const viewHistoryBtn = document.getElementById('viewHistoryBtn');
  const listModal = document.getElementById('listModal');
  const listBody = document.getElementById('listBody');
  const listTitle = document.getElementById('listTitle');

  // Sidebar
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('closeSidebar');

  // Notifications
  const notifBtn = document.getElementById('notifBtn');
  const notifDropdown = document.getElementById('notifDropdown');
  const notifList = document.getElementById('notifList');
  const clearNotifs = document.getElementById('clearNotifs');

  // Mira Chat
  const miraBtn = document.getElementById('miraBtn');
  const miraChat = document.getElementById('miraChat');
  const closeChat = document.getElementById('closeChat');
  const chatForm = document.getElementById('chatForm');
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');

  // Ticket storage
  const loadTickets = () => JSON.parse(localStorage.getItem('mc_tickets') || '[]');
  const saveTickets = arr => localStorage.setItem('mc_tickets', JSON.stringify(arr));

  // Modal helpers
  function showModal(modal) {
    backdrop.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    backdrop.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Open ticket modal
  openTicketBtn.addEventListener('click', () => {
    ticketForm.reset();
    showModal(ticketModal);
  });

  // Close modal buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
  });

  backdrop.addEventListener('click', () => {
    document.querySelectorAll('.modal').forEach(closeModal);
  });

  // Submit Ticket
  ticketForm.addEventListener('submit', e => {
    e.preventDefault();
    const subj = document.getElementById('ticketSubject').value.trim();
    const cat = document.getElementById('ticketCategory').value;
    const desc = document.getElementById('ticketDesc').value.trim();

    if (!subj || !desc) return alert('Please complete subject and description.');

    const tickets = loadTickets();
    tickets.unshift({
      id: Date.now(),
      subject: subj,
      category: cat,
      desc,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    saveTickets(tickets);
    closeModal(ticketModal);
    alert('Ticket submitted — it appears in Pending Tickets.');
  });

  // Render lists
  function renderList(status) {
    const tickets = loadTickets().filter(t => status === 'all' || t.status === status);
    listBody.innerHTML = '';

    if (!tickets.length) {
      listBody.innerHTML = `<p style="color:#666">No ${status} tickets found.</p>`;
      return;
    }

    tickets.forEach(t => {
      const el = document.createElement('div');
      el.className = 'ticket-item';
      el.innerHTML = `
        <h4>${escapeHtml(t.subject)}
          <small style="color:var(--muted);font-weight:600"> — ${escapeHtml(t.category)}</small>
        </h4>
        <div class="ticket-meta">
          <div>${new Date(t.createdAt).toLocaleString()}</div>
          <div style="margin-left:auto;font-weight:700;color:${t.status === 'pending' ? '#b71c1c' : '#2a9d2a'}">${t.status}</div>
        </div>
        <p style="margin-top:8px;color:var(--muted)">${escapeHtml(t.desc)}</p>
        <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
          ${t.status === 'pending' ? `<button data-id="${t.id}" class="btn resolve">Mark Resolved</button>` : ''}
          <button data-id="${t.id}" class="btn delete">Delete</button>
        </div>
      `;
      listBody.appendChild(el);
    });

    listBody.querySelectorAll('.resolve').forEach(btn => {
      btn.addEventListener('click', () => {
        saveTickets(loadTickets().map(t => t.id == btn.dataset.id ? { ...t, status: 'resolved' } : t));
        renderList('pending');
      });
    });

    listBody.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', () => {
        saveTickets(loadTickets().filter(t => t.id != btn.dataset.id));
        renderList('pending');
      });
    });
  }

  // View lists
  viewPendingBtn.addEventListener('click', () => {
    listTitle.textContent = 'Pending Tickets';
    renderList('pending');
    showModal(listModal);
  });

  viewHistoryBtn.addEventListener('click', () => {
    listTitle.textContent = 'Ticket History (resolved)';
    renderList('resolved');
    showModal(listModal);
  });

  // Search
  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    filterGrid(resourcesGrid, q);
    filterGrid(eventsGrid, q);
  });

  function filterGrid(grid, q) {
    Array.from(grid.children).forEach(card => {
      card.style.display = (card.innerText.toLowerCase().includes(q) || !q) ? '' : 'none';
    });
  }

  // Sidebar
  hamburger.addEventListener('click', () => sidebar.setAttribute('aria-hidden', 'false'));
  closeSidebar.addEventListener('click', () => sidebar.setAttribute('aria-hidden', 'true'));

  // Notifications
  notifBtn.addEventListener('click', () => {
    const open = notifDropdown.getAttribute('aria-hidden') === 'false';
    notifDropdown.setAttribute('aria-hidden', open ? 'true' : 'false');
  });

  clearNotifs.addEventListener('click', () => {
    notifList.innerHTML = `
      <li class="notif-item">
        <strong>No new notifications</strong>
        <p style="margin:6px 0 0;color:var(--muted)">You're all caught up.</p>
      </li>`;
    document.querySelector('.notif').style.display = 'none';
  });

  document.addEventListener('click', e => {
    if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
      notifDropdown.setAttribute('aria-hidden', 'true');
    }
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target) && window.innerWidth < 900) {
      sidebar.setAttribute('aria-hidden', 'true');
    }
  });

  // Mira chat
  function appendBot(text) {
    const div = document.createElement('div');
    div.className = 'bot-msg';
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendUser(text) {
    const div = document.createElement('div');
    div.className = 'user-msg';
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  miraBtn.addEventListener('click', () => {
    const open = miraChat.getAttribute('aria-hidden') === 'false';
    miraChat.setAttribute('aria-hidden', open ? 'true' : 'false');
  });

  closeChat.addEventListener('click', () => miraChat.setAttribute('aria-hidden', 'true'));

  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const q = chatInput.value.trim();
    if (!q) return;

    appendUser(q);
    chatInput.value = '';

    const lq = q.toLowerCase();
    setTimeout(() => {
      if (lq.includes('guide') || lq.includes('safety')) {
        appendBot('Opening safety guides...');
        setTimeout(() => location.href = 'guides.html', 800);
      } else if (lq.includes('ticket')) {
        appendBot('Opening ticket form...');
        setTimeout(() => {
          miraChat.setAttribute('aria-hidden', 'true');
          ticketForm.reset();
          showModal(ticketModal);
        }, 700);
      } else if (lq.includes('policy')) {
        appendBot('Opening Policies...');
        setTimeout(() => location.href = 'policies.html', 800);
      } else if (lq.includes('mira') || lq.includes('who are you')) {
        appendBot("I'm Mira — your virtual assistant!");
      } else if (lq.includes('help')) {
        appendBot('Try asking: "Where are safety guides?" or "Open ticket"');
      } else {
        appendBot('Noted! You can also say: "Open ticket" or "Show guides".');
      }
    }, 700);
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  // Init
  document.querySelectorAll('.modal').forEach(closeModal);
  sidebar.setAttribute('aria-hidden', 'true');
  notifDropdown.setAttribute('aria-hidden', 'true');
  miraChat.setAttribute('aria-hidden', 'true');

 
});

// Close hamburger menu when clicking outside of it
document.addEventListener("click", function (event) {
  const sidebar = document.querySelector(".sidebar"); // or your menu element
  const menuButton = document.querySelector(".hamburger"); // your toggle button

  // If sidebar or button doesn’t exist, stop
  if (!sidebar || !menuButton) return;

  // Check if the click is outside both the menu and the button
  const clickedOutside = !sidebar.contains(event.target) && !menuButton.contains(event.target);

  if (clickedOutside && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }
});


