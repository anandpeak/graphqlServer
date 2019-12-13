const Event = require('../../models/event');
const { transformEvent } = require('./mergeHelpers');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map(event => {
        return transformEvent(event);
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

      createdEvent = transformEvent(result);

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
  }
};
