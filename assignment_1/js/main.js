/* 
    CIS 5120 - Human-Computer Interaction
    Course Planning System
    Main JavaScript file for the course planning application

    No backend required for this web app, using placeholder data for now.
*/

// App state
let selectedCourses = [];
let cartCourses = [];
let planCourses = [];
let unavailableTimes = new Set();
let isSelectionMode = false;
let selectedPlan = null;
let isAdvancedSearchVisible = false;
let isDragging = false;

// Time slots for calendar display
const SCRIPT_TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

// Utility functions
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Start the app
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for all scripts to load
    setTimeout(initializeApp, 100);
});

function initializeApp() {
    console.log('Initializing Course Planning App...');
    
    // Make sure everything is loaded
    if (typeof DAYS === 'undefined') {
        console.error('DAYS not defined - courseData.js not loaded properly');
        setTimeout(initializeApp, 200);
        return;
    }
    
    if (typeof getAllSemesters === 'undefined') {
        console.error('getAllSemesters not defined - programsData.js not loaded properly');
        setTimeout(initializeApp, 200);
        return;
    }
    
    console.log('Dependencies loaded successfully');
    console.log('Course Data:', COURSE_DATA ? `${COURSE_DATA.length} courses loaded` : 'No course data');
    
    try {
        // Wire up the UI
        setupSearchFunctionality();
        
        setupNavigation();
        
        setupCoursePlanner();
        
        setupPlanGeneration();
        
        setupInteractiveElements();
        
        // Handle drag interactions
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // Touch events for mobile
        document.addEventListener('touchend', function() {
            isDragging = false;
        });
        
        // Credit slider
        setupCreditSlider();
        
        // Mobile stuff
        setupMobileOptimizations();
        
        // Build the calendar
        setTimeout(() => {
            generateTimeCalendar();
        }, 500);
        
        // Hide results section initially
        hideSection('results-section');
        
        console.log('App initialization complete');
        
        // Test notification
        setTimeout(() => {
            showNotification('App loaded successfully!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('❌ CRITICAL ERROR during initialization:', error);
        alert('App initialization failed: ' + error.message);
    }
}

// Search Functionality
function setupSearchFunctionality() {
    
    const searchBtn = document.querySelector('.search-btn');
    const keywordsInput = document.getElementById('keywords-input');
    const advancedToggle = document.getElementById('advanced-search-toggle');
    const programSearch = document.getElementById('program-search');
    
    console.log('Search elements:', {
        searchBtn: !!searchBtn,
        keywordsInput: !!keywordsInput,
        advancedToggle: !!advancedToggle,
        programSearch: !!programSearch
    });
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        console.log('Search button listener added');
    } else {
        console.error('Search button not found');
    }
    
    if (advancedToggle) {
        advancedToggle.addEventListener('click', toggleAdvancedSearch);
        console.log('Advanced toggle listener added');
    } else {
        console.error('Advanced toggle not found');
    }
    
    if (programSearch) {
        programSearch.addEventListener('input', filterPrograms);
        console.log('Program search listener added');
    } else {
        console.error('Program search not found');
    }
    
    // Allow Enter key to trigger search
    if (keywordsInput) {
        keywordsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        console.log('Keywords input listener added');
    } else {
        console.error('Keywords input not found');
    }
}


function toggleAdvancedSearch() {
    const advancedSearch = document.getElementById('advanced-search');
    const toggle = document.getElementById('advanced-search-toggle');
    
    isAdvancedSearchVisible = !isAdvancedSearchVisible;
    
    if (isAdvancedSearchVisible) {
        advancedSearch.classList.remove('hidden');
        toggle.textContent = 'Hide Advanced Search';
        toggle.classList.add('active');
    } else {
        advancedSearch.classList.add('hidden');
        toggle.textContent = 'Toggle for Advanced Search';
        toggle.classList.remove('active');
    }
}

function filterPrograms() {
    const searchInput = document.getElementById('program-search');
    const programSelect = document.getElementById('program-select');
    const query = searchInput.value.trim();
    
    // Clear existing options except "All Programs"
    programSelect.innerHTML = '<option value="all">All Programs</option>';
    
    if (query) {
        const filteredPrograms = searchPrograms(query);
        filteredPrograms.forEach(program => {
            const option = document.createElement('option');
            option.value = program.id;
            option.textContent = program.name;
            programSelect.appendChild(option);
        });
    } else {
        // Show all programs
        const allPrograms = getAllPrograms();
        allPrograms.forEach(program => {
            const option = document.createElement('option');
            option.value = program.id;
            option.textContent = program.name;
            programSelect.appendChild(option);
        });
    }
}

function performSearch() {
    console.log('Performing search...');
    
    const semesterSelect = document.getElementById('semester-select');
    const keywordsInput = document.getElementById('keywords-input');
    const typeSelect = document.getElementById('type-select');
    const programSelect = document.getElementById('program-select');
    
    const semester = semesterSelect.value;
    const keywords = keywordsInput.value.trim();
    const courseType = typeSelect.value;
    const program = programSelect.value;
    
    console.log('Search parameters:', { semester, keywords, courseType, program });
    
    if (!semester) {
        console.log('No semester selected');
        showNotification('Please select a semester', 'warning');
        return;
    }
    
    if (!keywords) {
        console.log('No keywords entered');
        showNotification('Please enter search keywords', 'warning');
        return;
    }
    
    // Show loading state
    const searchBtn = document.querySelector('.search-btn');
    const originalText = searchBtn.textContent;
    searchBtn.textContent = 'Searching...';
    searchBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        searchBtn.textContent = originalText;
        searchBtn.disabled = false;
        
        // Search courses
        const results = searchCourses(keywords, semester, program, courseType);
        console.log('Search results:', results.length, 'courses found');
        console.log('Results:', results.map(c => c.code).join(', '));
        
        displaySearchResults(results);
        
        // Show results section
        showSection('results-section');
        
        showNotification(`Found ${results.length} courses for ${semester}`, 'success');
    }, 1000);
}

function displaySearchResults(courses) {
    const courseList = document.getElementById('course-list');
    const resultsCount = document.getElementById('results-count');
    
    // Update count
    resultsCount.textContent = `${courses.length} courses found.`;
    
    // Clear existing results
    courseList.innerHTML = '';
    
    // Display courses
    courses.forEach(course => {
        const courseItem = createCourseItem(course);
        courseList.appendChild(courseItem);
    });
}

