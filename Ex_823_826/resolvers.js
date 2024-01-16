const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const author = require('./models/author')

const JWT_SECRET = process.env.JWT_SECRET

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
      me: (root, args, context) => {
        return context.currentUser
      }
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
          authoredBooks: author.authoredBooks, //async () => await Book.collection.countDocuments({ author : root._id })
          bookCount: author.authoredBooks.length
        }
      },
      id: (root) => root.id,
      genres: (root) => root.genres
    },
    Author: {
      name: (root) => root.name,
      id: (root) => root.id,
      born: (root) => root.born,
      authoredBooks: (root) => root.authoredBooks, //async (root) => await Book.collection.countDocuments({ author : root._id })
      bookCount: (root) => root.authoredBooks.length
    },
    Mutation: {
      addBook: async (root, args, context) => {
        if(!context.currentUser) {
          throw new GraphQLError('Could not complete task, Invalid User, please log in')
        }else{
          const author = await Author.findOne({ name: args.author })
          
          if(!author) {
            throw new GraphQLError("No author found", {
              invalidArgs: args,
            })
          }

          const book = new Book({ ...args, author: author})
            
          const newBook = await book.save()

          author.authoredBooks = author.authoredBooks.concat(newBook._id)
          author.save()

          pubsub.publish('BOOK_ADDED', { bookAdded: book })

          return book
        }
      },
  
      addAuthor: async (root, args, context) => {
        if(!context.currentUser) {
          throw new GraphQLError('Could not complete task, Invalid User, please log in')
        }else{
          const author = new Author({ ...args })
          try {
            await author.save()
          } catch (error) {
            throw new GraphQLError('Saving author failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.name,
                error
              }
            })
          }
          return author
        }
      },
  
      editAuthor: async (root, args, context) => {
        if(!context.currentUser) {
          throw new GraphQLError('Could not complete task, Invalid User, please log in')
        }else{
          const author = await Author.findOne({ name: args.name })
          author.born = args.born
    
          try {
            await author.save()
          } catch (error) {
            throw new GraphQLError('Saving author failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.name,
                error
              }
            })
          }
          return author
        }
      },
  
      createUser: async (root, args) => {
        const user = new User({ ...args })
    
        try {
          await user.save()
        } catch (error) {
          throw new GraphQLError('Saving user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
        return user
      },
  
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
    
        if ( !user || args.password !== 'secret' ) {
          throw new GraphQLError("wrong credentials")
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        }
    
        return { value: jwt.sign(userForToken, JWT_SECRET) }
      }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        },
    },
  }

  module.exports = resolvers