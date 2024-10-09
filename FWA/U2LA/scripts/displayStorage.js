import { storage , analytics } from "./firebaseInitialize.js";
import { ref, listAll, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";


document.addEventListener('DOMContentLoaded', async () => {
    const fileList = document.getElementById('fileList');
    const deleteButton = document.getElementById('deleteButton');
    const fileDetails = document.getElementById('fileDetails');
    const fileTitle = document.getElementById('fileTitle');
    const fileDescription = document.getElementById('fileDescription');
    const fileContent = document.getElementById('fileContent');
    const closeDetails = document.querySelector('.close-details');

    // Create a popup element for delete success messages
    const popup = document.createElement('div');
    popup.id = 'popup';
    document.body.appendChild(popup);

    // Track the current folder path
    let currentFolderPath = '/Sounds';

    const displayItems = async (folderRef, parentElement) => {
        try {
            const res = await listAll(folderRef);
            parentElement.innerHTML = '';

            // Add a "Back" button if not in the root folder
            if (currentFolderPath !== '/Sounds') {
                const backButton = document.createElement('div');
                backButton.className = 'back-button file-item';
                backButton.textContent = '⬅️ Back';
                parentElement.appendChild(backButton);

                backButton.addEventListener('click', () => {
                    // Navigate to the parent folder
                    currentFolderPath = currentFolderPath.substring(0, currentFolderPath.lastIndexOf('/'));
                    if (currentFolderPath === '') currentFolderPath = '/Sounds'; // Ensure we don't go above the root folder
                    displayItems(ref(storage, currentFolderPath), parentElement);
                });
            }

            // Check if the folder is empty
            if (res.prefixes.length === 0 && res.items.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-message';
                emptyMessage.textContent = 'Library Empty';
                parentElement.appendChild(emptyMessage);
                return;
            }

            // Display directories first
            if (res.prefixes.length > 0) {
                res.prefixes.forEach((subFolderRef) => {
                    const folderItem = document.createElement('div');
                    folderItem.className = 'file-item';
                    folderItem.textContent = `📁 ${subFolderRef.name}`;
                    parentElement.appendChild(folderItem);

                    folderItem.addEventListener('click', () => {
                        // Update the current folder path
                        currentFolderPath = `${currentFolderPath}/${subFolderRef.name}`;
                        displayItems(subFolderRef, parentElement);
                    });
                });
            }

            // Display files
            if (res.items.length > 0) {
                res.items.forEach(async (itemRef) => {
                    const fileURL = await getDownloadURL(itemRef);
                    const fileName = itemRef.name;
                    const fileType = fileName.match(/\.(mp3|wav|ogg|mp4)$/) ? 'Audio' : (fileName.match(/\.(jpg|jpeg|png|gif)$/) ? 'Image' : 'Other');

                    const fileItem = document.createElement('div');
                    fileItem.className = 'file-item';

                    // Add checkbox for file selection
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'file-checkbox';
                    fileItem.appendChild(checkbox);

                    // Add content preview (image or audio)
                    if (fileType === 'Audio') {
                        const audioElement = document.createElement('audio');
                        audioElement.controls = false;
                        audioElement.src = fileURL;
                        fileItem.appendChild(audioElement);
                    } else if (fileType === 'Image') {
                        const imgElement = document.createElement('img');
                        imgElement.src = fileURL;
                        imgElement.alt = fileName;
                        fileItem.appendChild(imgElement);
                    }

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = fileName;
                    fileItem.appendChild(nameSpan);

                    parentElement.appendChild(fileItem);

                    // Show file details on click
                    fileItem.addEventListener('click', (e) => {
                        if (e.target !== checkbox) {  // Prevents checkbox clicks from triggering the drawer
                            fileTitle.textContent = fileName;
                            fileDescription.textContent = fileType;
                            fileContent.innerHTML = '';

                            if (fileType === 'Audio') {
                                const audioElement = document.createElement('audio');
                                audioElement.controls = true;
                                audioElement.src = fileURL;
                                fileContent.appendChild(audioElement);
                            } else if (fileType === 'Image') {
                                const imgElement = document.createElement('img');
                                imgElement.src = fileURL;
                                imgElement.alt = fileName;
                                fileContent.appendChild(imgElement);
                            } else {
                                const downloadLink = document.createElement('a');
                                downloadLink.href = fileURL;
                                downloadLink.textContent = 'View';
                                downloadLink.target = '_blank';
                                fileContent.appendChild(downloadLink);
                            }

                            fileDetails.classList.add('open');

                            // Log event when a file is viewed
                            analytics.logEvent('view_file', {
                                file_name: fileName,
                                file_type: fileType
                            });
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching file list:', error);
            const errorItem = document.createElement('div');
            errorItem.className = 'file-item';
            errorItem.textContent = 'Could not fetch the list of files.';
            parentElement.appendChild(errorItem);

            // Log error event
            analytics.logEvent('fetch_files_error', {
                error_message: error.message
            });
        }
    };

    // Function to delete selected files
    const deleteSelectedFiles = async () => {
        const checkboxes = document.querySelectorAll('.file-checkbox:checked');
        if (checkboxes.length === 0) return;

        const confirmDelete = confirm(`Are you sure you want to delete ${checkboxes.length} selected file(s)?`);
        if (!confirmDelete) return;

        let successCount = 0;

        for (const checkbox of checkboxes) {
            const fileItem = checkbox.closest('.file-item');
            const fileName = fileItem.querySelector('span').textContent;
            const fileRef = ref(storage, `${currentFolderPath}/${fileName}`);

            try {
                await deleteObject(fileRef);
                fileItem.remove();
                successCount++;
            } catch (error) {
                console.error(`Error deleting file ${fileName}:`, error);

                // Log error event
                analytics.logEvent('delete_file_error', {
                    file_name: fileName,
                    error_message: error.message
                });
            }
        }

        // Show success popup
        if (successCount > 0) {
            popup.textContent = `${successCount} file(s) deleted successfully.`;
            popup.classList.add('show');
            setTimeout(() => {
                popup.classList.remove('show');
            }, 2000);

            // Log event for successful deletions
            analytics.logEvent('delete_files_success', {
                deleted_count: successCount
            });
        }

        // Check if the folder is empty after deletion
        const remainingItems = document.querySelectorAll('.file-item');
        if (remainingItems.length === 0 || (remainingItems.length === 1 && remainingItems[0].classList.contains('back-button'))) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Library Empty';
            fileList.appendChild(emptyMessage);
        }
    };

    // Initialize and display the items in the root folder
    const rootFolderRef = ref(storage, currentFolderPath);
    displayItems(rootFolderRef, fileList);

    // Handle closing the file details drawer
    closeDetails.addEventListener('click', () => {
        fileDetails.classList.remove('open');
    });

    // Handle delete button click
    deleteButton.addEventListener('click', deleteSelectedFiles);
});