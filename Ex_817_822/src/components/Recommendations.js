import React from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../gql/Queries'

const Recommendations = ({ show, currUser, token }) => {
  const booksresult = useQuery(ALL_BOOKS)

  if (!show) {
    return null
  }

  if (booksresult.loading) {
    return <div>Books loading....</div>
  }

  const currGenre = currUser ? currUser.data.me.favouriteGenre : ''
  const books = booksresult.data.allBooks
  const booksToShow = currGenre === '' ? books : books.filter(book => book.genres.includes(currGenre))

  return (
    <div>
      <h2>Recommendations</h2>
      <p>Recommended Books based on your favourite Genre <b>{currGenre}</b></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
