import random

class MockAnalysisService:
    @staticmethod
    def analyze(case_text, category):
        """
        Returns structured JSON for the case.
        """
        # Placeholder logic
        # In real world, this would call LLM or Rule Engine
        
        paths = [
            {
                "id": "path_1",
                "title": "مسالحه و توافق (Negotiation)",
                "description": "تلاش برای حل اختلاف از طریق مذاکره مستقیم یا شورای حل اختلاف.",
                "steps": [
                    "ارسال اظهارنامه رسمی",
                    "دعوت به جلسه صلح و سازش",
                    "تنظیم صورت‌جلسه توافق"
                ],
                "probability": 70,
                "duration": "1-2 ماه",
                "risk": "low"
            },
            {
                "id": "path_2",
                "title": "طرح دعوی حقوقی (Litigation)",
                "description": "ثبت دادخواست در دادگاه حقوقی و پیگیری قضایی.",
                "steps": [
                    "تنظیم دادخواست",
                    "ثبت در دفاتر خدمات قضایی",
                    "جلسه اول دادرسی",
                    "کارشناسی",
                    "صدور رای بدوی"
                ],
                "probability": 45,
                "duration": "6-12 ماه",
                "risk": "medium"
            }
        ]
        
        if category == 'criminal':
            paths.append({
                "id": "path_3",
                "title": "شکایت کیفری",
                "description": "پیگیری موضوع از طریق دادسرا و پلیس آگاهی.",
                "steps": ["شکواییه", "تحقیقات مقدماتی", "صدور کیفرخواست"],
                "probability": 60,
                "duration": "3-9 ماه",
                "risk": "high"
            })
            
        return {
            "summary": "با توجه به مستندات ارائه شده، پرونده شما قابلیت پیگیری از چند مسیر را دارد.",
            "paths": paths,
            "recommended_path": "path_1"
        }
