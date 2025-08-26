import mongoose from 'mongoose';

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    district: { type: String, required: true },
    artist: { type: String, required: true },
    ticketPrice: { type: String, required: true },
    ticketLink: { type: String, required: true },
    poster: { type: String, required: false }, // URL for the event poster
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advertiser',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publicationPaymentId: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;