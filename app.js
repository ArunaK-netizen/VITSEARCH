// Faculty data will be loaded from cabins.json
let facultyData = [];
let currentFaculty = [];
let currentPage = 1;
const itemsPerPage = 9;
let searchTimeout = null;

// Department to School mapping
const departmentToSchool = {
  'SELECT': { code: 'SELECT', name: 'School of Electrical Engineering' },
  'VITBS': { code: 'VITBS', name: 'VIT Business School' },
  'SAS': { code: 'SAS', name: 'School of Advanced Sciences' },
  'SSL': { code: 'SSL', name: 'School of Social Sciences and Languages' },
  'SMEC': { code: 'SMEC', name: 'School of Mechanical Engineering' },
  'SCE': { code: 'SCE', name: 'School of Civil Engineering' },
  'VFIT': { code: 'VFIT', name: 'VIT Fashion Institute of Technology' },
  'SENSE': { code: 'SENSE', name: 'School of Electronics Engineering' },
  'VITSOL': { code: 'VITSOL', name: 'VIT School of Law' },
  'SCOPE': { code: 'SCOPE', name: 'School of Computer Science and Engineering' }
};

// Application data structure
const appData = {
  "campus_info": {
    "name": "Vellore Institute of Technology - Chennai Campus",
    "established": 2010,
    "location": "Vandalur-Kelambakkam Road, Chennai-600127, Tamil Nadu, India",
    "phone": "+91 44 3993 1555",
    "fax": "+91-44 3993 2555",
    "email": "admin.chennai@vit.ac.in",
    "area_acres": 192,
    "total_faculty": "300+"
  },
  "academic_blocks": [
    { "name": "Academic Block 1 (AB1)", "floors": 8, "facilities": ["Amphitheater", "Classrooms", "Faculty Cabins", "Labs"] },
    { "name": "Academic Block 2 (AB2)", "floors": 7, "facilities": ["Classrooms", "Faculty Cabins", "Labs", "Offices"] },
    { "name": "Admin Block", "floors": 8, "facilities": ["Administrative Offices", "Dean Offices", "Meeting Rooms"] },
    { "name": "Delta Block", "floors": 4, "facilities": ["Faculty Cabins", "Research Labs", "Offices"] },
    { "name": "Sigma Block", "floors": 4, "facilities": ["Faculty Cabins", "Labs", "Offices"] },
    { "name": "Health Centre", "floors": 3, "facilities": ["Medical Facilities", "Faculty Cabins", "Offices"] }
  ],
  "schools": []
};

// Helper functions
function getDesignationFromName(name) {
  if (name.startsWith('Prof.')) {
    return 'Professor';
  } else if (name.startsWith('Dr.')) {
    return 'Associate Professor';
  } else {
    return 'Assistant Professor';
  }
}

function generateEmail(name) {
  const cleanName = name.replace(/^(Dr\.|Prof\.)\s+/, '').toLowerCase();
  const parts = cleanName.split(' ').filter(part => part.length > 1);
  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return `${firstName}.${lastName}@vit.ac.in`.replace(/[^a-z0-9.@]/g, '');
  }
  return `${cleanName.replace(/\s+/g, '.')}@vit.ac.in`.replace(/[^a-z0-9.@]/g, '');
}

function getDefaultSpecializations(department) {
  const specializationMap = {
    'SELECT': ['Power Systems', 'Control Systems', 'Renewable Energy'],
    'VITBS': ['Management Studies', 'Finance', 'Marketing'],
    'SAS': ['Physics', 'Mathematics', 'Chemistry'],
    'SSL': ['Language Studies', 'Social Sciences', 'Communication'],
    'SMEC': ['Mechanical Engineering', 'Manufacturing', 'Thermal Engineering'],
    'SCE': ['Structural Engineering', 'Environmental Engineering', 'Construction Management'],
    'VFIT': ['Fashion Technology', 'Textile Engineering', 'Design'],
    'SENSE': ['Electronics', 'Signal Processing', 'VLSI Design'],
    'VITSOL': ['Law', 'Legal Studies', 'Jurisprudence'],
    'SCOPE': ['Computer Science', 'Software Engineering', 'Data Science']
  };
  return specializationMap[department] || ['General Studies'];
}

