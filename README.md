# 

Le site est un site statique généré par eleventy.

Les fichiers de travail du site sont synchronisés sur [un répertoire Git](https://github.com/BenjmnG/guez_caraibes)

L’action d’éditer le site repose sur un triptyque : Édition d’un fichier texte → Génération du site → Stockage des fichiers générés

En clair, une modification dans les fichiers textes induit la régénération des fichiers du site puis leurs transfert (automatique) vers le serveur hébergeant le site.

[Pour éditer le contenu ](https://github.dev/BenjmnG/guez_caraibes)

 ## Rédiger un projet

Voici un projet type

 ```
---
titre: Un beau projet
maître_ouvrage: RSMAM (Régiment du Service Militaire Adapté Martinique)

typologie: Logements et Hébergements
type_de_travaux: Réhabilitation
mission: MOE
statut: Marché public

surface: 1300
montant: 2765000 

ile: Martinique
localité: Fort-de-France
coordonnées: 16.267663050184627, -61.52724555704186

calendrier:
  durée_en_mois: 21
  fin : 2025-09-01 

cover:
  src: /_media/3000-example.jpg
  alt: Joli petit chat joue à la balle sur fond bleu
  temporary: false
  
visible: true
---
 ```

### À noter que :

#### `typologie`

À choisir parmis les valeurs :

+ Centres commerciaux et Commerces 
+ Santé 
+ Enseignement 
+ Tertiaires
+ Logements et Hébergements
+ Culture, Sport et Loisirs
+ Aménagement Urbain
+ Aéroportuaire et maritime
+ Institutions et services public


#### `type_de_travaux`

À choisir parmis les valeurs :

+ Réhabilitation
+ Construction neuve


#### `missions`

À choisir parmis les valeurs :

+ MOE
+ AMO
+ BET Fluides
+ BET VRD
+ BET HQE
+ OPC
+ CSPS
+ CSSI


#### `surface`

À indiquer en M², sans unité, sans espace


#### `montant`

À indiquer en euros, sans unité, sans espace


#### `coordonnées`

Les coordonées _latitude_, _longitude_ en degrés décimaux (ex: 41.40338, 2.17403)
Obtenir les coordonnées d'un lieu

1. Ouvrez Google Maps sur votre ordinateur. 
2. Effectuez un clic droit sur le lieu ou la zone qui vous intéresse sur la carte. Vous trouverez vos coordonnées (latitude et longitude) au format décimal en haut de la fenêtre pop-up qui s'affiche.
3. Pour copier automatiquement les coordonnées, effectuez un clic gauche sur la latitude et la longitude.


#### `calendrier`

Ce champ ne comprend pas de valeurs directes mais deux enfants (affiliés).
Il convient d'indenter les deux champs suivants au moyen de deux espaces

exemple :

```
calendrier:
  durée_en_mois: 21
  fin : 2025-09-01 
```


#### `durée_en_mois`

Enfant du champ `calendrier`
Indiquer le nombre de mois, sans unité.

#### `fin` et `début`
Indiquer l'un ou l'autre.
La date doit être formatée suivant le format: AAAA-MM-JJ (Année-Mois-Jour)

Exemple : 

`début : 2025-09-01 `


#### `cover`

Ce champ ne comprend pas de valeurs directes mais trois enfants (affiliés).
Il convient d'indenter les deux champs suivants au moyen de deux espaces

Exemple:

```
cover:
  src: /_media/3000-example.jpg
  alt: Joli petit chat joue à la balle sur fond bleu
  temporary: false
```

#### `src`

Enfant du champ `cover`
Indiquer le nom du fichier avec son extension, précédé du dossier dans lequel l'image a été téléversé. Par défaut : `/_media/`

Il convient dans le même temps de téléverser l'image dans le dossier `_media`

Il est préférable de garder un nom d'image concis, et sans espace. Par exemple: `3001-1-projet_chat.jpg`


#### `alt`

Enfant du champ `cover`
Indiquer une description pertinente de l'image.
Cet important détail permet à une personne déficiente visuelle de comprendre l'image projet.


#### `temporary`

Enfant du champ `cover`
Ce champs ne supporte que deux valeurs :
+ `true`: l'image est grisée
+ `false`: l'image est affichée en couleur

Une image grisée permet d'homogénéiser les photographies disgracieuses ou temporaire


#### `visible`

Champ indépendant de l'image.

Ce champs ne supporte que deux valeurs :
+ `true`: le projet est référencé sur le site
+ `false`: le projet ne l'est pas