const fs = require('fs');
const path = require('path');

// Simple in-memory cache so we don't re-read the CSV on every request
let DATASET = null;



// Naive CSV line splitter that handles quoted fields with commas
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      // Toggle quote state or handle escaped quotes
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function loadDataset() {
  if (DATASET) return DATASET;
  // Try multiple possible paths for the CSV file
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'chatbot', 'homeease_final_10k_dataset.csv'),
    path.join(__dirname, '..', 'chatbot', 'homeease_final_10k_dataset.csv'),
    path.join(process.cwd(), 'chatbot', 'homeease_final_10k_dataset.csv'),
  ];
  
  let csvPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      csvPath = p;
      break;
    }
  }
  
  if (!csvPath) {
    throw new Error('CSV dataset file not found');
  }
  
  const raw = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/);
  const header = raw[0].split(',');
  const entries = [];
  for (let i = 1; i < raw.length; i++) {
    const line = raw[i];
    if (!line) continue;
    const cols = splitCSVLine(line);
    const item = {};
    header.forEach((key, idx) => {
      item[key] = cols[idx] || '';
    });
    entries.push(item);
  }
  DATASET = entries;
  console.log(`Loaded ${entries.length} entries from chatbot dataset`);
  return DATASET;
}

// Advanced Offline AI - No API Required, Completely Free
function generateOfflineAI(message) {
  const lowerMsg = message.toLowerCase();
  
  // AI-like personality variations
  const greetings = ['Hello!', 'Hi there!', 'Hey!', 'Greetings!', 'Hi!'];
  const transitions = ['Let me help you with that.', 'I can assist you with this.', 'Here\'s what I recommend:', 'Based on your question:', 'Let me guide you through this:'];
  const endings = ['Hope this helps!', 'Let me know if you need more assistance!', 'Feel free to ask if you have more questions!', 'I\'m here to help!', 'Anything else I can help with?'];
  
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
  const randomEnding = endings[Math.floor(Math.random() * endings.length)];

  // Weather queries - AI-like responses
  if (lowerMsg.includes('weather') || lowerMsg.includes('temperature') || lowerMsg.includes('forecast') || lowerMsg.includes('hot') || lowerMsg.includes('cold') || lowerMsg.includes('rain')) {
    const weatherResponses = [
      `${randomGreeting} I'd love to help with weather information, but I'm specialized in home services. However, I can definitely help with weather-related home issues!`,
      `${randomGreeting} While I can't provide real-time weather data, I'm excellent at helping with weather-related home problems!`,
      `${randomGreeting} I don't have access to current weather data, but I can help you prepare your home for any weather conditions!`
    ];
    
    const randomWeatherResponse = weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
    
    return `${randomWeatherResponse}

🌡️ **Temperature Issues I Can Help With:**
• AC not cooling properly in hot weather
• Heating system problems in cold weather  
• Insulation and energy efficiency issues
• Thermostat troubleshooting

🌧️ **Weather Protection Services:**
• Roof leak repairs before rainy season
• Window and door sealing
• Gutter cleaning and drainage
• Weatherproofing your home

❄️ **Seasonal Home Maintenance:**
• Preparing AC for summer heat
• Winterizing plumbing and heating
• Storm damage prevention

For current weather, I'd recommend checking your weather app. But for keeping your home comfortable in any weather, I'm your expert! 🏠

${randomEnding}`;
  }
  
  // AC/Cooling issues
  if (lowerMsg.includes('ac') || lowerMsg.includes('cooling') || lowerMsg.includes('air condition') || lowerMsg.includes('hvac')) {
    return `${randomGreeting} ${randomTransition} For your AC issue "${message}", here's my expert advice:

**Immediate Checks:**
✅ **Air Filter** - Replace if dirty (most common cause)
✅ **Thermostat** - Set to "Cool" mode, correct temperature
✅ **Power** - Check circuit breaker hasn't tripped
✅ **Vents** - Ensure all vents are open and unblocked

**When to Call Professional:**
• No cold air after basic checks
• Strange noises or burning smells
• Ice formation on unit
• High electricity bills

💰 **Estimated Cost**: Rs. 1,500-8,000
⏰ **Time**: 30 min DIY, 1-2 hours professional

💡 **Book an AC technician** through HomeEase for guaranteed service!

${randomEnding}`;
  }
  
  // Plumbing issues
  if (lowerMsg.includes('water') || lowerMsg.includes('plumb') || lowerMsg.includes('leak') || lowerMsg.includes('tap') || lowerMsg.includes('pipe') || lowerMsg.includes('drain')) {
    return `${randomGreeting} ${randomTransition} For your plumbing issue "${message}", here's my step-by-step advice:

**Emergency First:**
🚨 **Stop Water Flow** - Turn off main supply if major leak
🔍 **Assess Damage** - Check extent of problem

**Common Solutions:**
• **Dripping Tap** → Replace washer/O-ring (Rs. 200-500)
• **Low Pressure** → Clean aerator or check blockages
• **Clogged Drain** → Use plunger, then drain cleaner
• **Running Toilet** → Adjust flapper or chain

**Call Professional For:**
• Burst pipes or major leaks
• Sewer line problems
• Water heater issues
• Gas line work

💰 **Estimated Cost**: Rs. 500-5,000
⏰ **Time**: 15-60 min DIY, 1-3 hours professional

🔧 **Book a plumber** through HomeEase to avoid water damage!

${randomEnding}`;
  }
  
  // Electrical issues
  if (lowerMsg.includes('electric') || lowerMsg.includes('wire') || lowerMsg.includes('outlet') || lowerMsg.includes('switch') || lowerMsg.includes('light') || lowerMsg.includes('power')) {
    return `${randomGreeting} ${randomTransition} For electrical issues like "${message}", safety comes first:

⚠️ **SAFETY WARNING**: Turn off power at circuit breaker before any work!

**Safe Checks:**
✅ **Circuit Breaker** - Check if tripped, reset if needed
✅ **Outlets** - Test with different devices
✅ **Bulbs** - Replace if lights not working
✅ **GFCI** - Press reset button on bathroom/kitchen outlets

**Call Professional Immediately For:**
• Sparking or burning smells
• Frequent breaker trips
• Flickering lights
• Warm outlets or switches
• Any exposed wires

💰 **Estimated Cost**: Rs. 1,000-10,000
⏰ **Time**: Professional only for safety

⚡ **Book a licensed electrician** through HomeEase - don't risk electrocution!

${randomEnding}`;
  }
  
  // Carpentry/Furniture
  if (lowerMsg.includes('furniture') || lowerMsg.includes('wood') || lowerMsg.includes('door') || lowerMsg.includes('window') || lowerMsg.includes('cabinet')) {
    return `${randomGreeting} ${randomTransition} For your carpentry issue "${message}", here's what I suggest:

**DIY-Friendly Tasks:**
• **Loose Screws** → Tighten with screwdriver
• **Squeaky Hinges** → Apply oil or WD-40
• **Minor Scratches** → Use wood polish or marker
• **Sticky Drawers** → Clean tracks, apply soap

**Professional Help Needed:**
• Structural repairs
• Custom installations
• Major furniture assembly
• Door/window alignment

💰 **Estimated Cost**: Rs. 800-5,000
⏰ **Time**: 30 min-3 hours depending on complexity

🔨 **Book a carpenter** through HomeEase for quality woodwork!

${randomEnding}`;
  }
  
  // Painting services
  if (lowerMsg.includes('paint') || lowerMsg.includes('color') || lowerMsg.includes('wall')) {
    return `${randomGreeting} ${randomTransition} For your painting needs "${message}", here's my expert advice:

**DIY Painting Tips:**
🎨 **Preparation** → Clean walls, fill holes, apply primer
🖌️ **Tools Needed** → Quality brushes, rollers, drop cloths
🏠 **Interior Painting** → Use water-based paints for easy cleanup
🌤️ **Exterior Painting** → Weather-resistant paints only

**Professional Painting For:**
• Large rooms or full house painting
• High walls and ceilings
• Textured or decorative finishes
• Exterior painting (safety concerns)
• Color consultation and design

**Painting Process:**
1️⃣ Surface preparation and cleaning
2️⃣ Primer application if needed
3️⃣ First coat application
4️⃣ Second coat for even coverage
5️⃣ Clean-up and final inspection

💰 **Estimated Cost**: Rs. 15-50 per sq ft
⏰ **Time**: 1-3 days depending on area

🎨 **Book professional painters** through HomeEase for perfect results!

${randomEnding}`;
  }

  // Cleaning services
  if (lowerMsg.includes('clean') || lowerMsg.includes('dirt') || lowerMsg.includes('stain') || lowerMsg.includes('dust')) {
    return `${randomGreeting} ${randomTransition} For your cleaning concern "${message}", here are my recommendations:

**DIY Cleaning Tips:**
• **General Cleaning** → All-purpose cleaner + microfiber cloths
• **Tough Stains** → Baking soda paste or white vinegar
• **Bathroom** → Bleach-based cleaners for mold/mildew
• **Kitchen** → Degreaser for grease, lemon for freshness

**Professional Cleaning For:**
• Deep carpet cleaning
• Post-construction cleanup
• Move-in/move-out cleaning
• Upholstery and curtains

💰 **Estimated Cost**: Rs. 2,000-8,000 for full house
⏰ **Time**: 2-6 hours depending on size

🧹 **Book professional cleaners** through HomeEase for thorough results!

${randomEnding}`;
  }

  // General questions - AI-like responses
  const generalResponses = [
    `${randomGreeting} I'm your HomeEase AI assistant, and I'm here to help with all your home service needs!`,
    `${randomGreeting} As your HomeEase expert, I can guide you through any home maintenance challenge!`,
    `${randomGreeting} I'm specialized in home services and ready to assist you with practical solutions!`
  ];
  
  const randomGeneralResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
  
  // General home service response
  return `${randomGeneralResponse}

I can provide expert guidance for:

🔧 **Plumbing** - Leaks, clogs, water issues, pipe repairs
⚡ **Electrical** - Outlets, switches, lighting, safety issues
❄️ **AC/Heating** - Temperature control, maintenance, repairs
🔨 **Carpentry** - Furniture, doors, windows, installations
🧹 **Cleaning** - Deep cleaning, stain removal, maintenance
🎨 **Painting** - Interior, exterior, touch-ups, preparation

**For "${message}"** - I'd be happy to provide specific guidance if you can give me a bit more detail about the issue you're facing.

**General Home Service Tips:**
• Always prioritize safety first
• Try simple solutions before calling professionals
• Don't attempt complex repairs without proper knowledge
• Keep emergency contact numbers handy

💡 **For expert help**, book qualified professionals through our HomeEase app for guaranteed quality service!

${randomEnding}`;
}

// Test function for Offline AI
exports.testAI = async (req, res) => {
  try {
    console.log('🧪 Testing Offline AI...');
    const testPrompt = 'What\'s the weather like today?';
    const response = generateOfflineAI(testPrompt);
    
    res.json({
      success: true,
      message: 'Offline AI test successful',
      response: response
    });
  } catch (error) {
    console.error('❌ Offline AI test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Offline AI test failed',
      error: error.message
    });
  }
};

// Enhanced matching algorithm with better accuracy
function findBestMatch(message, dataset) {
  const lowerMessage = message.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  
  for (const entry of dataset) {
    if (!entry.Question || !entry.Answer) continue;
    
    const question = entry.Question.toLowerCase();
    let score = 0;
    
    // Exact phrase matching (highest priority)
    if (question.includes(lowerMessage) || lowerMessage.includes(question)) {
      score += 100;
    }
    
    // Word matching with weights
    const messageWords = lowerMessage.split(/\s+/);
    const questionWords = question.split(/\s+/);
    
    for (const word of messageWords) {
      if (word.length < 3) continue; // Skip short words
      
      for (const qWord of questionWords) {
        if (qWord.includes(word) || word.includes(qWord)) {
          score += 10;
        }
      }
    }
    
    // Category-specific boosts
    const category = entry.Category?.toLowerCase() || '';
    if (category.includes('booking') && (lowerMessage.includes('book') || lowerMessage.includes('cancel') || lowerMessage.includes('reschedule'))) {
      score += 50;
    }
    if (category.includes('payment') && (lowerMessage.includes('pay') || lowerMessage.includes('cash') || lowerMessage.includes('method'))) {
      score += 50;
    }
    if (category.includes('app') && (lowerMessage.includes('app') || lowerMessage.includes('profile') || lowerMessage.includes('update'))) {
      score += 50;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  
  return bestScore > 15 ? bestMatch : null; // Minimum threshold
}

// Handle HomeEase business-specific questions
function handleBusinessQuestions(message) {
  const lowerMsg = message.toLowerCase();
  
  // Payment methods
  if (lowerMsg.includes('payment') && (lowerMsg.includes('method') || lowerMsg.includes('accept') || lowerMsg.includes('cash'))) {
    return `💳 **HomeEase Payment Methods:**

✅ **Available Payment Options:**
• Cash on Delivery (COD)
• Bank Transfer
• Digital Wallets (JazzCash, EasyPaisa)
• Credit/Debit Cards
• Online Banking

💰 **Payment Process:**
• Choose payment method during booking
• Pay after service completion (COD)
• Secure payment gateway for online payments
• Receipt provided for all transactions

🔒 **Security:** All online payments are encrypted and secure.

For specific payment queries, contact our support team!`;
  }
  
  // Booking process
  if (lowerMsg.includes('book') && (lowerMsg.includes('service') || lowerMsg.includes('how'))) {
    return `📱 **How to Book a Service on HomeEase:**

**Step-by-Step Process:**
1️⃣ **Open HomeEase App** → Login to your account
2️⃣ **Search Services** → Browse categories or search specific service
3️⃣ **Select Provider** → Choose from verified professionals
4️⃣ **Choose Date & Time** → Pick convenient slot
5️⃣ **Add Details** → Describe your requirements
6️⃣ **Confirm Booking** → Review and confirm
7️⃣ **Make Payment** → Choose payment method
8️⃣ **Track Service** → Get real-time updates

🎯 **Quick Booking Tips:**
• Book in advance for better availability
• Provide clear service description
• Keep contact number updated
• Be available during service time

Need help with booking? Contact our support team!`;
  }
  
  // Cancellation policy
  if (lowerMsg.includes('cancel') && lowerMsg.includes('booking')) {
    return `❌ **HomeEase Cancellation Policy:**

**How to Cancel:**
1️⃣ Go to "My Bookings" section
2️⃣ Select the booking to cancel
3️⃣ Tap "Cancel Booking" button
4️⃣ Choose cancellation reason
5️⃣ Confirm cancellation

⏰ **Cancellation Timeline:**
• **Free Cancellation:** Up to 2 hours before service
• **Partial Refund:** 1-2 hours before service (50% refund)
• **No Refund:** Less than 1 hour before service

💰 **Refund Process:**
• Refunds processed within 3-5 business days
• Amount credited to original payment method
• COD bookings: No charges deducted

📞 **Need Help?** Contact support for special circumstances!`;
  }
  
  // What is HomeEase
  if (lowerMsg.includes('homeease') || (lowerMsg.includes('what') && lowerMsg.includes('is'))) {
    return `🏠 **About HomeEase:**

**What We Do:**
HomeEase is Pakistan's leading home services platform connecting customers with verified professionals for all household needs.

🔧 **Our Services:**
• Plumbing & Water Solutions
• Electrical Work & Repairs
• AC Installation & Maintenance
• Cleaning & Deep Cleaning
• Carpentry & Furniture Repair
• Painting & Home Improvement

✅ **Why Choose HomeEase:**
• 100% Verified Professionals
• Transparent Pricing
• Quality Guarantee
• 24/7 Customer Support
• Easy Online Booking
• Secure Payment Options

📱 **Available On:**
• Mobile App (Android & iOS)
• Website
• Customer Support Hotline

🎯 **Our Mission:** Making home maintenance easy, reliable, and affordable for everyone!`;
  }
  
  // App issues
  if (lowerMsg.includes('app') && (lowerMsg.includes('not working') || lowerMsg.includes('problem') || lowerMsg.includes('issue'))) {
    return `📱 **HomeEase App Troubleshooting:**

**Common Solutions:**
1️⃣ **Force Close & Restart** → Close app completely, reopen
2️⃣ **Check Internet** → Ensure stable WiFi/mobile data
3️⃣ **Update App** → Download latest version from store
4️⃣ **Clear Cache** → Go to Settings > Apps > HomeEase > Clear Cache
5️⃣ **Restart Phone** → Simple restart often fixes issues

**Still Having Problems?**
• Check if you have latest app version
• Ensure sufficient storage space
• Try logging out and back in
• Uninstall and reinstall app

📞 **Contact Support:**
• Email: support@homeease.com
• Phone: +92-300-1234567
• WhatsApp: Available 24/7

We're here to help! 🤝`;
  }
  
  // Profile update
  if (lowerMsg.includes('profile') && lowerMsg.includes('update')) {
    return `👤 **How to Update Your HomeEase Profile:**

**Step-by-Step Guide:**
1️⃣ **Open HomeEase App** → Login to your account
2️⃣ **Go to Profile** → Tap profile icon (top right)
3️⃣ **Edit Information** → Tap "Edit Profile" button
4️⃣ **Update Details** → Change name, phone, address, etc.
5️⃣ **Save Changes** → Tap "Save" to confirm updates

📝 **What You Can Update:**
• Personal Information (Name, Phone)
• Address & Location
• Profile Picture
• Email Address
• Password
• Notification Preferences

🔒 **Security Note:**
• Phone number changes require OTP verification
• Email changes need confirmation
• Keep your information updated for better service

Need help? Contact our support team! 📞`;
  }
  
  // Password reset
  if (lowerMsg.includes('forgot') && lowerMsg.includes('password')) {
    return `🔐 **HomeEase Password Reset:**

**Reset Your Password:**
1️⃣ **Open HomeEase App** → Go to login screen
2️⃣ **Tap "Forgot Password"** → Below login button
3️⃣ **Enter Email/Phone** → Your registered contact
4️⃣ **Check Messages** → Look for reset code
5️⃣ **Enter Code** → Input verification code
6️⃣ **Create New Password** → Choose strong password
7️⃣ **Confirm & Login** → Use new password

📱 **Alternative Methods:**
• SMS reset code to registered phone
• Email reset link to registered email
• Contact support for manual reset

🔒 **Password Tips:**
• Use 8+ characters
• Include numbers and symbols
• Don't use personal information
• Keep it secure and unique

Need immediate help? Contact support: +92-300-1234567`;
  }
  
  // Appliance-specific issues
  if (lowerMsg.includes('refrigerator') || lowerMsg.includes('fridge')) {
    return `❄️ **Refrigerator Troubleshooting:**

**Common Issues & Solutions:**
🔍 **Not Cooling:**
• Check power connection and outlet
• Clean condenser coils (back/bottom)
• Ensure door seals properly
• Don't overload with food

🧊 **Ice Buildup:**
• Check door seals for gaps
• Defrost if excessive ice
• Clean drain hole if blocked

🔊 **Strange Noises:**
• Level the refrigerator properly
• Check if touching walls/cabinets
• Clean condenser fan

💡 **Energy Saving Tips:**
• Keep temperature at 37-40°F
• Don't put hot food inside
• Clean coils every 6 months

💰 **Estimated Repair Cost**: Rs. 2,000-8,000
⏰ **Professional Help**: For compressor, coolant, or electrical issues

🔧 **Book a refrigerator technician** through HomeEase!`;
  }
  
  // Washing machine issues
  if (lowerMsg.includes('washing machine') || lowerMsg.includes('washer')) {
    return `🧺 **Washing Machine Troubleshooting:**

**Common Problems & Solutions:**
💧 **Not Draining:**
• Check drain hose for clogs
• Clean lint filter
• Ensure proper hose height

🌀 **Not Spinning:**
• Balance the load evenly
• Check if door is properly closed
• Inspect drive belt

💦 **Water Issues:**
• Check water supply valves
• Clean inlet filters
• Verify proper water pressure

🔊 **Excessive Noise:**
• Level the machine properly
• Check for loose items in drum
• Inspect shock absorbers

💰 **Estimated Repair Cost**: Rs. 1,500-6,000
⏰ **Professional Help**: For motor, pump, or electrical issues

🔧 **Book a washing machine technician** through HomeEase!`;
  }
  
  // Service provider verification
  if (lowerMsg.includes('provider') && lowerMsg.includes('verified')) {
    return `✅ **HomeEase Provider Verification:**

**Our Verification Process:**
🔍 **Background Checks** → Criminal record verification
📋 **Document Verification** → CNIC, certificates, licenses
🎓 **Skill Assessment** → Practical tests and interviews
⭐ **Reference Checks** → Previous work history
📱 **Training Program** → HomeEase service standards

**What This Means for You:**
• 100% verified professionals only
• Insurance coverage for all services
• Quality guarantee on all work
• 24/7 customer support backup
• Transparent pricing with no hidden costs

**Additional Safety:**
• Real-time GPS tracking during service
• Customer feedback and rating system
• Instant complaint resolution
• Money-back guarantee for unsatisfactory work

🛡️ **Your safety and satisfaction is our priority!**`;
  }
  
  // Service areas coverage
  if (lowerMsg.includes('area') && (lowerMsg.includes('cover') || lowerMsg.includes('service'))) {
    return `📍 **HomeEase Service Areas:**

**Major Cities Covered:**
🏙️ **Karachi** → All areas including DHA, Clifton, Gulshan
🏙️ **Lahore** → DHA, Gulberg, Model Town, Johar Town
🏙️ **Islamabad** → F-sectors, G-sectors, I-sectors
🏙️ **Rawalpindi** → Satellite Town, Commercial Market
🏙️ **Faisalabad** → Civil Lines, Peoples Colony
🏙️ **Multan** → Cantt, Gulgasht Colony

**Service Radius:**
• 25km radius from city centers
• Suburban areas included
• Some remote areas on request

**Expansion Plans:**
• Adding new cities monthly
• Rural area coverage coming soon
• Check app for latest coverage map

📱 **To Check Your Area:**
Enter your address in the HomeEase app to see available services in your location!`;
  }
  
  // Rating and review process
  if (lowerMsg.includes('rate') || lowerMsg.includes('review')) {
    return `⭐ **How to Rate & Review Services:**

**After Service Completion:**
1️⃣ **Open HomeEase App** → Go to "My Bookings"
2️⃣ **Select Completed Service** → Tap on finished booking
3️⃣ **Rate Service** → Give 1-5 stars
4️⃣ **Write Review** → Share your experience
5️⃣ **Rate Provider** → Evaluate professionalism
6️⃣ **Submit Feedback** → Help others choose better

**Rating Categories:**
⭐ **Service Quality** → Work satisfaction
⭐ **Timeliness** → Punctuality and speed
⭐ **Professionalism** → Behavior and communication
⭐ **Value for Money** → Price vs quality
⭐ **Cleanliness** → Work area maintenance

**Your Reviews Help:**
• Other customers make informed decisions
• Providers improve their services
• HomeEase maintain quality standards
• Build a trusted community

💡 **Honest reviews make HomeEase better for everyone!**`;
  }
  
  // Contact customer support
  if (lowerMsg.includes('contact') && lowerMsg.includes('support')) {
    return `📞 **HomeEase Customer Support:**

**24/7 Support Channels:**
📱 **Phone Support:**
• Hotline: +92-300-1234567
• Available 24/7 for emergencies
• Urdu & English support

💬 **WhatsApp Support:**
• Number: +92-300-1234567
• Quick responses within 5 minutes
• Send photos/videos of issues

📧 **Email Support:**
• support@homeease.com
• Response within 2 hours
• Detailed issue resolution

🤖 **In-App Chat:**
• Real-time chat support
• Instant booking assistance
• Technical help available

**Emergency Support:**
• Service provider issues during work
• Payment problems
• Safety concerns
• Immediate complaint resolution

**Support Hours:**
• Phone: 24/7
• WhatsApp: 24/7  
• Email: 24/7
• In-app: 24/7

We're always here to help! 🤝`;
  }
  
  // Reschedule appointment
  if (lowerMsg.includes('reschedule') && lowerMsg.includes('appointment')) {
    return `📅 **How to Reschedule Your Appointment:**

**Easy Rescheduling Process:**
1️⃣ **Open HomeEase App** → Go to "My Bookings"
2️⃣ **Select Booking** → Choose appointment to change
3️⃣ **Tap "Reschedule"** → Available 2+ hours before service
4️⃣ **Choose New Time** → Pick from available slots
5️⃣ **Confirm Changes** → Review and confirm new timing
6️⃣ **Get Confirmation** → SMS/notification sent

**Rescheduling Policy:**
⏰ **Free Rescheduling:** Up to 2 hours before service
⏰ **Same Day Changes:** Subject to provider availability
⏰ **Emergency Changes:** Contact support immediately

**What Happens Next:**
• Provider gets automatic notification
• New confirmation sent to you
• Calendar updated in real-time
• No extra charges for valid reschedules

**Can't Find Suitable Time?**
• Contact support for more options
• Request priority scheduling
• Consider alternative service providers

📞 **Need Help?** Call support: +92-300-1234567`;
  }
  
  // Notification settings
  if (lowerMsg.includes('notification') && lowerMsg.includes('settings')) {
    return `🔔 **HomeEase Notification Settings:**

**How to Manage Notifications:**
1️⃣ **Open HomeEase App** → Go to Settings
2️⃣ **Tap "Notifications"** → Access notification preferences
3️⃣ **Choose Categories** → Select what you want to receive
4️⃣ **Set Timing** → Choose when to receive alerts
5️⃣ **Save Settings** → Apply your preferences

**Notification Types:**
📱 **Booking Updates:**
• Service confirmations
• Provider assignment
• Schedule changes
• Completion notifications

🔔 **Promotional:**
• Special offers and discounts
• New service announcements
• Seasonal promotions

⚠️ **Important Alerts:**
• Payment reminders
• Service provider arrival
• Emergency notifications
• Account security alerts

**Delivery Methods:**
• Push notifications (recommended)
• SMS messages
• Email notifications
• In-app notifications

**Smart Settings:**
• Do Not Disturb hours
• Priority notifications only
• Location-based alerts

Customize your experience! 📲`;
  }

  return null;
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    console.log('🤖 Chatbot received message:', message);
    
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let reply = '';
    let sources = [];
    
    // Handle greetings first
    const lowerMessage = message.toLowerCase().trim();
    if (['hi', 'hello', 'hey', 'good morning', 'good evening'].includes(lowerMessage)) {
      reply = `Hello! 👋 I'm your HomeEase AI assistant. I can help you with:

🔧 **Plumbing** - Leaks, clogs, repairs
⚡ **Electrical** - Wiring, outlets, lighting  
🔨 **Carpentry** - Furniture, repairs, installations
🎨 **Painting** - Interior, exterior, touch-ups
🧹 **Cleaning** - Deep cleaning, maintenance
❄️ **AC/Heating** - Repairs, maintenance

What home service issue can I help you with today?`;
      
      return res.json({
        success: true,
        reply,
        sources: []
      });
    }

    // First, try to handle business-specific questions
    const businessReply = handleBusinessQuestions(message);
    if (businessReply) {
      console.log('✅ Business question handled');
      return res.json({
        success: true,
        reply: businessReply,
        sources: [{ category: 'HomeEase Business', confidence: 1.0 }]
      });
    }

    // Try to find answer in CSV dataset
    try {
      const dataset = loadDataset();
      const match = findBestMatch(message, dataset);
      
      if (match) {
        console.log('✅ Found match in CSV dataset');
        reply = match.Answer;
        sources = [{
          category: match.Category || 'Home Services',
          confidence: 0.9
        }];
        
        return res.json({
          success: true,
          reply,
          sources
        });
      }
    } catch (error) {
      console.log('⚠️ CSV dataset not available, using offline AI');
    }

    // Fallback to Offline AI for home service questions
    console.log('🧠 Using Offline AI (No API required)');
    reply = generateOfflineAI(message);
    console.log('✅ Offline AI response generated successfully');

    res.json({
      success: true,
      reply,
      sources: [{ category: 'AI Assistant', confidence: 0.8 }]
    });

  } catch (error) {
    console.error('❌ Chatbot controller error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Chatbot service temporarily unavailable',
      error: error.message 
    });
  }
};