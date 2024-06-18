## Speech Evaluation System

### Overview
This repository contains a Node.js application for evaluating spoken audio files based on various linguistic and sentiment analysis metrics. The system transcribes audio to text using Google Cloud Speech-to-Text API, evaluates the transcribed text against predefined criteria, and provides a comprehensive evaluation score.

### Features
1. **Audio-to-Text Conversion**: Utilizes Google Cloud's Speech-to-Text API to convert audio files (in `.wav` format) to textual transcripts.
   
2. **Evaluation Metrics**:
   - **Accuracy**: Measures how closely the transcribed text matches the predefined text.
   - **Hesitation Rate**: Calculates the frequency of pauses and filler words, indicative of speaker confidence.
   - **Pronunciation Accuracy**: Assesses pronunciation fidelity using phonetic encoding (Soundex algorithm).
   - **Expression Score**: Evaluates sentiment and emotional tone using the AFINN-based sentiment analysis library.
   - **Weighted Average Score**: Combines all metrics to provide an overall evaluation score.
   - **Grade Assignment**: Assigns a grade (e.g., Excellent, Very Good) based on the weighted average score.

3. **Technologies Used**:
   - **Node.js**: Backend server environment.
   - **Express.js**: Web framework for routing and handling HTTP requests.
   - **Multer**: Middleware for handling file uploads.
   - **Google Cloud Speech-to-Text API**: Converts audio data to text.
   - **Sentiment**: Node.js library for sentiment analysis.
   - **MongoDB (as future scope)**: For storing and querying evaluation results.

4. **Future Scope**:
   - **Machine Learning Implementation**: Enhance accuracy through training models on diverse speech patterns and improving sentiment analysis.
   - **Database Integration**: Store evaluation results for historical analysis and reporting.
   - **Real-time Evaluation**: Implement streaming audio processing for immediate feedback during speech.
   - **User Interface**: Develop a frontend interface for easy file uploads, real-time evaluation, and result visualization.


VS code backend:
![image](https://github.com/Vedantt-Patel/Speech-Quality-Evaluator/assets/145900718/69835495-a52a-42dc-ba53-69923412bf75)


Postman API testing:
![Screenshot (41)](https://github.com/Vedantt-Patel/Speech-Quality-Evaluator/assets/145900718/af58e3ab-11d7-497e-a375-c59a317f67cf)


### Setup Instructions
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   cd <repository-folder>
   npm install
   ```
3. Set up Google Cloud credentials:
   - Obtain a service account key for Speech-to-Text API and set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to its path.

4. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`.

### Usage
- **Uploading Audio**: Use `/evaluate` endpoint (POST request with audio file) to upload an audio file for evaluation.
- **Local File Evaluation**: Uncomment and modify `evaluateLocalAudioFile` function to evaluate a local `.wav` file.

### Example
```javascript
const localAudioFilePath = 'path/to/local/audio/sample.wav';
evaluateLocalAudioFile(localAudioFilePath);
```

### Contributors
- Add your name here if contributing to this project.

### Contact
For questions or issues, please contact [your-email@example.com](mailto:your-vedxnt2912@gmail.com).

---

Feel free to expand on each section with more detailed explanations or add additional functionalities as needed. This readme aims to provide a comprehensive overview and setup guide for anyone interested in using or contributing to the project.
