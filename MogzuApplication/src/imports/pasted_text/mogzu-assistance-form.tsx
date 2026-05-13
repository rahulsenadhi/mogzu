Design a full-page multi-step assistance request form called "Mogzu Assistance" for the Mogzu B2B events marketplace platform. This page opens when a corporate user clicks "Mogzu Assistance"  — it replaces the need to search the platform, instead letting the Mogzu team manually curate and respond to requirements.

STEP 1 — Select Assistance Type

Heading: "What do you need help with?"
Subtitle: "Select the type of assistance and we'll connect you with the right team."

Display as a 2×3 grid of selectable cards (radio-style, click to select, shows border highlight + checkmark on selection):

Card 1: 📋 RFP — "Request for Proposal or RFP Cart"
Card 2: 🎁 Gifting — "Corporate gifting solutions"
Card 3: 🏢 Space Booking — "Meeting, marketing or activity spaces"
Card 4: 🎉 Events — "Activity and event assistance"
Card 5: 📢 Promotional Space — "Vendor or in-office promotions"
Card 6: 🛠 Support — "Help with ongoing services or issues"
Card 7: ✏️ Other — "Custom request — let us know"

Each card: Icon (large, centered top), bold label, short description below. Selected state: filled accent-color border, soft background tint, checkmark badge top-right.

CTA: "Next →" button (disabled until selection made)

---

STEP 2 — Client Details

Heading: "Your Contact Information"
Subtitle: "So our team knows who to reach out to."

Fields (stacked, full-width):
- Client / Company Name* (text input)
- Phone Number* (text input with country code selector: +91 default)
- Email Address* (email input)

All fields: floating label style, rounded corners, subtle border, focus state with accent color glow.

CTA: Back | Next →

---

STEP 3 — Specify Requirements

Heading: "Tell Us What You Need"
Subtitle: "The more detail you share, the better we can assist you."

Fields:
- Requirement Details* — Large textarea (min 120px height), placeholder: "Describe your requirements in detail..."
- Promotion Activity Requirements — Textarea, placeholder: "Any in-office or venue promotion needs?"
- Custom Requirements — Textarea, placeholder: "Anything else we should know?"
- RFP? — Toggle switch labeled "This is an RFP request". If toggled ON, reveal an input: "RFP Reference / Details"
- Ad Reference Link — Text input, placeholder: "Paste a link to reference material"
- Upload Reference Image — Drag-and-drop zone: dashed border, upload icon, "Drop image here or click to upload", shows thumbnail preview on upload
- Custom Combo Request — Text input, placeholder: "Specify any combo packages you'd like"

CTA: Back | Next →

---

STEP 4 — Dates & Timing

Heading: "When Do You Need This?"
Subtitle: "Set your preferred dates and we'll plan around your schedule."

Fields:
- Check-In Date* — Date picker (calendar popup, clean modern style)
- Check-Out Date* — Date picker
- Alternative Dates — Textarea, placeholder: "List any backup dates or flexible date ranges"

Show a subtle inline calendar visual for primary date range selection (showing selected range highlighted across days).

CTA: Back | Next →

---

STEP 5 — Guest / Pax Information

Heading: "Guest Details"
Subtitle: "Help us understand the scale of your event or requirement."

Fields:
- Number of Guests* — Number input with +/- stepper buttons, large centered display of number
- Pax Information — Textarea, placeholder: "Any details about attendees, special requirements, dietary needs, VIP guests, etc."

CTA: Back | Next →

---

STEP 6 — Payment Preference

Heading: "Payment Method"
Subtitle: "How would you like to handle payment?"

Fields:
- Payment Method* — Segmented control / tab selector:
  Option A: "Immediate Payment"
  Option B: "Credit Terms"
- Payment Details — Text input, placeholder: "Bank name, credit terms reference, or relevant details"
- Checkbox: "Let Mogzu handle payment processing on my behalf" — when checked, show a soft info banner: "Our team will reach out with a payment link or invoice."

CTA: Back | Next →

---

STEP 7 — Review & Submit

Heading: "Review Your Request"
Subtitle: "Take a moment to confirm everything looks right before submitting."

Display a read-only summary card for each step in collapsible accordion sections:
- ✅ Assistance Type
- ✅ Client Details
- ✅ Requirements
- ✅ Dates
- ✅ Guest Info
- ✅ Payment

Each section shows label-value pairs in a clean two-column layout. Include a small "Edit" link per section that navigates back to that step.

Below summary:
- Checkbox: "I confirm the above details are accurate"
- Primary CTA: Large button — "Submit Request to Mogzu" (accent color, full width, arrow icon)

On submit: Show a full-screen success state:
- Large animated checkmark (green)
- Heading: "Request Submitted!"
- Subtext: "Your Mogzu team will review this and reach out within 2 business hours."
- Secondary action: "Return to Dashboard"

---

INTERACTION NOTES:
- Animate step transitions: slide-in from right on Next, slide-in from left on Back
- Left panel step tracker updates in real-time as user progresses
- Show inline validation on blur (red border + error message below field)
- Required fields marked with *
- Disable Next button if required fields in current step are empty
