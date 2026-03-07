
const axios = require('axios');

async function testQuizAPI() {
    try {
        console.log('--- Testing Quiz API ---');
        
        // 1. First, we need to login or register to get a token
        // Let's try to login with the user from your screenshot if it exists, 
        // or just use a dummy one if we can't.
        // For testing purposes, I'll assume you have a user or I'll create one.
        
        const loginData = {
            email: 'rushi@gmail.com',
            password: 'password123'
        };

        console.log('Attempting to login...');
        let token;
        try {
            const loginRes = await axios.post('http://localhost:5001/api/auth/login', loginData);
            token = loginRes.data.token;
            console.log('Login successful!');
        } catch (err) {
            console.log('Login failed, attempting to register...');
            const registerRes = await axios.post('http://localhost:5001/api/auth/register', {
                name: 'Rushi Merat',
                ...loginData
            });
            token = registerRes.data.token;
            console.log('Registration successful!');
        }

        // 2. Now test the quiz start endpoint
        console.log('Testing /api/quiz/start...');
        const quizRes = await axios.post('http://localhost:5001/api/quiz/start', {
            subject: 'JavaScript',
            level: 'easy',
            count: 2
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Quiz API Response Status:', quizRes.status);
        if (quizRes.data.ok) {
            console.log('SUCCESS: Quiz generated successfully!');
            console.log('Questions:', JSON.stringify(quizRes.data.quiz.questions, null, 2));
        } else {
            console.log('FAILED: Quiz generation failed in response data.');
            console.log('Data:', quizRes.data);
        }

    } catch (error) {
        console.error('ERROR during testing:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testQuizAPI();
