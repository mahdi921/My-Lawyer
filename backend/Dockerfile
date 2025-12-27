FROM python:3.13.9-alpine

WORKDIR /app

# Install dependencies for psycopg2, Pillow, and python-magic
RUN apk add --no-cache \
    postgresql-dev \
    gcc \
    musl-dev \
    jpeg-dev \
    zlib-dev \
    libmagic \
    zlib-dev \
    linux-headers

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "virtual_lawyer.wsgi:application"]
