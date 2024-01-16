import React, { useState } from 'react'

const Authors = ({show, authors, updateAuthor, token}) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState(0)
  
  if (!show) {
    return null
  }
  
  const submit = (event) => {
    event.preventDefault()
    updateAuthor({ variables: { name, born } })
  
    setName('')
    setBorn(0)
  }

  const UpdateAuthorForm = () => {
    if (token) {
      return (
        <div>
          <h2>update author</h2>
          <form onSubmit={submit}>
            <div>
              Author's name:
              <select value={name} onChange={({ target }) => setName(target.value)}>
                {authors.map((a) => (<option key={a.id} value={a.name}>{a.name}</option>))}
              </select>
            </div>
            <div>
              author's birth year 
              <input
                type="number"
                value={born}
                onChange={({ target }) => setBorn(parseInt(target.value))}
              />
            </div>
            <button type="submit">Update Author</button>
          </form>
        </div>
      )
    }
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>name</th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {<UpdateAuthorForm />}
    </div>
  )
}

export default Authors
