import mongoose from 'mongoose';

const advertisementSchema = mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    image: { 
      type: String, 
      required: false 
    },
    advertiser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Advertiser', 
      required: true 
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true 
  }
);

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

export default Advertisement;
