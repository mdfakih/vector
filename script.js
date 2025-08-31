class RhinestoneTemplateCreator {
  constructor() {
    this.canvas = document.getElementById('previewCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.originalImage = null;
    this.processedImageData = null;
    this.currentTemplate = null;

    this.initializeEventListeners();
    this.updateSliderValues();
  }

  initializeEventListeners() {
    // File upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearBtn = document.getElementById('clearBtn');

    dropZone.addEventListener('click', (e) => {
      // Don't trigger if clicking on the upload button (it has its own handler)
      if (e.target === uploadBtn || e.target.closest('.upload-btn')) {
        return;
      }
      // Only trigger file input if no file is currently selected
      if (!this.originalImage) {
        fileInput.click();
      }
    });
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileUpload(files[0]);
      }
    });

    uploadBtn.addEventListener('click', (e) => {
      // Prevent event bubbling to drop zone
      e.stopPropagation();
      // Always allow clicking upload button to change file
      fileInput.click();
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });
    clearBtn.addEventListener('click', () => this.clearImage());

    // Parameter controls
    const sliders = [
      'stoneColors',
      'designWidth',
      'designHeight',
      'stoneSpacing',
      'threshold',
    ];
    sliders.forEach((id) => {
      const slider = document.getElementById(id);
      slider.addEventListener('input', () => {
        this.updateSliderValues();
        if (this.originalImage) {
          this.updatePreview();
        }
      });
    });

    const selects = ['stoneSize', 'pattern', 'zoomLevel'];
    selects.forEach((id) => {
      const select = document.getElementById(id);
      select.addEventListener('change', () => {
        if (this.originalImage) {
          this.updatePreview();
        }
      });
    });

    document.getElementById('invertFill').addEventListener('change', () => {
      if (this.originalImage) {
        this.updatePreview();
      }
    });

    // Reset threshold button
    document
      .getElementById('resetThresholdBtn')
      .addEventListener('click', () => {
        document.getElementById('threshold').value = 128;
        document.getElementById('thresholdValue').textContent = '128';
        if (this.originalImage) {
          this.updatePreview();
        }
      });

    // Reset all button
    document.getElementById('resetAllBtn').addEventListener('click', () => {
      this.resetAll();
    });

    // Action buttons
    document
      .getElementById('createBtn')
      .addEventListener('click', () => this.createTemplate());
    document
      .getElementById('downloadSvgBtn')
      .addEventListener('click', () => this.downloadSVG());
    document
      .getElementById('downloadPdfBtn')
      .addEventListener('click', () => this.downloadPDF());
    document
      .getElementById('downloadCdrBtn')
      .addEventListener('click', () => this.downloadCDR());
  }

  updateSliderValues() {
    const sliders = {
      stoneColors: '',
      designWidth: 'mm',
      designHeight: 'mm',
      stoneSpacing: 'mm',
      threshold: '',
    };

    Object.entries(sliders).forEach(([id, suffix]) => {
      const slider = document.getElementById(id);
      const valueDisplay = document.getElementById(id + 'Value');
      valueDisplay.textContent = slider.value + suffix;
    });

    // Update color selection when stone colors change
    if (sliders.hasOwnProperty('stoneColors')) {
      this.updateColorSelection();
    }
  }

  handleFileUpload(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.originalImage = img;
        this.displayFileInfo(file.name);
        this.enableCreateButton();
        this.updatePreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  displayFileInfo(fileName) {
    document.getElementById('fileName').textContent = fileName;
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('dropZone').style.display = 'none';
  }

  clearImage() {
    this.originalImage = null;
    this.processedImageData = null;
    this.currentTemplate = null;

    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('dropZone').style.display = 'block';
    document.getElementById('fileInput').value = '';

    this.disableButtons();
    this.clearCanvas();
    this.updatePreviewInfo('Upload an image to see the preview');
  }

  enableCreateButton() {
    document.getElementById('createBtn').disabled = false;
  }

  disableButtons() {
    document.getElementById('createBtn').disabled = true;
    document.getElementById('downloadSvgBtn').disabled = true;
    document.getElementById('downloadPdfBtn').disabled = true;
    document.getElementById('downloadCdrBtn').disabled = true;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updatePreviewInfo(message) {
    document.getElementById('previewInfo').innerHTML = `<p>${message}</p>`;
  }

  updatePreview() {
    if (!this.originalImage) return;

    this.updatePreviewInfo('Processing image...');

    // Process the image
    this.processImage();

    // Render the template
    this.renderTemplate();
  }

  processImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to match design dimensions
    const designWidth = parseInt(document.getElementById('designWidth').value);
    const designHeight = parseInt(
      document.getElementById('designHeight').value,
    );

    canvas.width = designWidth;
    canvas.height = designHeight;

    // Draw and scale the image
    ctx.drawImage(this.originalImage, 0, 0, designWidth, designHeight);

    // Get image data
    const imageData = ctx.getImageData(0, 0, designWidth, designHeight);
    const data = imageData.data;

    // Convert to grayscale using luminosity method
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Luminosity formula: Y = 0.2126*R + 0.7152*G + 0.0722*B
      const luminosity = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      data[i] = data[i + 1] = data[i + 2] = luminosity;
    }

    // Auto-adjust threshold for high-contrast images
    this.autoAdjustThreshold(data);

    this.processedImageData = imageData;
  }

  autoAdjustThreshold(data) {
    // Calculate image statistics
    let minLuminance = 255;
    let maxLuminance = 0;
    let totalLuminance = 0;
    let pixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
      const luminance = data[i];
      minLuminance = Math.min(minLuminance, luminance);
      maxLuminance = Math.max(maxLuminance, luminance);
      totalLuminance += luminance;
      pixelCount++;
    }

    const avgLuminance = totalLuminance / pixelCount;
    const contrast = maxLuminance - minLuminance;

    // Only auto-adjust if user hasn't manually set a threshold or if it's a very problematic image
    const currentThreshold = parseInt(
      document.getElementById('threshold').value,
    );
    const isDefaultThreshold = currentThreshold === 128; // Default value

    // Auto-adjust threshold for problematic images
    if (isDefaultThreshold) {
      if (contrast < 30) {
        // Very low contrast image - use average luminance
        const newThreshold = Math.round(avgLuminance);
        document.getElementById('threshold').value = newThreshold;
        document.getElementById('thresholdValue').textContent = newThreshold;
      } else if (maxLuminance < 50) {
        // Very dark image (like black images) - set threshold to show dark areas
        const newThreshold = Math.round(maxLuminance * 0.8);
        document.getElementById('threshold').value = newThreshold;
        document.getElementById('thresholdValue').textContent = newThreshold;
      } else if (minLuminance > 200) {
        // Very bright image - set threshold to show bright areas
        const newThreshold = Math.round(minLuminance * 0.2);
        document.getElementById('threshold').value = newThreshold;
        document.getElementById('thresholdValue').textContent = newThreshold;
      }
    }
  }

  renderTemplate() {
    if (!this.processedImageData) return;

    const pattern = document.getElementById('pattern').value;
    this.clearCanvas();

    // Scale canvas to fit the preview area while maintaining aspect ratio
    const designWidth = parseInt(document.getElementById('designWidth').value);
    const designHeight = parseInt(
      document.getElementById('designHeight').value,
    );

    // Improved scaling for larger designs with zoom control
    const zoomLevel = document.getElementById('zoomLevel').value;
    let scale;

    if (zoomLevel === 'auto') {
      const maxCanvasSize = 600;
      const minScale = 0.1; // Minimum scale to ensure visibility
      scale = Math.max(
        Math.min(maxCanvasSize / designWidth, maxCanvasSize / designHeight),
        minScale,
      );
    } else {
      // Use manual zoom level
      scale = parseInt(zoomLevel) / 100;
    }

    this.canvas.width = designWidth * scale;
    this.canvas.height = designHeight * scale;

    this.ctx.scale(scale, scale);

    // Render based on pattern
    switch (pattern) {
      case 'grid':
        this.renderGridPattern();
        break;
      case 'scatter':
        this.renderScatterPattern();
        break;
      case 'radial':
        this.renderRadialPattern();
        break;
      case 'contour':
        this.renderContourPattern();
        break;
    }

    this.updatePreviewInfo(
      `Template created with ${pattern} pattern (Scale: ${(scale * 100).toFixed(
        1,
      )}%)`,
    );
    document.getElementById('downloadSvgBtn').disabled = false;
    document.getElementById('downloadPdfBtn').disabled = false;
    document.getElementById('downloadCdrBtn').disabled = false;
  }

  renderGridPattern() {
    const stoneSize = parseInt(document.getElementById('stoneSize').value);
    const spacing = parseFloat(document.getElementById('stoneSpacing').value);
    const threshold = parseInt(document.getElementById('threshold').value);
    const invertFill = document.getElementById('invertFill').checked;
    const stoneColors = parseInt(document.getElementById('stoneColors').value);

    const totalSpacing = stoneSize + spacing;
    const data = this.processedImageData.data;
    const width = this.processedImageData.width;
    const height = this.processedImageData.height;

    this.currentTemplate = [];

    for (let y = 0; y < height; y += totalSpacing) {
      for (let x = 0; x < width; x += totalSpacing) {
        const pixelIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
        const luminosity = data[pixelIndex];

        // Improved threshold logic for black images
        let shouldPlaceStone;
        if (invertFill) {
          shouldPlaceStone = luminosity <= threshold;
        } else {
          shouldPlaceStone = luminosity > threshold;
        }

        if (shouldPlaceStone) {
          const colorIndex = Math.floor((luminosity / 255) * stoneColors);
          const color = this.getStoneColor(colorIndex, stoneColors);

          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(
            x + stoneSize / 2,
            y + stoneSize / 2,
            stoneSize / 2,
            0,
            2 * Math.PI,
          );
          this.ctx.fill();

          this.currentTemplate.push({
            x: x + stoneSize / 2,
            y: y + stoneSize / 2,
            radius: stoneSize / 2,
            color: color,
          });
        }
      }
    }
  }

  renderScatterPattern() {
    const stoneSize = parseInt(document.getElementById('stoneSize').value);
    const spacing = parseFloat(document.getElementById('stoneSpacing').value);
    const threshold = parseInt(document.getElementById('threshold').value);
    const invertFill = document.getElementById('invertFill').checked;
    const stoneColors = parseInt(document.getElementById('stoneColors').value);

    const minDistance = stoneSize + spacing;
    const width = this.processedImageData.width;
    const height = this.processedImageData.height;
    const data = this.processedImageData.data;

    // Poisson disk sampling
    const points = this.generatePoissonDiskPoints(width, height, minDistance);
    this.currentTemplate = [];

    points.forEach((point) => {
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);

      if (x >= 0 && x < width && y >= 0 && y < height) {
        const pixelIndex = (y * width + x) * 4;
        const luminosity = data[pixelIndex];

        // Improved threshold logic for black images
        let shouldPlaceStone;
        if (invertFill) {
          shouldPlaceStone = luminosity <= threshold;
        } else {
          shouldPlaceStone = luminosity > threshold;
        }

        if (shouldPlaceStone) {
          const colorIndex = Math.floor((luminosity / 255) * stoneColors);
          const color = this.getStoneColor(colorIndex, stoneColors);

          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(point.x, point.y, stoneSize / 2, 0, 2 * Math.PI);
          this.ctx.fill();

          this.currentTemplate.push({
            x: point.x,
            y: point.y,
            radius: stoneSize / 2,
            color: color,
          });
        }
      }
    });
  }

  generatePoissonDiskPoints(width, height, minDistance) {
    const points = [];
    const active = [];
    const grid = [];
    const cellSize = minDistance / Math.sqrt(2);
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    // Initialize grid
    for (let i = 0; i < cols * rows; i++) {
      grid[i] = -1;
    }

    // Add first point
    const firstPoint = {
      x: Math.random() * width,
      y: Math.random() * height,
    };
    points.push(firstPoint);
    active.push(0);
    const gridX = Math.floor(firstPoint.x / cellSize);
    const gridY = Math.floor(firstPoint.y / cellSize);
    grid[gridY * cols + gridX] = 0;

    while (active.length > 0) {
      const activeIndex = Math.floor(Math.random() * active.length);
      const pointIndex = active[activeIndex];
      const point = points[pointIndex];
      let found = false;

      // Try to generate new points around this point
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = minDistance + Math.random() * minDistance;
        const newPoint = {
          x: point.x + Math.cos(angle) * distance,
          y: point.y + Math.sin(angle) * distance,
        };

        if (
          newPoint.x >= 0 &&
          newPoint.x < width &&
          newPoint.y >= 0 &&
          newPoint.y < height
        ) {
          const gridX = Math.floor(newPoint.x / cellSize);
          const gridY = Math.floor(newPoint.y / cellSize);

          if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
            let valid = true;

            // Check neighboring cells
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const checkX = gridX + dx;
                const checkY = gridY + dy;

                if (
                  checkX >= 0 &&
                  checkX < cols &&
                  checkY >= 0 &&
                  checkY < rows
                ) {
                  const neighborIndex = grid[checkY * cols + checkX];
                  if (neighborIndex !== -1) {
                    const neighbor = points[neighborIndex];
                    const dist = Math.sqrt(
                      (newPoint.x - neighbor.x) ** 2 +
                        (newPoint.y - neighbor.y) ** 2,
                    );
                    if (dist < minDistance) {
                      valid = false;
                      break;
                    }
                  }
                }
              }
              if (!valid) break;
            }

            if (valid) {
              points.push(newPoint);
              active.push(points.length - 1);
              grid[gridY * cols + gridX] = points.length - 1;
              found = true;
              break;
            }
          }
        }
      }

      if (!found) {
        active.splice(activeIndex, 1);
      }
    }

    return points;
  }

  renderRadialPattern() {
    const stoneSize = parseInt(document.getElementById('stoneSize').value);
    const spacing = parseFloat(document.getElementById('stoneSpacing').value);
    const threshold = parseInt(document.getElementById('threshold').value);
    const invertFill = document.getElementById('invertFill').checked;
    const stoneColors = parseInt(document.getElementById('stoneColors').value);

    const totalSpacing = stoneSize + spacing;
    const width = this.processedImageData.width;
    const height = this.processedImageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX ** 2 + centerY ** 2);
    const data = this.processedImageData.data;

    this.currentTemplate = [];

    for (let radius = 0; radius < maxRadius; radius += totalSpacing) {
      const circumference = 2 * Math.PI * radius;
      const numStones = Math.floor(circumference / totalSpacing);

      for (let i = 0; i < numStones; i++) {
        const angle = (i / numStones) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        if (x >= 0 && x < width && y >= 0 && y < height) {
          const pixelIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
          const luminosity = data[pixelIndex];

          // Improved threshold logic for black images
          let shouldPlaceStone;
          if (invertFill) {
            shouldPlaceStone = luminosity <= threshold;
          } else {
            shouldPlaceStone = luminosity > threshold;
          }

          if (shouldPlaceStone) {
            const colorIndex = Math.floor((luminosity / 255) * stoneColors);
            const color = this.getStoneColor(colorIndex, stoneColors);

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, stoneSize / 2, 0, 2 * Math.PI);
            this.ctx.fill();

            this.currentTemplate.push({
              x: x,
              y: y,
              radius: stoneSize / 2,
              color: color,
            });
          }
        }
      }
    }
  }

  renderContourPattern() {
    const stoneSize = parseInt(document.getElementById('stoneSize').value);
    const spacing = parseFloat(document.getElementById('stoneSpacing').value);
    const threshold = parseInt(document.getElementById('threshold').value);
    const invertFill = document.getElementById('invertFill').checked;
    const stoneColors = parseInt(document.getElementById('stoneColors').value);

    const totalSpacing = stoneSize + spacing;
    const width = this.processedImageData.width;
    const height = this.processedImageData.height;
    const data = this.processedImageData.data;

    // Sobel edge detection
    const edges = this.detectEdges(data, width, height);
    this.currentTemplate = [];

    for (let y = 0; y < height; y += totalSpacing) {
      for (let x = 0; x < width; x += totalSpacing) {
        const edgeIndex = Math.floor(y) * width + Math.floor(x);
        const isEdge = edges[edgeIndex] > threshold;

        if (isEdge) {
          const pixelIndex = edgeIndex * 4;
          const luminosity = data[pixelIndex];
          const colorIndex = Math.floor((luminosity / 255) * stoneColors);
          const color = this.getStoneColor(colorIndex, stoneColors);

          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(
            x + stoneSize / 2,
            y + stoneSize / 2,
            stoneSize / 2,
            0,
            2 * Math.PI,
          );
          this.ctx.fill();

          this.currentTemplate.push({
            x: x + stoneSize / 2,
            y: y + stoneSize / 2,
            radius: stoneSize / 2,
            color: color,
          });
        }
      }
    }
  }

  detectEdges(data, width, height) {
    const edges = new Array(width * height);

    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0,
          gy = 0;

        // Apply Sobel kernels
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            const pixelValue = data[pixelIndex];
            const kernelIndex = (ky + 1) * 3 + (kx + 1);

            gx += pixelValue * sobelX[kernelIndex];
            gy += pixelValue * sobelY[kernelIndex];
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * width + x] = magnitude;
      }
    }

    return edges;
  }

  getStoneColor(index, totalColors) {
    // Get custom colors if available, otherwise use default colors
    const customColors = this.getCustomColors();
    const colors = customColors.length > 0 ? customColors : [
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF',
      '#FFA500',
      '#800080',
    ];

    // If only 1 color is selected, always return the first color
    if (totalColors === 1) {
      return colors[0];
    }

    const normalizedIndex = Math.floor((index / totalColors) * colors.length);
    return colors[normalizedIndex % colors.length];
  }

  getCustomColors() {
    const colorInputs = document.querySelectorAll('#colorSelectionContainer input[type="color"]');
    return Array.from(colorInputs).map(input => input.value);
  }

  updateColorSelection() {
    const numColors = parseInt(document.getElementById('stoneColors').value);
    const container = document.getElementById('colorSelectionContainer');
    const selectionDiv = document.getElementById('stoneColorSelection');

    // Show/hide color selection based on number of colors
    if (numColors > 1) {
      selectionDiv.style.display = 'block';
      container.innerHTML = '';

      // Default colors
      const defaultColors = [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
        '#FF00FF', '#00FFFF', '#FFA500', '#800080'
      ];

      for (let i = 0; i < numColors; i++) {
        const colorItem = document.createElement('div');
        colorItem.className = 'color-picker-item';
        
        const label = document.createElement('label');
        label.textContent = `Color ${i + 1}`;
        
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = defaultColors[i] || '#FF0000';
        colorInput.addEventListener('change', () => {
          if (this.originalImage) {
            this.updatePreview();
          }
        });

        colorItem.appendChild(label);
        colorItem.appendChild(colorInput);
        container.appendChild(colorItem);
      }
    } else {
      selectionDiv.style.display = 'none';
    }
  }

  resetAll() {
    // Reset all parameters to default values
    document.getElementById('stoneColors').value = 1;
    document.getElementById('stoneSize').value = 10;
    document.getElementById('designWidth').value = 150;
    document.getElementById('designHeight').value = 150;
    document.getElementById('stoneSpacing').value = 0.5;
    document.getElementById('threshold').value = 128;
    document.getElementById('invertFill').checked = false;
    document.getElementById('pattern').value = 'grid';
    document.getElementById('zoomLevel').value = 'auto';

    // Update displays
    this.updateSliderValues();
    this.updateColorSelection();

    // Clear image and reset UI
    this.clearImage();

    // Show success message
    this.updatePreviewInfo('All settings have been reset to default values');
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  createTemplate() {
    if (!this.originalImage) return;

    this.updatePreviewInfo('Creating template...');
    this.updatePreview();
    this.updatePreviewInfo('Template created successfully!');
  }

  downloadSVG() {
    if (!this.currentTemplate) return;

    const designWidth = parseInt(document.getElementById('designWidth').value);
    const designHeight = parseInt(
      document.getElementById('designHeight').value,
    );
    const pattern = document.getElementById('pattern').value;

    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${designWidth}mm" height="${designHeight}mm" viewBox="0 0 ${designWidth} ${designHeight}" 
     xmlns="http://www.w3.org/2000/svg">
  <title>Rhinestone Template - ${pattern} pattern</title>
  <defs>
    <style>
      .stone { stroke: #000; stroke-width: 0.1; }
    </style>
  </defs>`;

    this.currentTemplate.forEach((stone) => {
      svg += `\n  <circle class="stone" cx="${stone.x}" cy="${stone.y}" r="${stone.radius}" fill="${stone.color}"/>`;
    });

    svg += '\n</svg>';

    // Create download link
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhinestone-template-${pattern}-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.updatePreviewInfo('SVG downloaded successfully!');
  }

  downloadPDF() {
    if (!this.currentTemplate) return;

    const designWidth = parseInt(document.getElementById('designWidth').value);
    const designHeight = parseInt(
      document.getElementById('designHeight').value,
    );
    const pattern = document.getElementById('pattern').value;

    try {
      // Create PDF using jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: designWidth > designHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [designWidth, designHeight],
      });

      // Set background to white
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, designWidth, designHeight, 'F');

      // Draw all stones as circles
      this.currentTemplate.forEach((stone) => {
        // Convert color from hex to RGB
        const color = this.hexToRgb(stone.color);
        doc.setFillColor(color.r, color.g, color.b);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);

        // Draw filled circle with outline
        doc.circle(stone.x, stone.y, stone.radius, 'FD');
      });

      // Add title and metadata
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Rhinestone Template - ${pattern} pattern`, 5, designHeight - 5);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        5,
        designHeight - 2,
      );

      // Save the PDF
      const filename = `rhinestone-template-${pattern}-${Date.now()}.pdf`;
      doc.save(filename);

      this.updatePreviewInfo('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      this.updatePreviewInfo('PDF generation failed. Please try again.');
    }
  }

  downloadCDR() {
    if (!this.currentTemplate) return;

    const designWidth = parseInt(document.getElementById('designWidth').value);
    const designHeight = parseInt(
      document.getElementById('designHeight').value,
    );
    const pattern = document.getElementById('pattern').value;

    try {
      // Create CDR-compatible SVG with specific attributes for CorelDRAW
      let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${designWidth}mm" height="${designHeight}mm" viewBox="0 0 ${designWidth} ${designHeight}" 
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     version="1.1" id="rhinestone-template">
  <title>Rhinestone Template - ${pattern} pattern</title>
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>Rhinestone Template</dc:title>
        <dc:creator>Rhinestone Template Creator</dc:creator>
        <dc:date>${new Date().toISOString()}</dc:date>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  <defs>
    <style type="text/css">
      .stone { stroke: #000000; stroke-width: 0.1; fill-rule: evenodd; }
      .stone-fill { fill-opacity: 1; }
    </style>
  </defs>
  <g id="rhinestone-layer" inkscape:groupmode="layer" inkscape:label="Rhinestones">`;

      this.currentTemplate.forEach((stone, index) => {
        svg += `\n    <circle class="stone stone-fill" id="stone-${index}" 
        cx="${stone.x}" cy="${stone.y}" r="${stone.radius}" 
        fill="${stone.color}" 
        style="fill: ${stone.color}; stroke: #000000; stroke-width: 0.1;"/>`;
      });

      svg += `\n  </g>
</svg>`;

      // Create download link for CDR-compatible SVG
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rhinestone-template-${pattern}-${Date.now()}.cdr`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.updatePreviewInfo(
        'CDR-compatible file downloaded successfully! (Import into CorelDRAW)',
      );
    } catch (error) {
      console.error('CDR generation error:', error);
      this.updatePreviewInfo('CDR generation failed. Please try again.');
    }
  }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new RhinestoneTemplateCreator();
});
