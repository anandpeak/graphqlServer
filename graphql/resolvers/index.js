const Event = require('../../models/event');
const User = require('../../models/user');
const bcrpyt = require('bcryptjs');

const events = async eventId => {
  try {
    const events = await Event.find({ _id: { $in: eventId } });
    events.map(event => {
      return { ...event._doc, _id: event.id, creator: user };
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createEvents: events.bind(this, user._doc.createEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    } catch (err) {
      throw err;
    }
  },

  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5dd3fafad02c10159c62e521'
    });

    let createdEvent;
    try {
      const result = await event.save();

      createdEvent = {
        ...result._doc,
        date: new Date(event._doc.date).toISOString(),

        creator: user.bind(this, result._doc.creator)
      };

      const creatorUser = await User.findById('5dd3fafad02c10159c62e521');

      if (!creatorUser) {
        throw new Error('User not found');
      }

      creatorUser.createdEvents.push(event);
      await creatorUser.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  },

  createUser: async args => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User exists already.');
      }
      const hashedPassword = await bcrpyt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });
      const result = await user.save();

      return { ...result._doc, _id: result.id };
    } catch (err) {
      throw err;
    }
  }
};
