#!/usr/bin/env Rscript
#
# Calculs statistiques pour le tableau de bord admin de SCKOLARIS.
#
# Volontairement écrit en R de base uniquement (aucun package CRAN requis :
# ni jsonlite, ni zoo, ni dplyr) — R n'est pas préinstallé sur le serveur de
# production (voir backend/nixpacks.toml) ; exiger l'installation de paquets
# CRAN au déploiement ajouterait un point de fragilité supplémentaire. Les
# échanges avec Laravel se font donc en CSV (read.csv/write.csv, natifs), pas
# en JSON.
#
# Usage : Rscript stats.R <dossier_entree> <dossier_sortie>
# Le dossier d'entrée doit contenir les CSV listés dans `series_files` et
# `categorical_files` ci-dessous (ceux absents sont simplement ignorés).

args <- commandArgs(trailingOnly = TRUE)
if (length(args) < 2) {
  stop("Usage: Rscript stats.R <dossier_entree> <dossier_sortie>")
}
input_dir <- args[1]
output_dir <- args[2]

# Moyenne mobile centrée sur les `window` derniers jours (tendance lissée,
# moins sensible aux pics isolés qu'une valeur brute jour par jour) — calcul
# manuel plutôt que stats::filter() pour un contrôle explicite du
# comportement en début de série (moyenne sur les jours disponibles plutôt
# que NA).
trailing_mean <- function(x, window = 7) {
  n <- length(x)
  sapply(seq_len(n), function(i) {
    from <- max(1, i - window + 1)
    round(mean(x[from:i]), 2)
  })
}

process_series <- function(name) {
  path <- file.path(input_dir, paste0(name, ".csv"))
  if (!file.exists(path)) return(invisible(NULL))

  data <- read.csv(path, stringsAsFactors = FALSE)
  data$date <- as.Date(data$date)
  data <- data[order(data$date), ]

  data$trend <- trailing_mean(data$count, window = 7)

  # Régression linéaire simple (jour -> valeur) : direction générale de la
  # série sur la période, en plus de la moyenne mobile — vaut NA si moins de
  # deux points distincts (pas assez de recul pour une tendance).
  slope <- NA
  if (nrow(data) >= 2 && length(unique(data$date)) >= 2) {
    fit <- lm(count ~ as.numeric(date), data = data)
    slope <- round(unname(coef(fit)[2]), 4)
  }

  write.csv(data, file.path(output_dir, paste0(name, "_out.csv")), row.names = FALSE)

  data.frame(series = name, total = sum(data$count), average = round(mean(data$count), 2),
             slope_per_day = slope)
}

process_categorical <- function(name) {
  path <- file.path(input_dir, paste0(name, ".csv"))
  if (!file.exists(path)) return(invisible(NULL))

  data <- read.csv(path, stringsAsFactors = FALSE)
  total <- sum(data$count)
  data$percentage <- if (total > 0) round(100 * data$count / total, 1) else 0
  data <- data[order(-data$count), ]

  write.csv(data, file.path(output_dir, paste0(name, "_out.csv")), row.names = FALSE)
}

series_files <- c("downloads_daily", "reads_daily", "registrations_daily", "activity_daily")
categorical_files <- c("top_depositors", "accounts_by_status", "online_now")

summaries <- lapply(series_files, process_series)
summaries <- do.call(rbind, summaries[!sapply(summaries, is.null)])
if (!is.null(summaries)) {
  write.csv(summaries, file.path(output_dir, "summary_out.csv"), row.names = FALSE)
}

invisible(lapply(categorical_files, process_categorical))
