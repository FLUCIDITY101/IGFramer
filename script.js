const imageUpload = document.getElementById('imageUpload');
const imagePreviews = document.getElementById('imagePreviews');
const aspectRatioSelect = document.getElementById('aspectRatio');
const imageQualitySelect = document.getElementById('imageQuality');
const marginOptionSelect = document.getElementById('marginOption');
const backgroundColorSelect = document.getElementById('backgroundColorSelect');
const backgroundColorCustomInput = document.getElementById('backgroundColorCustom');
const downloadBtn = document.getElementById('downloadBtn');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const dropArea = document.getElementById('imagePreviews');

let uploadedImages = [];
let uploadedFileNames = [];

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);   

});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();   

}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight,   
 false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');   

}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files);   

}

function handleFiles(files) {
    uploadedFileNames = [];
    [...files].forEach(file => {
        uploadedFileNames.push(file.name);
        uploadFile(file);
    });
}

function uploadFile(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        uploadedImages.push(img);

        // Check if all images have been loaded
        if (uploadedImages.length === files.length) {
            processImages(uploadedImages); // Process all images together
        }
    }
    reader.readAsDataURL(file);
}

uploadBtn.addEventListener('click', () => {
    imageUpload.value = null;
    imageUpload.click();
});

imageUpload.addEventListener('change', (event) => {
    const files = event.target.files;
    const imagePreviewElements = imagePreviews.querySelectorAll('.imagePreview');
    imagePreviewElements.forEach(element => element.remove());
    uploadedImages = [];
    uploadedFileNames = Array.from(files).map(file => file.name);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const previewCanvas = document.createElement('canvas');
                const previewCtx = previewCanvas.getContext('2d');
                const previewContainer = document.createElement('div');
                previewContainer.classList.add('imagePreview');

                const selectedAspectRatio = aspectRatioSelect.value;
                let canvasWidth, canvasHeight;

                if (selectedAspectRatio === 'square') {
                    canvasWidth = canvasHeight = 1080;
                } else if (selectedAspectRatio === 'portrait') {
                    canvasWidth = 1080;
                    canvasHeight = 1350;
                } else if (selectedAspectRatio === 'landscape') {
                    canvasWidth = 1080;
                    canvasHeight = 565;
                } else if (selectedAspectRatio === 'landscape169') {
                    canvasWidth = 1080;
                    canvasHeight = 608;
                }

                const qualityMultiplier = parseInt(imageQualitySelect.value);
                canvasWidth *= qualityMultiplier;
                canvasHeight *= qualityMultiplier;

                previewCanvas.width = canvasWidth;
                previewCanvas.height = canvasHeight;

                const marginOption = marginOptionSelect.value;
                let marginPercentage = 5; // Default to normal margins

                if (marginOption === 'oneSide') {
                    marginPercentage = 0; // No margins on sides
                } else if (marginOption === 'large') {
                    marginPercentage = 8;
                }

                let marginX = (canvasWidth * marginPercentage) / 100;
                let marginY = (canvasHeight * marginPercentage) / 100;

                let x, y, newWidth, newHeight;

                if (marginOption === 'oneSide') {
                    if (img.width > img.height) {
                        marginX = 0;
                    } else {
                        marginY = 0;
                    }
                }

                const scale = Math.min((canvasWidth - 2 * marginX) / img.width, (canvasHeight - 2 * marginY) / img.height);
                newWidth = img.width * scale;
                newHeight = img.height * scale;
                x = (canvasWidth - newWidth) / 2;
                y = (canvasHeight - newHeight) / 2;

                // Determine the background color based on the selected option
                let backgroundColor = backgroundColorSelect.value === 'offWhite' ? '#fffdf5' : backgroundColorCustomInput.value;

                previewCtx.fillStyle = backgroundColor;
                previewCtx.fillRect(0, 0, canvasWidth, canvasHeight);

                // Set imageSmoothingQuality to 'high'
                previewCtx.imageSmoothingQuality = 'high';

                previewCtx.drawImage(img, x, y, newWidth, newHeight);

                previewContainer.appendChild(previewCanvas);
                imagePreviews.appendChild(previewContainer);
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(file);
    }
});

downloadBtn.addEventListener('click', () => {
    const previewCanvases = imagePreviews.querySelectorAll('canvas');

    if (previewCanvases.length === 1) {
        const link = document.createElement('a');
        link.download = `${uploadedFileNames[0].split('.')[0]}_framed.png`;
        link.href = previewCanvases[0].toDataURL('image/png');
        link.click();
    } else {
        const zip = new JSZip();

        previewCanvases.forEach((canvas, index) => {
            const filename = `${uploadedFileNames[index].split('.')[0]}_framed.png`;
            zip.file(filename, canvas.toDataURL('image/png').split(',')[1], { base64: true });
        });

        // Display a message indicating the zipping process
        downloadBtn.textContent = "Zipping...";
        downloadBtn.disabled = true; // Disable the button while zipping

        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                const link = document.createElement('a');
                link.download = "framed_images.zip";
                link.href = URL.createObjectURL(content);
                link.click();

                // Reset the button text and enable it
                downloadBtn.textContent = "Download All";
                downloadBtn.disabled = false;
            });
    }
});
// Add an event listener to show/hide the color picker
backgroundColorSelect.addEventListener('change', () => {
    if (backgroundColorSelect.value === 'custom') {
        backgroundColorCustomInput.style.display = 'block';
    } else {
        backgroundColorCustomInput.style.display = 'none';
    }
});

clearBtn.addEventListener('click', () => {
    // Clear the image previews
    const imagePreviewElements = imagePreviews.querySelectorAll('.imagePreview');
    imagePreviewElements.forEach(element => element.remove());

    // Clear the uploaded images array
    uploadedImages = [];
    uploadedFileNames = [];

    // Reset the file input element
    imageUpload.value = '';

    // Reset the aspect ratio, image quality, margin option, and background color selects to their default values
    aspectRatioSelect.selectedIndex = 0;
    imageQualitySelect.selectedIndex = 0;
    marginOptionSelect.selectedIndex = 0;
    backgroundColorSelect.selectedIndex = 0;
    backgroundColorCustomInput.value = '#fffdf5';
    backgroundColorCustomInput.style.display = 'none'; // Hide the custom color picker

    const dropAreaText = dropArea.querySelector('.drop-area p');
    if (dropAreaText) {
        dropAreaText.textContent = 'Drop images here';
    }
});