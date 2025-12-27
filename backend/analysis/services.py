import json
import os
import logging
import uuid
from datetime import datetime
from django.conf import settings

logger = logging.getLogger(__name__)


class MockAnalysisService:
    """Provides lawyer-grade mock analysis with detailed steps."""
    
    @staticmethod
    def analyze(case_text, category):
        """
        Returns V2 lawyer-grade analysis structure.
        """
        analysis_id = f"a_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        paths = [
            {
                "id": "path_1",
                "title": "مسالحه و توافق (Negotiation)",
                "summary": "تلاش برای حل اختلاف از طریق مذاکره مستقیم یا شورای حل اختلاف",
                "overall_probability": 70,
                "total_estimated_time_days": 45,
                "total_estimated_cost_range": [500000, 2000000],
                "rationale": "با توجه به ماهیت پرونده، مذاکره مستقیم می‌تواند سریع‌ترین و کم‌هزینه‌ترین راه‌حل باشد.",
                "primary_risks": ["عدم همکاری طرف مقابل", "نیاز به امتیازدهی"],
                "steps": [
                    {
                        "id": "p1s1",
                        "title": "ارسال اظهارنامه رسمی",
                        "description": "تهیه و ارسال اظهارنامه رسمی به طرف مقابل طبق ماده ۱۵۶ قانون آیین دادرسی مدنی. اظهارنامه باید حاوی شرح دقیق ادعا، مبلغ مورد مطالبه و مهلت پاسخگویی باشد.",
                        "required_documents": ["قرارداد اصلی.pdf", "مدارک هویتی.jpg", "مستندات مالی.xlsx"],
                        "estimated_time_days": 7,
                        "estimated_cost": 150000,
                        "legal_basis": ["قانون آیین دادرسی مدنی، ماده ۱۵۶", "mock_reference"],
                        "success_probability": 80,
                        "risks": ["طرف مقابل اظهارنامه را نادیده بگیرد"],
                        "actor": "user",
                        "next_actions": ["انتظار پاسخ تا ۱۰ روز", "آماده‌سازی مدارک برای مرحله بعد"],
                        "links": []
                    },
                    {
                        "id": "p1s2",
                        "title": "دعوت به جلسه مذاکره",
                        "description": "در صورت پاسخ مثبت یا سکوت طرف مقابل، ارسال دعوت‌نامه رسمی برای جلسه مذاکره حضوری یا آنلاین.",
                        "required_documents": ["نامه دعوت.docx"],
                        "estimated_time_days": 14,
                        "estimated_cost": 100000,
                        "legal_basis": ["mock_reference"],
                        "success_probability": 65,
                        "risks": ["عدم حضور طرف مقابل", "اختلاف زیاد در مواضع"],
                        "actor": "user",
                        "next_actions": ["برگزاری جلسه", "تنظیم صورت‌جلسه"],
                        "links": []
                    },
                    {
                        "id": "p1s3",
                        "title": "تنظیم صورت‌جلسه توافق",
                        "description": "در صورت توافق، تنظیم صورت‌جلسه رسمی با امضای طرفین و شاهدین. این سند می‌تواند در صورت نقض، مبنای طرح دعوی قرار گیرد.",
                        "required_documents": ["صورت‌جلسه توافق.pdf"],
                        "estimated_time_days": 7,
                        "estimated_cost": 250000,
                        "legal_basis": ["قانون مدنی، ماده ۱۰", "mock_reference"],
                        "success_probability": 90,
                        "risks": ["عدم اجرای تعهدات توافق‌شده"],
                        "actor": "lawyer",
                        "next_actions": ["پیگیری اجرای تعهدات", "آرشیو مدارک"],
                        "links": []
                    }
                ]
            },
            {
                "id": "path_2",
                "title": "طرح دعوی حقوقی (Litigation)",
                "summary": "ثبت دادخواست در دادگاه حقوقی و پیگیری قضایی رسمی",
                "overall_probability": 55,
                "total_estimated_time_days": 270,
                "total_estimated_cost_range": [5000000, 20000000],
                "rationale": "در صورت عدم موفقیت مذاکره، طرح دعوی حقوقی می‌تواند حقوق شما را از طریق قانونی استیفا کند.",
                "primary_risks": ["طولانی بودن روند دادرسی", "هزینه‌های بالا", "عدم قطعیت نتیجه"],
                "steps": [
                    {
                        "id": "p2s1",
                        "title": "تنظیم دادخواست",
                        "description": "تهیه دادخواست با رعایت تشریفات قانونی طبق ماده ۵۱ قانون آیین دادرسی مدنی. دادخواست باید شامل خواسته، دلایل و مستندات باشد.",
                        "required_documents": ["دادخواست.pdf", "قرارداد.pdf", "مستندات مالی.xlsx", "شناسنامه.jpg"],
                        "estimated_time_days": 10,
                        "estimated_cost": 500000,
                        "legal_basis": ["قانون آیین دادرسی مدنی، مواد ۵۱ تا ۵۳", "mock_reference"],
                        "success_probability": 70,
                        "risks": ["رد دادخواست به دلیل نقص شکلی"],
                        "actor": "lawyer",
                        "next_actions": ["ثبت در دفاتر خدمات قضایی"],
                        "links": []
                    },
                    {
                        "id": "p2s2",
                        "title": "ثبت در دفاتر خدمات قضایی",
                        "description": "مراجعه به دفاتر خدمات الکترونیک قضایی و ثبت دادخواست. پرداخت هزینه دادرسی بر اساس تعرفه‌های مصوب.",
                        "required_documents": [],
                        "estimated_time_days": 3,
                        "estimated_cost": 1500000,
                        "legal_basis": ["قانون وصول برخی از درآمدهای دولت", "mock_reference"],
                        "success_probability": 95,
                        "risks": [],
                        "actor": "user",
                        "next_actions": ["دریافت شماره پرونده", "انتظار تعیین وقت"],
                        "links": []
                    },
                    {
                        "id": "p2s3",
                        "title": "جلسه اول دادرسی",
                        "description": "حضور در جلسه دادرسی و ارائه لوایح و مستندات. پاسخ به ایرادات احتمالی خوانده.",
                        "required_documents": ["لایحه دفاعیه.pdf"],
                        "estimated_time_days": 60,
                        "estimated_cost": 1000000,
                        "legal_basis": ["mock_reference"],
                        "success_probability": 60,
                        "risks": ["ایراد خوانده به صلاحیت دادگاه", "ارجاع به کارشناسی"],
                        "actor": "lawyer",
                        "next_actions": ["پیگیری جلسات بعدی"],
                        "links": []
                    },
                    {
                        "id": "p2s4",
                        "title": "مرحله کارشناسی",
                        "description": "در صورت ارجاع به کارشناس، همکاری با کارشناس رسمی دادگستری و ارائه مدارک لازم.",
                        "required_documents": ["مدارک فنی مورد نیاز کارشناس"],
                        "estimated_time_days": 45,
                        "estimated_cost": 3000000,
                        "legal_basis": ["قانون آیین دادرسی مدنی، مواد ۲۵۷ تا ۲۶۹", "mock_reference"],
                        "success_probability": 50,
                        "risks": ["نظر کارشناس به نفع طرف مقابل باشد"],
                        "actor": "third_party",
                        "next_actions": ["بررسی نظر کارشناس", "اعتراض در صورت نیاز"],
                        "links": []
                    },
                    {
                        "id": "p2s5",
                        "title": "صدور رأی بدوی",
                        "description": "صدور رأی توسط قاضی بر اساس مستندات و نظر کارشناسی. امکان تجدیدنظرخواهی ظرف ۲۰ روز.",
                        "required_documents": [],
                        "estimated_time_days": 30,
                        "estimated_cost": 0,
                        "legal_basis": ["قانون آیین دادرسی مدنی، ماده ۳۳۶", "mock_reference"],
                        "success_probability": 55,
                        "risks": ["رأی نامطلوب", "تجدیدنظرخواهی طرف مقابل"],
                        "actor": "court",
                        "next_actions": ["دریافت رأی", "بررسی امکان تجدیدنظر"],
                        "links": []
                    }
                ]
            }
        ]
        
        # Add criminal path for criminal cases
        if category == 'criminal':
            paths.append({
                "id": "path_3",
                "title": "شکایت کیفری",
                "summary": "پیگیری موضوع از طریق دادسرا و مراجع کیفری",
                "overall_probability": 60,
                "total_estimated_time_days": 180,
                "total_estimated_cost_range": [2000000, 10000000],
                "rationale": "در صورت وجود وصف مجرمانه (مثل کلاهبرداری یا خیانت در امانت)، شکایت کیفری می‌تواند فشار بیشتری بر متهم وارد کند.",
                "primary_risks": ["عدم احراز وصف مجرمانه", "صدور قرار منع تعقیب"],
                "steps": [
                    {
                        "id": "p3s1",
                        "title": "تنظیم شکواییه",
                        "description": "تهیه شکواییه با ذکر دقیق عنوان مجرمانه، شرح واقعه و ادله اثباتی.",
                        "required_documents": ["شکواییه.pdf", "مستندات جرم.pdf"],
                        "estimated_time_days": 7,
                        "estimated_cost": 300000,
                        "legal_basis": ["قانون آیین دادرسی کیفری، ماده ۶۴", "mock_reference"],
                        "success_probability": 70,
                        "risks": ["رد شکایت"],
                        "actor": "lawyer",
                        "next_actions": ["ثبت در دادسرا"],
                        "links": []
                    }
                ]
            })
            
        return {
            "analysis_id": analysis_id,
            "source": "experimental-mock",
            "generated_at": datetime.now().isoformat(),
            "summary": "با توجه به مستندات ارائه شده، پرونده شما قابلیت پیگیری از چند مسیر قانونی را دارد. توجه: این تحلیل آزمایشی است و جایگزین مشاوره حقوقی رسمی نمی‌باشد.",
            "disclaimer": "این راهنمایی مشاوره‌ای است و جایگزین مشاوره حقوقی رسمی نیست.",
            "paths": paths,
            "recommended_path": "path_1"
        }