function createCourseItem(course) {
    const item = document.createElement('div');
    item.className = 'course-item';
    item.dataset.courseId = course.id;
    
    // Calculate total enrollment across all sections (handle both old and new structures)
    let totalEnrolled, totalCapacity;
    if (course.sections && course.sections.length > 0) {
        // New structure with sections
        totalEnrolled = course.sections.reduce((sum, section) => sum + section.enrolled, 0);
        totalCapacity = course.sections.reduce((sum, section) => sum + section.capacity, 0);
    } else {
        // Old structure without sections
        totalEnrolled = course.enrolled || 0;
        totalCapacity = course.capacity || 0;
    }
    const enrollmentPercent = totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;
    const progressColor = getEnrollmentColor(totalEnrolled, totalCapacity);
    
    item.innerHTML = `
        <div class="course-code">${course.code}:</div>
        <div class="course-title">${course.title}</div>
        <div class="course-info">Info: ${course.description}</div>
        <div class="course-details">
            <span class="credits">Credits: ${course.credits}</span>
            <span class="enrollment">Enrollment: ${totalEnrolled}/${totalCapacity}</span>
            <span class="department">Department: ${course.department}</span>
            <span class="type">Type: ${course.type}</span>
            <span class="level">Level: ${course.level}</span>
        </div>
        <div class="course-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${enrollmentPercent}%; background-color: ${progressColor}"></div>
            </div>
        </div>
        ${course.sections && course.sections.length > 0 ? `
        <div class="course-sections">
            <h5>Available Sections:</h5>
            ${course.sections.map(section => `
                <div class="section-item">
                    <div class="section-header">
                        <span class="section-number">Section ${section.section}</span>
                        <span class="section-instructor">${section.instructor}</span>
                        <span class="section-enrollment">${section.enrolled}/${section.capacity}</span>
                    </div>
                    <div class="section-times">
                        ${section.times.map(time => 
                            `<span class="time-slot">${time.day} ${formatTime(time.start)}-${formatTime(time.end)}</span>`
                        ).join('')}
                    </div>
                    <div class="section-actions">
                        <button class="btn btn-add-cart" data-section-id="${section.id}">Add to Cart</button>
                        <button class="btn btn-add-plan" data-section-id="${section.id}">Add to Plan</button>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : `
        <div class="course-times">
            ${course.times ? course.times.map(time => 
                `<span class="time-slot">${time.day} ${formatTime(time.start)}-${formatTime(time.end)}</span>`
            ).join('') : ''}
        </div>
        <div class="course-actions">
            <button class="btn btn-add-cart" data-course-id="${course.id}">Add to Cart</button>
            <button class="btn btn-add-plan" data-course-id="${course.id}">Add to Plan</button>
        </div>
        `}
    `;
    
    // Add click handlers for action buttons (handle both structures)
    const addToCartBtns = item.querySelectorAll('.btn-add-cart');
    const addToPlanBtns = item.querySelectorAll('.btn-add-plan');
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.dataset.sectionId) {
                // New structure with sections
                const sectionId = this.dataset.sectionId;
                const section = course.sections.find(s => s.id === sectionId);
                addToCart({...course, ...section, sectionId: sectionId});
            } else {
                // Old structure without sections
                addToCart(course);
            }
        });
    });
    
    addToPlanBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.dataset.sectionId) {
                // New structure with sections
                const sectionId = this.dataset.sectionId;
                const section = course.sections.find(s => s.id === sectionId);
                addToPlan({...course, ...section, sectionId: sectionId});
            } else {
                // Old structure without sections
                addToPlan(course);
            }
        });
    });
    
    return item;
}

function addToCart(course) {
    if (cartCourses.find(c => c.id === course.id)) {
        console.log('Course already in cart:', course.code);
        showNotification(`${course.code} is already in your cart`, 'warning');
        return;
    }
    
    cartCourses.push(course);
    console.log('Added to cart:', course.code, `(${course.credits} credits)`);
    console.log('Cart now has:', cartCourses.length, 'courses');
    showNotification(`Added ${course.code} to cart`, 'success');
    updateCartDisplay();
}

function addToPlan(course) {
    if (planCourses.find(c => c.id === course.id)) {
        console.log('Course already in plan:', course.code);
        showNotification(`${course.code} is already in your plan`, 'warning');
        return;
    }
    
    planCourses.push(course);
    console.log('Added to plan:', course.code, `(${course.credits} credits)`);
    console.log('Plan now has:', planCourses.length, 'courses');
    showNotification(`Added ${course.code} to plan`, 'success');
    updatePlanDisplay();
}

function updateCartDisplay() {
    console.log('Cart courses:', cartCourses);
    // This would update cart display if we had a cart section
}

function updatePlanDisplay() {
    console.log('Plan courses:', planCourses);
    // This would update plan display if we had a plan section
}

// Navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.dataset.section;
            handleNavigation(section);
        });
    });
    
    // Add functionality to other buttons
    setupOtherButtons();
}

function setupOtherButtons() {
    // Degree Auditing button
    const degreeAuditBtn = document.querySelector('.btn-suggestion');
    if (degreeAuditBtn) {
        degreeAuditBtn.addEventListener('click', function() {
            showNotification('Degree Auditing feature coming soon!', 'info');
        });
    }
    
    // Pick Cart button
    const pickCartBtn = document.getElementById('pick-cart-btn');
    if (pickCartBtn) {
        pickCartBtn.addEventListener('click', function() {
            if (cartCourses.length === 0) {
                showNotification('Your cart is empty. Add some courses first!', 'warning');
            } else {
                showCartDetails();
            }
        });
    }
    
    // Pick Plan button
    const pickPlanBtn = document.getElementById('pick-plan-btn');
    if (pickPlanBtn) {
        pickPlanBtn.addEventListener('click', function() {
            if (planCourses.length === 0) {
                showNotification('Your plan is empty. Add some courses first!', 'warning');
            } else {
                showPlanDetails();
            }
        });
    }
    
    // Clear Cart button
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            if (cartCourses.length === 0) {
                showNotification('Cart is already empty!', 'info');
            } else {
                const courseCount = cartCourses.length;
                cartCourses = [];
                updateCartDisplay();
                showNotification(`Cleared ${courseCount} courses from cart`, 'success');
            }
        });
    }
    
    // Clear Plan button
    const clearPlanBtn = document.getElementById('clear-plan-btn');
    if (clearPlanBtn) {
        clearPlanBtn.addEventListener('click', function() {
            if (planCourses.length === 0) {
                showNotification('Plan is already empty!', 'info');
            } else {
                const courseCount = planCourses.length;
                planCourses = [];
                updatePlanDisplay();
                showNotification(`Cleared ${courseCount} courses from plan`, 'success');
            }
        });
    }
}

function handleNavigation(section) {
    const clickedButton = document.querySelector(`[data-section="${section}"]`);
    const rightColumn = document.getElementById('right-column');
    
    // Check if the button is already active
    if (clickedButton.classList.contains('active')) {
        // Deactivate the button and hide content
        clickedButton.classList.remove('active');
        rightColumn.classList.add('hidden');
        showNotification(`${section.replace('-', ' ')} disabled`, 'info');
        return;
    }
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    clickedButton.classList.add('active');
    
    // Show the right column
    rightColumn.classList.remove('hidden');
    
    switch(section) {
        case 'course-planner':
            showCoursePlanner();
            break;
        case 'primary-cart':
            showCart();
            break;
        case 'primary-plan':
            showPlans();
            break;
        case 'contact-help':
            showNotification('Contact & Help section coming soon!', 'info');
            break;
    }
}

// Course Planner
function setupCoursePlanner() {
    
    const selectionToggle = document.getElementById('selection-toggle');
    const generateBtn = document.getElementById('generate-plans-btn');
    const resetBtn = document.getElementById('reset-planner-btn');
    
    console.log('Course planner elements:', {
        selectionToggle: !!selectionToggle,
        generateBtn: !!generateBtn,
        resetBtn: !!resetBtn
    });
    
    if (selectionToggle) {
        selectionToggle.addEventListener('click', toggleSelectionMode);
        console.log('Selection toggle listener added');
    } else {
        console.error('Selection toggle not found');
    }
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePlans);
        console.log('Generate button listener added');
    } else {
        console.error('Generate button not found');
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPlanner);
        console.log('Reset button listener added');
    } else {
        console.error('Reset button not found');
    }
}

