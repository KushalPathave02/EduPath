const axios = require('axios');

const API_URL = 'http://localhost:5000/api/quiz';
const TEST_USER_ID = '60d5ecb8b4850b3e8c8e8b09'; // A mock ObjectId

// Helper to submit a quiz
async function submitQuiz(quiz, answers) {
  try {
    await axios.post(`${API_URL}/submit`, { quiz, answers, userId: TEST_USER_ID });
    console.log(`✅ Submitted quiz for subject: ${quiz.subject}`);
  } catch (error) {
    console.error(`❌ Failed to submit quiz for ${quiz.subject}:`, error.message);
  }
}

async function testPersonalization() {
  console.log('--- 🧪 Starting personalization test ---');

  // 1. Create mock history
  console.log('Step 1: Submitting mock quiz history...');
  const historyQuiz = {
    subject: 'History',
    level: 'easy',
    questions: [
      { id: 'h1', question: 'Who was the first US president?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
      { id: 'h2', question: 'When did WWII end?', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
    ],
  };
  await submitQuiz(historyQuiz, [0, 1]); // Score: 2/2 (100%)

  const mathQuiz = {
    subject: 'Math',
    level: 'easy',
    questions: [
      { id: 'm1', question: '2 + 2 = ?', options: ['1', '2', '3', '4'], correctIndex: 3 },
      { id: 'm2', question: '10 * 5 = ?', options: ['50', '40', '30', '20'], correctIndex: 0 },
    ],
  };
  await submitQuiz(mathQuiz, [3, 1]); // Score: 1/2 (50%)

  // 2. Request a personalized quiz
  console.log('\nStep 2: Requesting a personalized quiz...');
  try {
    const response = await axios.post(`${API_URL}/start`, 
      { userId: TEST_USER_ID, count: 1 },
      { timeout: 30000 }
    );

    const newQuiz = response.data.quiz;
    console.log('✅ Backend responded with a new quiz!');

    // 3. Verify the subject
    console.log(`\nStep 3: Verifying the quiz subject...`);
    if (newQuiz.subject === 'Math') {
      console.log(`✅ SUCCESS: Personalized quiz is for 'Math' as expected.`);
    } else {
      console.error(`❌ FAILURE: Expected quiz for 'Math', but got '${newQuiz.subject}'.`);
    }
    console.log('------------------------------------');

  } catch (error) {
    console.error('❌ Personalization test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testPersonalization();
