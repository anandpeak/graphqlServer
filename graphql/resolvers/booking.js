const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('./mergeHelpers');
const Event = require('../../models/event');

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
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

      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },

  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');

      const event = transformEvent(booking.event);

      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (error) {
      throw error;
    }
  }
};