function setupPlanGeneration() {
    
    // Add click handlers to plan items (these will be generated dynamically)
    // This function sets up the general plan interaction system
    
    // Set up plan info panel close button
    const closePanelBtn = document.getElementById('close-panel-btn');
    if (closePanelBtn) {
        closePanelBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            console.log('Close panel button clicked');
            hidePlanInfoPanel();
            if (selectedPlan) {
                const planElement = document.querySelector(`[data-plan-id="${selectedPlan.id}"]`);
                if (planElement) {
                    planElement.classList.remove('selected');
                }
                selectedPlan = null;
            }
        });
        console.log('Plan panel close button listener added');
    } else {
        console.error('Plan panel close button not found');
    }
    
    console.log('Plan generation setup complete');
}

function generateTimeCalendar() {
    console.log('=== STARTING CALENDAR GENERATION ===');
    
    const calendar = document.getElementById('planner-calendar');
    console.log('Calendar element:', calendar);
    
    if (!calendar) {
        console.error('CRITICAL ERROR: Calendar element not found!');
        alert('Calendar element not found! Check HTML structure.');
        return;
    }
    
    // Clear existing content
    calendar.innerHTML = '';
    console.log('Calendar cleared');
    
    // Create time slots from 8 AM to 8 PM (8:00 to 20:00)
    const timeSlots = [];
    for (let hour = 8; hour <= 20; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    console.log('Time slots created:', timeSlots);
    console.log('DAYS array:', DAYS);
    
    if (!DAYS || DAYS.length === 0) {
        console.error('CRITICAL ERROR: DAYS array is not defined or empty!');
        console.log('Using fallback DAYS array');
        const fallbackDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        window.DAYS = fallbackDays;
    }
    
    let rowCount = 0;
    
    timeSlots.forEach((time, index) => {
        console.log(`Creating row ${index + 1}/${timeSlots.length} for time ${time}`);
        
        const timeRow = document.createElement('div');
        timeRow.className = 'time-row';
        timeRow.style.display = 'grid';
        timeRow.style.gridTemplateColumns = '50px repeat(5, 1fr)';
        timeRow.style.gap = '1px';
        timeRow.style.background = '#f8f9fa';
        timeRow.style.minHeight = '40px';
        timeRow.style.borderBottom = '1px solid #e1e5e9';
        
        const timeLabel = document.createElement('div');
        timeLabel.className = 'time-label';
        timeLabel.textContent = formatTime(time);
        timeLabel.style.background = '#f8f9fa';
        timeLabel.style.display = 'flex';
        timeLabel.style.alignItems = 'center';
        timeLabel.style.justifyContent = 'center';
        timeLabel.style.fontSize = '11px';
        timeLabel.style.color = '#6c757d';
        timeLabel.style.borderRight = '1px solid #e1e5e9';
        timeLabel.style.fontWeight = '500';
        
        timeRow.appendChild(timeLabel);
        console.log(`Added time label: ${formatTime(time)}`);
        
        DAYS.forEach((day, dayIndex) => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.dataset.day = day;
            timeSlot.dataset.time = time;
            
            // Apply styles directly
            timeSlot.style.height = '40px';
            timeSlot.style.border = 'none';
            timeSlot.style.background = 'white';
            timeSlot.style.display = 'flex';
            timeSlot.style.alignItems = 'center';
            timeSlot.style.justifyContent = 'center';
            timeSlot.style.fontSize = '10px';
            timeSlot.style.fontWeight = '500';
            timeSlot.style.transition = 'all 0.3s ease';
            timeSlot.style.cursor = 'pointer';
            timeSlot.style.borderRight = '1px solid #e1e5e9';
            timeSlot.style.position = 'relative';
            
            // Keep time slots empty - no text content
            
            timeSlot.addEventListener('click', function() {
                console.log(`Time slot clicked: ${day} at ${time}`);
                if (isSelectionMode) {
                    toggleTimeSlot(this);
                } else {
                    showNotification('Enable selection mode to mark time slots', 'info');
                }
            });
            
            // Add drag selection functionality
            timeSlot.addEventListener('mousedown', function(e) {
                if (isSelectionMode) {
                    e.preventDefault();
                    isDragging = true;
                    toggleTimeSlot(this);
                }
            });
            
            timeSlot.addEventListener('mouseenter', function() {
                if (isDragging && isSelectionMode) {
                    toggleTimeSlot(this);
                }
                if (!this.classList.contains('unavailable')) {
                    this.style.background = '#e3f2fd';
                }
            });
            
            timeSlot.addEventListener('mouseleave', function() {
                if (!this.classList.contains('unavailable')) {
                    this.style.background = 'white';
                }
            });
            
            timeRow.appendChild(timeSlot);
            console.log(`Added time slot: ${day} at ${time}`);
        });
        
        calendar.appendChild(timeRow);
        rowCount++;
        console.log(`Row ${rowCount} added to calendar`);
    });
    
    console.log(`=== CALENDAR GENERATION COMPLETE ===`);
    console.log(`Total rows created: ${rowCount}`);
    console.log(`Calendar children count: ${calendar.children.length}`);
    
    // Verify calendar was populated
    if (calendar.children.length === 0) {
        console.error('CRITICAL ERROR: No rows were added to calendar!');
        alert('Calendar generation failed! Check console for errors.');
    } else {
        console.log('SUCCESS: Calendar populated with', calendar.children.length, 'rows');
    }
}

function toggleSelectionMode() {
    isSelectionMode = !isSelectionMode;
    const toggle = document.getElementById('selection-toggle');
    const calendar = document.getElementById('planner-calendar');
    
    if (isSelectionMode) {
        toggle.textContent = 'Selection Mode: ON';
        toggle.classList.add('active');
        showNotification('Click on time slots to mark as unavailable', 'info');
        if (calendar) {
            calendar.style.display = 'flex';
        }
    } else {
        toggle.textContent = 'Selection Mode: OFF';
        toggle.classList.remove('active');
        showNotification('Selection mode turned off', 'info');
        if (calendar) {
            calendar.style.display = 'none';
        }
    }
}

function toggleTimeSlot(slot) {
    const day = slot.dataset.day;
    const time = slot.dataset.time;
    const key = `${day}-${time}`;
    
    if (unavailableTimes.has(key)) {
        unavailableTimes.delete(key);
        slot.classList.remove('unavailable');
    } else {
        unavailableTimes.add(key);
        slot.classList.add('unavailable');
    }
}

function generatePlans() {
    console.log('Generating plans...');
    
    const coursesToUse = planCourses.length > 0 ? planCourses : cartCourses;
    console.log('Using courses:', coursesToUse.length > 0 ? 
        coursesToUse.map(c => `${c.code} (${c.credits}cr)`).join(', ') : 'None');
    
    if (coursesToUse.length === 0) {
        console.log('No courses available for plan generation');
        showNotification('Please add courses to cart or plan first', 'warning');
        return;
    }
    
    const creditLimit = parseInt(document.getElementById('credit-limit').value);
    const totalCredits = coursesToUse.reduce((sum, course) => sum + course.credits, 0);
    console.log(`Credit limit: ${creditLimit}, Total credits: ${totalCredits}`);
    
    // If total credits exceed limit, select best courses that fit within limit
    let selectedCourses = coursesToUse;
    if (totalCredits > creditLimit) {
        console.log('Credits exceed limit, selecting best courses...');
        selectedCourses = selectCoursesWithinLimit(coursesToUse, creditLimit);
        const selectedCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);
        console.log(`Selected ${selectedCourses.length} courses (${selectedCredits}/${creditLimit} credits)`);
        showNotification(`Selected ${selectedCourses.length} courses (${selectedCredits}/${creditLimit} credits) from ${coursesToUse.length} total courses`, 'info');
    }
    
    const generateBtn = document.getElementById('generate-plans-btn');
    const originalText = generateBtn.textContent;
    
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    
    setTimeout(() => {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
        
        const plans = createPlans(selectedCourses, creditLimit);
        displayPlans(plans);
        
        if (plans.length > 0) {
            const finalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);
            showNotification(`Generated ${plans.length} plans (${finalCredits}/${creditLimit} credits)`, 'success');
        } else {
            showNotification('No feasible plans found with current constraints', 'warning');
        }
    }, 2000);
}

