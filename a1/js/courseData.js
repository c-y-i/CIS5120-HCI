// Course data - some courses have multiple sections
// Generated data, not real
const COURSE_DATA = [
    {
        id: 'CIS1100',
        code: 'CIS 1100',
        title: 'Introduction to Computer Programming',
        description: 'Learn the fundamentals of programming from the creator of C++. Covers variables, loops, functions, and why C++ is still the best language.',
        credits: 4,
        sections: [
            {
                id: 'CIS1100-001',
                section: '001',
                times: [
                    { day: 'Monday', start: '10:00', end: '11:30' },
                    { day: 'Wednesday', start: '10:00', end: '11:30' },
                    { day: 'Friday', start: '10:00', end: '11:30' }
                ],
                instructor: 'Dr. Bjarne Stroustrup',
                capacity: 120,
                enrolled: 95
            },
            {
                id: 'CIS1100-002',
                section: '002',
                times: [
                    { day: 'Tuesday', start: '09:00', end: '10:30' },
                    { day: 'Thursday', start: '09:00', end: '10:30' }
                ],
                instructor: 'Prof. Alan Kay',
                capacity: 80,
                enrolled: 67
            },
            {
                id: 'CIS1100-003',
                section: '003',
                times: [
                    { day: 'Monday', start: '14:00', end: '15:30' },
                    { day: 'Wednesday', start: '14:00', end: '15:30' },
                    { day: 'Friday', start: '14:00', end: '15:30' }
                ],
                instructor: 'Dr. Grace Hopper',
                capacity: 100,
                enrolled: 89
            }
        ],
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS1200',
        code: 'CIS 1200',
        title: 'Programming Languages and Techniques I',
        description: 'Functional programming with OCaml. Learn why functional programming is superior and why everyone else is doing it wrong.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '14:00', end: '15:30' },
            { day: 'Thursday', start: '14:00', end: '15:30' }
        ],
        instructor: 'Prof. Jane Kahan',
        capacity: 80,
        enrolled: 78,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS1210',
        code: 'CIS 1210',
        title: 'Programming Languages and Techniques II',
        description: 'Object-oriented programming in Java. Learn why Java is the language of the future and why C++ is outdated.',
        credits: 4,
        times: [
            { day: 'Monday', start: '16:00', end: '17:30' },
            { day: 'Wednesday', start: '16:00', end: '17:30' }
        ],
        instructor: 'Dr. James Gosling',
        capacity: 100,
        enrolled: 88,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS1600',
        code: 'CIS 1600',
        title: 'Mathematical Foundations of Computer Science',
        description: 'Discrete mathematics and proofs. Learn to think like a mathematician and why intuition is overrated.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '10:00', end: '11:30' },
            { day: 'Thursday', start: '10:00', end: '11:30' }
        ],
        instructor: 'Prof. Alan Turing',
        capacity: 90,
        enrolled: 82,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS2400',
        code: 'CIS 2400',
        title: 'Introduction to Computer Systems',
        description: 'Computer organization and assembly language. Learn what really happens when you run "Hello World".',
        credits: 4,
        times: [
            { day: 'Monday', start: '12:00', end: '13:30' },
            { day: 'Wednesday', start: '12:00', end: '13:30' },
            { day: 'Friday', start: '12:00', end: '13:30' }
        ],
        instructor: 'Saul Goodman',
        capacity: 110,
        enrolled: 105,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS2620',
        code: 'CIS 2620',
        title: 'Automata, Computability, and Complexity',
        description: 'Formal languages and computational theory. Learn why some problems are impossible to solve.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '16:00', end: '17:30' },
            { day: 'Thursday', start: '16:00', end: '17:30' }
        ],
        instructor: 'Mike Ehrmantraut',
        capacity: 70,
        enrolled: 65,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS3200',
        code: 'CIS 3200',
        title: 'Introduction to Algorithms',
        description: 'Algorithm design and analysis. Learn to solve problems efficiently and why brute force is for amateurs.',
        credits: 4,
        times: [
            { day: 'Monday', start: '14:00', end: '15:30' },
            { day: 'Wednesday', start: '14:00', end: '15:30' }
        ],
        instructor: 'Jesse Pinkman',
        capacity: 85,
        enrolled: 80,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS3800',
        code: 'CIS 3800',
        title: 'Database and Information Systems',
        description: 'Database design and SQL. Learn why relational databases are the only databases that matter.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '12:00', end: '13:30' },
            { day: 'Thursday', start: '12:00', end: '13:30' }
        ],
        instructor: 'Hank Schrader',
        capacity: 95,
        enrolled: 92,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS4000',
        code: 'CIS 4000',
        title: 'Computer Networks',
        description: 'Network protocols and TCP/IP. Learn how the internet actually works and why your WiFi is slow.',
        credits: 4,
        times: [
            { day: 'Monday', start: '18:00', end: '19:30' },
            { day: 'Wednesday', start: '18:00', end: '19:30' }
        ],
        instructor: 'Kim Wexler',
        capacity: 75,
        enrolled: 70,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS4500',
        code: 'CIS 4500',
        title: 'Software Engineering',
        description: 'Software development lifecycle and project management. Learn why your code is terrible and how to fix it.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '18:00', end: '19:30' },
            { day: 'Thursday', start: '18:00', end: '19:30' }
        ],
        instructor: 'Lalo Salamanca',
        capacity: 60,
        enrolled: 58,
        department: 'CIS',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'MEAM1100',
        code: 'MEAM 1100',
        title: 'Introduction to Mechanical Engineering',
        description: 'Basic principles of mechanical engineering. Learn why mechanical engineers are the real engineers.',
        credits: 4,
        times: [
            { day: 'Monday', start: '09:00', end: '10:30' },
            { day: 'Wednesday', start: '09:00', end: '10:30' },
            { day: 'Friday', start: '09:00', end: '10:30' }
        ],
        instructor: 'Nacho Varga',
        capacity: 100,
        enrolled: 85,
        department: 'MEAM',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'MEAM1200',
        code: 'MEAM 1200',
        title: 'Materials Science and Engineering',
        description: 'Properties and behavior of materials. Learn why Walter White was actually a great materials scientist.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '11:00', end: '12:30' },
            { day: 'Thursday', start: '11:00', end: '12:30' }
        ],
        instructor: 'Prof. Walter White',
        capacity: 80,
        enrolled: 75,
        department: 'MEAM',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'MEAM1300',
        code: 'MEAM 1300',
        title: 'Thermodynamics',
        description: 'Energy, heat, and work in mechanical systems. Learn why perpetual motion machines are impossible.',
        credits: 4,
        times: [
            { day: 'Monday', start: '13:00', end: '14:30' },
            { day: 'Wednesday', start: '13:00', end: '14:30' }
        ],
        instructor: 'Dr. Sadi Carnot',
        capacity: 90,
        enrolled: 88,
        department: 'MEAM',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'ESE1100',
        code: 'ESE 1100',
        title: 'Introduction to Electrical Engineering',
        description: 'Basic electrical circuits and systems. Learn why electricity is magic that we pretend to understand.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '09:00', end: '10:30' },
            { day: 'Thursday', start: '09:00', end: '10:30' }
        ],
        instructor: 'Prof. Thomas Edison',
        capacity: 110,
        enrolled: 95,
        department: 'ESE',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'ESE1200',
        code: 'ESE 1200',
        title: 'Digital Systems Design',
        description: 'Digital logic and computer architecture. Learn why everything is just 1s and 0s.',
        credits: 4,
        times: [
            { day: 'Monday', start: '15:00', end: '16:30' },
            { day: 'Wednesday', start: '15:00', end: '16:30' }
        ],
        instructor: 'Dr. Claude Shannon',
        capacity: 85,
        enrolled: 80,
        department: 'ESE',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'ESE1300',
        code: 'ESE 1300',
        title: 'Signals and Systems',
        description: 'Mathematical foundations of signal processing. Learn why your phone can understand you.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '13:00', end: '14:30' },
            { day: 'Thursday', start: '13:00', end: '14:30' }
        ],
        instructor: 'Prof. Harry Nyquist',
        capacity: 75,
        enrolled: 72,
        department: 'ESE',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'BE1100',
        code: 'BE 1100',
        title: 'Introduction to Bioengineering',
        description: 'Engineering principles applied to biological systems. Learn why biology is just messy engineering.',
        credits: 4,
        times: [
            { day: 'Monday', start: '11:00', end: '12:30' },
            { day: 'Wednesday', start: '11:00', end: '12:30' },
            { day: 'Friday', start: '11:00', end: '12:30' }
        ],
        instructor: 'Dr. Rosalind Franklin',
        capacity: 70,
        enrolled: 65,
        department: 'BE',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'BE1200',
        code: 'BE 1200',
        title: 'Biomechanics',
        description: 'Mechanical principles in biological systems. Learn why your bones are better than steel.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '15:00', end: '16:30' },
            { day: 'Thursday', start: '15:00', end: '16:30' }
        ],
        instructor: 'Prof. Leonardo da Vinci',
        capacity: 60,
        enrolled: 55,
        department: 'BE',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'BE1300',
        code: 'BE 1300',
        title: 'Biomaterials',
        description: 'Materials used in medical applications. Learn why titanium is the best metal for implants.',
        credits: 4,
        times: [
            { day: 'Monday', start: '14:00', end: '15:30' },
            { day: 'Wednesday', start: '14:00', end: '15:30' }
        ],
        instructor: 'Dr. Marie Curie',
        capacity: 50,
        enrolled: 48,
        department: 'BE',
        type: 'in-person',
        level: 'undergrad'
    },
    {
        id: 'CIS5000',
        code: 'CIS 5000',
        title: 'Advanced Algorithms',
        description: 'Graduate-level algorithm design and analysis. Learn why your undergraduate algorithms were too easy.',
        credits: 4,
        times: [
            { day: 'Monday', start: '16:00', end: '17:30' },
            { day: 'Wednesday', start: '16:00', end: '17:30' }
        ],
        instructor: 'Dr. Richard Karp',
        capacity: 40,
        enrolled: 35,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    },
    {
        id: 'CIS5100',
        code: 'CIS 5100',
        title: 'Machine Learning',
        description: 'Statistical learning and artificial intelligence. Learn why AI will replace all of us eventually.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '10:00', end: '11:30' },
            { day: 'Thursday', start: '10:00', end: '11:30' }
        ],
        instructor: 'Prof. Geoffrey Hinton',
        capacity: 45,
        enrolled: 42,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    },
    {
        id: 'CIS5200',
        code: 'CIS 5200',
        title: 'Computer Vision',
        description: 'Image processing and computer vision. Learn why computers are better at seeing than humans.',
        credits: 4,
        times: [
            { day: 'Monday', start: '18:00', end: '19:30' },
            { day: 'Wednesday', start: '18:00', end: '19:30' }
        ],
        instructor: 'Dr. Yann LeCun',
        capacity: 35,
        enrolled: 32,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    },
    {
        id: 'CIS5300',
        code: 'CIS 5300',
        title: 'Natural Language Processing',
        description: 'Computational linguistics and text processing. Learn why chatbots are still terrible.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '14:00', end: '15:30' },
            { day: 'Thursday', start: '14:00', end: '15:30' }
        ],
        instructor: 'Gus Fring',
        capacity: 30,
        enrolled: 28,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    },
    {
        id: 'CIS5400',
        code: 'CIS 5400',
        title: 'Distributed Systems',
        description: 'Large-scale distributed computing systems. Learn why your single server is not enough.',
        credits: 4,
        times: [
            { day: 'Monday', start: '12:00', end: '13:30' },
            { day: 'Wednesday', start: '12:00', end: '13:30' }
        ],
        instructor: 'Dr. Leslie Lamport',
        capacity: 25,
        enrolled: 22,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    },
    {
        id: 'CIS5500',
        code: 'CIS 5500',
        title: 'Database Systems',
        description: 'Advanced database design and implementation. Learn why SQL is the only query language that matters.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '16:00', end: '17:30' },
            { day: 'Thursday', start: '16:00', end: '17:30' }
        ],
        instructor: 'Prof. Michael Stonebraker',
        capacity: 30,
        enrolled: 27,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    },
    {
        id: 'CIS5600',
        code: 'CIS 5600',
        title: 'Computer Graphics',
        description: '3D graphics and rendering algorithms. Learn why video games look so realistic.',
        credits: 4,
        times: [
            { day: 'Monday', start: '14:00', end: '15:30' },
            { day: 'Wednesday', start: '14:00', end: '15:30' }
        ],
        instructor: 'Dr. Ivan Sutherland',
        capacity: 35,
        enrolled: 30,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    },
    {
        id: 'CIS5700',
        code: 'CIS 5700',
        title: 'Cryptography',
        description: 'Mathematical foundations of cryptography. Learn why your passwords are not secure.',
        credits: 4,
        times: [
            { day: 'Tuesday', start: '18:00', end: '19:30' },
            { day: 'Thursday', start: '18:00', end: '19:30' }
        ],
        instructor: 'Prof. Whitfield Diffie',
        capacity: 25,
        enrolled: 20,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    },
    {
        id: 'CIS5800',
        code: 'CIS 5800',
        title: 'Software Engineering',
        description: 'Advanced software development methodologies. Learn why your code is still terrible.',
        credits: 4,
        times: [
            { day: 'Monday', start: '10:00', end: '11:30' },
            { day: 'Wednesday', start: '10:00', end: '11:30' }
        ],
        instructor: 'Dr. Grady Booch',
        capacity: 40,
        enrolled: 35,
        department: 'CIS',
        type: 'in-person',
        level: 'grad'
    }
];