// Process faculty data
function processFacultyData(cabinsData) {
  facultyData = cabinsData.map(faculty => {
    const school = departmentToSchool[faculty.department] || { 
      code: faculty.department, 
      name: faculty.department 
    };
    
    return {
      id: parseInt(faculty.id),
      name: faculty.name,
      designation: getDesignationFromName(faculty.name),
      school: school.code,
      school_name: school.name,
      department: faculty.department,
      email: generateEmail(faculty.name),
      phone: "+91-44-39931000",
      intercom: "1000",
      qualification: "Ph.D",
      cabin_location: faculty.cabin_location,
      specialization: getDefaultSpecializations(faculty.department),
    };
  });
  
  // Set current faculty for filtering/pagination
  currentFaculty = [...facultyData];
  
  console.log('Processed faculty data:', facultyData.length, 'faculty members');
  
  return facultyData;
}

// Generate schools data from faculty data
function generateSchoolsData() {
  const schoolMap = new Map();
  
  facultyData.forEach(faculty => {
    if (!schoolMap.has(faculty.school)) {
      const schoolInfo = departmentToSchool[faculty.school] || { 
        code: faculty.school, 
        name: faculty.school 
      };
      
      schoolMap.set(faculty.school, {
        code: faculty.school,
        name: schoolInfo.name,
        dean: "TBA",
        established: 2010,
        programs: ["B.Tech", "M.Tech", "Ph.D"],
        faculty_count: 0,
        specializations: ["Engineering", "Technology", "Research"]
      });
    }
    
    const school = schoolMap.get(faculty.school);
    school.faculty_count++;
  });
  
  appData.schools = Array.from(schoolMap.values());
  appData.faculty_data = facultyData;
}

// Load data from cabins.json
async function loadFacultyData() {
  try {
    showLoading();
    console.log('Loading faculty data from cabins.json...');
    
    const response = await fetch('./cabins.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const cabinsData = await response.json();
    console.log('Raw cabin data loaded:', cabinsData.length, 'records');
    
    // Process the data
    processFacultyData(cabinsData);
    
    // Generate schools data
    generateSchoolsData();
    
    console.log('Faculty data processed successfully');
    hideLoading();
    
    return facultyData;
  } catch (error) {
    console.error('Error loading cabins.json:', error);
    hideLoading();
    showToast('Error loading faculty data', 'error');
    return [];
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing app...');
  await initializeApp();
});

async function initializeApp() {
  try {
    // Load faculty data FIRST
    await loadFacultyData();
    
    // Only initialize UI after data is loaded
    initializeNavigation();
    initializeHome();
    initializeFacultyDirectory();
    initializeDepartments();
    initializeMap();
    initializeContact();
    initializeModal();
    initializeKeyboardShortcuts();
    
    console.log('App initialized successfully with', facultyData.length, 'faculty members');
  } catch (error) {
    console.error('Error initializing app:', error);
    showToast('Error initializing application', 'error');
  }
}

// Navigation functionality
function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav__link');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = link.dataset.section;
      showSection(sectionId);
      updateActiveNavLink(link);
    });
  });

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  document.addEventListener('click', (e) => {
    if (nav && !nav.contains(e.target) && !menuToggle?.contains(e.target)) {
      nav.classList.remove('active');
    }
  });
}

