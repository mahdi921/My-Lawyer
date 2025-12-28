<div align="center">

# 🏛️ وکیل مجازی | Virtual Lawyer

**AI-Powered Legal Case Analysis Platform**

*Your intelligent assistant for navigating the Iranian legal system*

[![Django](https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai)](https://openai.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://docker.com)

[🇮🇷 فارسی](#persian) • [🇬🇧 English](#english)

</div>

---

<a name="english"></a>

## 🌟 What is Virtual Lawyer?

Virtual Lawyer is a modern web application that uses **artificial intelligence** to help users understand their legal options. Upload your case documents (contracts, court summons, evidence), describe your situation, and receive a structured analysis with:

- 📊 **Multiple legal pathways** with success probability estimates
- ⏱️ **Timeline projections** for each approach
- 💰 **Cost estimates** including court fees and lawyer expenses
- 📋 **Step-by-step action plans** with required documents
- ⚖️ **Legal references** to relevant Iranian law articles

> **Note:** This tool provides *informational guidance only* and does not constitute legal advice. Always consult a licensed attorney for your specific case.

---

## ✨ Key Features

### 📁 Case Management
- Create and organize legal cases by category (Civil, Criminal, Family, Administrative)
- Upload documents in PDF, image, or audio format
- Track case events and timeline (hearings, verdicts, settlements)
- Version-controlled analysis history

### 🤖 AI-Powered Analysis
- **OpenAI GPT integration** for intelligent legal reasoning
- Automatic **PDF text extraction** using pdfplumber
- **Audio transcription** support via OpenAI Whisper API
- Generates multiple solution pathways with confidence scores

### 📈 Live Progress Tracking
- **Real-time updates** via Server-Sent Events (SSE)
- Polling fallback for broader browser compatibility
- Cancel long-running analyses
- Visual progress indicators per phase

### 🎨 Persian-First Design
- **RTL (Right-to-Left)** layout throughout
- **Vazirmatn** font for optimal Persian readability
- Emerald/Slate color palette
- Fully responsive mobile-first design

### 🔐 Security
- **JWT-based authentication** with phone number login
- Protected routes with server-side middleware
- Secure file uploads with MIME-type validation

---

## 🏗️ Tech Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | Django 5.2 + Django REST Framework |
| Database | PostgreSQL |
| Cache/Queue | Redis |
| Task Queue | Celery |
| AI | OpenAI API (GPT-4 / Whisper) |
| Document Processing | pdfplumber, python-magic |
| Real-time | SSE + Django Redis Cache |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 19 + Vite |
| Styling | TailwindCSS 3.4 |
| State | TanStack Query (React Query) |
| Routing | React Router 7 |
| Visualization | ReactFlow (flowcharts) |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |

### Infrastructure
| Component | Technology |
|-----------|------------|
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | (Ready for GitHub Actions) |

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- (Optional) OpenAI API key for AI analysis

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/virtual-lawyer.git
cd virtual-lawyer
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Required for AI analysis (optional for demo)
OPENAI_API_KEY=sk-your-api-key-here

# These have defaults in docker-compose but can be overridden
SECRET_KEY=your-production-secret-key
DEBUG=1
```

### 3. Start the Application

```bash
docker compose up -d --build
```

This starts:
- **PostgreSQL** database (port 5432)
- **Redis** cache/queue (port 6379)
- **Django API** server (port 8000)
- **Celery worker** for background tasks
- **React frontend** via Nginx (port 80)

### 4. Access the Application

Open [http://localhost](http://localhost) in your browser.

To create an admin user:
```bash
docker compose exec web python manage.py createsuperuser
```

---

## 📱 Screenshots

> *Add screenshots of your application here*

| Dashboard | Case Analysis | Progress Tracking |
|-----------|---------------|-------------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Analysis](docs/screenshots/analysis.png) | ![Progress](docs/screenshots/progress.png) |

---

## 📂 Project Structure

```
virtual-lawyer/
├── backend/                 # Django API
│   ├── users/              # Authentication & user profiles
│   ├── cases/              # Case management (models, views, serializers)
│   ├── analysis/           # AI analysis engine
│   │   ├── services.py     # OpenAI integration
│   │   ├── tasks.py        # Celery async tasks
│   │   ├── extractors.py   # PDF/audio processing
│   │   └── progress.py     # Real-time progress tracking
│   ├── audit_log/          # Activity logging
│   └── virtual_lawyer/     # Django settings
│
├── frontend/                # React application
│   ├── src/
│   │   ├── pages/          # Route components
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth)
│   │   └── api.js          # Axios API client
│   ├── nginx.conf          # Production server config
│   └── Dockerfile
│
├── docs/                    # Documentation
│   └── design_brief.md     # UI/UX guidelines
│
├── docker-compose.yml       # Container orchestration
└── README.md
```

---

## 🔧 Development

### Running Locally (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Running Tests

**Backend:**
```bash
docker compose exec web python manage.py test
```

**Frontend:**
```bash
cd frontend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for GPT and Whisper APIs
- [pdfplumber](https://github.com/jsvine/pdfplumber) for PDF extraction
- [TailwindCSS](https://tailwindcss.com) for styling utilities
- [ReactFlow](https://reactflow.dev) for flowchart visualization
- [Vazirmatn](https://github.com/rastikerdar/vazirmatn) for Persian typography

---

<a name="persian"></a>

<div align="center">

## 🇮🇷 راهنمای فارسی

</div>

### وکیل مجازی چیست؟

وکیل مجازی یک پلتفرم هوشمند است که با استفاده از **هوش مصنوعی** به شما کمک می‌کند گزینه‌های حقوقی خود را درک کنید.

مدارک پرونده خود را آپلود کنید و دریافت نمایید:
- 📊 راهکارهای حقوقی متعدد با احتمال موفقیت
- ⏱️ زمان‌بندی تخمینی هر مسیر
- 💰 هزینه‌های تخمینی دادرسی
- 📋 مراحل اجرایی دقیق با مدارک مورد نیاز

### نصب و راه‌اندازی

```bash
git clone https://github.com/yourusername/virtual-lawyer.git
cd virtual-lawyer
docker compose up -d --build
```

سپس به آدرس [http://localhost](http://localhost) مراجعه کنید.

---

<div align="center">

**ساخته شده با ❤️ در ایران**

</div>
