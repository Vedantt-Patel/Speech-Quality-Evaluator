const express = require('express');
const multer = require('multer');
const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');
const Sentiment = require('sentiment');
const mongoose = require('mongoose');

// process.env.GOOGLE_APPLICATION_CREDENTIALS = "speech-text-key.json";

const client = new SpeechClient();
const sentiment = new Sentiment();

const app = express();
const port = 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Predefined text for evaluation
const predefinedText = "it was anxious to find him knowing that expectation of a man who were giving his father enjoyment and she was avoided insight in the minister to which indeed";

// Function to convert audio to text
const convertAudioToText = async (filePath) => {
    const file = fs.readFileSync(filePath);
    const audioBytes = file.toString('base64');

    const request = {
        audio: {
            content: audioBytes,
        },
        config: {
            encoding: 'LINEAR16',
            languageCode: 'en-US',
        },
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    return transcription;
};

// Evaluate the text
const evaluateText = async (transcribedText) => {
    const transcribedWords = transcribedText.split(' ');
    const predefinedWords = predefinedText.split(' ');

    let correctWords = 0;

    predefinedWords.forEach((word, index) => {
        if (transcribedWords[index] && transcribedWords[index].toLowerCase() === word.toLowerCase()) {
            correctWords++;
        }
    });

    const accuracy = (correctWords / predefinedWords.length) * 100;
    const hesitationRate = parseFloat(calculateHesitation(transcribedText)); // Calculate hesitation rate and ensure it's a number
    const pronunciationAccuracy = parseFloat(calculatePronunciation(predefinedText, transcribedText)); // Calculate pronunciation accuracy and ensure it's a number
    const expressionScore = parseFloat(calculateExpression(transcribedText)); // Calculate expression score and ensure it's a number

    const weightedAverageScore = calculateWeightedAverage({
        accuracy,
        hesitationRate,
        pronunciationAccuracy,
        expressionScore
    });

    const grade = assignGrade(weightedAverageScore);

    return {
        accuracy: accuracy.toFixed(2),
        hesitationRate: hesitationRate.toFixed(2),
        pronunciationAccuracy: pronunciationAccuracy.toFixed(2),
        expressionScore: expressionScore.toFixed(2),
        weightedAverageScore: weightedAverageScore.toFixed(2),
        grade: grade
    };
};

// Hesitation rate
const calculateHesitation = (spokenText) => {
    const words = spokenText.toLowerCase().match(/\b\w+\b/g); // Match words while ignoring punctuation

    const fillerWords = ['uh','ah','aa','um','like','you know','well']; // Additional filler words to consider
    const pauseDurationThreshold = 1.5; // Minimum pause duration in seconds to count as hesitation

    let hesitationCount = 0;
    let totalPauseDuration = 0;
    let isInsidePause = false;
    let pauseStart = 0;

    words.forEach((word, index) => {
        if (fillerWords.includes(word)) {
            hesitationCount++;
        }

        // Detect pauses based on punctuation or silence
        const isPause = !word.trim();

        if (isPause && !isInsidePause) {
            // Start of a new pause
            isInsidePause = true;
            pauseStart = index;
        } else if (!isPause && isInsidePause) {
            // End of a pause
            isInsidePause = false;
            const pauseDuration = index - pauseStart;
            if (pauseDuration >= pauseDurationThreshold) {
                totalPauseDuration += pauseDuration;
            }
        }
    });

    const hesitationRate = (hesitationCount + (totalPauseDuration / words.length)) / words.length * 100;

    return hesitationRate;
};

// Pronunciation accuracy using Soundex
const calculatePronunciation = (correctText, spokenText) => {
    const correctWords = correctText.split(/\s+/).map(word => soundex(word));
    const spokenWords = spokenText.split(/\s+/).map(word => soundex(word));

    let correctCount = 0;
    correctWords.forEach((correctWord, index) => {
        if (spokenWords[index] && spokenWords[index] === correctWord) {
            correctCount++;
        }
    });

    return (correctCount / correctWords.length) * 100;
};

// Soundex function - phonetics using mapping
const soundex = (word) => {
    const map = {
        'B': 1, 'F': 1, 'P': 1, 'V': 1,
        'C': 2, 'G': 2, 'J': 2, 'K': 2, 'Q': 2, 'S': 2, 'X': 2, 'Z': 2,
        'D': 3, 'T': 3,
        'L': 4,
        'M': 5, 'N': 5,
        'R': 6
    };
    
    const firstLetter = word[0].toUpperCase();
    const chars = word.toUpperCase().split('');
    
    const encoded = [firstLetter];
    let prevCode = map[firstLetter] || null;
    
    for (let i = 1; i < chars.length; i++) {
        const code = map[chars[i]] || 0;
        if (code !== prevCode && code !== 0) {
            encoded.push(code);
        }
        if (encoded.length === 4) break;
        prevCode = code;
    }
    
    return (encoded.join('') + '0000').slice(0, 4);
};

// Expression score using sentiment analysis
const calculateExpression = (spokenText) => {
    const result = sentiment.analyze(spokenText);
    const sentimentScore = result.score;
    return sentimentScore;
};

// Weighted average of scores
const calculateWeightedAverage = (scores) => {
    const weights = {
        accuracy: 0.4,
        hesitationRate: 0.2,
        pronunciationAccuracy: 0.2,
        expressionScore: 0.2
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (let key in scores) {
        totalScore += scores[key] * weights[key];
        totalWeight += weights[key];
    }

    return totalScore / totalWeight;
};

// Assign a grade based on the weighted average score
const assignGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Above Average';
    if (score >= 50) return 'Average';
    if (score >= 40) return 'Below Average';
    return 'Poor';
};

// Endpoint to handle audio file upload and evaluation
app.post('/evaluate', upload.single('audio'), async (req, res) => {
    try {
        const audioFilePath = req.file.path;
        const transcribedText = await convertAudioToText(audioFilePath);
        const evaluationResult = await evaluateText(transcribedText);

        // Cleanup uploaded file
        fs.unlinkSync(audioFilePath);

        res.json(evaluationResult);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the audio file.');
    }
});

// Evaluate a local audio file
const evaluateLocalAudioFile = async (localFilePath) => {
    try {
        const transcribedText = await convertAudioToText(localFilePath);
        const evaluationResult = await evaluateText(transcribedText);

        console.log('Transcribed Text:', transcribedText);
        console.log('Evaluation Result:', evaluationResult);

        return evaluationResult;
    } catch (error) {
        console.error('Error processing the audio file:', error);
    }
};

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    // const localAudioFilePath = 'sample-1.wav';
    evaluateLocalAudioFile(localAudioFilePath);
});