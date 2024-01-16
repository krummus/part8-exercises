const typeDefs = `
  type Author {
    name: String!
    id: ID!
    born: Int
    authoredBooks: [Book!]
    bookCount: Int
  } 

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount(author: String): Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book]
    allAuthors: [Author]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String!]!
    ): Book

	  addAuthor(
      name: String!
      born: Int
	  ): Author

    editAuthor(
      name: String!
      born: Int!
    ): Author

    createUser(
        username: String!
        favouriteGenre: String!
    ): User

    login(
        username: String!
        password: String!
    ): Token  
  }

  type Subscription {
    bookAdded: Book!
  } 
`

module.exports = typeDefs