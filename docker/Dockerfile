FROM php:8.3-fpm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
      git \
      unzip \
      curl \
      libicu-dev \
      libzip-dev \
      libonig-dev \
      nodejs \
      npm \
    && docker-php-ext-install intl pdo zip pdo_sqlite \
    && docker-php-ext-enable opcache \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY backend/composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-progress || true

COPY backend/package.json package-lock.json* ./
RUN npm install --include=dev

COPY backend/ ./

RUN npm run build

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
 && mkdir -p storage/framework/{cache,views,sessions} storage/logs bootstrap/cache \
 && touch database/database.sqlite \
 && chown -R www-data:www-data storage bootstrap/cache database \
 && chmod -R 775 storage bootstrap/cache database

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
