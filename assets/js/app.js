// app.js – Main Application Logic for Courts After Dark
// -------------------------------------------------------------
// Uses Storage helper and UI utilities.
// Handles facility seeding, discovery, availability, booking workflow,
// dashboard, history, result, settings, and staff demo facilities management.

(function () {
  // ----- Helper Selectors -----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const getQueryParam = (name) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  };

  // Safe image error handler utility
  const attachImageFallback = (img) => {
    if (!img) return;
    img.onerror = () => {
      if (!img.dataset.fallbackAttempted) {
        img.dataset.fallbackAttempted = 'true';
        img.src = 'assets/images/placeholder.png';
      }
    };
  };

  // ----- 1. Facility Data Seeding & Migration -----
  const seedFacilities = () => {
    const existing = Storage.getFacilities();
    const defaultFacilities = [
      {
        id: 'fac1',
        name: 'Main Basketball Court',
        category: 'Basketball',
        description: 'Indoor hardwood court with professional hoops and glass backboards.',
        image: 'assets/images/basketball.jpg',
        status: 'Available',
      },
      {
        id: 'fac2',
        name: 'Badminton Hall',
        category: 'Badminton',
        description: 'Well-ventilated three-court hall with tournament-grade net systems.',
        image: 'assets/images/badminton.jpg',
        status: 'Available',
      },
      {
        id: 'fac3',
        name: 'University Football Field',
        category: 'Football',
        description: 'Full-size synthetic turf pitch equipped with high-intensity floodlights.',
        image: 'assets/images/football.jpg',
        status: 'Available',
      },
      {
        id: 'fac4',
        name: 'Volleyball Court',
        category: 'Volleyball',
        description: 'Indoor regulation court with boundary markings and impact cushioning.',
        image: 'assets/images/volleyball.jpg',
        status: 'Available',
      },
      {
        id: 'fac5',
        name: 'Table Tennis Room',
        category: 'Table Tennis',
        description: 'Four ITTF-approved professional tables with barriers and non-slip flooring.',
        image: 'assets/images/table-tennis.jpg',
        status: 'Available',
      },
      {
        id: 'fac6',
        name: 'Outdoor Tennis Courts',
        category: 'Tennis',
        description: 'Two competition hard courts surrounded by perimeter fencing and night lighting.',
        image: 'assets/images/tennis.jpg',
        status: 'Available',
      },
    ];

    if (!existing || existing.length === 0) {
      Storage.setFacilities(defaultFacilities);
    } else {
      // Auto-migrate legacy image names if stored previously
      let modified = false;
      existing.forEach((f) => {
        if (f.image && f.image.includes('facility-')) {
          f.image = f.image.replace('facility-tabletennis.jpg', 'table-tennis.jpg')
                           .replace('facility-basketball.jpg', 'basketball.jpg')
                           .replace('facility-badminton.jpg', 'badminton.jpg')
                           .replace('facility-football.jpg', 'football.jpg')
                           .replace('facility-volleyball.jpg', 'volleyball.jpg')
                           .replace('facility-tennis.jpg', 'tennis.jpg');
          modified = true;
        }
        if (!f.status) {
          f.status = 'Available';
          modified = true;
        }
      });
      if (modified) {
        Storage.setFacilities(existing);
      }
    }
  };

  // ----- 2. Explore Page (Catalogue, Search, Chips) -----
  const initExplore = () => {
    const grid = $('#facilityGrid');
    const emptyState = $('#emptyState');
    if (!grid) return;

    const render = (list) => {
      grid.innerHTML = '';
      if (!list || list.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
      }
      if (emptyState) emptyState.style.display = 'none';

      list.forEach((fac) => {
        const card = document.createElement('div');
        card.className = 'facility-card';
        card.innerHTML = `
          <img src="${fac.image}" alt="${fac.name}" class="facility-thumb" />
          <div class="facility-card-body">
            <div>
              <span class="facility-category">${fac.category}</span>
              <h3>${fac.name}</h3>
              <p class="facility-desc">${fac.description}</p>
            </div>
            <a href="facility-details.html?id=${fac.id}" class="button primary">View Details &amp; Book</a>
          </div>
        `;
        attachImageFallback(card.querySelector('img'));
        grid.appendChild(card);
      });
    };

    const allFacilities = Storage.getFacilities();
    render(allFacilities);

    // Search input
    const searchInput = $('#searchInput');
    const chips = $$('#categoryFilters .filter-chip');

    const applySearchAndFilter = () => {
      const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const activeChips = chips.filter((c) => c.classList.contains('active') && !c.classList.contains('clear'));
      const activeCategories = activeChips.map((c) => c.dataset.category);

      const filtered = allFacilities.filter((f) => {
        const matchesTerm = !term || f.name.toLowerCase().includes(term) || f.category.toLowerCase().includes(term);
        const matchesCategory = activeCategories.length === 0 || activeCategories.includes(f.category);
        return matchesTerm && matchesCategory;
      });

      render(filtered);
    };

    if (searchInput) {
      searchInput.addEventListener('input', applySearchAndFilter);
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (chip.classList.contains('clear')) {
          chips.forEach((c) => c.classList.remove('active'));
          if (searchInput) searchInput.value = '';
          render(allFacilities);
          return;
        }
        chip.classList.toggle('active');
        applySearchAndFilter();
      });
    });
  };

  // ----- 3. Facility Details (Date, Availability, Slot Selection) -----
  const initFacilityDetails = () => {
    const detailsContainer = $('#facilityDetails');
    if (!detailsContainer) return;

    const facId = getQueryParam('id');
    const facility = Storage.getFacilities().find((f) => f.id === facId);

    // Handle invalid facility ID gracefully (Test S12)
    if (!facility) {
      detailsContainer.innerHTML = `
        <div class="card" style="text-align:center; padding:3rem 1.5rem;">
          <h2>Facility Not Found</h2>
          <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
            The sports facility you requested could not be found or has been removed.
          </p>
          <a href="explore.html" class="button primary">Back to Facilities Catalogue</a>
        </div>
      `;
      return;
    }

    // Populate static information
    const nameEl = $('#facilityName');
    const descEl = $('#facilityDescription');
    const catEl = $('#facilityCategory');
    const imgEl = $('#facilityImage');

    if (nameEl) nameEl.textContent = facility.name;
    if (descEl) descEl.textContent = facility.description;
    if (catEl) catEl.textContent = facility.category;
    if (imgEl) {
      imgEl.src = facility.image;
      attachImageFallback(imgEl);
    }

    const dateInput = $('#bookingDate');
    const slotGrid = $('#timeSlotGrid');
    const continueBtn = $('#continueButton');
    if (!dateInput || !slotGrid || !continueBtn) return;

    // Prevent past dates (Test S13)
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', todayStr);
    dateInput.value = todayStr;

    // Generate hourly slots (08:00 - 22:00) with simulated availability and double-booking protection
    const renderSlotsForDate = (selectedDate) => {
      slotGrid.innerHTML = '';
      continueBtn.disabled = true;

      // Existing bookings on this date for this facility
      const existingBookings = Storage.getBookings().filter(
        (b) => b.facilityId === facId && b.date === selectedDate && b.status !== 'canceled'
      );
      const bookedSlots = existingBookings.map((b) => b.timeSlot);

      const slots = [];
      for (let h = 8; h <= 21; h++) {
        const hour = h.toString().padStart(2, '0');
        slots.push(`${hour}:00`);
      }

      // Hardcoded lunch / maintenance slots for demo
      const maintenanceSlots = ['16:00'];
      const unavailableSlots = ['12:00', '13:00'];

      slots.forEach((time) => {
        let isAvailable = true;
        let label = time;

        if (maintenanceSlots.includes(time)) {
          isAvailable = false;
          label = `${time} (Maint.)`;
        } else if (unavailableSlots.includes(time) || bookedSlots.includes(time)) {
          isAvailable = false;
          label = `${time} (Booked)`;
        }

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `time-slot-btn ${isAvailable ? '' : 'disabled'}`;
        btn.textContent = label;
        btn.disabled = !isAvailable;
        btn.dataset.time = time;

        if (isAvailable) {
          btn.addEventListener('click', () => {
            $$('.time-slot-btn').forEach((b) => b.classList.remove('selected'));
            btn.classList.add('selected');
            continueBtn.disabled = false;

            // Persist draft in sessionStorage
            const draft = {
              facilityId: facId,
              date: selectedDate,
              time: time,
            };
            sessionStorage.setItem('bookingDraft', JSON.stringify(draft));
          });
        }

        slotGrid.appendChild(btn);
      });
    };

    // Initial render for default date
    renderSlotsForDate(todayStr);

    dateInput.addEventListener('change', () => {
      if (dateInput.value < todayStr) {
        dateInput.value = todayStr;
        UI.showToast('Past dates cannot be selected.', 'warning');
      }
      renderSlotsForDate(dateInput.value);
    });

    continueBtn.addEventListener('click', () => {
      window.location.href = 'booking-review.html';
    });
  };

  // ----- 4. Booking Review (Draft Display & Submission) -----
  const initBookingReview = () => {
    const reviewSection = $('#bookingReview');
    if (!reviewSection) return;

    const draftStr = sessionStorage.getItem('bookingDraft');
    if (!draftStr) {
      UI.showToast('No booking selection found. Please select a facility first.', 'error');
      setTimeout(() => {
        window.location.href = 'explore.html';
      }, 1200);
      return;
    }

    let draft;
    try {
      draft = JSON.parse(draftStr);
    } catch (e) {
      sessionStorage.removeItem('bookingDraft');
      window.location.href = 'explore.html';
      return;
    }

    const facility = Storage.getFacilities().find((f) => f.id === draft.facilityId);
    if (!facility) {
      UI.showToast('Selected facility is no longer available.', 'error');
      window.location.href = 'explore.html';
      return;
    }

    const facEl = $('#summaryFacility');
    const dtEl = $('#summaryDateTime');
    if (facEl) facEl.textContent = facility.name;
    if (dtEl) dtEl.textContent = `${draft.date} at ${draft.time}`;

    const ack1 = $('#ack1');
    const ack2 = $('#ack2');
    const submitBtn = $('#submitButton');
    const editBtn = $('#editButton');

    const updateSubmitState = () => {
      if (submitBtn) {
        submitBtn.disabled = !(ack1 && ack1.checked && ack2 && ack2.checked);
      }
    };

    if (ack1) ack1.addEventListener('change', updateSubmitState);
    if (ack2) ack2.addEventListener('change', updateSubmitState);

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        window.location.href = `facility-details.html?id=${draft.facilityId}`;
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const user = Storage.getCurrentUser();
        if (!user) {
          UI.showToast('Please login to finalize your booking demo.', 'error');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1200);
          return;
        }

        const bookingId = `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newBooking = {
          id: bookingId,
          userEmail: user,
          facilityId: draft.facilityId,
          date: draft.date,
          timeSlot: draft.time,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const bookings = Storage.getBookings();
        bookings.push(newBooking);
        Storage.setBookings(bookings);
        sessionStorage.removeItem('bookingDraft');

        UI.showToast('Demo booking request submitted!', 'success');
        setTimeout(() => {
          window.location.href = `booking-success.html?id=${bookingId}`;
        }, 600);
      });
    }
  };

  // ----- 5. Booking Success -----
  const initBookingSuccess = () => {
    const successSection = $('#bookingSuccess');
    if (!successSection) return;

    const bookingId = getQueryParam('id');
    const booking = Storage.getBookings().find((b) => b.id === bookingId);

    if (booking) {
      const facility = Storage.getFacilities().find((f) => f.id === booking.facilityId);
      const facEl = $('#successFacility');
      const dateEl = $('#successDate');
      const timeEl = $('#successTime');

      if (facEl) facEl.textContent = facility ? facility.name : 'University Court';
      if (dateEl) dateEl.textContent = booking.date;
      if (timeEl) timeEl.textContent = booking.timeSlot;
    }
  };

  // ----- 6. Student Dashboard -----
  const initDashboard = () => {
    const dashboardMain = $('.dashboard-content');
    if (!dashboardMain || !$('#userName')) return;

    const userEmail = Storage.getCurrentUser();
    const user = Storage.getUsers().find((u) => u.email === userEmail);
    const userNameEl = $('#userName');
    if (userNameEl) {
      userNameEl.textContent = user?.displayName || userEmail?.split('@')[0] || 'Student';
    }

    const today = new Date().toISOString().split('T')[0];
    const userBookings = Storage.getBookings().filter((b) => b.userEmail === userEmail);
    const upcoming = userBookings.filter((b) => b.date >= today && b.status !== 'canceled');
    const past = userBookings.filter((b) => b.date < today || b.status === 'canceled');

    const upcomingCountEl = $('#upcomingCount');
    const pastCountEl = $('#pastCount');
    if (upcomingCountEl) upcomingCountEl.textContent = upcoming.length;
    if (pastCountEl) pastCountEl.textContent = past.length;

    // Featured facilities
    const featuredGrid = $('#featuredGrid');
    if (featuredGrid) {
      const facilities = Storage.getFacilities().slice(0, 3);
      featuredGrid.innerHTML = '';
      facilities.forEach((fac) => {
        const card = document.createElement('div');
        card.className = 'facility-card';
        card.innerHTML = `
          <img src="${fac.image}" alt="${fac.name}" class="facility-thumb" />
          <div class="facility-card-body">
            <div>
              <span class="facility-category">${fac.category}</span>
              <h3>${fac.name}</h3>
              <p class="facility-desc">${fac.description}</p>
            </div>
            <a href="facility-details.html?id=${fac.id}" class="button primary">View Details</a>
          </div>
        `;
        attachImageFallback(card.querySelector('img'));
        featuredGrid.appendChild(card);
      });
    }
  };

  // ----- 7. My Bookings History & Cancellation -----
  const initHistory = () => {
    const upcomingContainer = $('#upcomingBookings');
    const pastContainer = $('#pastBookings');
    if (!upcomingContainer || !pastContainer) return;

    const today = new Date().toISOString().split('T')[0];
    const userEmail = Storage.getCurrentUser();
    const allBookings = Storage.getBookings();
    const userBookings = allBookings.filter((b) => b.userEmail === userEmail);

    const upcoming = userBookings.filter((b) => b.date >= today && b.status !== 'canceled');
    const past = userBookings.filter((b) => b.date < today || b.status === 'canceled');

    const renderCard = (booking, isUpcoming) => {
      const facility = Storage.getFacilities().find((f) => f.id === booking.facilityId);
      const card = document.createElement('div');
      card.className = 'booking-card';
      card.innerHTML = `
        <div>
          <p class="booking-facility">${facility?.name || 'Sports Venue'}</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time Slot:</strong> ${booking.timeSlot}</p>
          <p style="margin-top:0.5rem;">
            <strong>Status:</strong> <span class="status-badge ${booking.status}">${booking.status}</span>
          </p>
        </div>
        <div class="booking-card-actions">
          <a href="result.html?id=${booking.id}" class="button secondary" style="padding:0.4rem 0.85rem; font-size:0.85rem;">View Details</a>
          ${
            isUpcoming
              ? `<button type="button" class="button secondary cancel-booking-btn" data-id="${booking.id}" style="padding:0.4rem 0.85rem; font-size:0.85rem; color:var(--error); border-color:#fad2d2;">Cancel</button>`
              : ''
          }
        </div>
      `;

      if (isUpcoming) {
        const cancelBtn = card.querySelector('.cancel-booking-btn');
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            UI.openModal({
              title: 'Cancel Booking Request',
              message: `Are you sure you want to cancel your session for ${facility?.name || 'this facility'} on ${booking.date} at ${booking.timeSlot}?`,
              confirmText: 'Yes, Cancel Booking',
              onConfirm: () => {
                const target = allBookings.find((b) => b.id === booking.id);
                if (target) {
                  target.status = 'canceled';
                  Storage.setBookings(allBookings);
                  UI.showToast('Booking request canceled.', 'info');
                  initHistory();
                }
              },
            });
          });
        }
      }

      return card;
    };

    upcomingContainer.innerHTML = '';
    pastContainer.innerHTML = '';

    if (upcoming.length > 0) {
      upcoming.forEach((b) => upcomingContainer.appendChild(renderCard(b, true)));
    } else {
      upcomingContainer.innerHTML = '<p class="empty-state">You have no upcoming booking requests.</p>';
    }

    if (past.length > 0) {
      past.forEach((b) => pastContainer.appendChild(renderCard(b, false)));
    } else {
      pastContainer.innerHTML = '<p class="empty-state">No past booking requests.</p>';
    }
  };

  // ----- 8. Booking Result / Details Page -----
  const initResult = () => {
    const resultPage = $('#bookingResult');
    if (!resultPage) return;

    const bookingId = getQueryParam('id');
    const booking = Storage.getBookings().find((b) => b.id === bookingId);

    if (!booking) {
      resultPage.innerHTML = `
        <div class="card" style="text-align:center; padding:3rem 1.5rem;">
          <h2>Booking Not Found</h2>
          <p style="color:var(--text-secondary); margin-bottom:1.5rem;">
            No booking record matches the specified ID.
          </p>
          <a href="history.html" class="button primary">View All My Bookings</a>
        </div>
      `;
      return;
    }

    const facility = Storage.getFacilities().find((f) => f.id === booking.facilityId);
    const facEl = $('#resultFacility');
    const dateEl = $('#resultDate');
    const timeEl = $('#resultTime');
    const statusEl = $('#resultStatus');
    const cancelBtn = $('#cancelBookingBtn');

    if (facEl) facEl.textContent = facility ? facility.name : 'Sports Facility';
    if (dateEl) dateEl.textContent = booking.date;
    if (timeEl) timeEl.textContent = booking.timeSlot;
    if (statusEl) {
      statusEl.textContent = booking.status;
      statusEl.className = `status-badge ${booking.status}`;
    }

    if (cancelBtn) {
      if (booking.status === 'canceled') {
        cancelBtn.style.display = 'none';
      } else {
        cancelBtn.addEventListener('click', () => {
          UI.openModal({
            title: 'Cancel Booking',
            message: `Are you sure you want to cancel this booking for ${booking.date} at ${booking.timeSlot}?`,
            confirmText: 'Yes, Cancel',
            onConfirm: () => {
              booking.status = 'canceled';
              Storage.setBookings(Storage.getBookings());
              UI.showToast('Booking canceled successfully.', 'info');
              initResult();
            },
          });
        });
      }
    }
  };

  // ----- 9. Settings / Profile Page -----
  const initSettings = () => {
    const form = $('#settingsForm');
    if (!form) return;

    const userEmail = Storage.getCurrentUser();
    const users = Storage.getUsers();
    const user = users.find((u) => u.email === userEmail);

    const nameInput = $('#displayName');
    const emailInput = $('#email');

    if (userEmail && emailInput) emailInput.value = userEmail;
    if (user && nameInput) nameInput.value = user.displayName || '';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = nameInput ? nameInput.value.trim() : '';
      if (!newName) {
        UI.showToast('Display name cannot be empty.', 'error');
        return;
      }

      if (user) {
        user.displayName = newName;
        Storage.setUsers(users);
        UI.showToast('Profile settings saved successfully.', 'success');
      } else if (userEmail) {
        users.push({ email: userEmail, displayName: newName });
        Storage.setUsers(users);
        UI.showToast('Profile settings saved successfully.', 'success');
      }
    });
  };

  // ----- 10. Staff Demo: Complete Facility Management (Add / Edit / Delete) -----
  const initStaffAndFacilities = () => {
    const container = $('#facilityListContainer');
    const addBtn = $('#addFacilityBtn');
    if (!container) return;

    const renderFacilityTable = () => {
      const facilities = Storage.getFacilities();
      container.innerHTML = '';

      if (!facilities || facilities.length === 0) {
        container.innerHTML = '<p class="empty-state">No facilities registered in the system.</p>';
        return;
      }

      const tableWrapper = document.createElement('div');
      tableWrapper.className = 'table-responsive';
      tableWrapper.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${facilities
              .map(
                (f) => `
              <tr>
                <td style="width:70px;">
                  <img src="${f.image}" alt="${f.name}" style="width:60px; height:42px; object-fit:cover; border-radius:6px;" onerror="this.src='assets/images/placeholder.png';"/>
                </td>
                <td><strong>${f.name}</strong><br/><small style="color:var(--text-secondary);">${f.description.substring(0, 50)}...</small></td>
                <td>${f.category}</td>
                <td><span class="badge ${f.status === 'Available' ? 'success' : f.status === 'Under Maintenance' ? 'warning' : 'error'}">${f.status || 'Available'}</span></td>
                <td>
                  <div class="table-actions">
                    <button type="button" class="button secondary edit-facility-btn" data-id="${f.id}" style="padding:0.35rem 0.75rem; font-size:0.85rem;">Edit</button>
                    <button type="button" class="button secondary delete-facility-btn" data-id="${f.id}" style="padding:0.35rem 0.75rem; font-size:0.85rem; color:var(--error); border-color:#fad2d2;">Delete</button>
                  </div>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;

      container.appendChild(tableWrapper);

      // Wire up Edit buttons
      $$('.edit-facility-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const fid = btn.dataset.id;
          const target = facilities.find((f) => f.id === fid);
          if (target) openFacilityModal('Edit Facility', target);
        });
      });

      // Wire up Delete buttons (Test S24: blocked when bookings exist)
      $$('.delete-facility-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const fid = btn.dataset.id;
          const hasBookings = Storage.getBookings().some(
            (b) => b.facilityId === fid && b.status !== 'canceled'
          );

          if (hasBookings) {
            UI.showToast('Cannot delete facility with existing active bookings.', 'warning');
            return;
          }

          UI.openModal({
            title: 'Delete Facility',
            message: 'Are you sure you want to permanently delete this facility from the catalogue?',
            confirmText: 'Yes, Delete',
            onConfirm: () => {
              const updated = Storage.getFacilities().filter((f) => f.id !== fid);
              Storage.setFacilities(updated);
              UI.showToast('Facility deleted successfully.', 'info');
              renderFacilityTable();
            },
          });
        });
      });
    };

    // Modal Form for Add & Edit
    const openFacilityModal = (modalTitle, existingData = null) => {
      const isEdit = !!existingData;
      const sports = ['Basketball', 'Badminton', 'Football', 'Volleyball', 'Table Tennis', 'Tennis'];
      const statuses = ['Available', 'Under Maintenance', 'Fully Booked'];
      const images = [
        'assets/images/basketball.jpg',
        'assets/images/badminton.jpg',
        'assets/images/football.jpg',
        'assets/images/volleyball.jpg',
        'assets/images/table-tennis.jpg',
        'assets/images/tennis.jpg',
        'assets/images/placeholder.png',
      ];

      const bodyHtml = `
        <form id="facilityModalForm" style="display:flex; flex-direction:column; gap:0.75rem;">
          <div>
            <label for="mFacName">Facility Name *</label>
            <input type="text" id="mFacName" value="${existingData?.name || ''}" placeholder="e.g. West Campus Arena" required />
          </div>
          <div>
            <label for="mFacCat">Category *</label>
            <select id="mFacCat" required>
              ${sports
                .map(
                  (s) =>
                    `<option value="${s}" ${existingData?.category === s ? 'selected' : ''}>${s}</option>`
                )
                .join('')}
            </select>
          </div>
          <div>
            <label for="mFacDesc">Description *</label>
            <textarea id="mFacDesc" rows="3" placeholder="Facility features, equipment, specifications..." required>${existingData?.description || ''}</textarea>
          </div>
          <div>
            <label for="mFacImg">Image Asset *</label>
            <select id="mFacImg" required>
              ${images
                .map(
                  (img) =>
                    `<option value="${img}" ${existingData?.image === img ? 'selected' : ''}>${img.replace('assets/images/', '')}</option>`
                )
                .join('')}
            </select>
          </div>
          <div>
            <label for="mFacStatus">Operational Status</label>
            <select id="mFacStatus">
              ${statuses
                .map(
                  (st) =>
                    `<option value="${st}" ${existingData?.status === st ? 'selected' : ''}>${st}</option>`
                )
                .join('')}
            </select>
          </div>
        </form>
      `;

      UI.openModal({
        title: modalTitle,
        bodyHtml: bodyHtml,
        confirmText: isEdit ? 'Save Changes' : 'Create Facility',
        onConfirm: () => {
          const name = $('#mFacName')?.value.trim();
          const category = $('#mFacCat')?.value;
          const description = $('#mFacDesc')?.value.trim();
          const image = $('#mFacImg')?.value;
          const status = $('#mFacStatus')?.value;

          if (!name || !description) {
            UI.showToast('Please fill out all required fields.', 'error');
            return false; // prevent modal close
          }

          const facilities = Storage.getFacilities();

          if (isEdit) {
            const target = facilities.find((f) => f.id === existingData.id);
            if (target) {
              target.name = name;
              target.category = category;
              target.description = description;
              target.image = image;
              target.status = status;
              Storage.setFacilities(facilities);
              UI.showToast('Facility updated successfully.', 'success');
            }
          } else {
            const newFacility = {
              id: `fac_${Date.now()}`,
              name,
              category,
              description,
              image,
              status,
            };
            facilities.push(newFacility);
            Storage.setFacilities(facilities);
            UI.showToast('New facility added to catalogue!', 'success');
          }

          renderFacilityTable();
          return true;
        },
      });
    };

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openFacilityModal('Add New Sports Facility');
      });
    }

    renderFacilityTable();

    // In staff.html, also render booking overview
    const staffOverview = $('#staffOverview');
    if (staffOverview && window.location.pathname.includes('staff.html')) {
      const allBookings = Storage.getBookings();
      const overviewContainer = document.createElement('div');
      overviewContainer.style.marginTop = '1.5rem';

      if (allBookings.length === 0) {
        overviewContainer.innerHTML = '<p class="empty-state">No demo reservations made yet.</p>';
      } else {
        const facilities = Storage.getFacilities();
        overviewContainer.innerHTML = `
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Student Email</th>
                  <th>Facility</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${allBookings
                  .map((b) => {
                    const fac = facilities.find((f) => f.id === b.facilityId);
                    return `
                    <tr>
                      <td><code>${b.id}</code></td>
                      <td>${b.userEmail}</td>
                      <td>${fac ? fac.name : 'Unknown'}</td>
                      <td>${b.date} @ ${b.timeSlot}</td>
                      <td><span class="badge ${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'canceled'}">${b.status}</span></td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        `;
      }
      staffOverview.appendChild(overviewContainer);
    }
  };

  // ----- Main Page Dispatcher -----
  const run = () => {
    Storage.initDefaults();
    seedFacilities();

    initExplore();
    initFacilityDetails();
    initBookingReview();
    initBookingSuccess();
    initDashboard();
    initHistory();
    initResult();
    initSettings();
    initStaffAndFacilities();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
