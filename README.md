<div align="center">

# 🏙️ CityHelp.AI

### AI-Powered Civic Issue Reporting Platform

*Built with ❤️ — because your city deserves better.*

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://city-help.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend-API-green?style=for-the-badge)](https://cityhelp.onrender.com)
[![ML API](https://img.shields.io/badge/ML-API-orange?style=for-the-badge)](https://cityhelp-py-flask.onrender.com)

</div>

---

## 🌟 What It Does  

**CityHelp.AI** empowers citizens to report civic issues like potholes, garbage piles, broken streetlights, and more—all with just a photo and description. Our AI-powered platform automatically generates captions for uploaded images, helps admins efficiently manage and resolve issues, and provides insightful data visualizations to track civic health.

### ✨ Key Highlights

- 🤖 **AI-Powered Image Captioning** using YOLOv8
- 🔐 **Secure JWT Authentication** with role-based access
- 📊 **Real-time Analytics Dashboard** with interactive charts
- 🎯 **Smart Issue Management** with status tracking
- 🌐 **Cloud-First Architecture** deployed on Vercel, Render & MongoDB Atlas

---

## 🚀 Live Links

| Service | URL |
|---------|-----|
| 🌐 **Frontend** | [city-help.vercel.app](https://city-help.vercel.app) |
| 🧠 **Backend API** | [cityhelp.onrender.com](https://cityhelp.onrender.com) |
| 🤖 **ML API** | [cityhelp-py-flask.onrender.com](https://cityhelp-py-flask.onrender.com) |

---

## 🧠 Tech Stack

<table>
<tr>
<td width="50%">

### Frontend
- ⚛️ React + Vite
- 🎨 Tailwind CSS
- 🧭 React Router DOM
- 📊 Chart.js

</td>
<td width="50%">

### Backend
- 🟢 Node.js + Express
- 🔒 JWT Authentication
- 🍃 MongoDB Atlas
- 🌐 CORS Support

</td>
</tr>
<tr>
<td width="50%">

### ML API
- 🐍 Flask + PyTorch
- 🎯 YOLOv8 (Ultralytics)
- 👁️ Torchvision
- 📸 Image Processing

</td>
<td width="50%">

### Deployment
- ▲ Vercel (Frontend)
- 🎨 Render (Backend + ML)
- ☁️ MongoDB Atlas (Database)

</td>
</tr>
</table>

---

## 🎯 Features

### 👥 For Citizens

- ✅ **Easy Registration & Login** — Secure account creation
- 📸 **Photo-Based Reporting** — Upload images of civic issues
- 🤖 **AI Auto-Caption** — Automatic title generation from images
- 📍 **Issue Tracking** — Monitor status of your reports
- 🔔 **Real-time Updates** — Get notified when issues are resolved

### 🛡️ For Admins

- 📋 **Centralized Dashboard** — View all reported issues
- 🔍 **Advanced Filtering** — Sort by status, category, date
- ✏️ **Issue Management** — Update status and add internal notes
- 👤 **User Management** — Promote/demote user roles
- 📊 **Analytics & Insights** — Visual breakdown of civic data

### 🤖 AI Integration

- 🎯 **Object Detection** — YOLOv8 identifies objects in images
- 💬 **Smart Captioning** — Flask API generates descriptive captions
- 🔄 **Auto-Fill** — Captions automatically populate issue titles
- 🧠 **Continuous Learning** — Model improves over time

---

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- MongoDB Atlas account
- Git

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Meetrao/CityHelp.git
cd CityHelp
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```env
VITE_BACKEND_URL=https://cityhelp.onrender.com
```

Run the development server:

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 3️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=https://city-help.vercel.app
PORT=5000
```

Run the backend server:

```bash
npm start
```

Backend will be available at `http://localhost:5000`

### 4️⃣ ML API Setup

```bash
cd ml-api
pip install -r requirements.txt
```

Ensure YOLOv8 weights are in the `weights/` directory.

Run the Flask server:

```bash
flask run
```

ML API will be available at `http://localhost:5000`

---

## 🌐 Environment Variables

### Frontend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API base URL | `https://cityhelp.onrender.com` |

### Backend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key_here` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://city-help.vercel.app` |
| `PORT` | Server port number | `5000` |

### ML API `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `MODEL_PATH` | Path to YOLOv8 weights | `./weights/yolov8n.pt` |
| `FLASK_ENV` | Flask environment | `production` |

---

## 📊 Admin Dashboard Features

<table>
<tr>
<td width="50%">

### 📈 Analytics
- 🥧 **Pie Chart** — Issue status breakdown
- 📊 **Bar Chart** — Issues by category
- 📅 **Timeline View** — Issue trends over time

</td>
<td width="50%">

### ⚙️ Management
- 👤 **User Management** — Role assignment
- 📝 **Internal Notes** — Admin-only annotations
- 🔄 **Status Updates** — Track resolution progress

</td>
</tr>
</table>

---

## 🔐 Authentication Flow

```mermaid
graph LR
    A[User Login] --> B[JWT Token Generated]
    B --> C[Token Stored in localStorage]
    C --> D[Protected Routes Accessible]
    D --> E[Role-Based Access Control]
```

- 🔑 JWT-based authentication
- 👮 Role-based access control (Citizen/Admin)
- 💾 Token persistence via localStorage
- 🛡️ Protected routes with `useAuth` hook

---

## 🚀 Deployment Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   React App     │──────▶│   Express API    │──────▶│  MongoDB Atlas  │
│   (Vercel)      │       │   (Render)       │       │   (Cloud DB)    │
└─────────────────┘       └──────────────────┘       └─────────────────┘
         │                          │
         │                          │
         ▼                          ▼
┌─────────────────┐       ┌──────────────────┐
│   YOLOv8 ML     │       │   RESTful API    │
│   (Render)      │       │   Endpoints      │
└─────────────────┘       └──────────────────┘
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add some amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 🐛 Known Issues & Roadmap

### 🔧 Current Limitations
- ML API cold start time on Render
- Limited offline support

### 🎯 Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Public issue map view
- [ ] Voting system for issue priority

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute!

See [LICENSE](LICENSE) for more details.

---

## 🙋‍♂️ About the Developer

<div align="center">

###

[![GitHub](https://img.shields.io/badge/GitHub-@Meetrao-181717?style=for-the-badge&logo=github)](https://github.com/Meetrao)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/meet-rao-a99a00276)

*Making cities smarter, one issue at a time* 🏙️✨

</div>

---

<div align="center">

### ⭐ Star this repo if you found it helpful!

**Questions?** Open an [issue](https://github.com/Meetrao/CityHelp/issues) or start a [discussion](https://github.com/Meetrao/CityHelp/discussions)

Made with 💙 for better civic engagement

</div>


