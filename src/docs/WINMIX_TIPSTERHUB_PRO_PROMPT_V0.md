# WinMix TipsterHub – Professzionális Prompt Gyűjtemény (v0.dev)

Ez a dokumentum a WinMix TipsterHub teljes frontend élményének megtervezéséhez és implementálásához szükséges, professzionális prompt utasításokat tartalmazza. A felépítés a belső 16 Phase roadmap kritériumait követi, és modulonként biztosítja a megfelelő vizuális, interaktív és funkcionalitási irányelveket. A promptok v0.dev környezetben is azonnal felhasználhatók.

## Általános irányelvek

- Sötét témájú, prémium érzetet keltő UI, emerald-zöld és arany akcentusokkal.
- Glassmorphism kártyák gradient glow kerettel, animált felület elemekkel.
- Hoverre és scrollra finom animációk, preferáltan fade-up és scale változatok.
- Komponens-szintű, moduláris megközelítés, ahol minden modul a saját vizuális akszentusait használja (pl. ML szekcióban kék, Admin modulban vörös figyelmeztetések).
- A promptok kombinálhatók, de önállóan is lefedik a releváns oldalakat és nézeteket.

## Prompt gyűjtemény

### Landing Page Prompt

```plaintext
I want to create a landing page for WinMix TipsterHub - an AI-powered sports betting prediction platform

@Dark Futuristic Sports Analytics Landing Page Template

I want this button as the main CTA @Animated Shiny Pulse Button with Gradient Glow

These are the sections:
@Hero Section with Animated Stats Counter and Floating Sports Icons
@AI-Powered Feature Cards Grid with Hover Animations
@How It Works Timeline Section with Step Indicators
@Live Prediction Ticker Marquee Section
@Testimonials Carousel with User Stats Cards
@Pricing Plans Comparison Table Section

For avatars I want:
@Professional Sports Analyst Portrait
@Data Scientist Dark Portrait
@Football Coach Silhouette
@Sports Bettor Confident Portrait
@AI Robot Face Neon Glow
@Stadium Night Atmosphere Portrait

For general images:
@Football Stadium Night Lights Aerial
@AI Neural Network Abstract Visualization
@Sports Data Dashboard Screenshot
@Machine Learning Algorithm Visualization
@Live Match Statistics Interface
@Trophy Success Celebration Dark Theme

For the footer @Dark Premium Footer with Newsletter and Social Links

I want all cards to be @Glassmorphism Card with Border Gradient Glow
I want to animate @Animation on Scroll Fade Up and Scale
I want @Smooth Parallax Background Effect
I want @Animated Number Counter for Statistics
I want @Dark Theme with Emerald Green and Gold Accents
```

### Dashboard Layout Prompt

```plaintext
I want to create a dashboard layout for WinMix TipsterHub sports prediction platform

@Modern Dark Dashboard Layout with Collapsible Sidebar

I want these navigation sections:
@Sidebar Navigation with Icon Labels and Active States
@Top Header with User Avatar Dropdown and Notifications Bell
@Breadcrumb Navigation Component

The sidebar should include these menu items with icons:
- Dashboard (Home icon)
- Predictions (Target icon)
- Matches (Calendar icon)
- Analytics (BarChart icon)
- ML Models (Brain icon)
- Jobs (Clock icon)
- Monitoring (Activity icon)
- Cross-League (Globe icon)
- Teams (Users icon)
- AI Chat (MessageSquare icon)
- Settings (Settings icon)
- Admin section (only for admin role) (Shield icon)

I want @Role-Based Navigation Visibility
I want @Dark/Light Theme Toggle in Header
I want @Responsive Drawer Sidebar for Mobile
I want @Animated Menu Transitions
I want @Notification Badge Counter Component
I want all to be @Dark Theme with Emerald Green Primary Color
```

### Predictions Module Prompt

```plaintext
I want to create the Predictions module for WinMix TipsterHub

@Data Table with Advanced Filtering and Sorting
@Prediction Card with Confidence Gauge

These are the components:
@Predictions List Page with Search and Filters
@Prediction Details Card with Match Info
@New Prediction Form with Match Selector
@Prediction Analyzer Dashboard with Charts
@Confidence Badge with Color Coding (red/yellow/green)
@Prediction Status Indicator (pending/correct/incorrect)

For the Analyzer section I want:
@Accuracy Trend Line Chart
@Confidence Distribution Histogram
@Model Comparison Bar Chart
@League Breakdown Pie Chart
@Metrics Cards (Accuracy, Precision, Recall, F1)

I want @Filter Panel with Date Range Picker
I want @Pagination Component with Page Size Selector
I want @Export to CSV Button
I want @Real-time Data Refresh Indicator
I want all cards to be @Glassmorphism with Subtle Border
I want @Animated Chart Transitions
```

### ML Models Module Prompt

