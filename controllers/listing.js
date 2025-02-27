const Listing = require("../models/listing");

module.exports.index = async(req,res)=>{
    let allListing =  await Listing.find({}); 
    res.render("listings/index.ejs",{allListing});
}

module.exports.newForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing = (async(req,res)=>{
    let {id} = req.params;
    let listing =  await Listing.findById(id)
        .populate(
        {path:"reviews",
        populate:{
            path:"author",
        }
        }).populate("owner"); 

    if(!listing){
        req.flash("error", "Listing doesn't exists");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
})

module.exports.createListing = async (req,res)=>{
    // let {title ,description , image, price , location , country} = req.body; 
    let url = req.file.path;
    let filename = req.file.filename;
    //console.log(url, filename);

    let listing= new Listing(req.body.listing);
    listing.image = {url , filename};
    // console.log(listing);

    listing.owner = req.user._id;
    await listing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};


module.exports.editListing = async (req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing doesn't exists");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs",{listing});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(req.file){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
    }
   
    await listing.save();
    req.flash("success","Listing Updated!");
    res.redirect("/listings");
}

module.exports.deleteListing = async(req,res)=>{
    let {id} = req.params;

    let deleteListing = await Listing.findByIdAndDelete(id,{new:true});
    req.flash("success","Listing deleted!");
    res.redirect("/listings");
}