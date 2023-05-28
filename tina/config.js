import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: process.env.TINA_PUBLIC_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "contenu",
    basePath: 'guez_caraibes'
  },
  media: {
    tina: {
      mediaRoot: "/_media",
      publicFolder: "contenu",
    },
  },
  schema: {
    collections: [

      {
        name: "website",
        label: "🚧 Métadonnée du site",
        format: 'json',
        ui:{
          allowedActions: {
            delete: false,
            create: false,
          }
        },
        path: "contenu/_data/",
        fields: [
          {
            type: "string",
            name: "name",
            label: "Nom de l'entreprise",
            required: true,
          },
          {
            type: "string",
            name: "subname",
            label: "Slogan de l'entreprise",
            required: true,
          },
          {
            label: "Colophon",
            name: "colophon",
            type: "object",
            fields: [
              {
                type: "string",
                name: "design",
                label: "Design",
                required: true,
              },
            ]
          },
          {
            label: "SEO",
            name: "seo",
            type: "object",
            fields: [
              {
                type: "string",
                name: "description",
                label: "Description du site",
                description: "180 caractères max",
                required: true,
              },
            ]
          },
          {
            type: "string",
            name: "url",
            label: "URL du site",
            required: true,
          },
          {
            type: "string",
            name: "email",
            label: "Mail de contact général",
            required: true,
          },
        ]
      },
      {
        name: "projets",
        label: "Projets",
        path: "contenu/projets",
        ui: {
          filename: {
            // if disabled, the editor can not edit the filename
            readonly: true,
            // Example of using a custom slugify function
            slugify: values => {
              // Values is an object containing all the values of the form. In this case it is {title?: string, topic?: string}
              return `${values?.titre?.replace(/ /g, '_') || 'sans_titre'}`
            },
          },
        },
        defaultItem: () => {
          return {visible: true}
        },      
        fields: [
          {
            type: "string",
            name: "titre",
            label: "Titre",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "maitre_ouvrage",
            nameOverride: "maître_ouvrage",
            label: "Maître d'ouvrage"
          },
          {
            type: "string",
            name: "typologie",
            label: "Typologie",
            options: [
              {
                value: 'Centres commerciaux et Commerces',
                label: 'Centres commerciaux et Commerces',
              },
              {
                value: 'Hôtels',
                label: 'Hôtels',
              },
              {
                value: 'Santé',
                label: 'Santé',
              },
              {
                value: 'Enseignement',
                label: 'Enseignement',
              },
              {
                value: 'Tertiaires',
                label: 'Tertiaires',
              },
              {
                value: 'Logements et Hébergements',
                label: 'Logements et Hébergements',
              },
              {
                value: 'Culture, Sport et Loisirs',
                label: 'Culture, Sport et Loisirs',
              },
              {
                value: 'Aménagement Urbain',
                label: 'Aménagement Urbain',
              },
            ]
          },
          {
            type: "string",
            name: "mission",
            label: "Mission",
            options: [
              {
                value: 'MOE',
                label: 'MOE',
              },
              {
                value: 'BET FLUIDES',
                label: 'BET FLUIDES',
              },
              {
                value: 'BET VRD',
                label: 'BET VRD',
              },
              {
                value: 'OPC',
                label: 'OPC',
              },
              {
                value: 'CSPS',
                label: 'CSPS',
              },
              {
                value: 'AMO',
                label: 'AMO',
              },
              {
                value: 'DIAGNOSTIC',
                label: 'DIAGNOSTIC',
              },
              {
                value: 'BET HQE',
                label: 'BET HQE',
              },
              {
                value: 'BET RTG',
                label: 'BET RTG',
              }
            ]
          },
          {
            type: "string",
            name: "statut",
            label: "Statut",
            options: [
              {
                value: 'Marché Privé',
                label: 'Marché Privé',
              },
              {
                value: 'Marché Public',
                label: 'Marché Public',
              },
            ]
          },
          {
            type: "string",
            name: "etat",
            label: "Etat du projet",
            options: [
              {
                value: 'ESQ',
                label: 'ESQ',
              },
              {
                value: 'APD',
                label: 'APD',
              },
              {
                value: 'PRO',
                label: 'PRO',
              },
              {
                value: 'DET',
                label: 'DET',
              },
              {
                value: 'Construit',
                label: 'Construit',
              }
            ]
          },
          {
            type: "number",
            name: "surface",
            label: "Surface"
          },
          {
            type: "string",
            name: "ile",
            label: "Ile",
            options: [
              {
                value: 'Martinique',
                label: 'Martinique',
              },
              {
                value: 'Guadeloupe',
                label: 'Guadeloupe',
              },
              {
                value: 'Saint-Martin',
                label: 'Saint-Martin',
              }
            ]
          },
          {
            type: "string",
            name: "localite",
            nameOverride: "localité",
            label: "Localité"
          },
          {
            type: "string",
            name: "coordonnees",
            nameOverride: "coordonnées",
            label: "Coordonnées"
          },
          {
            type: "datetime",
            name: "debut",
            label: "Date de début du projet"
          },
          {
            type: "datetime",
            name: "fin",
            description: 'Optionnel',
            label: "Date de fin"
          },
          {
            type: "boolean",
            name: "visible",
            label: "Visible ?",
            value: true
          },
          {
            label: "Image",
            name: "cover",
            type: "object",
            fields: [
              {
                type: 'image',
                label: 'Image',
                name: 'src',
                  ui: {
                  parse(value) {
                    //remove leading slash if it exists
                    return encodeURI(value.replace(/ /g, '_'));
                  },
                }
              },
              {
                type: 'string',
                label: "Description de l'image",
                name: 'alt',
              }
            ]
          }       
        ]
      },

      {
        name: "savoirfaire",
        nameOverride: "savoir-faire",
        label: "Savoir-faire",
        path: "contenu/savoir-faire",
        fields: [
          {
            type: "string",
            name: "nom",
            label: "Nom de la mission",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "description",
            label: "Description",
            isBody: true,
          }
        ]
      },
      {
        name: "jobs",
        label: "Jobs",
        path: "contenu/jobs",
        fields: [
          {
            type: "string",
            name: "titre",
            label: "Intitulé du poste",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "description",
            label: "Description",
            isBody: true,
          }
        ]
      },
      {
        name: "equipes",
        nameOverride: "équipes",
        label: "Équipes",
        path: "contenu/équipes",
        fields: [
          {
            type: "string",
            name: "nom",
            label: "Nom de l'île",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "coordonnees",
            nameOverride: "coordonnées",
            label: "Coordonnées"
          },
          {
            label: "Adresse",
            name: "adresse",
            type: "object",
            fields: [
              {
                type: "string",
                name: "telephone",
                nameOverride: "téléphone",
                label: "Téléphone"
              },
              {
                type: "string",
                name: "mail",
                nameOverride: "mail",
                label: "Adresse email"
              },
              {
                type: "string",
                name: "postale",
                nameOverride: "postale",
                label: "Adresse postale"
              }
            ]
          },
          {
            type: "boolean",
            name: "siege",
            nameOverride: "siège",
            label: "Siège ?"
          },
        ]
      },
    ],
  },
});
