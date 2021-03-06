var moment = require('moment');

module.exports = {
  markdown: 'index.md',
  footer: {
    markdown: 'footer.md'
  },
  formatDate: function () {
    return moment(this._meta.today).format('YYYY');
  }
};
