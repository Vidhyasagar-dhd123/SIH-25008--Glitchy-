// Test script for lesson search functionality
const BASE_URL = 'http://localhost:3000/api';

async function testLessonSearch() {
    console.log('🧪 Testing Lesson Search by Hyphen-Separated Names\n');
    
    const testCases = [
        'fire-safety',
        'earthquake-preparedness', 
        'flood-response',
        'basic-first-aid',
        'emergency-evacuation',
        'disaster-communication'
    ];
    
    for (const searchTerm of testCases) {
        console.log(`\n🔍 Testing search term: "${searchTerm}"`);
        console.log('='.repeat(50));
        
        try {
            const response = await fetch(`${BASE_URL}/lessons/search?searchTerm=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ Success: Found ${data.data.length} lessons`);
                console.log(`📝 Hyphenated term used: ${data.searchTerm}`);
                
                if (data.data.length > 0) {
                    console.log('📚 Lessons found:');
                    data.data.forEach((lesson, index) => {
                        console.log(`   ${index + 1}. ${lesson.title} (ID: ${lesson.lessonId})`);
                        console.log(`      Module: ${lesson.module?.name || 'N/A'}`);
                    });
                } else {
                    console.log('   No lessons match this search term');
                }
            } else {
                console.log(`❌ Error: ${data.message || data.error}`);
            }
        } catch (error) {
            console.log(`💥 Request failed: ${error.message}`);
        }
    }
    
    // Test edge cases
    console.log('\n\n🧪 Testing Edge Cases\n');
    console.log('='.repeat(50));
    
    const edgeCases = [
        { term: '', description: 'Empty string' },
        { term: '   ', description: 'Only spaces' },
        { term: 'Fire Safety Basics', description: 'Spaces (should convert to hyphens)' },
        { term: 'earthquake!!!preparedness', description: 'Special characters' },
        { term: 'FIRE-SAFETY', description: 'Uppercase' }
    ];
    
    for (const testCase of edgeCases) {
        console.log(`\n🔍 ${testCase.description}: "${testCase.term}"`);
        
        try {
            const response = await fetch(`${BASE_URL}/lessons/search?searchTerm=${encodeURIComponent(testCase.term)}`);
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ Converted to: "${data.searchTerm}" - Found ${data.data.length} lessons`);
            } else {
                console.log(`❌ Error: ${data.message || data.error}`);
            }
        } catch (error) {
            console.log(`💥 Request failed: ${error.message}`);
        }
    }
}

// Test getAllLessons with search parameter
async function testGetAllLessonsWithSearch() {
    console.log('\n\n🧪 Testing getAllLessons with search parameter\n');
    console.log('='.repeat(50));
    
    const searchTerms = ['fire', 'safety', 'emergency'];
    
    for (const term of searchTerms) {
        console.log(`\n🔍 Testing getAllLessons with search: "${term}"`);
        
        try {
            const response = await fetch(`${BASE_URL}/lessons?search=${encodeURIComponent(term)}`);
            const data = await response.json();
            
            if (response.ok && Array.isArray(data)) {
                console.log(`✅ Found ${data.length} lessons containing "${term}"`);
                data.slice(0, 3).forEach((lesson, index) => {
                    console.log(`   ${index + 1}. ${lesson.title} (ID: ${lesson.lessonId})`);
                });
            } else {
                console.log(`❌ Error or unexpected response format`);
            }
        } catch (error) {
            console.log(`💥 Request failed: ${error.message}`);
        }
    }
}

// Run tests
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testLessonSearch().then(() => testGetAllLessonsWithSearch());
} else {
    // Browser environment
    console.log('🚀 Running in browser - make sure backend is running on localhost:3000');
    testLessonSearch().then(() => testGetAllLessonsWithSearch());
}

// Export for use in HTML
if (typeof module !== 'undefined') {
    module.exports = { testLessonSearch, testGetAllLessonsWithSearch };
}