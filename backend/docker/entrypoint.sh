#!/bin/sh
# Reproduit exactement la séquence qu'exécutait le Procfile sous Railpack —
# seul changement : --config pointe vers le Caddyfile copié par le
# Dockerfile (docker/Caddyfile) au lieu de celui que Railpack générait
# automatiquement.
set -e

# Un service Railway "Cron Job" séparé (même image, voir deploiement.md —
# planificateur de tâches) passe sa propre commande ponctuelle (ex:
# `php artisan users:mark-expired-offline`) en "Custom Start Command" — on
# l'exécute directement, sans relancer migrate/seed/cache (inutile et
# répété à chaque déclenchement) ni le serveur web.
if [ "$#" -gt 0 ]; then
	exec "$@"
fi

# Railway peut monter un volume sur storage/ après la construction de
# l'image. Les dossiers ignorés par Git disparaissent alors du runtime;
# Laravel en a besoin, notamment storage/framework/views pour les e-mails
# Markdown et les templates Blade.
mkdir -p \
	storage/framework/cache \
	storage/framework/sessions \
	storage/framework/testing \
	storage/framework/views \
	storage/logs \
	storage/app/public
chown -R www-data:www-data storage bootstrap/cache

php artisan migrate --force
php artisan db:seed --class=AdminSeeder --force
php artisan storage:link || true
php artisan config:cache
php artisan route:cache

exec frankenphp run --config /etc/frankenphp/Caddyfile --adapter caddyfile