function showSection(sectionId) {
  const sections = document.querySelectorAll('main section');
  sections.forEach(section => {
    section.classList.add('hidden');
    section.classList.remove('section--active');
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    targetSection.classList.add('section--active');
  }

  const nav = document.querySelector('.nav');
  if (nav) nav.classList.remove('active');
}

function updateActiveNavLink(activeLink) {
  document.querySelectorAll('.nav__link').forEach(link => link.classList.remove('active'));
  if (activeLink) activeLink.classList.add('active');
}

// Home section initialization
function initializeHome() {
  const totalFacultyEl = document.getElementById('total-faculty');
  const totalSchoolsEl = document.getElementById('total-schools');
  const campusAreaEl = document.getElementById('campus-area');

  if (totalFacultyEl) totalFacultyEl.textContent = facultyData.length;
  if (totalSchoolsEl) totalSchoolsEl.textContent = appData.schools.length;
  if (campusAreaEl) campusAreaEl.textContent = appData.campus_info.area_acres;

  const schoolCardsContainer = document.getElementById('school-cards');
  if (schoolCardsContainer) {
    schoolCardsContainer.innerHTML = appData.schools.map(school => `
      <div class="card school-card" tabindex="0" data-school="${school.code}">
        <div class="school-card__header">
          <h4 class="school-card__code">${school.code}</h4>
          <p class="school-card__name">${school.name}</p>
        </div>
        <div class="school-card__body">
          <p><strong>Dean:</strong> ${school.dean || 'TBA'}</p>
          <p><strong>Faculty:</strong> ${school.faculty_count}</p>
          <p><strong>Programs:</strong></p>
          <ul class="school-card__programs">
            ${school.programs.map(program => `<li>${program}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');

    schoolCardsContainer.addEventListener('click', (e) => {
      const schoolCard = e.target.closest('.school-card');
      if (schoolCard) {
        const schoolCode = schoolCard.dataset.school;
        navigateToSchool(schoolCode);
      }
    });
  }
}

function navigateToSchool(schoolCode) {
  showSection('directory');
  updateActiveNavLink(document.querySelector('[data-section="directory"]'));
  setTimeout(() => {
    const schoolFilter = document.getElementById('school-filter');
    if (schoolFilter) {
      schoolFilter.value = schoolCode;
      applyFilters();
    }
  }, 100);
}

// Faculty directory initialization
function initializeFacultyDirectory() {
  populateFilters();
  renderFacultyList();
  setupDirectoryEventHandlers();
}

function populateFilters() {
  const schoolFilter = document.getElementById('school-filter');
  const designationFilter = document.getElementById('designation-filter');
  const departmentFilter = document.getElementById('department-filter');

  if (schoolFilter && facultyData.length > 0) {
    const schools = [...new Set(facultyData.map(f => f.school))].sort();
    schoolFilter.innerHTML = '<option value="">All Schools</option>' + 
      schools.map(school => `<option value="${school}">${school}</option>`).join('');
  }

  if (designationFilter && facultyData.length > 0) {
    const designations = [...new Set(facultyData.map(f => f.designation))].sort();
    designationFilter.innerHTML = '<option value="">All Designations</option>' + 
      designations.map(designation => `<option value="${designation}">${designation}</option>`).join('');
  }

  if (departmentFilter && facultyData.length > 0) {
    const departments = [...new Set(facultyData.map(f => f.department))].sort();
    departmentFilter.innerHTML = '<option value="">All Departments</option>' + 
      departments.map(department => `<option value="${department}">${department}</option>`).join('');
  }
}

function setupDirectoryEventHandlers() {
  const searchInput = document.getElementById('search-input');
  const schoolFilter = document.getElementById('school-filter');
  const designationFilter = document.getElementById('designation-filter');
  const departmentFilter = document.getElementById('department-filter');
  const clearBtn = document.getElementById('clear-btn');
  const exportBtn = document.getElementById('export-btn');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      showLoading();
      searchTimeout = setTimeout(() => {
        applyFilters();
      }, 300);
    });
  }

  if (schoolFilter) schoolFilter.addEventListener('change', applyFilters);
  if (designationFilter) designationFilter.addEventListener('change', applyFilters);
  if (departmentFilter) departmentFilter.addEventListener('change', applyFilters);

  if (clearBtn) clearBtn.addEventListener('click', clearFilters);
  if (exportBtn) exportBtn.addEventListener('click', exportFacultyData);
}

function applyFilters() {
  const searchInput = document.getElementById('search-input');
  const schoolFilter = document.getElementById('school-filter');
  const designationFilter = document.getElementById('designation-filter');
  const departmentFilter = document.getElementById('department-filter');

  const searchTerm = searchInput?.value.toLowerCase().trim() || '';
  const schoolFilterValue = schoolFilter?.value || '';
  const designationFilterValue = designationFilter?.value || '';
  const departmentFilterValue = departmentFilter?.value || '';

  currentFaculty = facultyData.filter(faculty => {
    const matchesSearch = !searchTerm || 
      faculty.name.toLowerCase().includes(searchTerm) ||
      faculty.department.toLowerCase().includes(searchTerm) ||
      faculty.cabin_location.toLowerCase().includes(searchTerm) ||
      faculty.specialization.some(spec => spec.toLowerCase().includes(searchTerm));

    const matchesSchool = !schoolFilterValue || faculty.school === schoolFilterValue;
    const matchesDesignation = !designationFilterValue || faculty.designation === designationFilterValue;
    const matchesDepartment = !departmentFilterValue || faculty.department === departmentFilterValue;

    return matchesSearch && matchesSchool && matchesDesignation && matchesDepartment;
  });

  currentPage = 1;
  hideLoading();
  renderFacultyList();
  renderPagination();
}