```plaintext
I want to create the ML Models module for WinMix TipsterHub

@Model Card with Performance Metrics
@Model Lifecycle State Machine Visualization

These are the components:
@Models List with Status Badges
@Model Details Page with Feature Importance Chart
@Model Comparison Side-by-Side View
@Performance Dashboard with ROC Curve
@Decay Indicator with Warning Alerts
@Lifecycle Status Timeline

For visualizations I want:
@Feature Importance Horizontal Bar Chart
@Accuracy Over Time Line Chart
@Confusion Matrix Heatmap
@ROC Curve with AUC Score
@Training History Timeline

I want @Status Badge Component (active/training/deprecated)
I want @Decay Score Progress Bar with Threshold Line
I want @Model Promotion Action Buttons (admin only)
I want @Training Trigger Button with Loading State
I want @Animated Status Transitions
I want all to be @Dark Theme with Blue Accent for ML Section
```

### Monitoring Module Prompt

```plaintext
I want to create the Monitoring module for WinMix TipsterHub

@System Health Dashboard Grid Layout
@Real-time Metrics Charts

These are the components:
@Health Status Cards with Pulse Animation
@Service Status Grid (Database, Auth, ML Pipeline, Scheduler)
@Metrics Charts (CPU, Memory, Response Times)
@Alerts Panel with Priority Sorting
@Computation Graph Visualization

For visualizations I want:
@Real-time Line Chart with Auto-scroll
@Service Status Indicator Dots (green/yellow/red)
@Alert Severity Badge
@Node-based Pipeline Graph
@Resource Usage Gauge Charts

I want @Alert Acknowledge Button
I want @Health Check Trigger Button
I want @Real-time WebSocket Updates Indicator
I want @Expandable Alert Details Row
I want @Animated Pulse for Active Services
I want all to be @Dark Theme with Status Color Coding
```

### Admin Module Prompt

```plaintext
I want to create the Admin module for WinMix TipsterHub (admin role only)

@Admin Dashboard with System Overview Cards
@User Management Data Table

These are the components:
@Admin Dashboard with Quick Stats
@User Management Table with Role Editor
@System Settings Form with Sections
@Training Controls Panel
@System Logs Viewer with Real-time Stream
@Import Wizard with Progress Steps

For the User Management I want:
@User Row with Avatar, Email, Role Badge, Status Toggle
@Role Dropdown Selector
@Invite User Modal Form
@Bulk Actions Toolbar

For Training Controls I want:
@Trigger Training Button with Confirmation
@Training Parameters Form
@Active Training Progress Bar
@Training History Log Table

I want @Role-Based Access Guard Component
I want @Confirmation Modal for Dangerous Actions
I want @Success/Error Toast Notifications
I want @Masked Environment Variables Display
I want all to be @Dark Theme with Red Accent for Admin Warnings
```

### AI Chat Module Prompt

```plaintext
I want to create the AI Chat module for WinMix TipsterHub

@Chat Interface with Message Bubbles
@AI Response with Markdown Rendering

These are the components:
@Chat Container with Message History
@User Message Bubble (right aligned)
@AI Response Bubble (left aligned) with Typing Indicator
@Chat Input with Send Button
@Suggested Questions Chips
@Embedded Prediction Card in AI Response

For the chat interface I want:
@Scrollable Message History
@Timestamp on Messages
@Copy Response Button
@Regenerate Response Button
@Chat History Sidebar (collapsible)

I want @Typing Animation for AI Responses
I want @Markdown Code Block Rendering
I want @Embedded Match Analysis Cards
I want @Voice Input Button (optional)
I want @Dark Theme with Gradient Message Bubbles
I want @Smooth Scroll to Latest Message
```

### Cross-League Module Prompt

```plaintext
I want to create the Cross-League Intelligence module for WinMix TipsterHub

@Correlation Matrix Heatmap
@League Comparison Dashboard

These are the components:
@Cross-League Dashboard with Multi-Select
@Correlation Matrix with Color Scale
@League Comparison Radar Chart
@Pattern Transfer Indicators
@Cross-League Accuracy Table

For visualizations I want:
@Interactive Heatmap with Hover Details
@Radar Chart Comparing Multiple Leagues
@Sankey Diagram for Pattern Flow
@Time-lagged Correlation Chart

I want @Multi-Select League Filter
I want @Statistical Significance Indicators
I want @Export Correlation Data Button
I want @Animated Chart Transitions
I want all to be @Dark Theme with Multi-color League Coding
```

### Authentication Prompt

```plaintext
I want to create the Authentication pages for WinMix TipsterHub

@Modern Dark Login Form with Gradient Background
@Registration Form with Validation

These are the pages:
@Login Page with Email/Password Fields
@Register Page with Password Confirmation
@Forgot Password Page with Email Input
@Email Verification Success Page

For forms I want:
@Input Fields with Floating Labels
@Password Visibility Toggle
@Remember Me Checkbox
@Social Login Buttons (optional)
@Form Validation Error Messages

I want @Supabase Auth Integration
I want @Loading Button States
I want @Success/Error Toast Messages
I want @Redirect After Login to Dashboard
I want @Dark Theme with Emerald Accent
I want @Animated Background Gradient
I want @WinMix Logo in Header
```

---

A fenti prompt gyűjtemény a WinMix TipsterHub valamennyi kiemelt moduljához részletes specifikációt nyújt. A moduláris felépítésnek köszönhetően a generált UI-k könnyen illeszthetők a meglévő komponensstruktúrába, miközben konzisztensen alkalmazzák a WinMix vizuális irányelveit és interaktív elvárásait.
