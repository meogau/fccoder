import mongoose, { Document, Schema } from 'mongoose'

export interface IPlayer extends Document {
  name: string
  shirtNumber: number
  position: string
  birthYear: number
  nationality: string
  bio?: string
  devRole: string
  teamRole: 'captain' | 'vice-captain' | 'member'
  goals: number
  assists: number
  matchesPlayed: number
  avatar?: string
  joinDate: Date
  joinedDate: Date // Keep for backward compatibility
  isActive: boolean
}

const PlayerSchema: Schema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  shirtNumber: { 
    type: Number, 
    required: true,
    unique: true,
    min: 1,
    max: 99
  },
  position: { 
    type: String, 
    required: true,
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']
  },
  birthYear: { 
    type: Number, 
    required: true,
    min: 1970,
    max: new Date().getFullYear() - 16
  },
  nationality: { 
    type: String, 
    required: false,
    trim: true
  },
  bio: { 
    type: String,
    trim: true
  },
  devRole: { 
    type: String, 
    required: true,
    enum: [
      'Frontend Engineer',
      'Backend Engineer', 
      'Full-stack Developer',
      'DevOps Engineer',
      'UI/UX Designer',
      'Mobile Developer',
      'Data Engineer',
      'QA Engineer',
      'Project Manager',
      'Tech Lead',
      'Software Architect',
      'AI Engineer'
    ]
  },
  teamRole: {
    type: String,
    required: true,
    enum: ['captain', 'vice-captain', 'member'],
    default: 'member'
  },
  goals: { 
    type: Number, 
    default: 0,
    min: 0
  },
  assists: { 
    type: Number, 
    default: 0,
    min: 0
  },
  matchesPlayed: { 
    type: Number, 
    default: 0,
    min: 0
  },
  avatar: { 
    type: String,
    trim: true
  },
  joinDate: { 
    type: Date, 
    required: true
  },
  joinedDate: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
})

PlayerSchema.index({ shirtNumber: 1 })
PlayerSchema.index({ position: 1 })
PlayerSchema.index({ devRole: 1 })
PlayerSchema.index({ teamRole: 1 })
PlayerSchema.index({ isActive: 1 })

export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema)