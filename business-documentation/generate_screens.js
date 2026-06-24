const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'Aura.pen');
let data;

try {
  const content = fs.readFileSync(file, 'utf8');
  data = JSON.parse(content);
} catch (e) {
  console.error("Failed to read Aura.pen", e);
  process.exit(1);
}

// Helpers
const genId = () => Math.random().toString(36).substring(2, 8);

const createText = (name, content, size = 16, weight = "400", fill = "$text-primary") => ({
  type: "text",
  id: genId(),
  name,
  fill,
  content,
  fontFamily: "$font-body",
  fontSize: size,
  fontWeight: weight
});

const createFrame = (name, x, y, children = [], options = {}) => ({
  type: "frame",
  id: genId(),
  name,
  x,
  y,
  layout: "vertical",
  gap: 24,
  fill: "#FFFFFF",
  padding: [32, 32],
  cornerRadius: 8,
  children,
  ...options
});

const createInput = (placeholder) => ({
  type: "frame",
  id: genId(),
  name: "Input",
  layout: "horizontal",
  fill: "$bg-surface",
  cornerRadius: "$radius-sm",
  padding: [12, 16],
  width: 300,
  children: [createText("Placeholder", placeholder, 14, "400", "$text-secondary")]
});

const createButton = (label, fill = "$primary") => ({
  type: "frame",
  id: genId(),
  name: "Button",
  fill,
  cornerRadius: "$radius-sm",
  padding: [10, 20],
  justifyContent: "center",
  alignItems: "center",
  children: [createText("Label", label, 14, "500", "#FFFFFF")]
});

// 1. Onboarding Wizard Frame
const onboardingFrame = createFrame("Registration & Onboarding", 2000, 0, [
  createText("SectionTitle", "Registration & Onboarding Flow", 24, "700"),
  
  createFrame("Landing Page - Magic Link Login", null, null, [
    createText("Title", "Welcome to Aura Planning", 20, "600"),
    createText("Subtitle", "Enter your email to continue", 14, "400", "$text-secondary"),
    createInput("name@example.com"),
    createButton("Send Magic Link")
  ], { fill: "$bg-surface", padding: [24, 24] }),

  createFrame("Profile Setup", null, null, [
    createText("Title", "Complete Your Profile", 20, "600"),
    createInput("Your Full Name"),
    createText("Terms", "☑ I accept the terms and conditions", 14),
    createButton("Save Profile")
  ], { fill: "$bg-surface", padding: [24, 24] }),

  createFrame("Onboarding Wizard - Steps", null, null, [
    createText("Title", "Create Your Event", 20, "600"),
    createText("Step", "Step 1: Template Selection", 16, "500"),
    createFrame("Templates", null, null, [
      createText("T1", "Minimalist"),
      createText("T2", "Elegant"),
      createText("T3", "Modern")
    ], { layout: "horizontal", gap: 16 }),
    createText("Step", "Step 2: Event Basics", 16, "500"),
    createInput("Event Name (e.g. Maria & Juan)"),
    createInput("Date"),
    createInput("Venue Address"),
    createButton("Create Event")
  ], { fill: "$bg-surface", padding: [24, 24] })
], { width: 800 });

// 2. Host Management Extensions Frame
const hostManagementFrame = createFrame("Host Management Detailed Views", 2900, 0, [
  createText("SectionTitle", "Host Management Panel", 24, "700"),
  
  createFrame("Guest Manager", null, null, [
    createText("Title", "Guest List", 20, "600"),
    createFrame("Actions", null, null, [
      createInput("Search guests..."),
      createButton("Import CSV"),
      createButton("Add Guest")
    ], { layout: "horizontal", gap: 16, fill: "transparent", padding: [0,0] }),
    createFrame("Table", null, null, [
      createText("Header", "Name | Email | Category | Status", 14, "600"),
      createText("Row1", "Juan Perez | juan@test.com | Family | Confirmed", 14),
      createText("Row2", "Maria Lopez | maria@test.com | Friends | Pending", 14)
    ], { fill: "#FFFFFF", padding: [16, 16] })
  ], { fill: "$bg-surface", padding: [24, 24] }),

  createFrame("Template Editor", null, null, [
    createText("Title", "Template Customization", 20, "600"),
    createFrame("Controls", null, null, [
      createText("Label", "Primary Color", 14, "500"),
      createInput("#0D9488"),
      createText("Label", "Typography", 14, "500"),
      createInput("Inter"),
      createText("Label", "Hero Image", 14, "500"),
      createButton("Upload Image", "$bg-surface")
    ], { fill: "#FFFFFF", padding: [16, 16] })
  ], { fill: "$bg-surface", padding: [24, 24] }),

  createFrame("Publishing Paywall", null, null, [
    createText("Title", "Publish Your Event", 20, "600"),
    createText("Price", "EUR 29.99 One-time", 24, "700", "$primary"),
    createText("Feature", "✓ Unlimited Guests", 14),
    createText("Feature", "✓ WhatsApp Invitations", 14),
    createText("Feature", "✓ Live Guest Journey", 14),
    createButton("Pay with Stripe")
  ], { fill: "$bg-surface", padding: [24, 24] })
], { width: 800 });

// 3. Communication Templates Frame
const commsFrame = createFrame("Communication Templates", 3800, 0, [
  createText("SectionTitle", "Communication Templates", 24, "700"),
  
  createFrame("Email Invitation", null, null, [
    createText("Title", "Email Preview", 16, "500", "$text-secondary"),
    createText("Subject", "You're invited to Maria & Juan's Wedding!", 18, "600"),
    createFrame("EmailBody", null, null, [
      createText("Image", "[ Hero Image ]", 14, "400", "$text-secondary"),
      createText("Text", "We would love for you to join us...", 14),
      createButton("RSVP Now")
    ], { fill: "#FFFFFF", padding: [24, 24], alignItems: "center" })
  ], { fill: "$bg-surface", padding: [24, 24] }),

  createFrame("WhatsApp Message", null, null, [
    createText("Title", "WhatsApp Preview", 16, "500", "$text-secondary"),
    createFrame("ChatBubble", null, null, [
      createText("Text", "Hi! You are invited to Maria & Juan's Wedding. Tap the link to RSVP:", 14),
      createText("Link", "https://aura.planning/e/maria-y-juan", 14, "400", "$primary")
    ], { fill: "#DCF8C6", padding: [12, 16], cornerRadius: 8 })
  ], { fill: "$bg-surface", padding: [24, 24] })
], { width: 600 });

// Add to children
if (!data.children) data.children = [];
data.children.push(onboardingFrame, hostManagementFrame, commsFrame);

// Write back
fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log("Successfully appended missing UI frames to Aura.pen");
