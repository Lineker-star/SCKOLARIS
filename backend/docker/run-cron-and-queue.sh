#!/bin/sh
# Combine en un seul service Railway (un seul "Custom Start Command") les
# deux tâches périodiques documentées séparément dans deploiement.md :
# planificateur (statut "en ligne") + worker de queue (indexation IA).
#
# Pourquoi un script plutôt que "cmd1 && cmd2" directement dans le champ
# Railway : ce champ est transmis tel quel à `docker/entrypoint.sh`, qui
# l'exécute via `exec "$@"` (pas de shell) — && n'y serait jamais interprété
# comme un opérateur, seulement comme un argument littéral. Invoquer ce
# script via `sh docker/run-cron-and-queue.sh` évite complètement ce piège.
#
# set -e : si la première commande échoue, on ne lance pas la seconde en
# silence — le job cron Railway doit remonter l'échec.
set -e

php artisan users:mark-expired-offline
php artisan queue:work --stop-when-empty --max-time=240