// Course data functions
function getCourseById(id) {
    return COURSE_DATA.find(course => course.id === id);
}

function getCoursesByTime(day, startTime, endTime) {
    return COURSE_DATA.filter(course => {
        return course.times.some(time => {
            return time.day === day && 
                   time.start === startTime && 
                   time.end === endTime;
        });
    });
}

function getAllCourses() {
    return COURSE_DATA;
}

function searchCourses(keywords, semester, program, courseType) {
    // Handle empty or undefined keywords
    const searchTerm = (keywords && typeof keywords === 'string') ? keywords.toLowerCase().trim() : '';
    
    let filteredCourses = COURSE_DATA.filter(course => {
        // Safe string matching with comprehensive null checks
        const matchesKeywords = !searchTerm || 
                               (course.title && typeof course.title === 'string' && course.title.toLowerCase().includes(searchTerm)) ||
                               (course.code && typeof course.code === 'string' && course.code.toLowerCase().includes(searchTerm)) ||
                               (course.description && typeof course.description === 'string' && course.description.toLowerCase().includes(searchTerm)) ||
                               (course.instructor && typeof course.instructor === 'string' && course.instructor.toLowerCase().includes(searchTerm));
        
        const matchesProgram = !program || program === 'all' || course.department === program;
        
        const matchesType = !courseType || courseType === 'all' || 
                           (courseType === 'undergrad' && course.level === 'undergrad') ||
                           (courseType === 'grad' && course.level === 'grad') ||
                           course.type === courseType;
        
        return matchesKeywords && matchesProgram && matchesType;
    });
    
    return filteredCourses;
}

// Calendar time slots
const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function timeToIndex(time) {
    return TIME_SLOTS.indexOf(time);
}

function indexToTime(index) {
    return TIME_SLOTS[index];
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

function getEnrollmentColor(enrolled, capacity) {
    const percentage = (enrolled / capacity) * 100;
    if (percentage < 60) return '#28a745'; // Green - relatively open
    if (percentage < 85) return '#ffc107'; // Yellow - mid enrollment
    return '#dc3545'; // Red - close to full or full
}