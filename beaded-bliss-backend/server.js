const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Reviews data file path
const reviewsFile = path.join(__dirname, 'reviews.json');

// Initialize reviews file if it doesn't exist
async function initializeReviewsFile() {
  try {
    await fs.access(reviewsFile);
  } catch {
    await fs.writeFile(reviewsFile, JSON.stringify({}));
  }
}

// Load reviews from file
async function loadReviews() {
  try {
    const data = await fs.readFile(reviewsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading reviews:', error);
    return {};
  }
}

// Save reviews to file
async function saveReviews(reviews) {
  try {
    await fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2));
  } catch (error) {
    console.error('Error saving reviews:', error);
    throw error;
  }
}

// Routes

// Get reviews for a product
app.get('/api/reviews/:productName', async (req, res) => {
  try {
    const { productName } = req.params;
    const reviews = await loadReviews();
    const productReviews = reviews[productName] || [];
    
    res.json({
      success: true,
      reviews: productReviews,
      averageRating: productReviews.length > 0 
        ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length 
        : 0
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to load reviews' });
  }
});

// Submit a new review
app.post('/api/reviews/:productName', upload.single('photo'), async (req, res) => {
  try {
    const { productName } = req.params;
    const { rating, reviewerName, reviewText } = req.body;
    
    // Validate input
    if (!rating || !reviewerName || !reviewText) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    // Load existing reviews
    const reviews = await loadReviews();
    if (!reviews[productName]) {
      reviews[productName] = [];
    }
    
    // Create review object
    const review = {
      id: Date.now().toString(),
      rating: parseInt(rating),
      reviewerName: reviewerName.trim(),
      reviewText: reviewText.trim(),
      date: new Date().toISOString(),
      photo: null
    };
    
    // Handle photo upload
    if (req.file) {
      const photoUrl = `/uploads/${req.file.filename}`;
      review.photo = photoUrl;
    }
    
    // Add review to the beginning of the array
    reviews[productName].unshift(review);
    
    // Save reviews
    await saveReviews(reviews);
    
    res.json({
      success: true,
      review: review,
      message: 'Review submitted successfully'
    });
    
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

// Get all reviews (for admin purposes)
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await loadReviews();
    res.json({
      success: true,
      reviews: reviews
    });
  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({ success: false, error: 'Failed to load reviews' });
  }
});

// Delete a review (for admin purposes)
app.delete('/api/reviews/:productName/:reviewId', async (req, res) => {
  try {
    const { productName, reviewId } = req.params;
    const reviews = await loadReviews();
    
    if (!reviews[productName]) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    const reviewIndex = reviews[productName].findIndex(review => review.id === reviewId);
    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    
    // Remove the review
    const deletedReview = reviews[productName].splice(reviewIndex, 1)[0];
    
    // Delete photo file if it exists
    if (deletedReview.photo) {
      const photoPath = path.join(__dirname, deletedReview.photo.replace('/uploads/', 'uploads/'));
      try {
        await fs.unlink(photoPath);
      } catch (error) {
        console.error('Error deleting photo file:', error);
      }
    }
    
    await saveReviews(reviews);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize the server
async function startServer() {
  await initializeReviewsFile();
  
  app.listen(PORT, () => {
    console.log(`🚀 Beaded Bliss Backend Server running on port ${PORT}`);
    console.log(`📁 Reviews stored in: ${reviewsFile}`);
    console.log(`📸 Uploads directory: ${uploadsDir}`);
  });
}

startServer().catch(console.error);