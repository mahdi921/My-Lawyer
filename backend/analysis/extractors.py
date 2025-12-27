"""
File extraction and processing utilities for the analysis pipeline.

Provides:
- PDF text extraction (pdfplumber)
- Audio transcription (OpenAI Whisper API)
- File validation (magic numbers, size limits)
"""
import os
import logging
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


class PDFExtractor:
    """Extract text content from PDF files."""
    
    @staticmethod
    def extract(file_path: str) -> dict:
        """
        Extract text from a PDF file.
        
        Returns:
            dict: {
                'success': bool,
                'text': str,
                'pages': int,
                'error': str (if failed)
            }
        """
        try:
            import pdfplumber
        except ImportError:
            logger.error("pdfplumber not installed. Run: pip install pdfplumber")
            return {'success': False, 'text': '', 'pages': 0, 'error': 'pdfplumber not installed'}
        
        try:
            text_parts = []
            page_count = 0
            
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(f"--- صفحه {i+1} ---\n{page_text}")
                    else:
                        text_parts.append(f"--- صفحه {i+1} (بدون متن قابل استخراج) ---")
            
            full_text = "\n\n".join(text_parts)
            logger.info(f"Extracted {len(full_text)} characters from {page_count} pages")
            
            return {
                'success': True,
                'text': full_text,
                'pages': page_count,
                'error': None
            }
            
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            return {
                'success': False,
                'text': '',
                'pages': 0,
                'error': str(e)
            }


