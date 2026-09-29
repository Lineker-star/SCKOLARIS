# Remplace la détection automatique de Railway (Railpack) — celle-ci
# ignorait `nixpacks.toml` et la variable NIXPACKS_PKGS, donc R n'a jamais
# été réellement installé en production malgré les deux tentatives. Un
# Dockerfile donne un contrôle total et vérifiable sur ce qui est installé.
#
# Base : image officielle FrankenPHP (PHP + Caddy déjà assemblés
# correctement), Debian (pas Alpine) — l'installation de R via apt est
# nettement mieux documentée/fiable sur Debian.
FROM dunglas/frankenphp:1-php8.3-bookworm

WORKDIR /app

# Extensions PHP réduites au strict nécessaire (pas incluses par défaut
# dans l'image de base, mais indispensables — sans elles le site ne
# démarre pas du tout, ce n'est pas une addition de confort) :
#   - pdo_pgsql : seule façon de se connecter à la base Postgres
#   - gd        : exigé explicitement par composer.json (ext-gd) — sans
#                 elle, `composer install` échoue immédiatement
#   - mbstring  : utilisée par le cœur de Laravel lui-même (Str, validation...)
RUN install-php-extensions \
	pdo_pgsql \
	gd \
	mbstring

# R — la seule vraie raison de ce Dockerfile. r-base uniquement (aucun
# paquet CRAN) : r-scripts/stats.R n'utilise que des fonctions R natives
# (read.csv/write.csv/lm/...), justement pour ne dépendre d'aucune
# installation de paquet CRAN au moment du build.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends r-base \
	&& rm -rf /var/lib/apt/lists/*

# Composer n'est pas inclus dans l'image de base — copié depuis l'image
# officielle Composer (pattern standard, aucune installation réseau custom).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker/php-overrides.ini /usr/local/etc/php/conf.d/zz-overrides.ini
COPY docker/Caddyfile /etc/frankenphp/Caddyfile

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
	&& chown -R www-data:www-data storage bootstrap/cache

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
