const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');
const User = require('./models/user');
const bcrpyt = require('bcryptjs');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphQlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!

      }

      type User {
        _id: ID!
        email: String!
        password: String!
      }

      input UserInput {
        email: String!
        password: String!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }

      schema { 
        query: RootQuery
        mutation: RootMutation
      }
    `),

    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            return events.map(event => {
              return { ...event._doc };
            });
          })
          .catch(err => {
            throw err;
          });
      },

      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: '5dd3fafad02c10159c62e521'
        });

        let createdEvent;

        return event
          .save()
          .then(result => {
            console.log(('result: ', result));
            createdEvent = { ...result._doc };
            return User.findById('5dd3fafad02c10159c62e521');
          })
          .then(user => {
            if (!user) {
              throw new Error('User not found');
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            throw err;
          });
      },

      createUser: args => {
        return (
          User.findOne({ email: args.userInput.email })
            .then(user => {
              if (user) {
                throw new Error('User exists already.');
              }
              return bcrpyt.hash(args.userInput.password, 12);
            })
            .then(hashedPassword => {
              const user = new User({
                email: args.userInput.email,
                password: hashedPassword
              });
              return user.save();
            })
            // .then(result => {
            //   return {
            //     ...result._doc,
            //     _id: result.id
            //   };
            // })
            .catch(err => {
              throw error;
            })
        );
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:JMkkMhL6HyMmbjWM@mern01-dnekz.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    throw err;
  });
