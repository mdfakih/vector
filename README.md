# ✨ Rhinestone Template Creator

A modern web application that converts digital images into beautiful rhinestone templates. This standalone application allows users to upload images, customize various parameters, and generate downloadable SVG templates for creating rhinestone designs.

## 🚀 Features

### Core Functionality

- **Image Upload**: Drag-and-drop interface or file browser for uploading JPG, PNG, or SVG images
- **Live Preview**: Real-time canvas that updates as you adjust parameters
- **Multiple Patterns**: Four different rhinestone placement patterns
- **Multiple Export Formats**: Download as SVG, PDF, or CDR-compatible files

### Parameter Customization

- **Stone Colors**: Select 2-8 colors for the final design
- **Stone Size (SS)**: Choose from SS6 (2.4mm), SS10 (2.8mm), SS16 (3.2mm), or SS20 (3.6mm)
- **Design Dimensions**: Set width and height in millimeters (50-300mm)
- **Stone Spacing**: Control distance between rhinestones (0-5mm)
- **Threshold**: Adjust color threshold for stone placement (0-255)
- **Invert Fill**: Toggle to fill darker or lighter areas

### Template Patterns

1. **Grid**: Uniform grid pattern with regular spacing
2. **Scatter**: Randomly distributed stones using Poisson-disk sampling
3. **Radial**: Circular pattern originating from the center
4. **Contour**: Stones placed along detected edges using Sobel operator

## 🛠️ Technical Implementation

### Image Processing Algorithm

1. **Grayscale Conversion**: Uses luminosity formula (Y = 0.2126×R + 0.7152×G + 0.0722×B)
2. **Thresholding**: Compares pixel values against user-defined threshold
3. **Color Quantization**: Reduces colors based on selected stone count
4. **Pattern Generation**: Applies selected placement algorithm

### Pattern Algorithms

- **Grid**: Iterative placement with controlled spacing
- **Scatter**: Poisson-disk sampling for natural, non-overlapping distribution
- **Radial**: Polar coordinate system with circular progression
- **Contour**: Sobel edge detection with gradient magnitude thresholding

## 📁 File Structure

```
rhinestone-template-creator/
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling
├── script.js           # Core JavaScript functionality
└── README.md           # This documentation
```

## 🚀 Getting Started

1. **Download/Clone**: Get all files in the same directory
2. **Open**: Open `index.html` in any modern web browser
3. **Upload**: Drag and drop an image or click to browse
4. **Customize**: Adjust parameters to your liking
5. **Preview**: See live updates in the preview panel
6. **Download**: Generate and download SVG template

## 💡 Usage Guide

### Step 1: Upload Image

- Drag and drop any image file (JPG, PNG, SVG) onto the upload area
- Or click "Choose File" to browse your computer
- The image will be automatically processed and displayed

### Step 2: Adjust Parameters

- **Stone Colors**: More colors = more detail but more complexity
- **Stone Size**: Larger stones = easier to work with but less detail
- **Design Dimensions**: Set the final size of your rhinestone design
- **Stone Spacing**: Controls how close stones are placed together
- **Threshold**: Higher values = fewer stones, lower values = more stones
- **Invert Fill**: Check to fill dark areas instead of light areas

### Step 3: Choose Pattern

- **Grid**: Best for geometric designs and beginners
- **Scatter**: Natural, organic look with random distribution
- **Radial**: Perfect for circular or centered designs
- **Contour**: Great for outline and edge-based designs

### Step 4: Create and Download

- Click "Create Template" to generate the design
- Preview the result in the canvas
- Choose your preferred format:
  - **Download SVG**: Vector format for cutting machines and design software
  - **Download PDF**: Native PDF format with vector graphics and metadata
  - **Download CDR**: CorelDRAW-compatible SVG format for professional design work

## 🎨 Design Tips

### For Best Results:

- Use high-contrast images for clearer templates
- Start with 4-6 stone colors for balanced detail
- Test different patterns to see which works best for your image
- Adjust threshold to control stone density
- Use appropriate stone sizes for your project scale

### Pattern Recommendations:

- **Grid**: Logos, text, geometric shapes
- **Scatter**: Photos, portraits, organic designs
- **Radial**: Mandalas, flowers, circular motifs
- **Contour**: Outlines, line art, edge-based designs

## 🔧 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📝 Technical Notes

### Image Processing

- Images are converted to grayscale using the luminosity method
- Processing is done entirely in the browser using HTML5 Canvas
- No server-side processing required

### Export Formats

- **SVG**: Vector format optimized for cutting machines and design software
- **PDF**: Native PDF format with proper vector graphics and metadata
- **CDR**: CorelDRAW-compatible SVG format with enhanced metadata and styling

### Performance

- Real-time preview updates as you adjust parameters
- Efficient algorithms for large designs
- Responsive design works on desktop and mobile

## 🤝 Contributing

This is a standalone application built with vanilla HTML, CSS, and JavaScript. Feel free to:

- Modify the styling in `styles.css`
- Add new patterns in `script.js`
- Improve the algorithms
- Add new features

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by rhinestone crafting communities
- Built with modern web technologies
- Designed for ease of use and accessibility

---

**Happy Crafting! ✨**
