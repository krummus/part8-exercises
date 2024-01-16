import React from 'react'
import { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, UPDATE_AUTHOR, LOGIN, ADD_BOOK, GET_ME, BOOK_ADDED } from './gql/Queries'

export const updateCache = (cache, query, addedBook) => {
  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [ page, setPage ] = useState('authors')
  const [ error, setError ] = useState('')
  const [ token, setToken ] = useState(null)
  
  const [ createBook ] = useMutation(ADD_BOOK, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS } ],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      notify(messages)
    }
  })
  
  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS } ],
    onError: (error) => {
      console.log(JSON.stringify(error))
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      notify(messages)
    }
  })

  const [ login, loginResult ] = useMutation(LOGIN, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS }, { query: GET_ME } ],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      notify(messages)
    },
  })

  const {data: userData, refetch: userRefetch} = useQuery(GET_ME)
  const {data: authData, loading: authLoading, refetch: authRefetch } = useQuery(ALL_AUTHORS)
  const {data: bookData, loading: bookLoading, refetch: booksRefetch } = useQuery(ALL_BOOKS)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      notify(`${addedBook.title} added`)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
    }
  })
  
  useEffect(() => {
    if(loginResult.data) { 
      const token = loginResult.data.login.value
      setToken(token)
      localStorage.setItem('books-user-token', token)
      userRefetch()
    }
  }, [loginResult.data]) // eslint-disable-line

  if ( bookLoading || authLoading ) {
    return <div>Data Loading, Standby...</div>
  }

  const notify = (message) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 5000)
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

  console.log(authData)

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => {
            setPage('authors')
            authRefetch()
          }}>authors</button>
        <button onClick={() => {
            setPage('books')
            booksRefetch()
          }}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>
      
        <Notification errorMessage={error} />
        <Authors show={page === 'authors'} authors={authData.allAuthors} updateAuthor={updateAuthor} token={token}/>
        <Books show={page === 'books'} books={bookData.allBooks} token={token}/>
        <LoginForm show={page === 'login'} setToken={setToken} setError={notify} refetch={userRefetch} login={login}/>
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => {
            setPage('authors')
            authRefetch()
          }}>authors</button>
        <button onClick={() => {
            setPage('books')
            booksRefetch()
          }}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => {
            setPage('recommendations')
            booksRefetch()
            authRefetch()
          }}>recommendations</button>
        <button onClick={logout}>logout</button>
      </div>

      <Notification errorMessage={error} />
      <Authors show={page === 'authors'} authors={authData.allAuthors} updateAuthor={updateAuthor} token={token} />
      <Books show={page === 'books'} books={bookData.allBooks} refetch={booksRefetch}/>
      <NewBook show={page === 'add'} createBook={createBook} />
      <Recommendations show={page === 'recommendations'} userData={userData} /> 
    </div>
  )
}

export default App
