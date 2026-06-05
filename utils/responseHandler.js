// Standardized API responses (even for SSR)
class ResponseHandler {
    static success(res, view, data = {}, flash = null) {
        if (flash) {
            req.flash(flash.type, flash.message);
        }
        return res.render(view, data);
    }
    
    static redirect(res, url, flash = null) {
        if (flash) {
            req.flash(flash.type, flash.message);
        }
        return res.redirect(url);
    }
    
    static error(next, statusCode, message) {
        return next(new AppError(statusCode, message));
    }
}

module.exports = ResponseHandler;