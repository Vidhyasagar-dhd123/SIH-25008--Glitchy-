import mongoose from 'mongoose';

const actionSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    from:{ type: Number, required: true },
    to:{ type: Number, required: true },
    framerate:{ type: Number, required: true },
    loop:{ type: Number, default: false },
    conditions:[{ type: String },{value: String}]
});

const assetsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    actions:[actionSchema],
    imageURL:{ type: String ,required: true },
    isStatic:{ type: Boolean, default: false },
    type:{ type: String, enum: ['model','text','raw'], required: true },
    position:{ x: Number, y: Number, z: Number },
    visible:{ type: Boolean, default: true }
});


const VirtualDrillSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    description:{ type: String },
    assests:[assetsSchema],
    targets:[{ type: String }],
    instructions:{ type: String, default: "" },
    released:{ type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
},
{ timestamps: true });

export default mongoose.model('VirtualDrill', VirtualDrillSchema);
   