function selectCoursesWithinLimit(courses, creditLimit) {
    // Sort courses by priority (you can customize this logic)
    // For now, we'll prioritize by:
    // 1. Lower credit courses (to fit more courses)
    // 2. Higher enrollment percentage (more popular courses)
    // 3. Alphabetical order for consistency
    
    const sortedCourses = courses.sort((a, b) => {
        // First, sort by credits (ascending - prefer lower credit courses)
        if (a.credits !== b.credits) {
            return a.credits - b.credits;
        }
        
        // Then by enrollment percentage (descending - prefer more popular courses)
        let aEnrollment = 0, bEnrollment = 0;
        
        if (a.sections && a.sections.length > 0) {
            // New structure with sections
            const aTotalEnrolled = a.sections.reduce((sum, section) => sum + section.enrolled, 0);
            const aTotalCapacity = a.sections.reduce((sum, section) => sum + section.capacity, 0);
            aEnrollment = aTotalCapacity > 0 ? aTotalEnrolled / aTotalCapacity : 0;
        } else {
            // Old structure
            aEnrollment = a.capacity > 0 ? a.enrolled / a.capacity : 0;
        }
        
        if (b.sections && b.sections.length > 0) {
            // New structure with sections
            const bTotalEnrolled = b.sections.reduce((sum, section) => sum + section.enrolled, 0);
            const bTotalCapacity = b.sections.reduce((sum, section) => sum + section.capacity, 0);
            bEnrollment = bTotalCapacity > 0 ? bTotalEnrolled / bTotalCapacity : 0;
        } else {
            // Old structure
            bEnrollment = b.capacity > 0 ? b.enrolled / b.capacity : 0;
        }
        
        if (aEnrollment !== bEnrollment) {
            return bEnrollment - aEnrollment;
        }
        
        // Finally, alphabetical by course code
        return a.code.localeCompare(b.code);
    });
    
    // Select courses that fit within the credit limit
    const selectedCourses = [];
    let totalCredits = 0;
    
    for (const course of sortedCourses) {
        if (totalCredits + course.credits <= creditLimit) {
            selectedCourses.push(course);
            totalCredits += course.credits;
        }
    }
    
    console.log(`Selected ${selectedCourses.length} courses (${totalCredits}/${creditLimit} credits) from ${courses.length} total courses`);
    return selectedCourses;
}

function createPlans(courses, creditLimit) {
    console.log('Creating plans for courses:', courses.map(c => c.code).join(', '));
    console.log('Credit limit:', creditLimit);
    
    const plans = [];
    const availableSlots = getAvailableSlots();
    
    console.log('Available time slots:', availableSlots.length);
    
    if (availableSlots.length === 0) {
        console.log('No available slots found');
        return [];
    }
    
    // Generate up to 3 different plans
    for (let i = 0; i < Math.min(3, courses.length); i++) {
        const plan = {
            id: i + 1,
            name: `Plan ${i + 1}`,
            courses: [],
            schedule: {}
        };
        
        // Try to fit courses into available slots
        courses.forEach(course => {
            const courseSlots = findAvailableCourseSlots(course, availableSlots);
            console.log(`Course ${course.code} slots:`, courseSlots);
            if (courseSlots.length > 0) {
                plan.courses.push(course);
                plan.schedule[course.id] = courseSlots;
            }
        });
        
        console.log(`Plan ${i + 1} created with ${plan.courses.length} courses`);
        if (plan.courses.length > 0) {
            plans.push(plan);
        }
    }
    
    console.log('Total plans created:', plans.length);
    return plans;
}

function getAvailableSlots() {
    const available = [];
    
    DAYS.forEach(day => {
        SCRIPT_TIME_SLOTS.forEach(time => {
            const key = `${day}-${time}`;
            if (!unavailableTimes.has(key)) {
                available.push({ day, time });
            }
        });
    });
    
    return available;
}

function findAvailableCourseSlots(course, availableSlots) {
    const courseSlots = [];
    
    course.times.forEach(courseTime => {
        const matchingSlots = availableSlots.filter(slot => 
            slot.day === courseTime.day && 
            slot.time === courseTime.start
        );
        
        if (matchingSlots.length > 0) {
            courseSlots.push({
                day: courseTime.day,
                start: courseTime.start,
                end: courseTime.end
            });
        }
    });
    
    return courseSlots;
}

function displayPlans(plans) {
    const container = document.getElementById('plans-container');
    const plansCount = document.getElementById('plans-count');
    
    container.innerHTML = '';
    plansCount.textContent = `${plans.length} plans generated`;
    
    plans.forEach(plan => {
        const planElement = createPlanElement(plan);
        container.appendChild(planElement);
    });
}

function createPlanElement(plan) {
    const planDiv = document.createElement('div');
    planDiv.className = 'plan-item';
    planDiv.dataset.planId = plan.id;
    
    planDiv.innerHTML = `
        <div class="plan-header">
            <h4>${plan.name}</h4>
            <div class="plan-summary">${plan.courses.length} courses</div>
        </div>
        <div class="plan-content">
            <div class="plan-courses">
                ${plan.courses.map(course => `
                    <div class="course-preview">
                        <span class="course-code">${course.code}</span>
                        <span class="course-title">${course.title}</span>
                    </div>
                `).join('')}
            </div>
            <div class="plan-calendar">
                <div class="calendar-header">
                    <div class="day">Mon</div>
                    <div class="day">Tue</div>
                    <div class="day">Wed</div>
                    <div class="day">Thu</div>
                    <div class="day">Fri</div>
                </div>
                <div class="calendar-grid" id="plan-${plan.id}-calendar">
                    <!-- Calendar will be populated by JavaScript -->
                </div>
            </div>
        </div>
    `;
    
    // Populate calendar with a small delay to ensure DOM is ready
    setTimeout(() => {
        console.log(`Attempting to populate calendar for plan ${plan.id}`);
        const calendarElement = document.getElementById(`plan-${plan.id}-calendar`);
        console.log('Calendar element found:', calendarElement);
        populatePlanCalendar(plan);
    }, 100);
    
    // Add click handler
    planDiv.addEventListener('click', function() {
        togglePlanSelection(plan);
    });
    
    return planDiv;
}

