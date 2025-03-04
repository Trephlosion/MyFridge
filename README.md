# MyFridge

MyFridge is an innovative recipe-sharing and ingredient management platform that empowers you to maximize the potential of your ingredients. Leveraging cutting-edge AI-powered tools—such as image recognition and large language model (LLM) integrations—MyFridge recommends recipes based on your current fridge inventory and even from photos. This smart platform streamlines meal planning, reduces food waste, and nurtures a vibrant food community.

## Team

**Team Name:** What’s In My Fridge?  
**Team Members & Roles:**
- **Ke’Arrah Martin** – AI Features Lead  
  *Focuses on evaluating and designing AI-powered features, including ingredient recognition and intelligent recipe suggestions.*
- **Rodney Whitney III** – Social Engagement Analyst  
  *Leads the development of community features such as following users, recipe challenges, and comment systems.*
- **Ronnie Burns** – Database Architect and Integration Specialist  
  *Oversees the design and integration of the database schema to support robust recipe filtering, inventory management, and analytics.*
- **Kayla Alexandre** – Accessibility and Usability Tester  
  *Ensures the platform is user-friendly and accessible, including for visually impaired users, by refining the interface and notification systems.*

## Project Overview

MyFridge revolutionizes your kitchen experience by enabling you to:
- **Manage a Virtual Fridge:** Add, update, or remove ingredients and even track details like expiration dates.
- **Discover Recipes:** Search by ingredient, cuisine, or dietary restriction; or try a vague query like “healthy snack” powered by AI.
- **Leverage AI-Powered Features:** Get personalized recipe recommendations based on your inventory or by simply snapping a photo.
- **Engage with a Community:** Post recipes, rate and comment on dishes, and follow your favorite content creators for a customized feed.
- **Plan Efficiently:** Automatically generate shopping lists for missing ingredients.

## Key Features

### Core Features
- **User Account Management:** 
  - Secure registration, login, and profile management.
  - Update contact information and notification preferences.
- **Virtual Fridge Management:** 
  - Easily add, edit, or delete items.
  - Potential future enhancements include tracking expiration dates and storage conditions.
- **AI-Driven Recipe Suggestions:** 
  - Receive recommendations based on your fridge inventory.
  - **Image-Based Suggestions:** Snap a picture of your ingredients and get tailored recipe ideas.
- **Advanced Recipe Search & Filtering:** 
  - Search recipes by name, ingredients, cuisine, dietary restrictions, or popularity.
  - Utilize AI-powered vague queries for more flexible searching.
- **Social & Community Features:** 
  - Post, comment on, save, and rate recipes.
  - Follow content creators to see their latest posts and participate in recipe challenges.
  - In-app messaging for direct communication between users.

### Administrative & Creator Tools
- **Administrative Controls:**
  - Manage user accounts (activation, deactivation, banning).
  - Generate detailed analytics reports (e.g., tracking recipe trends by category over specific timeframes, such as “March to June”).
  - Highlight seasonal recipes on the homepage.
  - Provide direct user support.
- **Content Creator & Recipe Curator Features:**
  - **Content Management:** Create, edit, and delete recipes including detailed instructions and AI-generated tags.
  - **Community Engagement:** Host recipe challenges and nutrition workshops. Note that nutrition workshops can be set up as Q&A sections where hosts post content and users engage via comments.
  - **Quality Control:** Review submitted recipes, ensure dietary compliance, evaluate popularity metrics, and identify trending recipes.

## Use Cases

- **User Registration and Login:**  
  Secure authentication for personalized access.
- **Virtual Fridge Updates:**  
  Keep your ingredient list current to power accurate AI recommendations.
- **Recipe Discovery:**  
  Use both precise searches (by name or ingredient) and flexible, AI-enhanced queries.
- **Social Interactions:**  
  Engage with the community through posting, commenting, rating, and in-app messaging.
- **Administrative Oversight:**  
  Monitor user activity, generate analytic reports, and manage content quality.

## Database Design Overview

The MyFridge platform is built upon a structured database that includes:

- **Users:**  
  Profiles, credentials, social connections, and personalization settings.
- **Recipes:**  
  Detailed recipe information including ingredients, instructions, images, and AI-generated tags.
- **Comments:**  
  User feedback on recipes.
- **Fridge:**  
  Records of each user’s inventory.
- **Shopping Lists:**  
  Automatically generated lists based on missing ingredients.
- **Ratings:**  
  User ratings and reviews for recipes.
- **Follow Relationships:**  
  Social connections between users and content creators.

For a complete schema and further details, please refer to the project documentation.

## Getting Started

### Prerequisites
- Environment setup (programming language runtimes, database systems, etc.) as specified in the full documentation.

### Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/myfridge.git

2. **Run the installations in the directory:**
    npm i 
    npm init @eslint/config@latest
    npm install -D tailwindcss postcss autoprefixer
    npx shadcn@latest init
    npm i -D @types/node

