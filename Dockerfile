# Set the base image for PHP and Nginx
# FROM php:8.1-fpm-alpine AS base
FROM cgr.dev/chainguard/php:latest-fpm AS base

# Set the working directory for the application
WORKDIR /var/www

# Install necessary dependencies without disturbing the base image packages
RUN apk update && apk add --no-cache \
    bash \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    zlib-dev \
    libxml2-dev \
    libicu-dev \
    libzip-dev \
    curl \
    nginx \
    supervisor

# Install Composer (PHP dependency manager)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Vite globally
RUN npm install -g vite

# Install PHP extensions required for Laravel
RUN docker-php-ext-configure zip
RUN docker-php-ext-install gd pdo pdo_mysql zip

# Copy the application code into the container
COPY . .

# Install PHP Composer dependencies
RUN composer install --no-interaction --optimize-autoloader

# Install JavaScript dependencies (Vite, React, etc.)
RUN npm install --legacy-peer-deps

# Build assets using Vite
RUN npm run build

# Configure Nginx by copying the configuration file into the container
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose ports for HTTP (Nginx) and PHP (PHP-FPM)
EXPOSE 80 9000

# Set the entrypoint
CMD ["sh", "-c", "php-fpm & nginx -g 'daemon off;'"]
