import React from 'react'
import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery, useMutation } from '@apollo/client'

const ADD_BOOK = gql`
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

const UPDATE_AUTHOR = gql`
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

const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    id
    born
    bookCount
  }
}
`

const ALL_BOOKS = gql`
query {
  allBooks {
    title
    author
    published
    title
    id
  }
}
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [error, setError] = useState('')
  const [ createBook ] = useMutation(ADD_BOOK, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS } ],
    onError: (error) => notify(error.graphQLErrors[0].message)
  })
  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS } ],
    onError: (error) => {
      notify(error.graphQLErrors[0].message)
    }
  })
  const result = useQuery(ALL_AUTHORS)
  const bresult = useQuery(ALL_BOOKS)

  if (result.loading) {
    return <div>Authors loading...</div>
  }

  if (bresult.loading) {
    return <div>Books loading...</div>
  }

  const notify = (message) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 10000)
  }

  const Notify = ({errorMessage}) => {
    if ( !errorMessage ) {
      return null
    }
    return (
      <div style={{color: 'red'}}>
      {errorMessage}
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Notify errorMessage={error} />
      <Authors show={page === 'authors'} authors={result.data.allAuthors} updateAuthor={updateAuthor}/>
      <Books show={page === 'books'} books={bresult.data.allBooks}/>
      <NewBook show={page === 'add'} createBook={createBook}/>
    </div>
  )
}

export default App
