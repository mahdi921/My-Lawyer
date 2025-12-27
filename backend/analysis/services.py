import json
import os
import logging
import uuid
import time
from datetime import datetime
from django.conf import settings
from .models import Case, AnalysisResult

logger = logging.getLogger(__name__)

class MockAnalysisService:
    """Provides lawyer-grade mock analysis with detailed steps (Strict V3 Schema)."""
    
    @staticmethod
    def analyze(case_text, category):
        """
        Returns V3 lawyer-grade analysis structure.
        """
        analysis_id = f"an_{uuid.uuid4().hex[:8]}"
        title = "پرونده حقوقی" # Default
        
        # Lawyer-Grade "Mock" Analysis JSON
        return {
            "analysis_id": analysis_id,
            "source": "experimental-mock",
            "version": "v1",
            "generated_at": datetime.now().isoformat(),
            "options": [
                {
                    "option_id": "opt_negotiation",
                    "title": "مذاکره و سازش",
                    "summary": "پیشنهاد سازش با ارسال اظهارنامه رسمی و دعوت به مذاکره.",
                    "detailed_steps": [
                        {
                            "step_number": 1,
                            "title": "ارسال اظهارنامه رسمی",
                            "description": "تهیه متن اظهارنامه شامل مطالبه وجه/حق و اخطار قانونی مبنی بر مراجعه به دادگاه.",
                            "estimated_duration_days": 3,
                            "required_documents": ["کارت ملی", "سند مدرک دعوی"],
                            "legal_actions": ["send_legal_notice"],
                            "assigned_role": "user",
                            "risk_notes": "خطر: ممکن است طرف مقابل آدرس خود را تغییر دهد."
                        },
                        {
                            "step_number": 2,
                            "title": "جلسه مذاکره",
                            "description": "برگزاری جلسه و تنظیم صلح‌نامه رسمی در دفترخانه.",
                            "estimated_duration_days": 10,
                            "required_documents": ["پیش‌نویس صلح‌نامه"],
                            "legal_actions": ["draft_settlement"],
                            "assigned_role": "lawyer",
                            "risk_notes": "خطر: عدم پایبندی طرف به توافق شفاهی."
                        }
                    ],
                    "estimated_success_probability": 70,
                    "confidence_score": 0.85,
                    "cost_estimate": {
                        "amount": 2000000, 
                        "currency": "IRR", 
                        "explanation": "هزینه دفتر خدمات قضایی"
                    },
                    "key_assumptions": ["خوانده تمایل به سازش دارد"],
                    "legal_references": [{"code": "CivilProc", "article": "156"}],
                    "limitations_and_disclaimer": "نتیجه تضمین شده نیست."
                },
                {
                    "option_id": "opt_litigation",
                    "title": "طرح دعوی در دادگاه",
                    "summary": "ثبت دادخواست و پیگیری قضایی تا صدور حکم.",
                    "detailed_steps": [
                        {
                            "step_number": 1,
                            "title": "ثبت دادخواست",
                            "description": "ثبت دادخواست در دفاتر خدمات قضایی.",
                            "estimated_duration_days": 7,
                            "required_documents": ["دادخواست", "ادله"],
                            "legal_actions": ["file_petition"],
                            "assigned_role": "user",
                            "risk_notes": "خطر: رد دادخواست به دلیل نقص."
                        },
                        {
                            "step_number": 2,
                            "title": "جلسه دادرسی",
                            "description": "حضور در دادگاه و دفاع.",
                            "estimated_duration_days": 90,
                            "required_documents": ["لایحه"],
                            "legal_actions": ["hearing"],
                            "assigned_role": "lawyer",
                            "risk_notes": "خطر: اطاله دادرسی."
                        }
                    ],
                    "estimated_success_probability": 60,
                    "confidence_score": 0.90,
                    "cost_estimate": {
                        "amount": 15000000, 
                        "currency": "IRR", 
                        "explanation": "۳.۵٪ هزینه دادرسی"
                    },
                    "key_assumptions": ["مدارک کامل است"],
                    "legal_references": [{"code": "CivilProc", "article": "48"}],
                    "limitations_and_disclaimer": "زمان‌بر بودن پروسه."
                }
            ],
            "flowchart_json": {
                "nodes": [
                    { "id": "1", "type": "input", "data": { "label": "شروع" }, "position": { "x": 250, "y": 0 } },
                    { "id": "2", "data": { "label": "ارسال اظهارنامه" }, "position": { "x": 100, "y": 100 } },
                    { "id": "3", "data": { "label": "ثبت دادخواست" }, "position": { "x": 400, "y": 100 } }
                ],
                "edges": [
                    { "id": "e1-2", "source": "1", "target": "2" },
                    { "id": "e1-3", "source": "1", "target": "3" }
                ]
            },
            "comparison_rationale": "مذاکره کم‌هزینه‌تر است، اما دادخواست نتیجه قطعی‌تری دارد.",
            "provenance": [{"source": "mock_engine", "value": "rules_v1"}]
        }


class AIAnalysisService:
    """AI-powered analysis using OpenAI API with strict V3 schema."""
    
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
You are an expert Iranian lawyer. Provide detailed, actionable advice.
Response MUST be valid JSON:
{
  "analysis_id": "uuid",
  "generated_at": "ISO",
  "source": "ai-engine",
  "options": [
    {
      "option_id": "string",
      "title": "Persian Title",
      "summary": "Persian Summary",
      "detailed_steps": [
        {
          "step_number": 1,
          "title": "Step Title",
          "description": "Detailed Instructions",
          "estimated_duration_days": int,
          "required_documents": ["doc1", "doc2"],
          "legal_actions": ["action_code"],
          "assigned_role": "user|lawyer",
          "risk_notes": "Risk warning"
        }
      ],
      "estimated_success_probability": int,
      "confidence_score": float,
      "cost_estimate": {"amount": int, "currency": "IRR", "explanation": "string"},
      "key_assumptions": ["string"],
      "legal_references": [{"code": "LawName", "article": "Number"}],
      "limitations_and_disclaimer": "string"
    }
  ],
  "flowchart_json": { "nodes": [], "edges": [] },
  "comparison_rationale": "string"
}
""".strip()

            user_prompt = f"Category: {category}\nDetails: {case_text}"

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
