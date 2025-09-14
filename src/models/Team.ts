import mongoose, { Document, Schema } from 'mongoose'

export interface ITeam extends Document {
  name: string
  coverPhoto?: string
  biography: string
  foundedYear: number
  location: string
  isActive: boolean
}

const TeamSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    default: 'FC Coder'
  },
  coverPhoto: { 
    type: String,
    trim: true
  },
  biography: { 
    type: String, 
    required: true,
    trim: true,
    default: 'A team of passionate developers who love both coding and football. We combine our technical skills with our love for the beautiful game.'
  },
  foundedYear: { 
    type: Number, 
    required: true,
    min: 2000,
    max: new Date().getFullYear(),
    default: 2024
  },
  location: { 
    type: String, 
    required: true,
    trim: true,
    default: 'Vietnam'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
})

TeamSchema.index({ isActive: 1 })

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema)