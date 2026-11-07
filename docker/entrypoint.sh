#!/usr/bin/env sh
set -euo pipefail

echo "[entrypoint] starting terrain (APP_ENV=${APP_ENV:-local})"

export COMPOSER_ALLOW_SUPERUSER=1

if [ ! -f vendor/autoload.php ]; then
    echo "[entrypoint] vendor/ missing — running composer install..."
    composer install --no-interaction --prefer-dist --no-progress
fi

if ! php -r 'exit((getenv("APP_KEY") ?: (preg_match("/^APP_KEY=.+/m", file_exists(".env")?file_get_contents(".env"):"")?1:0))?0:1);'; then
    php artisan key:generate --force || true
fi

echo "[entrypoint] ensuring storage dirs..."
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
touch database/database.sqlite 2>/dev/null || true
chown -R www-data:www-data storage bootstrap/cache database || true
chmod -R 775 storage bootstrap/cache database || true

echo "[entrypoint] running migrations..."
php artisan migrate --force || true

echo "[entrypoint] clearing caches..."
php artisan config:clear || true
php artisan route:clear  || true
php artisan view:clear   || true

if [ "${APP_ENV:-local}" = "production" ]; then
    php artisan config:cache || true
    php artisan route:cache  || true
    php artisan view:cache   || true
fi

echo "[entrypoint] starting php-fpm"
exec php-fpm -F
