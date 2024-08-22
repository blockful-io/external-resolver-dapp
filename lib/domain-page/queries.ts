import { gql } from "graphql-request";

export const query = gql`
  query Query($name: String!) {
    domain(name: $name) {
      id
      owner
      resolvedAddress
      parent
      subdomains
      subdomainCount
      resolver {
        id
        address
        texts {
          key
          value
        }
        addresses {
          address
          coin
        }
      }
      expiryDate
    }
  }
`;
