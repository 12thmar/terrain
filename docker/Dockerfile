FROM php:8.3-fpm

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
      git \
      unzip \
      curl \
      libicu-dev \
      libzip-dev \
      libonig-dev \
      libpq-dev \
      nodejs \
      npm \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install intl pdo zip pdo_sqlite pdo_pgsql \
    && docker-php-ext-enable opcache

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
