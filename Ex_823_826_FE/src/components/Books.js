import React from 'react'
import { useState } from 'react'

const Books = ({ show, books, refetch }) => {
  const [genreFilter, setGenreFilter] = useState('')

  const updateGenreFilter = (e) => {
    setGenreFilter(e.target.value)
    refetch()
  }

  if (!show) {
    return null
  }

  const genreFilterList = books.reduce((genres, currGenre) => genres.concat(currGenre.genres),[])
  const booksToShow = genreFilter === '' ? books : books.filter(book => book.genres.includes(genreFilter))

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th>book title</th>
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
      <p>Apply Genre Filter:</p><button value='' onClick={updateGenreFilter} key='clear'>clear filter</button>
      {genreFilterList.map((g) => <button value={g} onClick={updateGenreFilter} key={g}>{g}</button>)}
    </div>
  )
}

export default Books
