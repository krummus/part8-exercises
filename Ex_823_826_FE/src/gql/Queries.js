import { gql } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    author {
      id
      name
      bookCount
      born
    }
    published
    genres
  }
`

export const ADD_BOOK = gql`
mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    author {
      name
      id
      bookCountAuth
      born
    }
    published
    genres
    id
  }
}
`

export const UPDATE_AUTHOR = gql`
  mutation editAuthor($name: String!, $born: Int!) {
    editAuthor(
      name: $name,
      born: $born
    ) {
      name
      born
      id
    }
  }
`

export const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    id
    bookCount
    born
  }
}
`

export const ALL_BOOKS = gql`
query {
  allBooks {
    title
    author {
      name
      id
      bookCount
      born
    }
    published
    genres
    id
  }
}
`

export const ALL_BOOKS_GENRE = gql`
query allBooksByGenre($genre: String!) {
  allBooks(genre: $genre) {
    title
    author {
      name
      id
      bookCount
      born
    }       
    published
    genres
    id 
  }
}`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
    value
    }
  }
`

export const GET_ME = gql`
query {
  me {
    username
    id
    favouriteGenre
  }
}
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`