function renderFacultyList() {
  const facultyList = document.getElementById('faculty-list');
  if (!facultyList) return;

  console.log('Rendering faculty list with', currentFaculty.length, 'faculty members');

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFaculty = currentFaculty.slice(startIndex, endIndex);

  if (currentFaculty.length === 0) {
    facultyList.innerHTML = `
      <div class="no-results">
        <h3>No faculty found</h3>
        <p>Try adjusting your search criteria or filters.</p>
        <p><small>Total faculty in database: ${facultyData.length}</small></p>
      </div>
    `;
    return;
  }

  facultyList.innerHTML = paginatedFaculty.map(faculty => `
    <div class="card faculty-card" tabindex="0" data-faculty-id="${faculty.id}">
      <div class="faculty-card__header">
        <h4 class="faculty-card__name">${faculty.name}</h4>
        <p class="faculty-card__designation">${faculty.designation}</p>
      </div>
      <div class="faculty-card__body">
        <ul class="faculty-card__info">
          <li><span class="faculty-card__label">School:</span> <span class="faculty-card__value">${faculty.school}</span></li>
          <li><span class="faculty-card__label">Department:</span> <span class="faculty-card__value">${faculty.department}</span></li>
          <li><span class="faculty-card__label">Cabin:</span> <span class="faculty-card__value">${faculty.cabin_location}</span></li>
        </ul>
      </div>
    </div>
  `).join('');

  // Add click handlers
  facultyList.addEventListener('click', handleFacultyCardClick);
}

function handleFacultyCardClick(e) {
  const facultyCard = e.target.closest('.faculty-card');
  if (facultyCard) {
    const facultyId = parseInt(facultyCard.dataset.facultyId);
    openFacultyModal(facultyId);
  }
}

function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  const totalPages = Math.ceil(currentFaculty.length / itemsPerPage);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let paginationHTML = `
    <button class="pagination__btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>‹ Previous</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      paginationHTML += `
        <button class="pagination__btn ${i === currentPage ? 'pagination__btn--active' : ''}" 
                data-page="${i}">${i}</button>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += `<span class="pagination__ellipsis">…</span>`;
    }
  }

  paginationHTML += `
    <button class="pagination__btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>Next ›</button>
  `;

  pagination.innerHTML = paginationHTML;
  pagination.addEventListener('click', handlePaginationClick);
}

function handlePaginationClick(e) {
  const btn = e.target.closest('.pagination__btn');
  if (!btn || btn.disabled) return;

  const page = btn.dataset.page;
  const totalPages = Math.ceil(currentFaculty.length / itemsPerPage);
  
  if (page === 'prev') {
    currentPage = Math.max(1, currentPage - 1);
  } else if (page === 'next') {
    currentPage = Math.min(totalPages, currentPage + 1);
  } else {
    currentPage = parseInt(page);
  }

  renderFacultyList();
  renderPagination();
}

function clearFilters() {
  const searchInput = document.getElementById('search-input');
  const schoolFilter = document.getElementById('school-filter');
  const designationFilter = document.getElementById('designation-filter');
  const departmentFilter = document.getElementById('department-filter');

  if (searchInput) searchInput.value = '';
  if (schoolFilter) schoolFilter.value = '';
  if (designationFilter) designationFilter.value = '';
  if (departmentFilter) departmentFilter.value = '';
  
  currentFaculty = [...facultyData];
  currentPage = 1;
  renderFacultyList();
  renderPagination();
  showToast('Filters cleared');
}