function populatePlanCalendar(plan) {
    console.log(`=== POPULATING CALENDAR FOR ${plan.name} ===`);
    const calendar = document.getElementById(`plan-${plan.id}-calendar`);
    if (!calendar) {
        console.error(`Calendar container not found: plan-${plan.id}-calendar`);
        return;
    }
    
    console.log('Calendar container found:', calendar);
    calendar.innerHTML = '';
    
    // Check DAYS array
    if (!DAYS || DAYS.length === 0) {
        console.error('DAYS array not available, using fallback');
        window.DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    }
    
    // Create time slots from 8 AM to 5 PM for plan display
    const planTimeSlots = [];
    for (let hour = 8; hour <= 17; hour++) {
        planTimeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    console.log('Plan time slots:', planTimeSlots);
    console.log('DAYS array:', DAYS);
    
    planTimeSlots.forEach(time => {
        const timeRow = document.createElement('div');
        timeRow.className = 'time-row';
        timeRow.style.display = 'grid';
        timeRow.style.gridTemplateColumns = 'repeat(5, 1fr)';
        timeRow.style.gap = '1px';
        timeRow.style.marginBottom = '1px';
        
        DAYS.forEach(day => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.style.height = '20px';
            slot.style.border = '1px solid #e1e5e9';
            slot.style.background = 'white';
            slot.style.position = 'relative';
            slot.style.display = 'flex';
            slot.style.alignItems = 'center';
            slot.style.justifyContent = 'center';
            slot.style.fontSize = '7px';
            slot.style.fontWeight = '600';
            
            // Check if any course is scheduled at this time
            const scheduledCourse = findScheduledCourse(plan, day, time);
            if (scheduledCourse) {
                // Prefer full code; fall back to title if missing
                slot.textContent = `${scheduledCourse.code || ''}`.trim() || scheduledCourse.title || 'Course';
                slot.classList.add('scheduled');
                slot.style.backgroundColor = '#28a745';
                slot.style.color = 'white';
                slot.style.borderLeft = '2px solid #dc3545';
            }
            
            timeRow.appendChild(slot);
        });
        
        calendar.appendChild(timeRow);
    });
    
    console.log(`Populated calendar for ${plan.name} with ${calendar.children.length} time rows`);
}

function findScheduledCourse(plan, day, time) {
    for (const course of plan.courses) {
        const courseSlots = plan.schedule[course.id] || [];
        if (courseSlots.some(slot => slot.day === day && slot.start === time)) {
            return course;
        }
    }
    return null;
}

function getCourseColor(courseId) {
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];
    const index = courseId.charCodeAt(courseId.length - 1) % colors.length;
    return colors[index];
}

function togglePlanSelection(plan) {
    const planElement = document.querySelector(`[data-plan-id="${plan.id}"]`);
    
    if (selectedPlan && selectedPlan.id === plan.id) {
        // Deselect current plan
        selectedPlan = null;
        planElement.classList.remove('selected');
        hidePlanInfoPanel();
        showNotification('Plan deselected', 'info');
    } else {
        // Select new plan
        if (selectedPlan) {
            document.querySelector(`[data-plan-id="${selectedPlan.id}"]`).classList.remove('selected');
        }
        
        selectedPlan = plan;
        planElement.classList.add('selected');
        showPlanInfoPanel(plan);
        showNotification(`${plan.name} selected`, 'success');
    }
}

