export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const WebsitePartsFragmentDoc = gql`
    fragment WebsiteParts on Website {
  name
  subname
  colophon {
    __typename
    design
  }
  seo {
    __typename
    description
  }
  url
  email
}
    `;
export const ProjetsPartsFragmentDoc = gql`
    fragment ProjetsParts on Projets {
  titre
  maitre_ouvrage
  typologie
  mission
  statut
  etat
  surface
  ile
  localite
  coordonnees
  debut
  fin
  visible
  cover {
    __typename
    src
    alt
  }
}
    `;
export const SavoirfairePartsFragmentDoc = gql`
    fragment SavoirfaireParts on Savoirfaire {
  nom
  description
}
    `;
export const JobsPartsFragmentDoc = gql`
    fragment JobsParts on Jobs {
  titre
  description
}
    `;
export const EquipesPartsFragmentDoc = gql`
    fragment EquipesParts on Equipes {
  nom
  coordonnees
  adresse {
    __typename
    telephone
    mail
    postale
  }
  siege
}
    `;
export const WebsiteDocument = gql`
    query website($relativePath: String!) {
  website(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...WebsiteParts
  }
}
    ${WebsitePartsFragmentDoc}`;
export const WebsiteConnectionDocument = gql`
    query websiteConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: WebsiteFilter) {
  websiteConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...WebsiteParts
      }
    }
  }
}
    ${WebsitePartsFragmentDoc}`;
export const ProjetsDocument = gql`
    query projets($relativePath: String!) {
  projets(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ProjetsParts
  }
}
    ${ProjetsPartsFragmentDoc}`;
export const ProjetsConnectionDocument = gql`
    query projetsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ProjetsFilter) {
  projetsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ProjetsParts
      }
    }
  }
}
    ${ProjetsPartsFragmentDoc}`;
export const SavoirfaireDocument = gql`
    query savoirfaire($relativePath: String!) {
  savoirfaire(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SavoirfaireParts
  }
}
    ${SavoirfairePartsFragmentDoc}`;
export const SavoirfaireConnectionDocument = gql`
    query savoirfaireConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SavoirfaireFilter) {
  savoirfaireConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SavoirfaireParts
      }
    }
  }
}
    ${SavoirfairePartsFragmentDoc}`;
export const JobsDocument = gql`
    query jobs($relativePath: String!) {
  jobs(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...JobsParts
  }
}
    ${JobsPartsFragmentDoc}`;
export const JobsConnectionDocument = gql`
    query jobsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: JobsFilter) {
  jobsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...JobsParts
      }
    }
  }
}
    ${JobsPartsFragmentDoc}`;
export const EquipesDocument = gql`
    query equipes($relativePath: String!) {
  equipes(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...EquipesParts
  }
}
    ${EquipesPartsFragmentDoc}`;
export const EquipesConnectionDocument = gql`
    query equipesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: EquipesFilter) {
  equipesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...EquipesParts
      }
    }
  }
}
    ${EquipesPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    website(variables, options) {
      return requester(WebsiteDocument, variables, options);
    },
    websiteConnection(variables, options) {
      return requester(WebsiteConnectionDocument, variables, options);
    },
    projets(variables, options) {
      return requester(ProjetsDocument, variables, options);
    },
    projetsConnection(variables, options) {
      return requester(ProjetsConnectionDocument, variables, options);
    },
    savoirfaire(variables, options) {
      return requester(SavoirfaireDocument, variables, options);
    },
    savoirfaireConnection(variables, options) {
      return requester(SavoirfaireConnectionDocument, variables, options);
    },
    jobs(variables, options) {
      return requester(JobsDocument, variables, options);
    },
    jobsConnection(variables, options) {
      return requester(JobsConnectionDocument, variables, options);
    },
    equipes(variables, options) {
      return requester(EquipesDocument, variables, options);
    },
    equipesConnection(variables, options) {
      return requester(EquipesConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, _options) => {
    const data = await client.request({
      query: doc,
      variables: vars
    });
    return { data: data?.data, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(createClient({ url: "https://content.tinajs.io/1.4/content/bf987e1f-8624-4d0f-ba66-d63279ff8cf6/github/main", queries }))
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
