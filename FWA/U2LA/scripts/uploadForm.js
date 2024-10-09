import { storage } from "./firebaseInitialize.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";
import { analytics } from "./firebaseInitialize.js";  // Corrected import

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
    const audioContainer = document.getElementById('audioContainer');
    const audioInput = document.getElementById('audioInput');
    const audioForm = document.getElementById('audioForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorPopup = document.getElementById('errorPopup');
    const successPopup = document.getElementById('successPopup');

    const titleInput = document.getElementById('title');
    const subjectInput = document.getElementById('subject');

    // Prevent spaces in the title and subject input fields
    titleInput.addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/\s+/g, '');
    });

    subjectInput.addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/\s+/g, '');
    });

    let mediaRecorder;
    let mediaStream;
    let recording = false;

    // Toggle button click event for starting/stopping recording
    toggleButton.addEventListener('click', async () => {
        if (recording) {
            mediaRecorder.stop();
            toggleButton.textContent = "Record";
            recording = false;

            // Stop all tracks of the media stream
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }

            // Log event for stopping recording
            analytics.logEvent('recording_stopped');
        } else {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(mediaStream);
                    const chunks = [];
                    
                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };

                    mediaRecorder.onstop = () => {
                        const blob = new Blob(chunks, { type: 'audio/mp4' });
                        const audioUrl = URL.createObjectURL(blob);
                        const audio = document.createElement('audio');
                        audio.src = audioUrl;
                        audio.controls = true;
                        audioContainer.innerHTML = '';
                        audioContainer.appendChild(audio);

                        // Store audio blob in hidden input
                        audioInput.value = audioUrl;
                        audioInput.blob = blob; // Store the blob for later upload

                        // Reset recorder
                        mediaStream.getTracks().forEach(track => track.stop());
                    };

                    mediaRecorder.start();
                    toggleButton.textContent = "Stop Recording";
                    recording = true;

                    // Log event for starting recording
                    analytics.logEvent('recording_started');
                } catch (error) {
                    console.error('Error accessing audio devices:', error);
                    loadingSpinner.style.display = 'none'; // Hide loading spinner on error

                    // Log error event
                    analytics.logEvent('access_audio_devices_error', {
                        error_message: error.message
                    });
                }
            } else {
                alert('getUserMedia is not supported in your browser. Please use a modern browser with HTTPS.');
                console.error('getUserMedia is not supported in this browser.');
                loadingSpinner.style.display = 'none'; // Hide loading spinner on unsupported browser

                // Log unsupported browser event
                analytics.logEvent('getusermedia_unsupported');
            }
        }
    });

    // Form submit event
    audioForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!audioInput.value || !audioInput.blob) {
            alert('Please record some audio before submitting the form.');
            // Log event for missing audio
            analytics.logEvent('form_submission_missing_audio');
            return;
        }

        const title = titleInput.value;
        const subject = subjectInput.value;
        const audioBlob = audioInput.blob;

        loadingSpinner.style.display = 'flex';
        console.log('Form submission started:', { title, subject });

        try {
            const fileName = `${title}.mp4`;
            const folderPath = `Sounds/${subject}`;

            const storageRef = ref(storage, `${folderPath}/${fileName}`);
            const snapshot = await uploadBytes(storageRef, audioBlob);
            console.log('File uploaded:', snapshot);

            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at:', downloadURL);

            // Show success message
            successPopup.style.display = 'block';
            successPopup.classList.add('fade-out');

            // Hide success message after 3 seconds
            setTimeout(() => {
                successPopup.classList.remove('fade-out');
                successPopup.style.display = 'none';
            }, 3000);

            // Log successful form submission
            analytics.logEvent('form_submission_success', {
                title: title,
                subject: subject,
                file_url: downloadURL
            });
        } catch (error) {
            console.error('Error submitting form:', error.message);

            // Display error popup
            errorPopup.style.display = 'block';
            setTimeout(() => {
                errorPopup.style.display = 'none';
            }, 3000);

            // Log error event
            analytics.logEvent('form_submission_error', {
                error_message: error.message
            });
        } finally {
            loadingSpinner.style.display = 'none'; // Hide loading spinner after form submission
        }
    });

    // Initially hide the loading spinner
    loadingSpinner.style.display = 'none';

    // Log page view event
    analytics.logEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
});