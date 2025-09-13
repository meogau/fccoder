import mongoose, { Document, Schema } from 'mongoose'

export interface IMatch extends Document {
  opponent: string
  date: Date
  venue: string
  isHome: boolean
  goalsFor: number
  goalsAgainst: number
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  competition: string
  attendance?: number
  weatherConditions?: string
  matchReport?: string
  playerStats: Array<{
    playerId: mongoose.Types.ObjectId
    minutesPlayed: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
    isStarter: boolean
  }>
}

const MatchSchema: Schema = new Schema({
  opponent: { 
    type: String, 
    required: true,
    trim: true
  },
  date: { 
    type: Date, 
    required: true 
  },
  venue: { 
    type: String, 
    required: true,
    trim: true
  },
  isHome: { 
    type: Boolean, 
    required: true 
  },
  goalsFor: { 
    type: Number, 
    default: 0,
    min: 0
  },
  goalsAgainst: { 
    type: Number, 
    default: 0,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  competition: { 
    type: String, 
    required: true,
    trim: true
  },
  attendance: { 
    type: Number,
    min: 0
  },
  weatherConditions: { 
    type: String,
    trim: true
  },
  matchReport: { 
    type: String,
    trim: true
  },
  playerStats: [{
    playerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Player', 
      required: true 
    },
    minutesPlayed: { 
      type: Number, 
      required: true,
      min: 0,
      max: 120
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
    yellowCards: { 
      type: Number, 
      default: 0,
      min: 0
    },
    redCards: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 1
    },
    isStarter: { 
      type: Boolean, 
      default: false 
    }
  }]
}, {
  timestamps: true
})

MatchSchema.index({ date: -1 })
MatchSchema.index({ status: 1 })
MatchSchema.index({ competition: 1 })
MatchSchema.index({ opponent: 1 })

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema)