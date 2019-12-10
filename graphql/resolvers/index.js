const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

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

const singleEvents = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event._doc.creator)
    };
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
      createdEvents: events.bind(this, user._doc.createEvents)
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

  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          createdAt: new Date(booking._doc.createdAt.toISOString),
          updatedAt: new Date(booking._doc.updatedAt.toISOString),
          user: user.bind(this, booking._doc.user),
          event: singleEvents.bind(this, booking._doc.event)
        };
      });
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
  },

  bookEvent: async args => {
    try {
      const fetchedEvent = await Event.findById(args.event);

      const booking = new Booking({
        user: '5dd3fafad02c10159c62e521',
        event: fetchedEvent
      });

      const result = await booking.save();

      return {
        ...result._doc,
        id: result.id,
        createdAt: new Date(result._doc.createdAt.toISOString),
        updatedAt: new Date(result._doc.updatedAt.toISOString),
        user: user.bind(this, booking._doc.user),
        event: singleEvents(booking._doc.event)
      };
    } catch (err) {
      throw err;
    }
  },

  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');

      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event.creator)
      };

      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (error) {
      throw error;
    }
  }
};
