import React from 'react'
import { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { useQuery, useMutation, useApolloClient } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, UPDATE_AUTHOR, ADD_BOOK, GET_ME } from './gql/Queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [error, setError] = useState('')
  const [token, setToken] = useState(null)
  const [ currUser, setCurrUser ] = useState(null)
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
  const userResult = useQuery(GET_ME)
  const result = useQuery(ALL_AUTHORS)
  const {data, loading, refetch} = useQuery(ALL_BOOKS)
  const client = useApolloClient()
  
  useEffect(() => {
    if(userResult.data) { 
      setCurrUser(userResult)
    }
  }, [userResult]) // eslint-disable-line

  if (result.loading || loading ) {
    return <div>Data Loading, Standby...</div>
  }

  const notify = (message) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 10000)
  }

  const Notification = ({errorMessage}) => {
    if ( !errorMessage ) {
      return null
    }
    return (
      <div style={{color: 'red'}}>
      {errorMessage}
      </div>
    )
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>
      
        <Notification errorMessage={error} />
        <Authors show={page === 'authors'} authors={result.data.allAuthors} updateAuthor={updateAuthor} token={token}/>
        <Books show={page === 'books'} books={data.allBooks} token={token}/>
        <LoginForm show={page === 'login'} setToken={setToken} setError={notify} refetch={userResult.refetch}/>
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommendations')}>recommendations</button>
        <button onClick={logout}>logout</button>
      </div>

      <Notification errorMessage={error} />
      <Authors show={page === 'authors'} authors={result.data.allAuthors} updateAuthor={updateAuthor} token={token} />
      <Books show={page === 'books'} books={data.allBooks} refetch={refetch}/>
      <NewBook show={page === 'add'} createBook={createBook} />
      <Recommendations show={page === 'recommendations'} currUser={currUser} token={token} /> 
    </div>
  )
}

export default App