class AudioTranscriber:
    """Transcribe audio files using OpenAI Whisper API (lightweight, cloud-based)."""
    
    @staticmethod
    def transcribe(file_path: str) -> dict:
        """
        Transcribe audio file to text using OpenAI Whisper API.
        
        Returns:
            dict: {
                'success': bool,
                'text': str,
                'duration_seconds': float (if available),
                'error': str (if failed)
            }
        """
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            logger.warning("OPENAI_API_KEY not set. Audio transcription skipped.")
            return {
                'success': False,
                'text': '[فایل صوتی - کلید API تنظیم نشده]',
                'duration_seconds': 0,
                'error': 'OPENAI_API_KEY not configured'
            }
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            
            with open(file_path, 'rb') as audio_file:
                # Use Whisper API for transcription
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    language="fa",  # Persian
                    response_format="text"
                )
            
            logger.info(f"Transcribed audio: {len(transcript)} characters")
            return {
                'success': True,
                'text': transcript,
                'duration_seconds': None,  # Not provided by API
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Audio transcription failed: {e}")
            return {
                'success': False,
                'text': f'[خطا در رونویسی فایل صوتی: {str(e)[:100]}]',
                'duration_seconds': 0,
                'error': str(e)
            }


class FileValidator:
    """Validate uploaded files for security and compatibility."""
    
    # Allowed MIME types and their extensions
    ALLOWED_TYPES = {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'audio/mpeg': ['.mp3'],
        'audio/mp4': ['.m4a'],
        'audio/wav': ['.wav'],
        'audio/ogg': ['.ogg'],
        'audio/webm': ['.webm'],
        'text/plain': ['.txt'],
    }
    
    # Max file sizes (in MB)
    MAX_FILE_SIZE_MB = 50
    MAX_AUDIO_SIZE_MB = 25  # OpenAI Whisper limit
    
    @classmethod
    def validate(cls, file_path: str, filename: str = None) -> dict:
        """
        Validate a file for upload.
        
        Returns:
            dict: {
                'valid': bool,
                'mime_type': str,
                'file_type': str (document|audio|image),
                'size_mb': float,
                'errors': list[str]
            }
        """
        errors = []
        result = {
            'valid': True,
            'mime_type': None,
            'file_type': 'document',
            'size_mb': 0,
            'errors': errors
        }
        
        # Check file exists
        if not os.path.exists(file_path):
            errors.append('فایل یافت نشد')
            result['valid'] = False
            return result
        
        # Check file size
        size_bytes = os.path.getsize(file_path)
        size_mb = size_bytes / (1024 * 1024)
        result['size_mb'] = round(size_mb, 2)
        
        if size_mb > cls.MAX_FILE_SIZE_MB:
            errors.append(f'حجم فایل بیش از حد مجاز ({cls.MAX_FILE_SIZE_MB}MB)')
            result['valid'] = False
        
        # Detect MIME type using python-magic
        try:
            import magic
            mime = magic.Magic(mime=True)
            detected_mime = mime.from_file(file_path)
            result['mime_type'] = detected_mime
            
            # Determine file type category
            if detected_mime.startswith('audio/'):
                result['file_type'] = 'audio'
                if size_mb > cls.MAX_AUDIO_SIZE_MB:
                    errors.append(f'حجم فایل صوتی بیش از حد مجاز ({cls.MAX_AUDIO_SIZE_MB}MB)')
                    result['valid'] = False
            elif detected_mime.startswith('image/'):
                result['file_type'] = 'image'
            else:
                result['file_type'] = 'document'
            
            # Validate MIME type is allowed
            if detected_mime not in cls.ALLOWED_TYPES:
                errors.append(f'نوع فایل مجاز نیست: {detected_mime}')
                result['valid'] = False
                
        except ImportError:
            logger.warning("python-magic not installed. Skipping MIME validation.")
            # Fallback to extension-based detection
            if filename:
                ext = Path(filename).suffix.lower()
                if ext in ['.mp3', '.m4a', '.wav', '.ogg', '.webm']:
                    result['file_type'] = 'audio'
                elif ext in ['.jpg', '.jpeg', '.png']:
                    result['file_type'] = 'image'
        except Exception as e:
            logger.error(f"MIME detection failed: {e}")
            errors.append(f'خطا در تشخیص نوع فایل: {str(e)[:50]}')
        
        return result


class ContentExtractor:
    """Unified content extraction from various file types."""
    
    @classmethod
    def extract_all(cls, files: list) -> dict:
        """
        Extract content from a list of files.
        
        Args:
            files: List of dicts with 'path' and 'filename' keys
            
        Returns:
            dict: {
                'documents': list of extracted text,
                'transcripts': list of audio transcripts,
                'errors': list of error messages,
                'summary': str (combined context for AI)
            }
        """
        documents = []
        transcripts = []
        errors = []
        
        for file_info in files:
            path = file_info.get('path')
            filename = file_info.get('filename', 'unknown')
            
            if not path or not os.path.exists(path):
                errors.append(f"فایل یافت نشد: {filename}")
                continue
            
            # Validate file
            validation = FileValidator.validate(path, filename)
            if not validation['valid']:
                errors.extend(validation['errors'])
                continue
            
            file_type = validation['file_type']
            
            if file_type == 'document' and validation['mime_type'] == 'application/pdf':
                # Extract PDF text
                result = PDFExtractor.extract(path)
                if result['success']:
                    documents.append({
                        'filename': filename,
                        'text': result['text'],
                        'pages': result['pages']
                    })
                else:
                    errors.append(f"خطا در استخراج PDF {filename}: {result['error']}")
                    
            elif file_type == 'audio':
                # Transcribe audio
                result = AudioTranscriber.transcribe(path)
                if result['success']:
                    transcripts.append({
                        'filename': filename,
                        'text': result['text']
                    })
                else:
                    errors.append(f"خطا در رونویسی {filename}: {result['error']}")
            
            # For images and other types, just note the filename
            elif file_type == 'image':
                documents.append({
                    'filename': filename,
                    'text': f'[تصویر پیوست: {filename}]',
                    'pages': 0
                })
        
        # Build combined summary
        summary_parts = []
        
        if documents:
            summary_parts.append("=== مستندات ===")
            for doc in documents:
                summary_parts.append(f"\n📄 {doc['filename']}:\n{doc['text']}")
        
        if transcripts:
            summary_parts.append("\n\n=== رونوشت فایل‌های صوتی ===")
            for trans in transcripts:
                summary_parts.append(f"\n🎤 {trans['filename']}:\n{trans['text']}")
        
        return {
            'documents': documents,
            'transcripts': transcripts,
            'errors': errors,
            'summary': "\n".join(summary_parts) if summary_parts else ""
        }
