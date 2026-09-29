<?php

namespace Database\Seeders;

use App\Models\Domain;
use Illuminate\Database\Seeder;

class DomainSeeder extends Seeder
{
    /**
     * Seed the taxonomy of the library: 8 domaines, 10 sous-domaines chacun.
     */
    public function run(): void
    {
        $taxonomy = [
            'Sciences de la Santé' => [
                'Médecine Générale', 'Pharmacie', 'Odontologie', 'Sciences Infirmières',
                'Kinésithérapie', 'Santé Publique', 'Anatomie', 'Physiologie',
                'Microbiologie', 'Nutrition',
            ],
            'Agronomie et Biotechnologie' => [
                'Agronomie Générale', 'Génie Rural', 'Biotechnologie Végétale', 'Zootechnie',
                'Phytopathologie', 'Sciences du Sol', 'Agroéconomie', 'Génétique Végétale',
                'Biotechnologie Alimentaire', 'Agroforesterie',
            ],
            'Ingénierie et Technologie Appliquée' => [
                'Génie Civil', 'Génie Électrique', 'Génie Mécanique', 'Génie Informatique',
                'Génie Logiciel', 'Télécommunications', 'Énergies Renouvelables', 'Robotique',
                'Intelligence Artificielle', 'Génie Industriel',
            ],
            'Sciences Économiques Appliquées et Gestion' => [
                'Microéconomie', 'Macroéconomie', 'Comptabilité', "Finance d'Entreprise",
                'Marketing', 'Management', 'Économétrie', 'Ressources Humaines',
                'Entrepreneuriat', 'Commerce International',
            ],
            'Droit et Sciences Économiques et Gestion' => [
                'Droit Civil', 'Droit des Affaires', 'Droit Constitutionnel', 'Droit International',
                'Droit du Travail', 'Droit Fiscal', 'Droit Pénal', 'Droit OHADA',
                'Gestion Financière Publique', 'Économie du Développement',
            ],
            'Communication et Art' => [
                'Communication Digitale', 'Journalisme', 'Relations Publiques', 'Publicité',
                'Cinéma et Audiovisuel', 'Design Graphique', 'Arts Plastiques', 'Musique',
                'Théâtre', 'Photographie',
            ],
            'Sciences Humaines Appliquées et Anthropologie' => [
                'Anthropologie Culturelle', 'Sociologie', 'Psychologie', "Sciences de l'Éducation",
                'Anthropologie Sociale', 'Démographie', 'Travail Social', 'Linguistique',
                'Ethnologie Africaine', 'Histoire Africaine',
            ],
            'Leadership' => [
                'Leadership Stratégique', 'Développement Personnel', 'Gestion du Changement',
                'Prise de Décision', 'Communication de Leadership', 'Éthique et Leadership',
                "Gestion d'Équipe", 'Négociation', 'Intelligence Émotionnelle',
                'Leadership Transformationnel',
            ],
        ];

        foreach ($taxonomy as $domainName => $subdomainNames) {
            $domain = Domain::firstOrCreate(['name' => $domainName]);

            foreach ($subdomainNames as $subdomainName) {
                $domain->subdomains()->firstOrCreate(['name' => $subdomainName]);
            }
        }
    }
}
