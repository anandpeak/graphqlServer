const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../helpers/date');

const events = async eventId => {
  try {
    const events = await Event.find({ _id: { $in: eventId } });

    events.map(event => {
      return transformEvent(event);
    });

    return events;
  } catch (err) {
    throw err;
  }
};

const singleEvents = async eventId => {
  try {
    const event = await Event.findById(eventId);

    return transformEvent(event);
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
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

const transformEvent = event => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    _id: event.id,
    creator: user.bind(this, event._doc.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id,
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
    user: user.bind(this, booking._doc.user),
    event: singleEvents.bind(this, booking._doc.event)
  };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
