const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');
const campground = require('../models/campground');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}).populate('author');
    res.render('campgrounds/index', { campgrounds });
}))
router.get('/new', isLoggedIn, catchAsync(async (req, res) => {
    res.render('campgrounds/new')
}))
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author=req.user._id;
    await campground.save();
    req.flash('success', 'Successfully Created!');
    res.redirect(`/campgrounds/${campground._id}`);
}));
router.get('/:id', catchAsync(async (req, res) => {
    const c = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!c){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    console.log(c);
    res.render('campgrounds/show',{c});
}))
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const{id}=req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground does not exist!');
        return res.redirect('/campgrounds');
    }
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You dont have permission');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp=await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash('error','You dont have permission');
        res.redirect('/campgrounds');
    }
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully Updated!')
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted!');
    res.redirect('/campgrounds');
}))
module.exports = router; 