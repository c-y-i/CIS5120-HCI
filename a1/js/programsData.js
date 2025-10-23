// Engineering programs at Penn
// Generated data, not real
const PROGRAMS_DATA = [
    {
        id: 'CIS',
        name: 'Computer and Information Science',
        fullName: 'Computer and Information Science',
        department: 'CIS',
        description: 'Computer science, software engineering, and information systems'
    },
    {
        id: 'MEAM',
        name: 'Mechanical Engineering and Applied Mechanics',
        fullName: 'Mechanical Engineering and Applied Mechanics',
        department: 'MEAM',
        description: 'Mechanical systems, robotics, and applied mechanics'
    },
    {
        id: 'ESE',
        name: 'Electrical and Systems Engineering',
        fullName: 'Electrical and Systems Engineering',
        department: 'ESE',
        description: 'Electrical engineering, systems engineering, and control systems'
    },
    {
        id: 'BE',
        name: 'Bioengineering',
        fullName: 'Bioengineering',
        department: 'BE',
        description: 'Biomedical engineering, biotechnology, and bioinformatics'
    },
    {
        id: 'CBE',
        name: 'Chemical and Biomolecular Engineering',
        fullName: 'Chemical and Biomolecular Engineering',
        department: 'CBE',
        description: 'Chemical processes, biomolecular engineering, and materials science'
    },
    {
        id: 'MSE',
        name: 'Materials Science and Engineering',
        fullName: 'Materials Science and Engineering',
        department: 'MSE',
        description: 'Materials properties, nanotechnology, and materials processing'
    },
    {
        id: 'ENM',
        name: 'Engineering Mathematics',
        fullName: 'Engineering Mathematics',
        department: 'ENM',
        description: 'Mathematical methods in engineering and applied mathematics'
    },
    {
        id: 'NETS',
        name: 'Networked and Social Systems Engineering',
        fullName: 'Networked and Social Systems Engineering',
        department: 'NETS',
        description: 'Network systems, social computing, and distributed systems'
    },
    {
        id: 'ROBO',
        name: 'Robotics',
        fullName: 'Robotics',
        department: 'ROBO',
        description: 'Robotic systems, automation, and intelligent machines'
    },
    {
        id: 'DATS',
        name: 'Data Science',
        fullName: 'Data Science',
        department: 'DATS',
        description: 'Data analysis, machine learning, and statistical methods'
    }
];

// Available semesters
const SEMESTERS = [
    '2025 Spring',
    '2025 Summer',
    '2025 Fall',
    '2026 Spring',
    '2026 Summer',
    '2026 Fall'
];

// Course type options
const COURSE_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'in-person', label: 'In-Person' },
    { value: 'online', label: 'Online' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'undergrad', label: 'Undergraduate (4xxx and under)' },
    { value: 'grad', label: 'Graduate (5xxx and higher)' },
    { value: 'seminar', label: 'Seminars' },
    { value: 'lab', label: 'Laboratory' },
    { value: 'lecture', label: 'Lecture' }
];

// Utility functions
function getProgramById(id) {
    return PROGRAMS_DATA.find(program => program.id === id);
}

function searchPrograms(query) {
    const searchTerm = query.toLowerCase();
    return PROGRAMS_DATA.filter(program => 
        program.name.toLowerCase().includes(searchTerm) ||
        program.fullName.toLowerCase().includes(searchTerm) ||
        program.department.toLowerCase().includes(searchTerm) ||
        program.description.toLowerCase().includes(searchTerm)
    );
}

function getAllPrograms() {
    return PROGRAMS_DATA;
}

function getAllSemesters() {
    return SEMESTERS;
}

function getAllCourseTypes() {
    return COURSE_TYPES;
}
