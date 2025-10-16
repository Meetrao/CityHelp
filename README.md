🏙️ CityHelp.AI
AI-powered civic issue reporting platform Built with ❤️ by @Meetrao — because your city deserves better.

🚀 Live Links
🌐 Frontend: city-help.vercel.app

🧠 Backend (Node.js): cityhelp.onrender.com

🤖 ML API (Flask + YOLOv8): cityhelp-py-flask.onrender.com

📦 What It Does
CityHelp.AI lets citizens report civic issues (like potholes, garbage, broken lights) with photos and descriptions. It uses AI to auto-caption images, helps admins manage and resolve issues, and visualizes civic data with charts.

🧠 Tech Stack
Layer	Tech Used
🎨 Frontend	React + Vite + Tailwind CSS + React Router DOM
🔧 Backend	Node.js + Express + JWT Auth + MongoDB Atlas
🤖 ML API	Flask + PyTorch + Torchvision + Ultralytics YOLOv8
📊 Charts	Chart.js (Pie + Bar)
☁️ Deployment	Vercel (Frontend), Render (Backend + ML API), MongoDB Atlas (Cloud DB)
🛠️ Local Setup (Step-by-Step)
1️⃣ Frontend
bash
git clone https://github.com/Meetrao/CityHelp
cd frontend
npm install
Create .env:

env
VITE_BACKEND_URL=https://cityhelp.onrender.com
Run it:

bash
npm run dev
2️⃣ Backend
bash
cd backend
npm install
Create .env:

env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://city-help.vercel.app
Run it:

bash
npm start
3️⃣ ML API
bash
cd ml-api
pip install -r requirements.txt
Make sure YOLOv8 weights are in weights/.

Run it:

bash
flask run
🌐 Environment Variables
Service	Variable	Description
Frontend	VITE_BACKEND_URL	Backend base URL
Backend	MONGO_URI	MongoDB Atlas connection string
Backend	JWT_SECRET	JWT signing secret
Backend	CORS_ORIGIN	Allowed frontend origin
ML API	MODEL_PATH	Path to YOLOv8 weights
🧪 Features
👥 Citizens
Login/signup

Report issues with image + description

Auto-caption via ML

Track issue status

🛡️ Admins
View all issues

Filter by status

Update status + notes

Manage user roles

🤖 AI Integration
YOLOv8 detects objects in images

Flask API returns caption

Caption used to autofill issue title

📊 Admin Dashboard
🥧 Pie Chart: Issue status breakdown

📊 Bar Chart: Issues by category

👤 User Management: Promote/demote roles

📝 Notes: Add internal notes per issue

🔐 Auth Flow
JWT-based login

Role-based access control

Token stored in localStorage

Protected routes via useAuth

🧼 Code Quality
Modular components

Centralized API logic

Clean routing

Dynamic .env config

CORS handled across services

🚀 Deployment Strategy
Service	Platform	URL
Frontend	Vercel	https://city-help.vercel.app
Backend	Render	https://cityhelp.onrender.com
ML API	Render	https://cityhelp-py-flask.onrender.com
Database	MongoDB	MongoDB Atlas
🤝 Contributing
bash
git clone https://github.com/Meetrao/CityHelp
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
Then open a pull request 🚀

📄 License
MIT License — use it, remix it, deploy it.

🙋‍♂️ Built By
Made with ❤️ by Meet Rao For queries, open an issue or drop a star ⭐
