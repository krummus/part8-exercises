const jwt = require('jsonwebtoken')
require('dotenv').config()
const { GraphQLError } = require('graphql')

const JWT_SECRET = process.env.JWT_SECRET
const MONGODB_URI = process.env.MONGODB_URI
const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
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
`

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.name && args.genre) {
        return await Book.find({ name: { $exists: args.name === 'YES' }, genres: { $in: [args.genre] } })
      }else if(args.name) {
        return await Book.find({ name: { $exists: args.name === 'YES' } })
      }else if(args.genre) {
        return await Book.find({ genres: { $in: [args.genre] } })
      }else{
        return await Book.find({})
      }
    },
    allAuthors: async (root, args) => await Author.find({}),
    me: (root, args, context) => context.currentUser
  },
  Book: {
    title: (root) => root.title,
    published: (root) => root.published,
    author: async (root) => {
      const author = await Author.findById(root.author)
      return {
        name: author.name,
        born: author.born,
        id: author.id,
        bookCount: async () => await Book.collection.countDocuments({ author : root._id })
      }
    },
    id: (root) => root.id,
    genres: (root) => root.genres
  },
  Author: {
    name: (root) => root.name,
    id: (root) => root.id,
    born: (root) => root.born,
    bookCount: async (root) => await Book.collection.countDocuments({ author : root._id })
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if(!context.currentUser) {
        throw new UserInputError('Could not complete task, Invalid User, please log in')
      }else{
        const author = await Author.findOne({ name: args.author })
        if(!author) {
          throw new UserInputError("No author found", {
            invalidArgs: args,
          })
        }
        const book = new Book({ ...args, author: author})
          
          try {
            await book.save()
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })
          }
          
        return book
      }

    },

    addAuthor: async (root, args, context) => {
      if(!context.currentUser) {
        throw new UserInputError('Could not complete task, Invalid User, please log in')
      }else{
        const author = new Author({ ...args })
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }

        return author
      }
    },

    editAuthor: async (root, args, context) => {
      if(!context.currentUser) {
        throw new UserInputError('Could not complete task, Invalid User, please log in')
      }else{
        const author = await Author.findOne({ name: args.name })
        author.born = args.born
  
        try {
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        return author
      }
    },

    createUser: async (root, args) => {
      const user = new User({ ...args })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})