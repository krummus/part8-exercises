import React, { useState } from 'react'

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState(0)
  
  if (!props.show) {
    return null
  }
  
  const submit = (event) => {
    event.preventDefault()
    props.updateAuthor({ variables: { name, born } })
  
    setName('')
    setBorn(0)
  }


  if (!props.show) {
    return null
  }

  const authors = props.authors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
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
      <h2>update author</h2>
      <form onSubmit={submit}>
        <div>
          Author's name:
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map((a) => (<option value={a.name}>{a.name}</option>))}
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

export default Authors
