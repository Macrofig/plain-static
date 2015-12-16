var moment = require('moment');

module.exports = {
    title: "test",
    markdown: "index.md",
    formatDate: function () {
      return moment(this._meta.today).format('YYYY');
    }
}
