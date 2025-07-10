const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Content Information
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  type: { 
    type: String, 
    enum: ['terms_of_service', 'privacy_policy', 'faq', 'help_article', 'announcement', 'maintenance_notice'],
    required: true 
  },
  content: { type: String, required: true },
  excerpt: { type: String },
  
  // Localization
  language: { type: String, default: 'en' },
  translations: [{
    language: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: { type: String }
  }],
  
  // Publishing
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  publishedAt: { type: Date },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // SEO and Display
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [String],
  featuredImage: { type: String },
  
  // Organization
  category: { type: String },
  tags: [String],
  order: { type: Number, default: 0 },
  
  // Access Control
  isPublic: { type: Boolean, default: true },
  requiredRoles: [{ type: String, enum: ['customer', 'provider', 'admin'] }],
  
  // Version Control
  version: { type: Number, default: 1 },
  previousVersions: [{
    version: { type: Number },
    content: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date }
  }],
  
  // Analytics
  views: { type: Number, default: 0 },
  lastViewed: { type: Date },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate slug from title if not provided
contentSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to publish content
contentSchema.methods.publish = function(adminId) {
  this.status = 'published';
  this.publishedAt = new Date();
  this.publishedBy = adminId;
  return this.save();
};

// Method to archive content
contentSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// Method to create new version
contentSchema.methods.createVersion = function(newContent, adminId) {
  // Store current version in previousVersions
  this.previousVersions.push({
    version: this.version,
    content: this.content,
    updatedBy: this.updatedBy,
    updatedAt: this.updatedAt
  });
  
  // Update current version
  this.content = newContent;
  this.version += 1;
  this.updatedBy = adminId;
  this.status = 'draft';
  
  return this.save();
};

// Method to add translation
contentSchema.methods.addTranslation = function(language, title, content, excerpt = '') {
  // Remove existing translation for this language
  this.translations = this.translations.filter(t => t.language !== language);
  
  // Add new translation
  this.translations.push({
    language,
    title,
    content,
    excerpt
  });
  
  return this.save();
};

// Method to increment views
contentSchema.methods.incrementViews = function() {
  this.views += 1;
  this.lastViewed = new Date();
  return this.save();
};

// Static method to get content by slug and language
contentSchema.statics.getBySlug = function(slug, language = 'en') {
  return this.findOne({ slug, status: 'published' }).then(content => {
    if (!content) return null;
    
    // If content is in requested language, return it
    if (content.language === language) {
      return content;
    }
    
    // Otherwise, look for translation
    const translation = content.translations.find(t => t.language === language);
    if (translation) {
      return {
        ...content.toObject(),
        title: translation.title,
        content: translation.content,
        excerpt: translation.excerpt,
        language: translation.language
      };
    }
    
    // Fall back to original content
    return content;
  });
};

module.exports = mongoose.model('Content', contentSchema); 