function showPlanInfoPanel(plan) {
    const panel = document.getElementById('plan-info-panel');
    const title = document.getElementById('panel-plan-title');
    const content = document.getElementById('panel-content');
    
    title.textContent = `${plan.name} Information`;
    
    content.innerHTML = `
        <div class="panel-course-info">
            <div class="plan-details">
                <h5>Courses in this plan:</h5>
                ${plan.courses.map(course => `
                    <div class="course-detail">
                        <div class="course-code">${course.code}</div>
                        <div class="course-title">${course.title}</div>
                        <div class="course-schedule">
                            ${plan.schedule[course.id].map(slot => 
                                `${slot.day} ${formatTime(slot.start)}-${formatTime(slot.end)}`
                            ).join(', ')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="panel-calendar">
            <h5>Schedule Calendar</h5>
            <div class="plan-calendar" id="plan-calendar-${plan.id}"></div>
        </div>
    `;
    
    // Generate calendar for this plan
    generatePlanCalendar(plan);
    
    panel.classList.remove('hidden');
}

function hidePlanInfoPanel() {
    const panel = document.getElementById('plan-info-panel');
    panel.classList.add('hidden');
}

function generatePlanCalendar(plan) {
    const calendarContainer = document.getElementById(`plan-calendar-${plan.id}`);
    if (!calendarContainer) {
        console.error('Plan calendar container not found');
        return;
    }
    
    // Clear existing content
    calendarContainer.innerHTML = '';
    
    // Create calendar header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.style.display = 'grid';
    header.style.gridTemplateColumns = '50px repeat(5, 1fr)';
    header.style.gap = '1px';
    header.style.marginBottom = '8px';
    
    // Add time label
    const timeLabel = document.createElement('div');
    timeLabel.textContent = 'Time';
    timeLabel.style.padding = '8px';
    timeLabel.style.fontWeight = '600';
    timeLabel.style.fontSize = '12px';
    timeLabel.style.color = '#6c757d';
    timeLabel.style.borderRight = '1px solid #e1e5e9';
    header.appendChild(timeLabel);
    
    // Add day headers
    DAYS.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day.substr(0, 3);
        dayHeader.style.padding = '8px';
        dayHeader.style.fontWeight = '600';
        dayHeader.style.fontSize = '12px';
        dayHeader.style.color = '#6c757d';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.background = '#f8f9fa';
        dayHeader.style.borderRight = '1px solid #e1e5e9';
        header.appendChild(dayHeader);
    });
    
    calendarContainer.appendChild(header);
    
    // Create time rows
    SCRIPT_TIME_SLOTS.forEach(time => {
        const timeRow = document.createElement('div');
        timeRow.className = 'time-row';
        timeRow.style.display = 'grid';
        timeRow.style.gridTemplateColumns = '50px repeat(5, 1fr)';
        timeRow.style.gap = '1px';
        timeRow.style.marginBottom = '1px';
        
        // Add time label
        const timeLabel = document.createElement('div');
        timeLabel.textContent = formatTime(time);
        timeLabel.style.padding = '4px';
        timeLabel.style.fontSize = '10px';
        timeLabel.style.color = '#6c757d';
        timeLabel.style.borderRight = '1px solid #e1e5e9';
        timeLabel.style.fontWeight = '500';
        timeRow.appendChild(timeLabel);
        
        // Add time slots
        DAYS.forEach(day => {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.style.height = '30px';
            timeSlot.style.border = '1px solid #e1e5e9';
            timeSlot.style.background = 'white';
            timeSlot.style.position = 'relative';
            timeSlot.style.borderRight = '1px solid #e1e5e9';
            
            // Check if this time slot has a course scheduled
            const hasCourse = plan.courses.some(course => {
                return plan.schedule[course.id] && plan.schedule[course.id].some(slot => {
                    return slot.day === day && 
                           slot.start <= time && 
                           slot.end > time;
                });
            });
            
            if (hasCourse) {
                timeSlot.style.background = '#28a745';
                timeSlot.style.color = 'white';
                timeSlot.style.fontSize = '8px';
                timeSlot.style.fontWeight = '600';
                timeSlot.style.display = 'flex';
                timeSlot.style.alignItems = 'center';
                timeSlot.style.justifyContent = 'center';
                
                // Find the course for this slot
                const course = plan.courses.find(course => {
                    return plan.schedule[course.id] && plan.schedule[course.id].some(slot => {
                        return slot.day === day && 
                               slot.start <= time && 
                               slot.end > time;
                    });
                });
                
                if (course) {
                    timeSlot.textContent = course.code;
                }
            }
            
            timeRow.appendChild(timeSlot);
        });
        
        calendarContainer.appendChild(timeRow);
    });
}

// Interactive Elements
function setupInteractiveElements() {
    
    const sortBtn = document.getElementById('sort-btn');
    const resetResultsBtn = document.getElementById('reset-results-btn');
    
    console.log('Interactive elements:', {
        sortBtn: !!sortBtn,
        resetResultsBtn: !!resetResultsBtn
    });
    
    if (sortBtn) {
        sortBtn.addEventListener('click', sortCourses);
        console.log('Sort button listener added');
    } else {
        console.error('Sort button not found');
    }
    
    if (resetResultsBtn) {
        resetResultsBtn.addEventListener('click', resetResults);
        console.log('Reset results button listener added');
    } else {
        console.error('Reset results button not found');
    }
}

function sortCourses() {
    const courseList = document.getElementById('course-list');
    const courses = Array.from(courseList.children);
    
    courses.sort((a, b) => {
        const codeA = a.querySelector('.course-code').textContent;
        const codeB = b.querySelector('.course-code').textContent;
        return codeA.localeCompare(codeB);
    });
    
    courses.forEach(course => courseList.appendChild(course));
    showNotification('Courses sorted alphabetically', 'info');
}

function resetResults() {
    selectedCourses = [];
    document.querySelectorAll('.course-item.selected').forEach(item => {
        item.classList.remove('selected');
    });
    
    document.getElementById('semester-select').value = '';
    document.getElementById('keywords-input').value = '';
    document.getElementById('type-select').value = 'all';
    document.getElementById('program-select').value = 'all';
    
    hideSection('results-section');
    showNotification('Results reset', 'info');
}

function resetPlanner() {
    unavailableTimes.clear();
    isSelectionMode = false;
    
    document.querySelectorAll('.time-slot.unavailable').forEach(slot => {
        slot.classList.remove('unavailable');
    });
    
    const toggle = document.getElementById('selection-toggle');
    toggle.textContent = 'Selection Mode: OFF';
    toggle.classList.remove('active');
    
    // Clear plans
    document.getElementById('plans-container').innerHTML = '';
    document.getElementById('plans-count').textContent = '— plans generated';
    
    hidePlanInfoPanel();
    selectedPlan = null;
    
    showNotification('Planner reset', 'info');
}

// Utility Functions
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.remove('hidden');
}

function hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.add('hidden');
}

function setupCreditSlider() {
    const creditSlider = document.getElementById('credit-limit');
    const creditValue = document.getElementById('credit-value');
    
    if (creditSlider && creditValue) {
        // Update display when slider changes
        creditSlider.addEventListener('input', function() {
            creditValue.textContent = this.value;
        });
        
        // Initial display update
        creditValue.textContent = creditSlider.value;
        
        console.log('Credit slider setup complete');
    } else {
        console.error('Credit slider elements not found');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });
    
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showCoursePlanner() {
    // Restore original course planner view
    restoreCoursePlannerView();
    showNotification('Showing Course Planner', 'info');
}

function restoreCoursePlannerView() {
    // Remove any existing displays
    const existingCart = document.getElementById('cart-display');
    const existingPlan = document.getElementById('plan-display');
    if (existingCart) existingCart.remove();
    if (existingPlan) existingPlan.remove();
    
    // Restore original sections
    const coursePlanner = document.querySelector('.course-planner');
    const recommendedPlans = document.querySelector('.recommended-plans');
    
    if (coursePlanner) coursePlanner.style.display = 'block';
    if (recommendedPlans) recommendedPlans.style.display = 'block';
}

function showCart() {
    const rightColumn = document.getElementById('right-column');
    rightColumn.classList.remove('hidden');
    
    // Hide course planner and show cart content
    const coursePlanner = document.querySelector('.course-planner');
    const recommendedPlans = document.querySelector('.recommended-plans');
    
    if (coursePlanner) coursePlanner.style.display = 'none';
    if (recommendedPlans) recommendedPlans.style.display = 'none';
    
    // Create or show cart display
    showCartDisplay();
    showNotification(`Showing cart with ${cartCourses.length} courses`, 'info');
}

function showPlans() {
    const rightColumn = document.getElementById('right-column');
    rightColumn.classList.remove('hidden');
    
    // Hide course planner and show plan content
    const coursePlanner = document.querySelector('.course-planner');
    const recommendedPlans = document.querySelector('.recommended-plans');
    
    if (coursePlanner) coursePlanner.style.display = 'none';
    if (recommendedPlans) recommendedPlans.style.display = 'none';
    
    // Create or show plan display
    showPlanDisplay();
    showNotification(`Showing plan with ${planCourses.length} courses`, 'info');
}

function showCartDisplay() {
    const rightColumn = document.getElementById('right-column');
    
    // Remove existing cart display if any
    const existingCart = document.getElementById('cart-display');
    if (existingCart) {
        existingCart.remove();
    }
    
    // Create cart display
    const cartDisplay = document.createElement('div');
    cartDisplay.id = 'cart-display';
    cartDisplay.className = 'course-planner';
    cartDisplay.innerHTML = `
        <div class="planner-header">
            <h3>Primary Cart</h3>
            <div class="planner-controls">
                <button class="btn btn-warning" id="clear-cart-display-btn">Clear Cart</button>
                <button class="btn btn-secondary" id="back-to-planner-btn">Back to Planner</button>
            </div>
        </div>
        <div class="cart-content">
            <div class="cart-count">${cartCourses.length} courses in cart</div>
            <div class="cart-list" id="cart-list">
                ${cartCourses.length === 0 ? '<p class="empty-message">Your cart is empty. Add courses from the search results!</p>' : ''}
            </div>
        </div>
    `;
    
    rightColumn.appendChild(cartDisplay);
    
    // Populate cart list
    if (cartCourses.length > 0) {
        const cartList = document.getElementById('cart-list');
        cartList.innerHTML = cartCourses.map(course => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-code">${course.code}</div>
                    <div class="cart-item-title">${course.title}</div>
                    <div class="cart-item-credits">${course.credits} credits</div>
                </div>
                <button class="btn btn-danger btn-sm remove-from-cart" data-course-id="${course.id}">Remove</button>
            </div>
        `).join('');
        
        // Add remove functionality
        document.querySelectorAll('.remove-from-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                const courseId = this.dataset.courseId;
                removeFromCart(courseId);
            });
        });
    }
    
    // Add clear cart functionality
    document.getElementById('clear-cart-display-btn').addEventListener('click', function() {
        cartCourses = [];
        showCartDisplay(); // Refresh display
        showNotification('Cart cleared', 'success');
    });
    
    // Add back to planner functionality
    document.getElementById('back-to-planner-btn').addEventListener('click', function() {
        document.querySelector('[data-section="course-planner"]').click();
    });
}

