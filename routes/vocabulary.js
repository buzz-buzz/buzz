module.exports = function (app, router, render) {
    router
        .get('/vocabulary/my', function *(next) {
            this.body = yield render('vocabulary/vocabulary.html', {});
        })
        .get('/vocabulary/print', function *(next) {
            this.body = yield render('vocabulary/vocabulary-printable.html', {});
        })
    ;
};