function exportFacultyData() {
  const csvContent = [
    ['Name', 'Designation', 'School', 'Department', 'Email', 'Phone', 'Cabin Location', 'Experience'],
    ...currentFaculty.map(faculty => [
      faculty.name, faculty.designation, faculty.school, faculty.department,
      faculty.email, faculty.phone, faculty.cabin_location
    ])
  ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vit_chennai_faculty.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Faculty data exported successfully!');
}

// Modal functionality
function initializeModal() {
  const modalClose = document.getElementById('modal-close');
  const modalOverlay = document.getElementById('modal-overlay');

  if (modalClose) modalClose.addEventListener('click', closeFacultyModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeFacultyModal);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('faculty-modal');
      if (modal && !modal.classList.contains('hidden')) {
        closeFacultyModal();
      }
    }
  });
}

function openFacultyModal(facultyId) {
  const faculty = facultyData.find(f => f.id === facultyId);
  if (!faculty) return;

  const modalBody = document.getElementById('modal-body');
  const modal = document.getElementById('faculty-modal');
  
  if (!modalBody || !modal) return;

  modalBody.innerHTML = `
    <h3 class="modal-faculty__name">${faculty.name}</h3>
    <p class="modal-faculty__designation">${faculty.designation}</p>
    
    <div class="modal-faculty__info">
      <div class="modal-faculty__field">
        <span class="modal-faculty__label">School:</span>
        <span class="modal-faculty__value">${faculty.school_name || faculty.school}</span>
      </div>
      <div class="modal-faculty__field">
        <span class="modal-faculty__label">Department:</span>
        <span class="modal-faculty__value">${faculty.department}</span>
      </div>
      <div class="modal-faculty__field">
        <span class="modal-faculty__label">Email:</span>
        <span class="modal-faculty__value">
          <a href="mailto:${faculty.email}" target="_blank">${faculty.email}</a>
        </span>
      </div>
      <div class="modal-faculty__field">
        <span class="modal-faculty__label">Cabin Location:</span>
        <span class="modal-faculty__value">${faculty.cabin_location}</span>
      </div>
    </div>
    
    <div class="modal-faculty__field">
      <span class="modal-faculty__label">Specializations:</span>
      <ul class="modal-faculty__specializations">
        ${faculty.specialization.map(spec => `<li>${spec}</li>`).join('')}
      </ul>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeFacultyModal() {
  const modal = document.getElementById('faculty-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

// Other sections
function initializeDepartments() {
  const departmentsContainer = document.getElementById('departments-list');
  if (!departmentsContainer) return;

  departmentsContainer.innerHTML = appData.schools.map(school => `
    <div class="card dept-card">
      <div class="dept-card__header">
        <h4 class="dept-card__code">${school.code}</h4>
        <p class="dept-card__name">${school.name}</p>
      </div>
      <div class="dept-card__body">
        <p><strong>Dean:</strong> ${school.dean || 'TBA'}</p>
        <p><strong>Faculty Count:</strong> ${school.faculty_count}</p>
        <p><strong>Programs:</strong> ${school.programs.join(', ')}</p>
      </div>
    </div>
  `).join('');
}

function initializeMap() {
  const blocksContainer = document.getElementById('blocks-list');
  if (!blocksContainer) return;

  blocksContainer.innerHTML = appData.academic_blocks.map(block => `
    <div class="card block-card">
      <div class="block-card__header">
        <h4 class="block-card__name">${block.name}</h4>
        <p class="block-card__floors">${block.floors} Floors</p>
      </div>
      <div class="block-card__body">
        <p><strong>Facilities:</strong></p>
        <ul class="block-card__facilities">
          ${block.facilities.map(facility => `<li>${facility}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
}

function initializeContact() {
  const campusLocation = document.getElementById('campus-location');
  const campusPhone = document.getElementById('campus-phone');
  const campusFax = document.getElementById('campus-fax');
  const emailLink = document.getElementById('campus-email');

  if (campusLocation) campusLocation.textContent = appData.campus_info.location;
  if (campusPhone) campusPhone.textContent = appData.campus_info.phone;
  if (campusFax) campusFax.textContent = appData.campus_info.fax;
  if (emailLink) {
    emailLink.textContent = appData.campus_info.email;
    emailLink.href = `mailto:${appData.campus_info.email}`;
  }
}

function initializeKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
        showSection('directory');
        updateActiveNavLink(document.querySelector('[data-section="directory"]'));
      }
    }
  });
}

// Utility functions
function showLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.remove('hidden');
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast ${type === 'error' ? 'toast--error' : ''}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