class AIAnalysisService:
    """AI-powered analysis using OpenAI API with lawyer-grade prompts."""
    
    @staticmethod
    def analyze(case_text, category):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.warning("OPENAI_API_KEY not found. Using Mock Service.")
            return MockAnalysisService.analyze(case_text, category)

        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)

            system_prompt = """
You are an expert Iranian lawyer (وکیل پایه یک دادگستری). Analyze the legal case and provide detailed, actionable advice.

Your response MUST be valid JSON with this structure:
{
  "analysis_id": "unique_id",
  "source": "ai-engine",
  "generated_at": "ISO timestamp",
  "summary": "Professional summary in Persian",
  "disclaimer": "این راهنمایی مشاوره‌ای است و جایگزین مشاوره حقوقی رسمی نیست.",
  "recommended_path": "best path id",
  "paths": [
    {
      "id": "path_1",
      "title": "Path title in Persian",
      "summary": "Brief summary",
      "overall_probability": 0-100,
      "total_estimated_time_days": number,
      "total_estimated_cost_range": [min, max],
      "rationale": "Why this path is recommended",
      "primary_risks": ["risk1", "risk2"],
      "steps": [
        {
          "id": "p1s1",
          "title": "Step title",
          "description": "Detailed description with specific instructions",
          "required_documents": ["doc1.pdf", "doc2.jpg"],
          "estimated_time_days": number,
          "estimated_cost": number,
          "legal_basis": ["قانون..., ماده..."],
          "success_probability": 0-100,
          "risks": ["specific risk"],
          "actor": "user|lawyer|court|third_party",
          "next_actions": ["next step"],
          "links": []
        }
      ]
    }
  ]
}

Rules:
1. ALL text must be in formal Persian
2. Provide at least 2 distinct paths with 3+ steps each
3. Include real Iranian legal references (قانون مدنی, قانون آیین دادرسی, etc.)
4. Be specific about costs, timelines, and required documents
5. Each step must have actionable instructions
""".strip()

            user_prompt = f"دسته‌بندی: {category}\nتوضیحات پرونده: {case_text}"

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )

            result_json = response.choices[0].message.content
            return json.loads(result_json)

        except Exception as e:
            logger.error(f"AI Analysis failed: {e}")
            return MockAnalysisService.analyze(case_text, category)
