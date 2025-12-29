FROM php:8.2-cli

WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libsqlite3-dev \
    libonig-dev \
    libpq-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (SQLite, PostgreSQL, and other required extensions)
RUN docker-php-ext-install pdo_sqlite pdo_pgsql mbstring zip pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --no-interaction --optimize-autoloader

# Create storage directories and set permissions
RUN mkdir -p storage/framework/{cache,sessions,views} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 8000

# Start server - clear cache and run migrations at runtime (not build time)
CMD php artisan config:clear && \
    php artisan cache:clear || true && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=8000
