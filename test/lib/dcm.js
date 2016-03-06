// DCM extension for selenium wd.

module.exports = function (wd) {
  var url;

  // loads DCM application
  wd.PromiseChainWebdriver.prototype.dcm = function (options) {
    url = options.url;

    return this
      .get(url);
  };

  // logins to the DCM main application
  wd.PromiseChainWebdriver.prototype.dcmLogin = function (username, password) {
    return this
      .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').type(username)
      .elementByCss('form[name=LoginForm] input[name=PASSWORD]').type(password)
      .elementByCss('form[name=LoginForm] button[type=submit]').click();
  };

  // goes to the Party tab
  wd.PromiseChainWebdriver.prototype.dcmPartyTab = function() {
    return this
      .frame('navbar')
      .elementById('Party').click();
  };

  // selects Party main frame
  wd.PromiseChainWebdriver.prototype.dcmPersonPartyPage = function () {
    return this
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('subpage');
  };

  return wd;
};