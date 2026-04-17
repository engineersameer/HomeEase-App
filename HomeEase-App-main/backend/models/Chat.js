const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Method to add message to chat
chatSchema.methods.addMessage = function(senderId, receiverId, content, messageType = 'text') {
  const message = {
    sender: senderId,
    receiver: receiverId,
    content,
    messageType
  };
  
  this.messages.push(message);
  this.lastMessage = this.messages[this.messages.length - 1]._id;
  this.lastMessageAt = new Date();
  
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.receiver.toString() === userId.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
    }
  });
  
  return this.save();
};

// Static method to find or create chat between two users
chatSchema.statics.findOrCreateChat = async function(user1Id, user2Id, bookingId = null, serviceId = null) {
  let chat = await this.findOne({
    participants: { $all: [user1Id, user2Id] },
    isActive: true
  });

  if (!chat) {
    chat = new this({
      participants: [user1Id, user2Id],
      messages: [],
      booking: bookingId,
      service: serviceId
    });
    await chat.save();
  }

  return chat;
};

module.exports = mongoose.model('Chat', chatSchema); 