# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies and build tools
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && curl -L -O http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz \
    && tar -zxf ta-lib-0.4.0-src.tar.gz \
    && cd ta-lib/ \
    && curl -L -o config.guess 'https://git.savannah.gnu.org/gitweb/?p=config.git;a=blob_plain;f=config.guess' \
    && curl -L -o config.sub 'https://git.savannah.gnu.org/gitweb/?p=config.git;a=blob_plain;f=config.sub' \
    && ./configure --prefix=/usr \
    && make \
    && make install \
    && ln -s /usr/lib/libta_lib.so /usr/lib/libta-lib.so \
    && ldconfig \
    && cd .. \
    && pip3 install setuptools numpy \
    && pip3 install ta-lib==0.6.1 \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /root/.cache \
              /tmp/* \
              /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"] 