/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Replace these with your GitHub info
const GITHUB_USERNAME = 'rickgomez223';
const GITHUB_REPO = 'DevThings';
const GITHUB_TOKEN = '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';
const EMAIL_RECIPIENT = 'kyle@mail.devthings.pro'; // Your email for backup

// Setup Nodemailer for email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-gmail-email@example.com',
    pass: 'your-gmail-password'
  }
});

// Cloud Function triggered by Firebase Scheduler (runs daily)
exports.dailyBackup = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  try {
    // Check GitHub commits
    const response = await axios.get(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/commits`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });

    // Get the latest commit
    const latestCommit = response.data[0];
    const commitAuthor = latestCommit.commit.author.name;

    // Check if the commit author matches your username
    if (commitAuthor !== GITHUB_USERNAME) {
      console.log("Commit was not made by you, skipping backup.");
      return null;
    }

    // Download the repo as a ZIP file
    const zipResponse = await axios({
      url: `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/zipball`,
      method: 'GET',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      },
      responseType: 'arraybuffer'
    });

    // Send the ZIP file via email
    await transporter.sendMail({
      from: '"Backup Service" <your-gmail-email@example.com>',
      to: EMAIL_RECIPIENT,
      subject: 'Daily GitHub Repo Backup',
      text: 'Here is your daily backup of the GitHub repository.',
      attachments: [
        {
          filename: `${GITHUB_REPO}.zip`,
          content: zipResponse.data,
          encoding: 'base64'
        }
      ]
    });

    console.log('Backup email sent successfully!');
    return null;

  } catch (error) {
    console.error('Error during backup process:', error);
    return null;
  }
});