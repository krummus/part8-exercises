import { gql } from '@apollo/client'

export const ADD_BOOK = gql`
mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    author
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
    born
    bookCount
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
        born
        bookCount
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
            born
            bookCount
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