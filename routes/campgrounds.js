const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError')
const Campground = require('../models/campground')
const {campgroundSchema, reviewSchema} = require('../schemas.js');

const validateCampground=(req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join('.')
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}

router.get('/makecampground', async (req,res)=>{
    const camp = new Campground({title:'My Backyard', description:'keep camping!'});
    await camp.save();
    res.send(camp);
})

router.get('/',async (req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})

router.get('/new',(req,res)=>{
    res.render('campgrounds/new')
})

router.post('/',validateCampground,catchAsync(async (req,res,next)=>{
    
    const campground= new Campground(req.body.campground);
    await campground.save();
    req.flash('success','Successfully made a new campground');
    res.redirect(`/campgrounds/${campground.id}`)
}))

router.get('/:id',catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show',{campground})
}))

router.get('/:id/edit',catchAsync(async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground})
}))

router.put('/:id',validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground},{new:true});
    res.redirect(`/campgrounds/${campground.id}`);
}))

router.delete('/:id',catchAsync(async(req,res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id,{new:true});
    res.redirect(`/campgrounds/`);
}))

// router.post('/:id/reviews',validateReview, catchAsync(async(req,res)=>{
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     campground.reviews.push(review);
//     await review.save();
//     await campground.save();
//     res.redirect(`/campgrounds/${campground.id}`);
// }))

// router.delete('/:id/reviews/:reviewId', catchAsync(async(req,res)=>{
//     const {id,reviewId} = req.params;
//     await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findByIdAndDelete(req.params.reviewId);
//     res.redirect(`/campgrounds/${id}`);
// }))




module.exports = router;