function showPlanDisplay() {
    const rightColumn = document.getElementById('right-column');
    
    // Remove existing plan display if any
    const existingPlan = document.getElementById('plan-display');
    if (existingPlan) {
        existingPlan.remove();
    }
    
    // Create plan display
    const planDisplay = document.createElement('div');
    planDisplay.id = 'plan-display';
    planDisplay.className = 'course-planner';
    planDisplay.innerHTML = `
        <div class="planner-header">
            <h3>Primary Plan</h3>
            <div class="planner-controls">
                <button class="btn btn-warning" id="clear-plan-display-btn">Clear Plan</button>
                <button class="btn btn-secondary" id="back-to-planner-btn-2">Back to Planner</button>
            </div>
        </div>
        <div class="plan-content">
            <div class="plan-count">${planCourses.length} courses in plan</div>
            <div class="plan-list" id="plan-list">
                ${planCourses.length === 0 ? '<p class="empty-message">Your plan is empty. Add courses from the search results!</p>' : ''}
            </div>
        </div>
    `;
    
    rightColumn.appendChild(planDisplay);
    
    // Populate plan list
    if (planCourses.length > 0) {
        const planList = document.getElementById('plan-list');
        planList.innerHTML = planCourses.map(course => `
            <div class="plan-item">
                <div class="plan-item-info">
                    <div class="plan-item-code">${course.code}</div>
                    <div class="plan-item-title">${course.title}</div>
                    <div class="plan-item-credits">${course.credits} credits</div>
                </div>
                <button class="btn btn-danger btn-sm remove-from-plan" data-course-id="${course.id}">Remove</button>
            </div>
        `).join('');
        
        // Add remove functionality
        document.querySelectorAll('.remove-from-plan').forEach(btn => {
            btn.addEventListener('click', function() {
                const courseId = this.dataset.courseId;
                removeFromPlan(courseId);
            });
        });
    }
    
    // Add clear plan functionality
    document.getElementById('clear-plan-display-btn').addEventListener('click', function() {
        planCourses = [];
        showPlanDisplay(); // Refresh display
        showNotification('Plan cleared', 'success');
    });
    
    // Add back to planner functionality
    document.getElementById('back-to-planner-btn-2').addEventListener('click', function() {
        document.querySelector('[data-section="course-planner"]').click();
    });
}

function removeFromCart(courseId) {
    const courseIndex = cartCourses.findIndex(course => course.id === courseId);
    if (courseIndex !== -1) {
        const removedCourse = cartCourses.splice(courseIndex, 1)[0];
        showCartDisplay(); // Refresh display
        showNotification(`Removed ${removedCourse.code} from cart`, 'success');
    }
}

function removeFromPlan(courseId) {
    const courseIndex = planCourses.findIndex(course => course.id === courseId);
    if (courseIndex !== -1) {
        const removedCourse = planCourses.splice(courseIndex, 1)[0];
        showPlanDisplay(); // Refresh display
        showNotification(`Removed ${removedCourse.code} from plan`, 'success');
    }
}

function showCartDetails() {
    const cartInfo = cartCourses.map(course => 
        `• ${course.code}: ${course.title}`
    ).join('\n');
    
    showNotification(`Cart contains ${cartCourses.length} courses:\n${cartInfo}`, 'info');
}

function showPlanDetails() {
    const planInfo = planCourses.map(course => 
        `• ${course.code}: ${course.title}`
    ).join('\n');
    
    showNotification(`Plan contains ${planCourses.length} courses:\n${planInfo}`, 'info');
}

function setupMobileOptimizations() {
    // Add touch-friendly interactions
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Make buttons more touch-friendly
        document.querySelectorAll('.btn').forEach(btn => {
            btn.style.minHeight = '44px'; // iOS recommended touch target size
        });
        
        // Add touch event listeners for time slots
        document.addEventListener('touchstart', function(e) {
            if (e.target.classList.contains('time-slot')) {
                e.target.style.backgroundColor = '#e9ecef';
            }
        });
        
        document.addEventListener('touchend', function(e) {
            if (e.target.classList.contains('time-slot')) {
                setTimeout(() => {
                    e.target.style.backgroundColor = '';
                }, 150);
            }
        });
        
        // Prevent zoom on input focus (iOS)
        document.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('focus', function() {
                if (this.style.fontSize !== '16px') {
                    this.style.fontSize = '16px';
                }
            });
        });
        
        // Add swipe gestures for navigation (optional)
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', function(e) {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Horizontal swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - could be used for navigation
                    console.log('Swipe left detected');
                } else {
                    // Swipe right - could be used for navigation
                    console.log('Swipe right detected');
                }
            }
            
            startX = 0;
            startY = 0;
        });
        
        console.log('Mobile optimizations applied');
    }
}

// Space Management Functions
function initializeSpaceManagement() {
    console.log('Initializing space management features...');
    
    // Collapsible sections
    const plannerCollapseToggle = document.getElementById('planner-collapse-toggle');
    const plansCollapseToggle = document.getElementById('plans-collapse-toggle');
    const coursePlanner = document.getElementById('course-planner');
    const recommendedPlans = document.getElementById('recommended-plans');
    
    if (plannerCollapseToggle && coursePlanner) {
        plannerCollapseToggle.addEventListener('click', function() {
            coursePlanner.classList.toggle('collapsed');
            const isCollapsed = coursePlanner.classList.contains('collapsed');
            plannerCollapseToggle.textContent = isCollapsed ? '▶' : '▼';
            plannerCollapseToggle.title = isCollapsed ? 'Expand' : 'Collapse';
        });
    }
    
    if (plansCollapseToggle && recommendedPlans) {
        plansCollapseToggle.addEventListener('click', function() {
            recommendedPlans.classList.toggle('collapsed');
            const isCollapsed = recommendedPlans.classList.contains('collapsed');
            plansCollapseToggle.textContent = isCollapsed ? '▶' : '▼';
            plansCollapseToggle.title = isCollapsed ? 'Expand' : 'Collapse';
        });
    }
    
    // View toggles for plans
    const compactViewToggle = document.getElementById('compact-view-toggle');
    const detailedViewToggle = document.getElementById('detailed-view-toggle');
    
    if (compactViewToggle && detailedViewToggle) {
        compactViewToggle.addEventListener('click', function() {
            setPlanViewMode('compact');
        });
        
        detailedViewToggle.addEventListener('click', function() {
            setPlanViewMode('detailed');
        });
    }
    
    // Cart/Plan view toggles
    initializeCartPlanViewToggles();
    
    console.log('Space management features initialized');
}

function setPlanViewMode(mode) {
    const compactToggle = document.getElementById('compact-view-toggle');
    const detailedToggle = document.getElementById('detailed-view-toggle');
    const plansContainer = document.getElementById('plans-container');
    
    if (!plansContainer) return;
    
    // Update toggle states
    if (mode === 'compact') {
        compactToggle.classList.add('active');
        detailedToggle.classList.remove('active');
        plansContainer.classList.add('compact-view');
        plansContainer.classList.remove('detailed-view');
    } else {
        detailedToggle.classList.add('active');
        compactToggle.classList.remove('active');
        plansContainer.classList.add('detailed-view');
        plansContainer.classList.remove('compact-view');
    }
    
    // Re-render plans with new view mode
    if (typeof renderRecommendedPlans === 'function') {
        renderRecommendedPlans();
    }
}

function initializeCartPlanViewToggles() {
    // Add view toggle functionality for cart and plan sections
    // This will be called when cart/plan sections are displayed
    const cartContent = document.querySelector('.cart-content');
    const planContent = document.querySelector('.plan-content');
    
    if (cartContent) {
        addViewToggleToSection(cartContent, 'cart');
    }
    
    if (planContent) {
        addViewToggleToSection(planContent, 'plan');
    }
}

function addViewToggleToSection(section, type) {
    const countElement = section.querySelector(`.${type}-count`);
    if (!countElement) return;
    
    // Check if toggle already exists
    if (countElement.querySelector('.view-toggle')) return;
    
    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.gap = '4px';
    toggleContainer.style.marginLeft = 'auto';
    
    const compactToggle = document.createElement('button');
    compactToggle.className = 'view-toggle active';
    compactToggle.textContent = '📋';
    compactToggle.title = 'Compact View';
    compactToggle.addEventListener('click', () => setCartPlanViewMode(type, 'compact'));
    
    const detailedToggle = document.createElement('button');
    detailedToggle.className = 'view-toggle';
    detailedToggle.textContent = '📄';
    detailedToggle.title = 'Detailed View';
    detailedToggle.addEventListener('click', () => setCartPlanViewMode(type, 'detailed'));
    
    toggleContainer.appendChild(compactToggle);
    toggleContainer.appendChild(detailedToggle);
    
    countElement.appendChild(toggleContainer);
}

function setCartPlanViewMode(type, mode) {
    const section = document.querySelector(`.${type}-content`);
    if (!section) return;
    
    const compactToggle = section.querySelector('.view-toggle:first-child');
    const detailedToggle = section.querySelector('.view-toggle:last-child');
    const items = section.querySelectorAll(`.${type}-item`);
    
    if (mode === 'compact') {
        compactToggle.classList.add('active');
        detailedToggle.classList.remove('active');
        items.forEach(item => item.classList.add('compact'));
    } else {
        detailedToggle.classList.add('active');
        compactToggle.classList.remove('active');
        items.forEach(item => item.classList.remove('compact'));
    }
}

// Add compact view styles for plans
function addCompactPlanStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .plans-container.compact-view .plan-item {
            padding: 12px;
            margin-bottom: 8px;
        }
        
        .plans-container.compact-view .plan-header h4 {
            font-size: 14px;
        }
        
        .plans-container.compact-view .plan-content {
            display: none;
        }
        
        .plans-container.compact-view .plan-summary {
            font-size: 11px;
            padding: 2px 8px;
        }
        
        .plans-container.detailed-view .plan-item {
            padding: 20px;
            margin-bottom: 16px;
        }
        
        .plans-container.detailed-view .plan-header h4 {
            font-size: 18px;
        }
        
        .plans-container.detailed-view .plan-content {
            display: flex;
        }
    `;
    document.head.appendChild(style);
}

// Pagination functionality
function addPaginationToSection(container, itemsPerPage = 5) {
    const items = container.querySelectorAll('.course-item, .plan-item, .cart-item');
    if (items.length <= itemsPerPage) return;
    
    // Remove existing pagination
    const existingPagination = container.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let currentPage = 1;
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    // Create pagination buttons
    const prevButton = document.createElement('button');
    prevButton.textContent = '‹';
    prevButton.title = 'Previous page';
    
    const nextButton = document.createElement('button');
    nextButton.textContent = '›';
    nextButton.title = 'Next page';
    
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    
    // Create page number buttons
    const pageButtons = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => goToPage(i));
        pageButtons.push(pageButton);
    }
    
    // Add all elements to pagination container
    paginationContainer.appendChild(prevButton);
    pageButtons.forEach(btn => paginationContainer.appendChild(btn));
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextButton);
    
    // Add pagination to container
    container.appendChild(paginationContainer);
    
    // Pagination functions
    function goToPage(page) {
        currentPage = page;
        updateDisplay();
        updatePagination();
    }
    
    function updateDisplay() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        items.forEach((item, index) => {
            if (index >= startIndex && index < endIndex) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    function updatePagination() {
        // Update page info
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        pageInfo.textContent = `${startItem}-${endItem} of ${totalItems}`;
        
        // Update button states
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
        
        // Update page buttons
        pageButtons.forEach((btn, index) => {
            const pageNum = index + 1;
            btn.disabled = false;
            btn.classList.toggle('active', pageNum === currentPage);
        });
    }
    
    // Event listeners
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) goToPage(currentPage - 1);
    });
    
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) goToPage(currentPage + 1);
    });
    
    // Initialize display
    updateDisplay();
    updatePagination();
}

// Auto-pagination for sections
function initializeAutoPagination() {
    // Add pagination to results section
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
        const courseList = resultsSection.querySelector('.course-list');
        if (courseList) {
            addPaginationToSection(courseList, 8);
        }
    }
    
    // Add pagination to cart and plan sections when they're displayed
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const cartList = node.querySelector('.cart-list');
                        const planList = node.querySelector('.plan-list');
                        
                        if (cartList) {
                            addPaginationToSection(cartList, 6);
                        }
                        if (planList) {
                            addPaginationToSection(planList, 6);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Prevent duplicate courses in cart/plan
function preventDuplicateCourses() {
    // Override existing add to cart/plan functions if they exist
    if (typeof addToCart === 'function') {
        const originalAddToCart = addToCart;
        addToCart = function(course) {
            // Check if course already exists in cart
            const existingCourse = cartCourses.find(c => c.code === course.code);
            if (existingCourse) {
                showNotification('Course already in cart!', 'warning');
                return;
            }
            return originalAddToCart(course);
        };
    }
    
    if (typeof addToPlan === 'function') {
        const originalAddToPlan = addToPlan;
        addToPlan = function(course) {
            // Check if course already exists in plan
            const existingCourse = planCourses.find(c => c.code === course.code);
            if (existingCourse) {
                showNotification('Course already in plan!', 'warning');
                return;
            }
            return originalAddToPlan(course);
        };
    }
}

// Improved notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#28a745'};
        color: ${type === 'warning' ? '#333' : 'white'};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        font-weight: 600;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Enhanced course item rendering
function renderCourseItem(course, container, type = 'cart') {
    const existingItem = container.querySelector(`[data-course-code="${course.code}"]`);
    if (existingItem) {
        showNotification('Course already added!', 'warning');
        return;
    }
    
    const courseItem = document.createElement('div');
    courseItem.className = `${type}-item`;
    courseItem.setAttribute('data-course-code', course.code);
    
    courseItem.innerHTML = `
        <div class="${type}-item-info">
            <div class="${type}-item-code">${course.code}</div>
            <div class="${type}-item-title">${course.title}</div>
            <div class="${type}-item-credits">${course.credits} credits</div>
        </div>
        <button class="remove-from-${type}" onclick="removeFrom${type.charAt(0).toUpperCase() + type.slice(1)}('${course.code}')">
            Remove
        </button>
    `;
    
    container.appendChild(courseItem);
    
    // Add animation
    courseItem.style.opacity = '0';
    courseItem.style.transform = 'translateY(20px)';
    setTimeout(() => {
        courseItem.style.transition = 'all 0.3s ease';
        courseItem.style.opacity = '1';
        courseItem.style.transform = 'translateY(0)';
    }, 100);
}

// Improved remove functions
function removeFromCart(courseCode) {
    const courseItem = document.querySelector(`[data-course-code="${courseCode}"].cart-item`);
    if (courseItem) {
        courseItem.style.transition = 'all 0.3s ease';
        courseItem.style.opacity = '0';
        courseItem.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            courseItem.remove();
            updateCartCount();
        }, 300);
    }
}

function removeFromPlan(courseCode) {
    const courseItem = document.querySelector(`[data-course-code="${courseCode}"].plan-item`);
    if (courseItem) {
        courseItem.style.transition = 'all 0.3s ease';
        courseItem.style.opacity = '0';
        courseItem.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            courseItem.remove();
            updatePlanCount();
        }, 300);
    }
}

// Update count displays
function updateCartCount() {
    const cartItems = document.querySelectorAll('.cart-item');
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = `${cartItems.length} courses in cart`;
    }
}

function updatePlanCount() {
    const planItems = document.querySelectorAll('.plan-item');
    const planCount = document.querySelector('.plan-count');
    if (planCount) {
        planCount.textContent = `${planItems.length} courses in plan`;
    }
}

// Initialize space management when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeSpaceManagement();
        addCompactPlanStyles();
        initializeAutoPagination();
        preventDuplicateCourses();
    }, 500);
});